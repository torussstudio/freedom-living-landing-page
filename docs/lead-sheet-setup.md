# Save website leads to the Freedom Living Lead Sheet

Every form on the site (visit, question, call-back pop-up, investor enquiry) posts to
`/api/lead`. That function adds a row to the **Landing Page Leads** tab and also sends the emails.
One-time setup, about 5 minutes:

## 1. Add the script to the sheet
1. Open the **Freedom Living Lead Sheet** → **Extensions → Apps Script**.
2. Delete the default code and paste the whole of [`lead-sheet.gs`](./lead-sheet.gs).
3. In `setSecret()` replace `CHANGE-ME-to-a-long-random-string` with your own long random text
   (keep a copy; you need it in step 3). Select `setSecret` in the function dropdown → **Run**
   → allow the permissions. After that you can change the text in the file back, the secret is stored.

## 2. Deploy it as a web app
1. **Deploy → New deployment → type: Web app**.
2. *Execute as*: **Me**. *Who has access*: **Anyone**.
3. **Deploy**, then copy the **Web app URL** (ends in `/exec`).
   Opening that URL in a browser should show `{"ok":true,"service":"Freedom Living leads"}`.

If you change the script later: **Deploy → Manage deployments → edit → New version**
(the URL stays the same).

## 3. Tell the website (Vercel)
Vercel → Project → Settings → Environment Variables:

| Name | Value |
| --- | --- |
| `LEADS_SHEET_WEBHOOK` | the Web app URL from step 2 |
| `LEADS_SHEET_SECRET` | the same secret text you used in `setSecret()` |

Redeploy. Fill any form on the live site: a new row appears in **Landing Page Leads**
(Sl No, Date, Name, Contact Number, Email, Lead Type, Details, Message, Our Contact Details).
The last column is left empty for your own notes (e.g. "Shared"), like the OLX Leads tab.

## Notes
- The emails keep working as before (`GMAIL_USER`, `GMAIL_APP_PASSWORD`). A form counts as
  sent if the sheet **or** the email worked; if one fails the other still goes through and the
  error is in the Vercel function logs.
- Without the two `LEADS_SHEET_*` variables the sheet step is simply skipped.
- Local testing: `npm run dev` does not run `/api`. Use `vercel dev` to try it.
