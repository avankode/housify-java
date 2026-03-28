# Housify - Java Backend

## Project Overview
Housify is a full-stack application. This repository is the **Java backend**, intended to replace the original Django/Python backend.

## Repository Map

| Repo | Path | Notes |
|------|------|-------|
| **This repo** (Java backend) | Current directory | The new backend being developed |
| Frontend | `/Users/avaneeshkulkarni/PycharmProjects/Housify/frontend` | React/JS frontend app |
| Original backend | `/Users/avaneeshkulkarni/PycharmProjects/Housify/backend` | Django/Python — the original working backend |

## Tech Stack
- **This repo:** Java (Spring Boot), PostgreSQL
- **Original backend:** Python (Django), PostgreSQL
- **Database:** PostgreSQL for both backends — schema should be compatible or equivalent

## Frontend Branch Strategy

- **`feature/amazon`** — Configured to work with the **Django backend** (`/Users/avaneeshkulkarni/PycharmProjects/Housify/backend`). This pairing is stable and mostly functional. Use it as the reference implementation.
- **`feature/hosting-ec2`** — Configured to work with **this Java backend**. This is the active development branch that needs changes to fully integrate with this repo.

## Django Backend Branch
- **`feature/onLocal`** — The branch used for running the Django backend locally. Use as reference for API behavior.

## Current Goal
Get the frontend (`feature/hosting-ec2` branch) fully working with this Java backend **locally**.

## Running Locally
- **Django backend:** `python manage.py runserver` (branch `feature/onLocal`)
- **Frontend:** `npm run dev` — runs on `localhost:3000`
- **This repo (Java backend):** TBD

## Development Notes
- When making API changes in this repo, corresponding changes may be needed on the `feature/hosting-ec2` branch of the frontend.
- Compare against the Django backend's API contracts when in doubt about expected request/response shapes.
- Both backends use PostgreSQL — use the Django backend's models/schema as reference when building or modifying tables in this repo.

## Additional Notes
- All production level deployments that are to be made are to be made in the frontend are to be made from now on in `/Users/avaneeshkulkarni/PycharmProjects/Housify/frontend` in the branch 'feature/java-deployment'
- All production level deployments that are to be made are to be made in the backend are to be made from now on in this repository in the branch 'prod'
- both these branches are already made and i am in them right now