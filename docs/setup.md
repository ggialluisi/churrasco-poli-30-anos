# Setup

## 1. Create the Google Sheet

Create a blank spreadsheet and copy its ID from the URL. Do not make the spreadsheet public.

## 2. Create the Apps Script project

From the spreadsheet, open **Extensions → Apps Script**. Copy the files from `google-apps-script/` into the project, preserving their names.

In **Project Settings → Script Properties**, create:

| Property | Value |
|---|---|
| `SPREADSHEET_ID` | ID of the spreadsheet |
| `ADMIN_EMAIL` | Exact Gmail allowed to use `/admin` |
| `GOOGLE_CLIENT_ID` | Web OAuth client ID created in Google Cloud |

Run `setupSpreadsheet` once from the Apps Script editor and authorize it. This creates and formats the required sheets and initial configuration.

## 3. Configure Google sign-in

In Google Cloud Console:

1. Configure the OAuth consent screen.
2. Create an OAuth 2.0 Client ID of type **Web application**.
3. Add `http://localhost:3000` and the final GitHub Pages origin as authorized JavaScript origins.
4. Put the client ID in both the Apps Script `GOOGLE_CLIENT_ID` property and the GitHub variable described below.

## 4. Deploy Apps Script

Select **Deploy → New deployment → Web app**:

- Execute as: **Me**
- Who has access: **Anyone**

The web app is public because attendance does not require login. Private admin actions still require a valid Google ID token whose verified email matches `ADMIN_EMAIL`.

Copy the `/exec` URL.

## 5. Configure GitHub

In **Settings → Secrets and variables → Actions → Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APPS_SCRIPT_URL` | Apps Script `/exec` URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth web client ID |

In **Settings → Pages**, select **GitHub Actions** as the source. A push to `master` runs lint, type checking, the static build, and deployment.

## 6. Configure the event

Edit values in the `Config` sheet. Keep the `public` column set to `TRUE` only for values that may be returned to every visitor. Never place the admin email or secrets in this sheet.
