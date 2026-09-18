# Project instructions

Keep this project intentionally simple and inexpensive.

## Architecture

- Next.js static export hosted on GitHub Pages.
- Google Sheets is the only persistence layer.
- Google Apps Script is the API between the browser and Sheets.
- Google Identity Services authenticates the single administrator.
- The API must validate the Google ID token, audience, expiration, verified email, and the allowlisted admin email.
- Do not add a Next.js server runtime, application database, payment processor, or user-management system unless explicitly requested.
- PIX payments happen outside the application; the app stores administrative records only.

## Privacy and language

- Public pages must never expose email addresses, phone numbers, dietary restrictions, notes, or payment details tied to an individual.
- Do not collect CPF, documents, banking credentials, passwords, or unnecessary personal data.
- User-facing copy is in Brazilian Portuguese. Code identifiers and documentation are in English.

## Quality

- Preserve static-export compatibility.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` after changes.
- Keep the interface responsive and accessible without adding a heavy UI framework.
