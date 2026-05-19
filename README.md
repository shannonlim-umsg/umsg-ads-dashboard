# GitHub Pages Meta Ads Dashboard

This package hosts the dashboard on GitHub Pages and updates Meta Ads data with GitHub Actions.

## Included files

- `index.html`
- `dashboard-data.json`
- `scripts/sync-meta-ads.mjs`
- `.github/workflows/sync-meta.yml`
- `README.md`

## Setup

1. Create a GitHub repository.
2. Upload all files from this package.
3. Add repository secrets:
   - `META_ACCESS_TOKEN`
   - `META_AD_ACCOUNT_ID`

`META_AD_ACCOUNT_ID` should be the numeric ID only, without `act_`.

4. Enable GitHub Pages:
   - Settings > Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /root

5. Run the sync:
   - Actions > Sync Meta Ads Data > Run workflow

6. Open your GitHub Pages URL and click:
   - Load GitHub Synced Data

## How it works

GitHub Actions calls the Meta Marketing API using GitHub Secrets, writes `dashboard-data.json`, commits it, and GitHub Pages serves it alongside the dashboard.

## Notes

- The sync pulls campaign-level Meta insights for the last 90 days.
- The dashboard still stores loaded data in browser localStorage.
- Revenue defaults to `0` unless you customize the script to pull purchase value.
- Artist defaults to `Imported Artist`; campaign type defaults to `Traffic`.
