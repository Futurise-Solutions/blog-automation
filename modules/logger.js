const fs = require("fs");
const path = require("path");

const LOGS_DIR = path.join(__dirname, "..", "logs");
const RUNS_LOG = path.join(LOGS_DIR, "runs.jsonl");

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function logRun(data) {
  ensureLogsDir();
  const entry = JSON.stringify({ ts: new Date().toISOString(), ...data });
  fs.appendFileSync(RUNS_LOG, entry + "\n", "utf8");
}

function readRecentRuns(n = 10) {
  ensureLogsDir();
  if (!fs.existsSync(RUNS_LOG)) return [];
  const lines = fs.readFileSync(RUNS_LOG, "utf8").trim().split("\n").filter(Boolean);
  return lines
    .slice(-n)
    .map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    })
    .filter(Boolean)
    .reverse();
}

module.exports = { logRun, readRecentRuns };
