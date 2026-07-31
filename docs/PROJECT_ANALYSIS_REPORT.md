# Project Analysis Report — Cool English (英檢口說練習)

## 1. Overview

**Cool English** is an AI-powered **GEPT (General English Proficiency Test)** speaking practice web app with two modes: **Question Answering** and **Image Description**. Combines Azure Cognitive Services (speech recognition/synthesis) + Azure OpenAI GPT for content scoring/feedback. All UI in zh-TW.

## 2. Project Structure

```
src/
├── routes/                                  # SvelteKit file-based routing
│   ├── +layout.svelte                       # Navbar (flowbite-svelte), route links: Home → Q&A / Image-Description
│   ├── +page.svelte                         # Landing page — hero, features, two mode cards
│   ├── question-answering/+page.svelte      # Q&A flow: landing→select difficulty→prepare→practice→scoring→results
│   ├── image-description/+page.svelte       # Image desc flow (multi-sub-question per round)
│   ├── recorder/+page.svelte                # Debug page for Recorder component + audio playback + animated score display
│   └── api/                                 # Server-side endpoints
│       ├── speech/credentials/+server.ts    # GET — fetches Azure STS JWT token for client SDK
│       ├── grader/score-answer/+server.ts   # POST — GPT scores single answer (vocab/grammar/relevance + feedback)
│       └── grader/overall-feedback/+server.ts  # POST — GPT summary feedback for all questions in a round
├── lib/server/                              # Server-only modules ($env/dynamic/private)
│   ├── azure/openai.ts                      # AzureOpenAI client instance (endpoint, key, version, deployment name from env)
│   ├── azure/speech.ts                      # getCredential() → calls Azure Cognitive Services STS endpoint → returns bearer token + region
│   └── utils/jailbreak.ts                   # detectJailbreak() — probes user input against an unrelated C++ question to prevent prompt injection
│   └── utils/zod.ts                         # removeUnsupportedProps() — sanitizes Zod schemas for OpenAI structured output helper
├── lib/azure/                               # Client-side Azure Speech integration
│   ├── credential.ts                        # getAzureCredential() — fetches JWT from /api/speech/credentials, caches with expiry check
│   └── speech/index.ts                      # Re-exports Recognizer + Synthesizer
│       ├── recognizer.ts                    # STT w. pronunciation assessment; token auto-refresh every 180s
│       └── synthesizer.ts                   # TTS using en-US-JennyNeural voice
├── lib/components/                          # Reusable Svelte UI components (Svelte 5)
│   ├── Recorder.svelte                      # Core recording comp — integrates Azure Recognizer, real-time transcription & scoring UI
│   ├── SpeakingPractice.svelte              # Higher-level practice wrapper
│   ├── ScoreSummary.svelte                  # Displays vocabulary/grammar/relevance scores at-a-glance
│   ├── AssessmentResult.svelte              # Per-question scoring breakdown
│   ├── FinalResult.svelte                   # Aggregate result summary
│   └── OverallFeedback.svelte               # Combined feedback display
│   ├── PronunciationBreakdown.svelte        # Phoneme-level pronunciation detail from Azure assessment
│   └── CircularProgress.svelte, ProgressNavigation.svelte, AudioPlayer.svelte  # Animation/UX helpers
├── lib/types.ts                             # Core type definitions — SpeechAssessment, ContentAssessment, AssessmentResult, Message + types/                                            # Question & ImageQuestion interfaces
│   ├── questions.ts                         # Question & ImageQuestion interfaces with fields like id, text, imageUrl, subquestions[], difficulty, category
│   └── questionService.ts                   # Question banks (5 Q&A + 1 real image + sampleImageQuestionBank w/ 6 entries) + random selection logic + used-image tracking via sessionStorage
├── static/                                  # Static assets served at root URL
└── app.*                                    # Global styles, HTML entry template, TypeScript declarations
```

## 🏗️ 3. Code Architecture Overview

| Layer | Technology |
|---|---|
| Framework | **SvelteKit** (v2.x) with Svelte 5 (`$state`, `$effect`) |
| Build Tool | Vite + `@sveltejs/adapter-auto` |
| Styling | TailwindCSS v4 + Flowbite-Svelte components |
| Icons | Lucide-Svelte |
| Language | TypeScript (strict mode, bundler resolution) |
| API Client | OpenAI SDK (`AzureOpenAI`) native client — supports structured JSON output via `zodResponseFormat` for parseable data |
| Validation | Zod (request/response schema validation at type-safe boundaries) |

### 3.1 Architecture Diagram (Simplified)

