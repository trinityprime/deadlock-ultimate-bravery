# Deadlock Ultimate Bravery — Item Randomizer (prototype)

This is a minimal React + Vite + TypeScript prototype that fetches items from the Deadlock Assets API and randomizes a build for a selected hero.

Quick start:

```bash
npm install
npm run dev
```

Notes:

- The app fetches items from `https://assets.deadlock-api.com/v2/items` on startup.
- Hero list is currently hardcoded in `src/App.tsx`.
- Next steps: seedable randomness, champion list from API, filtering rules, shareable links.
