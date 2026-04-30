/**
 * Seed Reactions v4 — Direct Gemini + Direct Supabase
 * 
 * Gọi Gemini API trực tiếp, lưu kết quả trực tiếp vào Supabase REST API.
 * KHÔNG đi qua backend Spring Boot.
 * 
 * Cách dùng:  node scripts/seed-reactions.mjs
 */

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://yesykibnglunqlspikin.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3lraWJuZ2x1bnFsc3Bpa2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzk1NDQsImV4cCI6MjA5MjYxNTU0NH0.BM7wQGcekMMVow1Z1ouxmfeWLfK9qRy5tRAbu7VNphg";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.0-flash";

// Gemini API keys — 12 keys từ project mới
const API_KEYS = [
  "AIzaSyAqMUNzPHZC3RJ7CbUehKKvNLgaEiE1WcI",
  "AIzaSyBftHFnFOsRwUnGk_lvcwinsRuWjmvMDIo",
  "AIzaSyDLNbKOkf-0AZ1XJqFe9TlPOJqa51-Qy1A",
  "AIzaSyAD6jMpts6iD28QkPl69n3HVS1wJqwirso",
  "AIzaSyD2obO8l4hfMATGiMtGXTntHB0yo-rwYJU",
  "AIzaSyBZQ-v9cYp6Y2WSQUhebksgbU1cmqQVNh8",
  "AIzaSyCQ-rviWZN8gzi85NOSZhQKbORQVGvC5UA",
  "AIzaSyB1Vpn8suvbcYsaHwEJR58sU95GbFAXFJo",
  "AIzaSyAagUjKCoNrY-zowen8QbJPmHPTSbIfDO0",
  "AIzaSyAsrFQKBt7jcHi9MSZEHnRXxM94QViDeCE",
  "AIzaSyAcq4bRkklbvHQ-Ibl_vg_IxvK-29OBP6E",
  "AIzaSyD4rzR3XX18lXC2sWhx0eGqLlKwu-gMiq8",
];

const WORKER_COUNT = 10;
const BATCH_SIZE = 100;
const DELAY_MS = 800;
const FAIL_DELAY_MS = 3000;

// ══════════════════════════════════════════════════════════════
// 84 CHEMICALS
// ══════════════════════════════════════════════════════════════
const ALL_FORMULAE = [
  "HCl", "H2SO4", "HNO3", "CH3COOH", "H3PO4", "H2CO3",
  "HBr", "HI", "HF", "HNO2", "H2SO3", "HClO4", "HCOOH", "H2S",
  "NaOH", "KOH", "Ca(OH)2", "NH3", "Mg(OH)2", "LiOH",
  "Ba(OH)2", "Al(OH)3", "Cu(OH)2", "Fe(OH)3", "Fe(OH)2", "Zn(OH)2", "AgOH",
  "NaCl", "CuSO4", "CaCO3", "KNO3", "AgNO3", "K2SO4",
  "Na2SO4", "Na2CO3", "K2CO3", "BaCl2", "AgCl", "BaSO4",
  "FeSO4", "FeCl3", "AlCl3", "KMnO4", "K2Cr2O7", "KI",
  "Na", "Fe", "Cu", "Zn", "Al", "Mg", "Ag", "Au", "Pt",
  "Hg", "Pb", "Sn", "K", "Ca", "Ba",
  "O2", "Cl2", "S", "C", "N2", "Br2", "I2", "P", "F2", "He", "Ar",
  "C2H5OH", "CH4", "C6H6", "C2H4", "C6H12O6", "C3H8",
  "C4H10", "C2H2", "HCHO", "CH3CHO", "CH3OH", "C6H5OH", "C3H8O3",
];

// ══════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════
let keyIndex = 0;
function getNextKey() {
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return key;
}

function buildReactionKey(a, b) {
  return [a.trim().toUpperCase(), b.trim().toUpperCase()].sort().join("__");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripCodeBlock(text) {
  if (!text) return text;
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");
  }
  return t.trim();
}

// ══════════════════════════════════════════════════════════════
// SUPABASE — check existing + insert
// ══════════════════════════════════════════════════════════════
const supaHeaders = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

