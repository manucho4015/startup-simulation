# Startup Simulation — Take-Home Assignment

## Overview

This project is a **single-player, turn-based startup simulation**. Each turn represents one business quarter. The player makes strategic decisions around pricing, hiring, and compensation, then advances the quarter to see updated financial and operational outcomes.

The simulation is **server-authoritative**: all business logic runs on the backend, and game state is persisted server-side so it survives page reloads. The objective is to keep the company solvent for 10 years. Running out of cash ends the game.

---

## Tech Stack

- **Frontend:** Next.js (App Router)
- **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Authentication:** Email & password (Supabase Auth)
- **Architecture:** Server-side simulation with a clean API boundary

---

## How It Works

1. Users authenticate via email and password.
2. Each user has a single persisted game state.
3. On each quarter, the client submits **decisions only** (price, hiring, salary level).
4. The server:
   - Loads the current game state
   - Executes the simulation logic
   - Persists the updated state and quarter history
5. The UI renders updated metrics, recent history, and an office visualization.

---

## Key Technical Decision

### Server-Authoritative Simulation Logic

All simulation math is implemented as a **pure function** and executed exclusively on the server via a single API endpoint. The client never computes outcomes and cannot influence results beyond submitting decisions.

This approach ensures:

- Correctness and consistency
- No client-side manipulation
- Clear separation between UI and business logic
- Easy reasoning and testability of the simulation model

---

## Tradeoffs & Scope Decisions

To stay focused and complete within the timebox, I intentionally scoped out:

- Multiple save slots or game resets
- Complex animations or visual effects
- Advanced economic balancing
- Multiplayer or real-time updates

The emphasis was placed on **correctness, clarity, and maintainability** rather than visual polish.

---

## What I’d Improve With More Time

With additional time, I would:

- Add stronger validation around decision inputs
- Improve responsiveness and polish of the office visualization
- Add automated tests for the simulation logic
- Introduce a game reset or replay option

---

## Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Add environment variables
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run the development server
npm run dev
```
