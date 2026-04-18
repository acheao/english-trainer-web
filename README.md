# English Trainer Web

`english-trainer-web` is the frontend for the English Trainer product. It turns the full learning loop into a usable interface:

`sign up / sign in -> connect model APIs -> import materials -> start a 30-minute daily session -> review feedback -> track progress`

The backend repository lives at `C:\Users\Lin Chao\Documents\work\language-agent`.

## Product Direction

This project is no longer positioned as a single-shot correction tool. It is a learner workspace built around user-owned materials and adaptive practice.

The intended product flow is:

1. A user registers and signs in.
2. The user connects one or more common LLM providers such as OpenAI, DeepSeek, Qwen, Gemini, Kimi, GLM, Grok, or MiniMax.
3. The user imports materials from YouTube URLs, article URLs, or plain text.
4. The backend stores those materials, downloads English subtitles and mp3 files for YouTube when available, and splits content into study units.
5. Every day the system builds a focused practice pack of about 30 minutes.
6. After each answer, the system records score, error types, duration, hesitation, and skip behavior to improve the next session.

## Frontend Information Architecture

### Auth

- Sign in
- Sign up
- Redirect new users into onboarding inside Settings

### Today

- The home page is the daily command center
- Shows the current focus, estimated practice time, readiness, recent lessons, and the main CTA to start practice

### Materials

- Import from YouTube URL
- Import from article URL
- Import from plain text
- Review lesson details and manage study units

### Practice

- Start a daily or extra session
- Answer tasks generated from user materials
- Review score, feedback, and error types
- Continue until the session is complete

### Stats

- Streak
- Practice time
- Average score
- Error type trends

### Settings

- Profile and daily learning goal
- Backend base URL override
- LLM provider configuration and testing

## Code Structure

```text
src/
  features/
    auth/
    home/
    materials/
    practice/
    settings/
    stats/
  shared/
    api/
    config/
    ui/
  types/
```

## Frontend Responsibilities

The frontend is responsible for:

- product flow and onboarding
- session state and user-facing feedback
- lesson, study unit, and stats presentation
- LLM configuration management UX

The backend is responsible for:

- authentication
- material ingestion and persistence
- YouTube subtitle/audio processing
- article text extraction
- daily plan calculation
- adaptive task generation
- grading and stats aggregation

## Local Development

### Requirements

- Node.js 20+
- npm

### Start

```bash
npm install
npm run dev
```

Default dev URL:

```text
http://localhost:5173
```

### Backend API URL

The app reads its default API base from `VITE_API_BASE_URL`, and users can also override it inside Settings.

Example:

```text
VITE_API_BASE_URL=http://127.0.0.1:8080
```

## Docker Deployment

This repository already includes:

- `Dockerfile`
- `docker-compose.yml`
- `nginx/default.conf`

Example:

```bash
docker compose up -d --build
```

By default the container exposes the frontend on port `8088`.

## Refactor Focus

The current refactor is centered on:

- a clearer onboarding flow
- user-owned materials instead of demo-only flows
- daily adaptive practice instead of generic exercises
- per-user LLM settings instead of a single global model
- cleaner product copy and interaction language

## Related Repositories

- Frontend: `C:\Users\Lin Chao\Documents\work\english-trainer-web`
- Backend: `C:\Users\Lin Chao\Documents\work\language-agent`