async function getExistingKeys() {
  const keys = new Set();
  let offset = 0;
  const limit = 1000;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/reaction_api_cache?select=reaction_key&offset=${offset}&limit=${limit}`,
      { headers: supaHeaders }
    );
    if (!res.ok) {
      console.log(`⚠️  Cannot read existing cache: HTTP ${res.status}`);
      break;
    }
    const rows = await res.json();
    if (rows.length === 0) break;
    for (const r of rows) keys.add(r.reaction_key);
    offset += limit;
    if (rows.length < limit) break;
  }
  return keys;
}

async function insertToSupabase(record) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reaction_api_cache`, {
    method: "POST",
    headers: { ...supaHeaders, "Prefer": "return=minimal,resolution=merge-duplicates" },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase INSERT failed: HTTP ${res.status} — ${text.substring(0, 200)}`);
  }
}

// ══════════════════════════════════════════════════════════════
// GEMINI — call AI directly
// ══════════════════════════════════════════════════════════════
function buildPrompt(a, b) {
  return `You are an educational chemistry reaction simulation system.
Reactants: ${a} + ${b}
Environmental conditions: Temperature: 25 C, Pressure: 1 atm, Catalyst: None

Predict the reaction result and return JSON according to the following schema (NO markdown, NO explanation outside JSON):
{
  "hasReaction": boolean,
  "equation": string | null,
  "productFormula": string | null,
  "effectType": "NONE" | "COLOR_CHANGE" | "PRECIPITATE" | "GAS_BUBBLE" | "HEAT" | "EXPLOSION",
  "effectColor": string | null,
  "gasFormula": string | null,
  "precipitateFormula": string | null,
  "precipitateColor": string | null,
  "messageVi": string,
  "explanationVi": string,
  "safetyNoteVi": string,
  "confidence": number (0.0-1.0)
}

Mandatory rules:
- effectType MUST be one of the exact enum values above
- MUST identify neutralization reactions (Acid + Base -> Salt + Water).
- MUST provide productFormula containing ONLY the reaction products.
- MUST return ALL products in productFormula.
- MUST include color description of products in messageVi and explanationVi.
- For precipitates, precipitateColor must be an exact HEX color code.
- messageVi, explanationVi, safetyNoteVi MUST be in Vietnamese
- Return ONLY pure JSON, no markdown`;
}

async function callGemini(prompt) {
  // Retry with backoff — if all keys hit 429, wait and retry
  const MAX_ROUNDS = 5; // try all keys up to 5 rounds
  for (let round = 0; round < MAX_ROUNDS; round++) {
    for (let ki = 0; ki < API_KEYS.length; ki++) {
      const apiKey = getNextKey();
      const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.status === 429) {
          // Rate limited — try next key immediately
          continue;
        }
        if (res.status === 400) {
          const errBody = await res.text().catch(() => "(no body)");
          // If key is invalid/expired, skip it
          if (errBody.includes("API_KEY_INVALID") || errBody.includes("expired")) {
            continue;
          }
          console.log(`    ⚠️  Gemini 400: ${errBody.substring(0, 200)}`);
          continue;
        }
        if (!res.ok) {
          const errBody = await res.text().catch(() => "(no body)");
          console.log(`    ⚠️  Gemini HTTP ${res.status}: ${errBody.substring(0, 200)}`);
          throw new Error(`Gemini HTTP ${res.status}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;
        return stripCodeBlock(text);
      } catch (err) {
        if (err.name === 'AbortError') continue;
        if (err.message?.startsWith('Gemini HTTP')) throw err;
        // network error — retry
        continue;
      }
    }
    // All keys exhausted this round — wait before retrying
    const waitSec = 30 * (round + 1); // 30s, 60s, 90s, 120s, 150s
    console.log(`    ⏳ All keys quota-limited. Waiting ${waitSec}s before retry (round ${round + 1}/${MAX_ROUNDS})...`);
    await sleep(waitSec * 1000);
  }
  throw new Error(`All keys exhausted after ${MAX_ROUNDS} rounds`);
}

// ══════════════════════════════════════════════════════════════
// WORKER
// ══════════════════════════════════════════════════════════════
let nextIndex = 0;
let allPairs = [];
const stats = { cached: 0, generated: 0, failed: 0, saved: 0 };
const errors = [];

