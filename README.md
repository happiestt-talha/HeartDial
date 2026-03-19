# 💖 HeartDial
<!-- feat: initialize Next.js application with dial management API routes, pages, and MongoDB integration. -->
A romantic long-distance relationship web app. Spin a dial, hear their voice, feel like they're right there.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in your MongoDB + Cloudinary credentials
npm run dev
# Open http://localhost:3000
```

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL (e.g. https://heartdial.app) |

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/create` | 4-step dial creator |
| `/d/[id]` | View a shared dial |

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/dials` | Create a new dial |
| GET | `/api/dials/[id]` | Fetch dial + increment view count |
| POST | `/api/dials/[id]/verify` | Check password |
| POST | `/api/dials/[id]/react` | Send a heart reaction |
| GET | `/api/dials/[id]/stats` | Get view count, reactions, days left |

## Tech Stack

- **Next.js 15** (App Router, JavaScript)
- **MongoDB Atlas + Mongoose** — data storage, 30-day TTL auto-delete
- **Cloudinary** — photo + audio hosting
- **nanoid** — 6-char short IDs
- **bcryptjs** — password hashing

## Notes

- Dials expire automatically after 30 days (MongoDB TTL index)
- Max 10 photos per dial
- Password protection is optional
- No user accounts needed
