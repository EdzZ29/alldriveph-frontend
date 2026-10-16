# Alldrive website (Next.js)

See the [project README](../README.md) for setup and deployment.

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3001
npm run build && npm start
```

Key folders:

- `app/[lang]/(site)` public pages in English, Filipino and Cebuano, `app/admin` admin panel (sign in served at `/alldriveadminlogin`), `app/[lang]/(site)/car-rental/[city]` branch landing pages
- `components/booking` booking wizard and tracking, `components/admin` admin UI
- `lib/api.ts` server side API client, `lib/client-api.ts` browser client, `lib/seo.tsx` structured data
- `lib/site.ts` business details, `lib/branches.ts` branch content