function getNextBatch() {
  const start = nextIndex;
  const end = Math.min(nextIndex + BATCH_SIZE, allPairs.length);
  nextIndex = end;
  return start >= allPairs.length ? [] : allPairs.slice(start, end);
}

async function worker(id, existingKeys) {
  while (true) {
    const batch = getNextBatch();
    if (batch.length === 0) break;

    for (const [a, b] of batch) {
      const key = buildReactionKey(a, b);

      // Skip if already in Supabase
      if (existingKeys.has(key)) {
        stats.cached++;
        continue;
      }

      try {
        // 1. Call Gemini directly
        const prompt = buildPrompt(a, b);
        const rawJson = await callGemini(prompt);

        // 2. Parse & validate
        let dto;
        try {
          dto = JSON.parse(rawJson);
        } catch {
          throw new Error(`Invalid JSON from Gemini`);
        }

        // Validate confidence
        const confidence = typeof dto.confidence === "number" ? dto.confidence : 0;

        // 3. Save directly to Supabase
        const now = new Date().toISOString();
        await insertToSupabase({
          reaction_key: key,
          input_payload: JSON.stringify([a, b]),
          raw_prediction_response: rawJson,
          normalized_result: JSON.stringify(dto),
          source: "AI_PREDICTION",
          confidence: confidence,
          verified: false,
          created_at: now,
          last_used_at: now,
        });

        stats.generated++;
        stats.saved++;
        existingKeys.add(key); // mark as done
        const done = stats.cached + stats.generated + stats.failed;
        console.log(`  [W${id}] ✅ ${a} + ${b} → saved (conf=${confidence}) [${done}/${allPairs.length}]`);

        await sleep(DELAY_MS);
      } catch (err) {
        stats.failed++;
        const msg = `${a} + ${b}: ${err.message}`;
        errors.push(msg);
        console.log(`  [W${id}] ❌ ${msg}`);
        await sleep(FAIL_DELAY_MS);
      }
    }

    const done = stats.cached + stats.generated + stats.failed;
    console.log(`📊 [W${id}] Batch done | ${done}/${allPairs.length} (cached=${stats.cached} saved=${stats.saved} fail=${stats.failed})`);
  }
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
async function main() {
  // Build all pairs
  allPairs = [];
  for (let i = 0; i < ALL_FORMULAE.length; i++) {
    for (let j = i + 1; j < ALL_FORMULAE.length; j++) {
      allPairs.push([ALL_FORMULAE[i], ALL_FORMULAE[j]]);
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`🧪 SEED REACTIONS — Direct Gemini → Supabase`);
  console.log(`   Chemicals:   ${ALL_FORMULAE.length}`);
  console.log(`   Total pairs: ${allPairs.length}`);
  console.log(`   Workers:     ${WORKER_COUNT}`);
  console.log(`   API keys:    ${API_KEYS.length}`);
  console.log(`${"═".repeat(60)}\n`);

  // Load existing cached keys from Supabase
  console.log(`📡 Loading existing cache from Supabase...`);
  const existingKeys = await getExistingKeys();
  console.log(`📊 Already cached in Supabase: ${existingKeys.size}\n`);

  const startTime = Date.now();

  // Launch workers
  const workers = [];
  for (let i = 0; i < WORKER_COUNT; i++) {
    workers.push(worker(i, existingKeys));
  }
  await Promise.all(workers);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Final check
  const finalKeys = await getExistingKeys();

  console.log(`\n${"═".repeat(60)}`);
  console.log(`✅ SEED COMPLETE in ${elapsed}s`);
  console.log(`   Total pairs:       ${allPairs.length}`);
  console.log(`   Already cached:    ${stats.cached}`);
  console.log(`   Newly saved to DB: ${stats.saved}`);
  console.log(`   Failed:            ${stats.failed}`);
  console.log(`   Supabase total:    ${finalKeys.size}`);
  console.log(`${"═".repeat(60)}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors:`);
    errors.slice(0, 30).forEach((e) => console.log(`   - ${e}`));
    if (errors.length > 30) console.log(`   ... and ${errors.length - 30} more`);
  }
}

main().catch(console.error);
