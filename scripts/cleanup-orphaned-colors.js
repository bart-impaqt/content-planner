const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "database.json");

// Read database
const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

// Get all valid colors from current labels
const validColors = new Set(data.labels.map((l) => l.color));

console.log("Valid colors:", Array.from(validColors));

let cleanedCount = 0;

// Clean up orphaned colors in both tables
["content", "music"].forEach((tableType) => {
  data.tables[tableType].clients.forEach((client) => {
    Object.keys(client.weeks).forEach((weekKey) => {
      const weekColor = client.weeks[weekKey].color;
      if (weekColor && weekColor !== "" && !validColors.has(weekColor)) {
        console.log(
          `Cleaning ${tableType} - ${client.name} - Week ${weekKey}: ${weekColor}`
        );
        client.weeks[weekKey].color = "";
        cleanedCount++;
      }
    });
  });
});

// Write back to database
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

console.log(`\nCleaned up ${cleanedCount} orphaned color(s)`);
