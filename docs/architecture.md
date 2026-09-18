# Architecture

The browser downloads a static Next.js site from GitHub Pages. Public reads and form submissions call a deployed Google Apps Script web app, which reads and writes one Google Sheet.

The administration page uses Google Identity Services to obtain a short-lived ID token. It sends that token only to Apps Script. Apps Script validates the token with Google and compares the verified email with the single `ADMIN_EMAIL` script property before returning private records.

The Google Sheet contains:

| Sheet | Purpose |
|---|---|
| `Config` | Public event configuration |
| `Participants` | Attendance responses and private contact details |
| `Payments` | Administrative payment records |
| `Expenses` | Planned and actual expenses |
| `Purchases` | Operational shopping list |

Public participant responses contain only a generated ID, display name, attendance status, and group size. Contact, dietary, notes, and individual payment data are administrative.

## Trust boundaries

- GitHub Pages and all `NEXT_PUBLIC_*` values are public.
- `ADMIN_EMAIL`, `SPREADSHEET_ID`, and `GOOGLE_CLIENT_ID` are stored in Apps Script properties.
- The Sheet must not be publicly shared.
- PIX is external and no banking integration exists.
