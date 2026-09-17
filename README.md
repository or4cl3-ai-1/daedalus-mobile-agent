# Daedalus Mobile Agent

**v2.1 — LLM-Connected · Document-Aware · Voice-Enabled**

**Autonomous AI Innovation Agent**  
Crafted by Or4cl3 AI Solutions’ Autonomous R&D Lab

> *I fuse humanistic creativity with machine precision. Tell me a software vision and I will turn it into production-ready reality.*

A complete, installable Progressive Web App that puts Daedalus in your pocket — with live Hugging Face LLM support, document upload, methodology modes, voice I/O, and project memory.

**Live app:** [https://or4cl3-ai-1.github.io/daedalus-mobile-agent/](https://or4cl3-ai-1.github.io/daedalus-mobile-agent/)

---

## What’s New in v2.1

| Feature | Description |
|---------|-------------|
| **Hugging Face LLM** | Paste your HF token in-app (LLM Settings). Chat uses the OpenAI-compatible Inference Providers router with the full Daedalus system prompt |
| **Document upload** | PDF, TXT, Markdown — text extracted (PDF.js), stored locally, injected into chat context |
| **Docs tab** | Dedicated gallery to upload, activate, and delete documents |
| **Methodology modes** | Auto · Requirements · Architecture · Prototype · Implement · Improve — steers local engine and live LLM |
| **Voice input** | Web Speech API mic button |
| **Text-to-speech** | Speak Daedalus’s last reply |
| **Follow-up chips** | Contextual next-step suggestions after every reply |
| **Context bar** | Shows active document, mode, and LLM connection status |
| **Export conversation** | Download the session as Markdown |
| **Projects gallery** | Save, load, rename, delete multi-turn projects |
| **Landing + loading** | Cinematic entry experience with particle field and neural loading sequence |

---

## Core Capabilities

- **Conversational agent** with typing animation and rich Markdown-style emphasis  
- **Local personality engine** that stays in character when offline or when no token is set  
- **Live LLM path** via `https://router.huggingface.co/v1/chat/completions`  
- **Document-aware reasoning** — uploaded papers become primary context  
- **Offline-first PWA** — service worker + localStorage; installable on iOS and Android  
- **Privacy by design** — token and data stay in the browser  

---

## The Five Methodologies

1. **Lightning-Fast Requirements Gathering**  
2. **Creative System Architecture**  
3. **Flawless Task Implementation**  
4. **Rapid Prototyping & Testing**  
5. **Continuous Improvement System**

Selectable as operating modes in the chat footer.

---

## Connecting a Hugging Face Model

1. Create a token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) with **Inference Providers** permission.  
2. In the app: Menu → **LLM Settings**.  
3. Paste the token and set a model ID (default: `google/gemma-2-9b-it`).  
4. Save. Status becomes **LLM Ready**.

The token is stored only in `localStorage` on your device. If the API call fails, the app falls back to the local engine.

**Recommended models** (must be available via Inference Providers):

- `google/gemma-2-9b-it`
- `google/gemma-2-27b-it`
- Other chat models listed on the HF router (optionally with `:fastest` or a provider suffix)

---

## Document Workflow

1. Open the **Docs** tab (or Menu → Upload Document).  
2. Upload PDF / TXT / MD.  
3. Tap **Use in Chat** to make it the active context.  
4. Ask for summaries, theorem extraction, architectures grounded in the paper, or implementation slices.

PDF text is extracted client-side with PDF.js (up to 40 pages, ~120k characters stored).

---

## Project Structure

```
daedalus-mobile-agent/
├── index.html          # SPA shell: landing, loading, chat, projects, docs, settings
├── css/styles.css      # Mobile-first design system
├── js/daedalus.js      # State, personality engine, HF client, voice, docs, projects
├── icons/              # Logo + PWA icons
├── manifest.json       # Installability
├── sw.js               # Offline cache (v2.1)
├── LICENSE             # Or4cl3 Open Model License (when present)
└── README.md
```

---

## Tech Stack

- Vanilla HTML / CSS / JS (zero framework dependencies)
- Progressive Web App (manifest + service worker)
- PDF.js (CDN) for client-side PDF text extraction
- Hugging Face Inference Providers (OpenAI-compatible chat completions)
- Web Speech API (input + TTS where supported)
- localStorage for messages, projects, documents, and HF settings

---

## Install (Add to Home Screen)

- **iOS Safari:** Share → Add to Home Screen  
- **Android Chrome:** Menu → Install app / Add to Home screen  

After first load the app works offline for the local engine and cached assets.

---

## Privacy & Security

- Conversations, projects, and documents never leave the device except when you intentionally call the HF API with your own token.  
- The HF token is not committed to the repo and is not sent to GitHub Pages.  
- Use a dedicated token with minimal scope; do not use privileged tokens on shared devices.

---

## Roadmap Ideas

- Streaming token responses from the HF router  
- Multi-document context picker  
- Structured architecture cards  
- Optional serverless proxy so the token never touches the client  
- Integration with **Daedalus-M** (Gemma 4 fine-tune) when released  

---

## License

Project code is intended for use under terms aligned with Or4cl3 Open Model License (OOML) where applicable. See `LICENSE` in the repository when present. Third-party libraries (e.g. PDF.js) retain their own licenses.

---

## Author

**Or4cl3 AI Solutions** — Autonomous R&D Lab  
Founder & Chief Architect: Dustin R. Groves  

*No software vision is out of reach. Together, let’s build the future.*

---

**Version:** 2.1  
**Repository:** [or4cl3-ai-1/daedalus-mobile-agent](https://github.com/or4cl3-ai-1/daedalus-mobile-agent)  
**Live:** [GitHub Pages](https://or4cl3-ai-1.github.io/daedalus-mobile-agent/)
