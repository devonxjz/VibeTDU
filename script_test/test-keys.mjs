/**
 * Quick diagnostic: test each Gemini API key individually.
 * Shows the actual HTTP status + error body for each key.
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.0-flash";

const API_KEYS = [
  "AIzaSyASxHI8xozKDM4OWrhS3YtjFFLmD1Lok_k",
  "AIzaSyDr5XxBTie_47DJcmMKzXhc-nMKHCxIJkI",
  "AIzaSyC2zo_lSniZ52mJ_HFfMSM002ATjPv_2A4",

];

const testPrompt = "Say hello in one word. Return JSON: {\"word\": \"hello\"}";

async function testKey(index, apiKey) {
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const masked = apiKey.substring(0, 12) + "..." + apiKey.substring(apiKey.length - 4);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: testPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 50 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await res.text();

    if (res.ok) {
      const data = JSON.parse(body);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(no text)";
      console.log(`  [Key ${index + 1}] ✅ HTTP ${res.status} — ${masked} — Response: ${text.substring(0, 60)}`);
    } else {
      // Parse error details
      let errorMsg = body.substring(0, 200);
      try {
        const errJson = JSON.parse(body);
        errorMsg = `${errJson.error?.status || ""} — ${errJson.error?.message?.substring(0, 150) || body.substring(0, 150)}`;
      } catch { }
      console.log(`  [Key ${index + 1}] ❌ HTTP ${res.status} — ${masked} — ${errorMsg}`);
    }

    return res.status;
  } catch (err) {
    console.log(`  [Key ${index + 1}] 💥 ERROR — ${masked} — ${err.message}`);
    return -1;
  }
}

async function main() {
  console.log(`\n🔑 Testing ${API_KEYS.length} Gemini API keys...\n`);

  const results = [];
  for (let i = 0; i < API_KEYS.length; i++) {
    const status = await testKey(i, API_KEYS[i]);
    results.push(status);
    // Small delay between tests to avoid self-throttling
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Summary:`);
  const ok = results.filter(s => s === 200).length;
  const rateLimit = results.filter(s => s === 429).length;
  const forbidden = results.filter(s => s === 403).length;
  const badKey = results.filter(s => s === 400).length;
  const other = results.filter(s => s !== 200 && s !== 429 && s !== 403 && s !== 400).length;

  console.log(`  ✅ Working:      ${ok}`);
  console.log(`  🚫 Rate-limited: ${rateLimit}`);
  console.log(`  🔒 Forbidden:    ${forbidden}`);
  console.log(`  ❌ Bad key:      ${badKey}`);
  console.log(`  ❓ Other:        ${other}`);
}

main().catch(console.error);
