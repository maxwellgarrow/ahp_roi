# Air Hydro Power &times; Guidewheel &mdash; Utilization &amp; ROI Calculator

A small live calculator for modeling utilization-gain ROI across a full machine
deployment. Pre-loaded with the Air Hydro Power trial baseline (Lathe 1 + Weld 1,
6:00 AM&ndash;3:00 PM shift), every number is editable in the browser:

- Trial utilization %, shift length, working days/year
- Machine count and location count
- Labor rate and fully-burdened multiplier
- A slider (or +1% / +3% / +5% quick buttons) for the utilization gain to model

It's a static front end (`public/`) served by a tiny Express server, so it
deploys anywhere Node runs &mdash; including Railway's free tier.

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000

## Deploy: push to GitHub

1. Create a new repo on GitHub (keep it **private** if this has customer-specific numbers in it &mdash; it's fine to make the underlying tool public later and just swap the baseline inputs).
2. From this folder:

```bash
git init
git add .
git commit -m "Initial commit: utilization & ROI calculator"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

If you don't have a repo yet, the fastest path is the GitHub CLI:

```bash
gh repo create <repo-name> --private --source=. --remote=origin --push
```

## Deploy: Railway

1. Go to [railway.app](https://railway.app) and log in (GitHub login is easiest).
2. **New Project** → **Deploy from GitHub repo** → pick the repo you just pushed.
3. Railway auto-detects Node from `package.json` and runs `npm start` &mdash; no config needed.
4. Once it builds, click **Settings → Networking → Generate Domain** to get a public URL.
5. Every time you `git push` to `main`, Railway auto-redeploys.

That's it &mdash; no Dockerfile needed for this one since it's a plain Node/Express app,
but if you want the containerized version to match your other ROI calculators
(e.g. Leatherman), a minimal `Dockerfile` would look like:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Drop that in the repo root and Railway will use it automatically instead of Nixpacks.

## Project structure

```
.
├── server.js          # Express static server
├── package.json
├── public/
│   ├── index.html     # calculator UI
│   ├── style.css      # Guidewheel-brand styling
│   └── script.js       # live calculation logic
└── README.md
```

## Updating the baseline numbers

All the default values live as `value="..."` attributes on the `<input>` tags in
`public/index.html` (trial utilization, shift hours, working days, machine count,
location count, labor rate, burden multiplier). Change those defaults to reuse
this same tool for a different customer or trial.