```
┌── Browser / Client ──────────────┐                    ┌── Server (Node.js via SvelteKit) ──┐                          ┌── External Services ───┐
│                                │                            │                                 │                              │                        │
│                  │                           │                         ├── GET /api/speech/credentials       ─────► Azure Cognitive          │          │                   Speech SDK calls        │                    Azure OpenAI               │            │                             ▲                      ▲                               Azure STS (Token Issuance)  │                       Chat Completions         │
│                             │                               │             (routes/api)              │                     │── GET /api/speech/credentials   ──► JWT token                │                          │        │                                 ├──── POST /api/grader/score-answer  ──► GPT scores answer          │                          │         │                                │── POST /api/grader/overall-feedback ► GPT generates summary      │                           │       │                                 │                               │                                 │                              │                        │
└────────────────────────────┘                    └──────────────────────────────────┘                          └───────────────────────────┘
```

### 3.2 Data Flow — Question Answering Mode

1. **User selects difficulty** (`beginner` / `intermediate` / `advanced`) → App picks random question from bank
2. **Synthesizer reads Q aloud twice (TTS via en-US-JennyNeural)
3. User speaks answer → Recognizer captures + assesses STT Azure Speech SDK w/ pronunciation assessment (accuracy, fluency, prosody — 0-100 per HundredMark system, with phoneme granular breakdown optional)
4. On speech end → `handleResult()` fires with transcript + accuracyScore/fluencyScore/prosodyScore from pron-assessment
5. Client POSTs `{ question.text, answer }` to **score-answer** endpoint — GPT model scores vocabulary/grammar/relevance (0-100 each), overall grade (0-5), gives friendly feedback in zh-TW)
6. UI renders combined results → option: "Retry" or "Next Question"

### Image Description Mode Flow

Same core flow, but: each image-question has 4 sub-questions to answer sequentially — scoring runs async in background (Promise-based pendingScore tracking) so next question immediately without blocking → at last question, waits for all scores, computes overall averages across speech + content, then calls **overall-feedback** endpoint for GPT-generated summary.

## 🔐 Azure / Microsoft Keys Required

All stored in `.env`, accessed via `$env/dynamic/private` (server-only — never leaked to client):

| Variable | Purpose | Where to Obtain | Example Value |
|---|---|---|---|
| `AZURE_SPEECH_KEY` | Key for Azure Cognitive Services Speech resource | Azure Portal > Speech Service > Keys & Endpoint | `abc123...` (your actual key) |
| `AZURE_SPEECH_REGION` | Region of your speech service deployment — used both for STS token issuance and client SDK region config | Same page as key, displayed alongside key | e.g., `westus`, `eastasia`, `northeurope` ... |
| `AZURE_OPENAI_ENDPOINT` | Full URL of your Azure OpenAI resource (must end with `/`) | Azure Portal > AI Foundry Resources > Keys & Endpoint | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY` | API authorization key for the same Azure OpenAI resource | Same as endpoint page, under "Key 1" or "Key 2" | `<YOUR_LONG_API_KEY>` |

### Key Security Notes
- `.env.example` is provided as template — **never commit actual keys to git** (`.gitignore`, it's excluded ✅)
- All values accessed via `$env/dynamic/private` — server-only environment variables, never exposed client. ✅
- The `/api/speech/credentials` endpoint acts as a token proxy: browser gets short-lived JWT instead of raw Azure key, mitigating credential leakage even if intercepted.

## 🚀 5. How to Start the Web Application

### Prerequisites
- **Node.js** (latest stable LTS recommended)
- **pnpm** package manager (`npm install -g pnpm`)

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and edit with YOUR actual Azure credentials
cp .env.example .env

# 3. Start the dev server
pnpm dev
```

App serves at **http://localhost:5173** (Vite's default). Opens in browser — requires microphone access + Web Audio API support (Chrome, Edge, Firefox all work fine).

### Other Commands

| Script | Description | Command |
|---|---|---|
| `dev` | Start Vite dev server with HMR | `pnpm dev` |
| `build` | Build for production deployment | `pnpm build` |
| `preview` | Preview the built production app locally | `pnpm preview` |
| `check` | Run Svelte type-checking (svelte-check) | `pnpm check` |
| `lint` | Prettier + ESLint code quality checks | `pnpm lint` |

---

## 6. Key Design Decisions & Considerations

### Dual Scoring System
- **Speech Quality** scored by **Azure Pronunciation Assessment** (browser, local, real-time — accuracy/fluency/prosody on phoneme granularity via HundredMark system) then converted to 0-5 scale via `total = avg(accuracy+fluency+prosody)/20`
- **Content & Feedback** scored by server GPT call → vocabulary/grammar/relevance (0-100) + overall grade (0-5) + zh-TW feedback for structured response

### Jailbreak/Prompt Injection Defense
Before every scoring request, `detectJailbreak()` fires: feeds user's answer into a **completely unrelated C++ memory management question** to GPT. If model returns ≥3 — interprets input as an attempt to subvert prompt (prompt leakage/injection) → rejects with 400 error

### Client-Side Token Lifecycle
- Azure STS tokens valid for ~10 minutes — auto-refresh via `setInterval(180_000)` ms).
- Expired tokens detected in `credentialIsValid()` via JWT payload `exp` claim check before use.
