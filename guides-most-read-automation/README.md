# Most-read guide automation (GA4 → /guides featured card)

A free daily GitHub Action reads your Google Analytics (GA4) all-time pageviews for the
three guide pages, picks the most-read one, and writes `featured.json`. The /guides page
reads that file and features the winning guide. If anything is ever unreachable, the page
just shows the current featured card — it can never break for visitors.

**Guides tracked**
- Families → `/lifestyle-family-portraits-guide-what-to-wear`
- Corporate → `/the-corporate-headshot-field-guide-what-to-wear-how-to-prepare`
- Wedding → `/the-ultimate-wedding-guide`

---

## Your one-time setup (the parts I can't do for you)

You'll do the logins + clicks; I've written all the code. ~15 minutes.

### 1. Get your GA4 Property ID
Google Analytics → **Admin** (gear, bottom-left) → **Property settings** → copy the
**Property ID** (a number like `123456789`). Make sure it's a **GA4** property (Universal
Analytics was shut off in 2024 and won't work).

### 2. Create a Google service account + key
1. Go to https://console.cloud.google.com/ and pick or **create a project** (any name).
2. In the search bar, open **"Google Analytics Data API"** → click **Enable**.
3. Search **"Service Accounts"** → **Create service account** → name it e.g. `ga-featured`
   → **Create and continue** → skip the optional role steps → **Done**.
4. Click the new service account → **Keys** tab → **Add key** → **Create new key** →
   **JSON** → **Create**. A `.json` file downloads. **Keep it safe — this is a secret.**
5. Copy the service account's **email** (looks like `ga-featured@yourproject.iam.gserviceaccount.com`).

### 3. Give the service account access to GA4
Google Analytics → **Admin** → **Property Access Management** (or Account Access
Management) → **+** → **Add users** → paste the service-account **email** → role **Viewer**
→ **Add**.

### 4. Create the GitHub repo and add these files
1. Create a **new GitHub repo** (private is fine), e.g. `guides-most-read`.
2. Upload the contents of this `guides-most-read-automation` folder to it
   (`update-featured.mjs`, `package.json`, `.gitignore`, and the `.github/workflows/…` file).
   You can drag-and-drop via the GitHub web "Add file → Upload files".

### 5. Add two repo secrets
Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
- **`GA4_PROPERTY_ID`** = the number from step 1.
- **`GA4_SA_KEY`** = paste the **entire contents** of the JSON key file from step 2.

### 6. Run it once
Repo → **Actions** tab → **Update most-read guide** → **Run workflow**. After ~1 minute a
`featured.json` should appear in the repo. Open it to confirm the counts look sane.

### 7. Tell me your GitHub username + repo name
Then I'll wire the /guides page to read
`https://raw.githubusercontent.com/<you>/<repo>/main/featured.json` (I'll drop it into the
`webflow-featured-swap.js` and register it on the page — the last step, done by me).

---

## Notes
- The job runs daily (~05:17 UTC). You can also trigger it any time from the Actions tab.
- The service-account key is written to a temp file in the runner and deleted before any
  commit — it is never stored in the repo (and `.gitignore` blocks it too).
- If GA4 records paths differently than expected (e.g. trailing slashes), the counts in
  `featured.json` will show zeros — tell me and I'll adjust the path matching.
