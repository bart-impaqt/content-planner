const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Load environment variables
const envPath = path.join(__dirname, "..", ".env.development");
require("dotenv").config({ path: envPath });

// Year to use for imported week numbers (1-52)
// You can override this by setting MIGRATION_YEAR in your env.
const TARGET_YEAR = parseInt(
  process.env.MIGRATION_YEAR || new Date().getFullYear(),
  10
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function validateFirebaseConfig(config) {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config values for: ${missing.join(
        ", "
      )}. Make sure .env.development exists in the project root and is filled.`
    );
  }
}

/**
 * Transform the old RTDB export format into the new Database shape.
 *
 * Old format (simplified):
 * {
 *   col1: { [clientUid]: { name, note, order, uid, weekStatus: [{ number, value, note }] } },
 *   col2: { ... },
 *   lagenda: {
 *     col1: { [labelUid]: { color, name, uid } },
 *     col2: { [labelUid]: { color, name, uid } }
 *   }
 * }
 *
 * New format (simplified):
 * {
 *   labels: [{ id, name, color, category }],
 *   tables: {
 *     content: { clients: [{ id, name, labelId, weeks: { "YYYY-WW": { color, note } } }] },
 *     music:   { clients: [...] }
 *   }
 * }
 */
function transformOldData(oldData) {
  if (!oldData) {
    throw new Error("No data provided to transform");
  }

  const result = {
    labels: [],
    tables: {
      content: { clients: [] },
      music: { clients: [] },
    },
  };

  let nextLabelId = 1;

  // Build label lists from lagenda for both columns
  function buildLabelsForColumn(colKey, category) {
    const lagendaCol = oldData.lagenda && oldData.lagenda[colKey];
    if (!lagendaCol) {
      console.warn(
        `No lagenda found for ${colKey}, skipping labels for ${category}.`
      );
      return { legendList: [] };
    }

    // Preserve order from JSON (Object.values keeps property order)
    const legendList = Object.values(lagendaCol);

    legendList.forEach((legend) => {
      result.labels.push({
        id: String(nextLabelId++),
        name: legend.name,
        color: legend.color,
        category,
      });
    });

    return { legendList };
  }

  const { legendList: contentLegend } = buildLabelsForColumn("col1", "content");
  const { legendList: musicLegend } = buildLabelsForColumn("col2", "music");

  console.log("Built labels from lagenda:");
  console.log(
    "- Content labels:",
    contentLegend.map((l) => l.name).join(", ") || "(none)"
  );
  console.log(
    "- Music labels:",
    musicLegend.map((l) => l.name).join(", ") || "(none)"
  );

  // Helper: convert weekStatus array to weeks map
  function convertWeekStatusArray(weekStatusArray, legendList, columnName) {
    const weeks = {};

    if (!Array.isArray(weekStatusArray)) {
      return weeks;
    }

    weekStatusArray.forEach((ws) => {
      const weekNumber = ws.number;
      const value = ws.value;
      const note = ws.note || "";

      if (typeof weekNumber !== "number") return;

      const weekKey = `${TARGET_YEAR}-${String(weekNumber).padStart(2, "0")}`;

      let color = "";
      if (typeof value === "number" && value > 0) {
        const index = value - 1; // values are 1-based indexes in the legend
        const legend = legendList[index];
        if (legend) {
          color = legend.color;
        } else {
          console.warn(
            `No legend entry for value ${value} in ${columnName}; leaving color empty for week ${weekKey}.`
          );
        }
      }

      // Only store weeks that have either a color or a note
      if ((color && color !== "") || note) {
        weeks[weekKey] = { color, note };
      }
    });

    return weeks;
  }

  // Convert clients for a given column
  function convertClients(oldClientsObj, legendList, tableKey, idPrefix) {
    if (!oldClientsObj) return;

    Object.entries(oldClientsObj).forEach(([uid, client]) => {
      const weeks = convertWeekStatusArray(
        client.weekStatus,
        legendList,
        tableKey
      );

      result.tables[tableKey].clients.push({
        id: client.uid || `${idPrefix}${uid}`,
        name: client.name || "",
        labelId: "", // no direct mapping from old data; can be set later in the app
        weeks,
      });
    });
  }

  convertClients(oldData.col1, contentLegend, "content", "c");
  convertClients(oldData.col2, musicLegend, "music", "m");

  return result;
}

async function migrateToFirebase() {
  console.log("Starting migration to Firebase...");

  // Ensure config is valid before initializing Firebase
  validateFirebaseConfig(firebaseConfig);

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Read old RTDB export
  const exportPath = path.join(
    __dirname,
    "..",
    "data",
    "contentplanner-a4b7d-default-rtdb-export.json"
  );
  const oldData = JSON.parse(fs.readFileSync(exportPath, "utf-8"));

  console.log("Old RTDB export loaded.");
  console.log(
    `- Content clients (col1): ${
      oldData.col1 ? Object.keys(oldData.col1).length : 0
    }`
  );
  console.log(
    `- Music clients (col2): ${
      oldData.col2 ? Object.keys(oldData.col2).length : 0
    }`
  );

  console.log(`Transforming data for target year ${TARGET_YEAR}...`);
  const transformed = transformOldData(oldData);

  console.log("Transformed data:");
  console.log(`- Labels: ${transformed.labels.length}`);
  console.log(
    `- Content clients: ${transformed.tables.content.clients.length}`
  );
  console.log(`- Music clients: ${transformed.tables.music.clients.length}`);

  // Upload to Firebase
  const docRef = doc(db, "weekOfYears", "main");
  await setDoc(docRef, transformed);

  console.log("\n✅ Migration complete! Data uploaded to Firebase.");
  console.log("Collection: weekOfYears");
  console.log("Document: main");
  console.log(`All weekStatus entries mapped to year ${TARGET_YEAR}.`);

  process.exit(0);
}

migrateToFirebase().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
