# docx-merger-app

A demo web application for the [docx-merger](https://www.npmjs.com/package/docx-merger) npm package. Upload up to 3 Word documents (.docx) and download them merged into one — styles, tables, images, and numbering all preserved.

## Live Demo

**[docx-merger-app.onrender.com](https://docx-merger-app.onrender.com)**

## Features

- Drag & drop or click-to-browse file selection (up to 3 files, 5 MB each)
- Drag-to-reorder files to control merge order
- Animated progress bar with shimmer while merging
- Animated SVG checkmark on success, shake animation on error
- Live npm stats (version, weekly & monthly downloads) fetched from the npm registry
- Server-side rate limiting, file size validation, and .docx-only filtering

## Stack

| Layer | Tech |
|---|---|
| Server | Node.js, Express |
| File uploads | Multer |
| Rate limiting | express-rate-limit |
| Merge engine | [docx-merger](https://github.com/apurvaojas/docx-merger) |
| Frontend | Vanilla HTML / CSS / JS — no framework |
| Deployment | Render |

## Local Development

```bash
git clone https://github.com/yoursshahnawaz/docx-merger-app
cd docx-merger-app
npm install
cp .env.example .env
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `MAX_FILE_SIZE_MB` | `5` | Max upload size per file |
| `MAX_FILES` | `3` | Max files per merge request |
| `RATE_LIMIT` | `30` | Merge requests per IP per hour |

Copy `.env.example` to `.env` and adjust as needed.

## Deploy to Render

1. Fork this repo
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo — settings are auto-detected from `render.yaml`
4. Click **Deploy**

The free tier spins down after 15 min of inactivity. Upgrade to Starter ($7/mo) for always-on.

## Project Structure

```
docx-merger-app/
├── server.js          # Express server — /merge endpoint
├── render.yaml        # Render deployment config
├── .env.example       # Environment variable reference
└── public/
    ├── index.html     # Landing page
    ├── styles.css     # Design system + component styles
    └── app.js         # Merge flow, drag-and-drop, npm stats
```

## License

MIT
