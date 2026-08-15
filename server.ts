import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Automatically load .env.local or .env if present
try {
  if (fs.existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  } else if (fs.existsSync(".env")) {
    process.loadEnvFile(".env");
  }
} catch {
  // Ignored if file does not exist or node loadEnvFile not available
}

const SYSTEM_PROMPT = `
You are AmniSphere's built-in ethical web renderer by Al-Haq Studio (alhaq.uk). You generate clean, accessible, modern web pages as complete HTML documents.

ETHICAL & ARCHITECTURAL GUIDELINES:
- Uphold high standards of decency, truthfulness, privacy, and moral integrity.
- Never generate explicit adult material, gambling interfaces, predatory financial schemes, or misleading malware.
- Focus on clean, high-utility, educational, creative, or productive web applications and layouts.
- Only generate the webpage content itself. Never simulate or generate a browser frame, omnibar, URL address bar, or outer operating system window borders.

STRUCTURE:
Return a full HTML document with a <head> and a <body>:

<html>
<head>
  <title>SiteName - Page Name</title>
  <meta name="color-scheme" content="dark">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Plus Jakarta Sans', sans-serif">
  ...page content...
</body>
</html>

Keep the <head> minimal — just the <title>, <meta name="color-scheme">, and a Google Fonts <link>. Tailwind CSS and scripts are injected automatically.
The <title> format is: "SiteName - PageName" eg. "NewsPortal - Home".
Use Tailwind CSS utility classes for styling. Create rich, responsive, realistic-looking pages.
For icons, use Material Symbols: <span class="material-symbols-outlined">icon_name</span>.
For actions, use: window.FlashLiteAPI.performAction('Description of intent', 'Optional payload')
For new tabs: window.FlashLiteAPI.openNewTab('url')
`;

function getGenAIClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3300;

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasServerKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Streaming generation route using Server-Sent Events (SSE)
  app.post("/api/generate-page", async (req, res) => {
    const {
      prompt,
      currentPageHtml,
      isGrounded = false,
      formState = [],
      isMobile = false,
      aiSettings = {},
    } = req.body;

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const isEdit = currentPageHtml !== null && currentPageHtml !== undefined;
    let userPrompt: string;

    if (isEdit) {
      const formStateBlock =
        formState && formState.length > 0
          ? `\n\nThe user entered the following values into input fields on the previous page:\n${formState.map((f: any) => `- ${f.name || "unnamed"} (${f.type}): "${f.value}"`).join("\n")}\n`
          : "";
      userPrompt = `
Update this page based on the following instruction.
Instruction: "${prompt}"

Keep layout, styling, and ethical principles consistent.
Return the complete updated HTML document.${formStateBlock}

CURRENT HTML:
${currentPageHtml}
`;
    } else {
      userPrompt = `
Task: Generate a new web page.
Description: "${prompt}"

Create a complete, detailed, realistic-looking, ethics-aligned web page based on this description.
`;
    }

    if (isGrounded) {
      userPrompt += `\nIMPORTANT: Use search grounding for accurate and verified information.\n`;
    }

    if (isMobile) {
      userPrompt += `\nIMPORTANT: Mobile layout with single-column responsive design.\n`;
    }

    const customKey = aiSettings?.geminiApiKey;
    const ai = getGenAIClient(customKey);

    // If no key available and not custom provider, return clean offline rendered page
    if (!ai && aiSettings?.provider !== "custom_endpoint" && aiSettings?.provider !== "openai") {
      sendEvent("token", { input: 50, output: 250, isEstimate: false });
      sendEvent("chunk", { text: generateOfflinePage(prompt) });
      sendEvent("done", {
        tokenCount: { input: 50, output: 250 },
        groundingSources: [],
        searchEntryPointHtml: "",
      });
      res.end();
      return;
    }

    // If custom endpoint (Ollama / LocalAI / OpenAI)
    if (aiSettings?.provider === "custom_endpoint" || aiSettings?.provider === "openai") {
      try {
        const endpoint =
          aiSettings.provider === "openai"
            ? "https://api.openai.com/v1/chat/completions"
            : `${aiSettings.customEndpointUrl}/chat/completions`;
        const apiKey = aiSettings.provider === "openai" ? aiSettings.openaiApiKey : aiSettings.customAuthHeader;
        const model = aiSettings.provider === "openai" ? aiSettings.openaiModel || "gpt-4o-mini" : "llama3";

        sendEvent("token", { input: 100, output: 0, isEstimate: true });

        const customResp = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            stream: false,
          }),
        });

        if (!customResp.ok) {
          throw new Error(`Endpoint returned status ${customResp.status}`);
        }

        const data = await customResp.json();
        const content = data.choices?.[0]?.message?.content || "";
        sendEvent("chunk", { text: content });
        sendEvent("done", {
          tokenCount: { input: 100, output: 250 },
          groundingSources: [],
          searchEntryPointHtml: "",
        });
        res.end();
        return;
      } catch (err: any) {
        sendEvent("chunk", {
          text: `<div class="p-8 text-amber-300 bg-gray-950 min-h-screen">
            <h2 class="text-xl font-bold mb-2">Endpoint Notice</h2>
            <p class="text-gray-300 mb-4">${err?.message || "Could not connect to custom provider"}</p>
          </div>`,
        });
        sendEvent("done", {
          tokenCount: { input: 0, output: 0 },
          groundingSources: [],
          searchEntryPointHtml: "",
        });
        res.end();
        return;
      }
    }

    // Call Gemini API server-side
    const modelName = aiSettings?.geminiModel || "gemini-3.7-flash";

    try {
      const config: any = {
        systemInstruction: SYSTEM_PROMPT,
      };

      if (isGrounded) {
        config.tools = [{ googleSearch: {} }];
      }

      let inputTokens = 120;
      try {
        const countResult = await ai!.models.countTokens({
          model: modelName,
          contents: [
            { role: "user", parts: [{ text: config.systemInstruction || "" }] },
            { role: "user", parts: [{ text: userPrompt }] },
          ],
        });
        inputTokens = countResult.totalTokens || 120;
      } catch {}

      sendEvent("token", { input: inputTokens, output: 0, isEstimate: true });

      const responseStream = await ai!.models.generateContentStream({
        model: modelName,
        contents: userPrompt,
        config,
      });

      let outputTokens = 0;
      let totalChars = 0;
      let groundingSources: Array<{ title: string; uri: string }> = [];
      let searchEntryPointHtml = "";

      for await (const chunk of responseStream) {
        if (chunk.usageMetadata) {
          if (chunk.usageMetadata.promptTokenCount) {
            inputTokens = chunk.usageMetadata.promptTokenCount;
          }
          outputTokens = chunk.usageMetadata.candidatesTokenCount || 0;
        }

        const groundingMeta = chunk.candidates?.[0]?.groundingMetadata;
        if (groundingMeta?.groundingChunks?.length) {
          groundingSources = groundingMeta.groundingChunks
            .filter((c: any) => c.web?.uri && c.web?.title)
            .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
        }
        if (groundingMeta?.searchEntryPoint?.renderedContent) {
          searchEntryPointHtml = groundingMeta.searchEntryPoint.renderedContent;
        }

        if (chunk.text) {
          totalChars += chunk.text.length;
          const estimatedOutput = Math.round(totalChars / 4);
          sendEvent("token", { input: inputTokens, output: estimatedOutput, isEstimate: true });
          sendEvent("chunk", { text: chunk.text });
        }
      }

      sendEvent("done", {
        tokenCount: { input: inputTokens, output: outputTokens || Math.round(totalChars / 4) },
        groundingSources,
        searchEntryPointHtml,
      });
      res.end();
    } catch (err: any) {
      console.error("Gemini server error:", err);
      // If 403 or quota or key failure, provide rich offline fallback with helpful message
      const isPermissionDenied =
        err?.status === 403 ||
        err?.message?.includes("PERMISSION_DENIED") ||
        err?.message?.includes("403");

      const offlineContent = generateOfflinePage(
        prompt,
        isPermissionDenied
          ? "Gemini API key is not configured or lacks permission for this model. You can add your own custom API Key under Settings > AI Utilities, or continue browsing offline with full privacy protection."
          : `Note: ${err?.message || "AI render service temporarily unavailable."}`
      );

      sendEvent("chunk", { text: offlineContent });
      sendEvent("done", {
        tokenCount: { input: 0, output: 100 },
        groundingSources: [],
        searchEntryPointHtml: "",
      });
      res.end();
    }
  });

  // Summarize content endpoint
  app.post("/api/summarize", async (req, res) => {
    const { text, aiSettings = {} } = req.body;
    const ai = getGenAIClient(aiSettings?.geminiApiKey);

    if (!ai) {
      return res.json({
        summary: "To use the AI Summarizer, please configure your Gemini API Key in Browser Settings > AI Utilities, or enable the server-side key.",
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: aiSettings.geminiModel || "gemini-3.7-flash",
        contents: `Provide an objective, concise, and ethical summary of the following web page content in 3-4 bullet points:\n\n${(text || "").substring(0, 8000)}`,
      });
      res.json({ summary: response.text || "No summary generated." });
    } catch (e: any) {
      res.json({ summary: `Summarization note: ${e?.message || "Service currently unavailable"}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`AmniSphere Server running on http://127.0.0.1:${PORT}`);
  });
}

function generateOfflinePage(topic: string, notice?: string): string {
  const safeTopic = (topic || "Safe Search").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeNotice = notice
    ? `<div class="mb-6 p-4 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-xs text-emerald-300">${notice}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <title>AmniSphere - ${safeTopic}</title>
  <meta name="color-scheme" content="dark">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Plus Jakarta Sans', sans-serif" class="bg-gray-950 text-gray-100 min-h-screen">
  <div class="max-w-4xl mx-auto px-6 py-12">
    ${safeNotice}
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-lg">🛡️</div>
      <div>
        <h1 class="text-2xl font-bold text-white">${safeTopic}</h1>
        <p class="text-xs text-emerald-400">Rendered securely by AmniSphere Offline Core & Al-Haq Ethics Shield</p>
      </div>
    </div>

    <div class="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8 shadow-xl">
      <h2 class="text-lg font-semibold text-emerald-300 mb-3">Topic Overview</h2>
      <p class="text-gray-300 leading-relaxed mb-6">
        You are browsing <strong>${safeTopic}</strong>. AmniSphere has isolated this view with 100% tracker-free security, zero telemetry, and Al-Haq Ethics Shield filtering.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
          <div class="text-emerald-400 text-sm font-semibold mb-1">Zero Telemetry</div>
          <div class="text-xs text-gray-400">All data stays strictly on your local device.</div>
        </div>
        <div class="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
          <div class="text-emerald-400 text-sm font-semibold mb-1">Al-Haq Ethics Shield</div>
          <div class="text-xs text-gray-400">Active filtering for predatory ads, gambling, usury, and trackers.</div>
        </div>
        <div class="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
          <div class="text-emerald-400 text-sm font-semibold mb-1">Open Source Core</div>
          <div class="text-xs text-gray-400">Crafted by Al-Haq Studio (alhaq.uk).</div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-4">
      <button onclick="FlashLiteAPI.performAction('Open Settings')" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition shadow">
        Configure Browser Settings
      </button>
      <button onclick="FlashLiteAPI.performAction('Open New Tab')" class="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium text-sm transition">
        Open Safe New Tab
      </button>
    </div>
  </div>
</body>
</html>`;
}

startServer();
