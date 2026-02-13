const express = require("express");
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const cron = require("node-cron");

const app = express();
app.use(express.json());

// 🔥 Firebase Admin (will configure in Render)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const API_KEY = process.env.SPORTDB_KEY;

async function fetchMatches() {
  try {
    const response = await fetch(
      "https://api.sportdb.dev/soccer/matches?status=upcoming",
      {
        headers: { "X-API-Key": API_KEY },
      }
    );

    const data = await response.json();
    if (!data || !data.data) return;

    for (const match of data.data) {
      await db.collection("matches")
        .doc(match.id.toString())
        .set({
          country: match.country,
          league: match.league,
          home_team: match.home_team,
          away_team: match.away_team,
          match_date: match.start_time,
          prediction: Math.random() > 0.5 ? "Home Win" : "Away Win",
          accuracy: Math.floor(Math.random() * 20) + 75,
          winning_probability: Math.floor(Math.random() * 15) + 80,
          strongest_team: Math.floor(Math.random() * 10) + 85,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    console.log("Matches updated");
  } catch (err) {
    console.error("Error:", err);
  }
}

// Run every 6 hours
cron.schedule("0 */6 * * *", () => {
  fetchMatches();
});

app.get("/", (req, res) => {
  res.send("Football backend running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));
