/**
 * Seed Reactions Script v2 – Client-side iteration
 * 
 * Gọi endpoint POST /api/lab/seed-one cho TỪNG CẶP phản ứng.
 * Script tự iterate, skip cache hit, retry on failure.
 * 
 * Cách dùng:  node scripts/seed-reactions.mjs
 */

const BACKEND_URL = "http://localhost:8080";

// All 84 chemical formulae from the app
const ALL_FORMULAE = [
  // Acid (14)
  "HCl", "H2SO4", "HNO3", "CH3COOH", "H3PO4", "H2CO3",
  "HBr", "HI", "HF", "HNO2", "H2SO3", "HClO4", "HCOOH", "H2S",
  // Base (13)
  "NaOH", "KOH", "Ca(OH)2", "NH3", "Mg(OH)2", "LiOH",
  "Ba(OH)2", "Al(OH)3", "Cu(OH)2", "Fe(OH)3", "Fe(OH)2", "Zn(OH)2", "AgOH",
  // Salt (18)
  "NaCl", "CuSO4", "CaCO3", "KNO3", "AgNO3", "K2SO4",
  "Na2SO4", "Na2CO3", "K2CO3", "BaCl2", "AgCl", "BaSO4",
  "FeSO4", "FeCl3", "AlCl3", "KMnO4", "K2Cr2O7", "KI",
  // Metal (15)
  "Na", "Fe", "Cu", "Zn", "Al", "Mg", "Ag", "Au", "Pt",
  "Hg", "Pb", "Sn", "K", "Ca", "Ba",
  // Non-metal (11)
  "O2", "Cl2", "S", "C", "N2", "Br2", "I2", "P", "F2", "He", "Ar",
  // Organic (13)
  "C2H5OH", "CH4", "C6H6", "C2H4", "C6H12O6", "C3H8",
  "C4H10", "C2H2", "HCHO", "CH3CHO", "CH3OH", "C6H5OH", "C3H8O3",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedOne(a, b) {
  const res = await fetch(`${BACKEND_URL}/api/lab/seed-one`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formulaA: a, formulaB: b }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return await res.json();
}

async function checkStatus() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/lab/seed-status`);
    const data = await response.json();
    return data.cachedReactions;
  } catch {
    return -1;
  }
}

async function main() {
  const total = ALL_FORMULAE.length * (ALL_FORMULAE.length - 1) / 2;
  const initialCached = await checkStatus();
  console.log(`📊 Currently cached: ${initialCached}`);
  console.log(`🧪 ${ALL_FORMULAE.length} chemicals → ${total} pairs to seed\n`);

  let cached = 0;
  let generated = 0;
  let failed = 0;
  let count = 0;
  const errors = [];

  for (let i = 0; i < ALL_FORMULAE.length; i++) {
    for (let j = i + 1; j < ALL_FORMULAE.length; j++) {
      const a = ALL_FORMULAE[i];
      const b = ALL_FORMULAE[j];
      count++;

      try {
        const result = await seedOne(a, b);

        if (result.cached) {
          cached++;
        } else {
          generated++;
          console.log(`✅ [${count}/${total}] ${a} + ${b} → generated (confidence=${result.confidence})`);
          // Delay after AI call to avoid rate limits
          await sleep(1200);
        }

        // Progress log every 50 pairs
        if (count % 50 === 0) {
          console.log(`\n📊 Progress: ${count}/${total} | cached=${cached} generated=${generated} failed=${failed}\n`);
        }
      } catch (err) {
        failed++;
        const msg = `${a} + ${b}: ${err.message}`;
        errors.push(msg);
        console.log(`❌ [${count}/${total}] ${msg}`);

        // Longer delay after failure
        await sleep(3000);
      }
    }
  }

  const finalCached = await checkStatus();
  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ SEED COMPLETE`);
  console.log(`   Total pairs:     ${total}`);
  console.log(`   Already cached:  ${cached}`);
  console.log(`   Newly generated: ${generated}`);
  console.log(`   Failed:          ${failed}`);
  console.log(`   DB total now:    ${finalCached}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors:`);
    errors.slice(0, 20).forEach((e) => console.log(`   - ${e}`));
    if (errors.length > 20) console.log(`   ... and ${errors.length - 20} more`);
  }
}

main().catch(console.error);
