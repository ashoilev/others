# Others

Editorial landing page built with React, Vinext and Cloudflare D1. Source lives in `app/`; generated, optimized artwork lives in `public/images/`.

## Development

Install with the Sites install-dependencies helper, then `npm run dev`. `npm run build` builds the Worker. D1 is declared as `DB` in `.openai/hosting.json`. Publishing through Sites provisions D1 and applies the committed Drizzle migration. Local preview needs that migration applied separately (see starter documentation).

## Waitlist and export

`POST /api/waitlist` validates and normalizes email, persists email/signup time/privacy version, and handles duplicates with a unique database key. Repeated signup returns the same success response to avoid revealing whether a person is registered. Database failures return an error, never a fake success. No email delivery provider is configured; signups are stored but confirmation emails are not sent.

Set a strong random `WAITLIST_ADMIN_TOKEN` through the Sites runtime environment settings (secret), then visit `/admin` to export CSV. Do not put the token in source or a URL. Export stays disabled until configured. CSV output neutralizes spreadsheet formula prefixes. Secure exported personal data and delete it when no longer needed.

Before a public consumer launch, set the site's audience to public, finalize the operator's privacy contact and retention policy, and configure outbound email with unsubscribe handling. New Sites are private by default. The displayed privacy disclosure describes this waitlist only; the fictional product preview does not collect personality data.

## Analytics

No analytics provider, tracking cookies, or persistent visitor identifiers are configured. The client emits local `others:analytics` CustomEvents for landing_page_viewed, primary_cta_clicked, how_it_works_reached, activity_feed_interacted, waitlist_signup_started, and waitlist_signup_completed. They contain an event name only and are not sent anywhere. Connect a privacy-conscious provider only after deciding the launch markets and any applicable consent requirements. Do not attach email addresses to analytics. Google Fonts currently serves DM Sans; self-host it before launch if eliminating third-party font requests is required.

## Artwork

Built-in imagegen created both assets; final prompts are in ARTWORK.md. Generated source PNGs remain in the Codex generated_images directory; the website uses optimized project-local JPEGs.

## GitHub Pages

`npm run build:pages` produces a pre-rendered static site in `pages-dist/` from the same React page and CSS. It preserves the Sites backend source separately. `.github/workflows/pages.yml` deploys pushes to `main` using GitHub Actions. Enable **Settings → Pages → Source → GitHub Actions** in the `others` repository.

Pages cannot run the D1/API backend. Until repository variable `WAITLIST_ENDPOINT` is configured, the Pages build explicitly states that signup is disconnected and saves nothing. Supply a public HTTPS endpoint implementing the existing JSON POST contract (`email`, `website`; JSON `message` on success, `error` on failure), with persistent storage, duplicate handling, and CORS allowing the Pages origin. Do not use the owner-private Sites URL as this endpoint. No administrator token belongs in a Pages variable or build.

For a custom domain or repository rename, update `PAGES_BASE_PATH` in the workflow. The default `/others/` supports a project Pages URL.
