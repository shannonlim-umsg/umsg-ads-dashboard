import fs from "node:fs";

const token = process.env.META_ACCESS_TOKEN;
const accountId = process.env.META_AD_ACCOUNT_ID;

if (!token || !accountId) {
  throw new Error("Missing META_ACCESS_TOKEN or META_AD_ACCOUNT_ID GitHub secret.");
}

const GRAPH_VERSION = "v19.0";
const LEVEL = "campaign";
const DATE_PRESET = "last_90d";

const fields = [
  "campaign_name",
  "impressions",
  "clicks",
  "spend",
  "actions",
  "video_play_actions",
  "date_start",
  "date_stop"
].join(",");

const url =
  `https://graph.facebook.com/${GRAPH_VERSION}/act_${accountId}/insights` +
  `?fields=${encodeURIComponent(fields)}` +
  `&level=${LEVEL}` +
  `&date_preset=${DATE_PRESET}` +
  `&limit=500` +
  `&access_token=${encodeURIComponent(token)}`;

async function fetchAllPages(firstUrl) {
  const all = [];
  let next = firstUrl;

  while (next) {
    const res = await fetch(next);
    const json = await res.json();

    if (!res.ok || json.error) {
      throw new Error(JSON.stringify(json.error || json, null, 2));
    }

    all.push(...(json.data || []));
    next = json.paging?.next || null;
  }

  return all;
}

function actionValue(actions, possibleTypes) {
  if (!Array.isArray(actions)) return 0;
  for (const type of possibleTypes) {
    const found = actions.find(a => a.action_type === type);
    if (found) return Number(found.value || 0);
  }
  return 0;
}

const rows = await fetchAllPages(url);

const campaigns = rows.map(r => {
  const conversions = actionValue(r.actions, [
    "purchase",
    "offsite_conversion.fb_pixel_purchase",
    "lead",
    "complete_registration"
  ]);

  const views = Array.isArray(r.video_play_actions)
    ? Number(r.video_play_actions[0]?.value || 0)
    : actionValue(r.actions, ["video_view"]);

  return {
    artist: "Imported Artist",
    name: r.campaign_name || "Unnamed campaign",
    platform: "Meta",
    type: "Traffic",
    impressions: Number(r.impressions || 0),
    clicks: Number(r.clicks || 0),
    views,
    conversions,
    spend: Number(r.spend || 0),
    revenue: 0,
    status: "active"
  };
});

const data = {
  generatedAt: new Date().toISOString(),
  source: "Meta Marketing API",
  dateRange: DATE_PRESET,
  weeks: [{
    label: "Meta 90-Day Import",
    period: "Last 90 Days",
    dateFrom: rows[0]?.date_start || "",
    dateTo: rows[0]?.date_stop || "",
    campaigns,
    adsets: []
  }]
};

fs.writeFileSync("dashboard-data.json", JSON.stringify(data, null, 2));
console.log(`Wrote dashboard-data.json with ${campaigns.length} campaigns.`);
