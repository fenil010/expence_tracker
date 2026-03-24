# FinTrack AI: Level 2 -> Level 5 Execution Roadmap

## Current Baseline (Already In Repo)
- Auth, budgets, goals, notifications, reports, tags, recurring rule model, CSV export, multi-currency core support.
- New in this iteration:
- `backend/routes/ai.js` with endpoints for chat-style spend Q&A, predictions, auto-categorization, and OCR-text parsing.
- `frontend/src/services/api.js` now exports `aiApi` for frontend integration.

## Feature Levels

## Level 2 (Polish + Intelligence)
- AI spend insights: weekly/monthly anomaly insights persisted to notifications.
- Receipt OCR v1: upload image -> OCR text -> parse amount/date/merchant -> transaction draft.
- Recurring transactions automation: scheduler to auto-create due transactions.
- Subscription tracker UI from recurring merchant rules.
- Advanced filters and tags UX improvements.

### API tasks
- Add `POST /api/transactions/receipt` (multipart upload + OCR service call).
- Add `GET /api/subscriptions/summary` from recurring + merchant heuristics.
- Add cron worker for recurring rule generation.

### Frontend tasks
- Add OCR upload flow in add transaction modal.
- Add AI chat panel using `aiApi.chat`.
- Add subscription widget on dashboard.

## Level 3 (Platform-Ready)
- Predictive analytics: next-month spend by category + confidence ranges.
- Weekly digest notifications (in-app + email).
- Bank feed simulator (mock provider) + auto-categorization pipeline.
- Export center with PDF + XLSX.

### Data model additions
- `BankConnection` (provider, token, status)
- `ImportedTransaction` (sourceId, confidence, matchStatus)
- `Subscription` (name, amount, cadence, nextRenewal)

## Level 4 (Collaborative + Mobile-First)
- Shared expenses (groups, member balances, settlement ledger).
- PWA offline-first sync queue.
- Voice input command parser (`Add 200 food expense`).
- 2FA (email OTP first, authenticator second).

### Data model additions
- `Group`, `GroupMember`, `GroupExpense`, `Settlement`
- `SyncQueue` local-first operation logs (frontend IndexedDB)

## Level 5 (Startup-Grade)
- Admin panel: user analytics, suspicious-entry heuristics, growth metrics.
- Fraud-like pattern detection (duplicates, impossible frequency, suspicious spikes).
- Full AI copilot with context memory (ask + actions).
- Production observability and audit trails.

## Priority Implementation Order (Recommended)
1. OCR upload -> transaction draft (visible wow factor)
2. AI chat + spend Q&A wired to `/api/ai/chat`
3. Prediction card using `/api/ai/predictions`
4. Subscription tracker from recurring data
5. Email weekly report + budget breach notifications
6. Shared expenses module (group MVP)
7. PWA offline sync
8. Admin analytics

## Environment Setup
- Backend `.env` now includes placeholders for OpenAI/Ollama/OCR/Twilio/SMTP in `.env.example`.
- Add real keys before enabling external providers.

## Suggested Milestones
- Milestone A (7 days): OCR + AI chat + prediction cards
- Milestone B (14 days): subscription tracker + weekly digest + export center
- Milestone C (21 days): split expenses + settlements
- Milestone D (30 days): offline mode + admin panel alpha

## Success Metrics
- Insight accuracy: >80% useful insights feedback.
- OCR draft accuracy: >70% merchant/date/amount extraction match.
- Auto-categorization top-1 accuracy: >75% on active users.
- Weekly active retention improvement after AI features: +15% target.
