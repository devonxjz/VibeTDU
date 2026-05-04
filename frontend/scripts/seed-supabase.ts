import { Client } from "pg";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { CATEGORY_GROUPS } from "../src/constants/chemicals";

dotenv.config({ path: ".env.local" });

const DB_USER = "postgres.yesykibnglunqlspikin";
const DB_PASS = "MSK&7%BX3FfSjN6";
const DB_HOST = "aws-1-ap-southeast-1.pooler.supabase.com";
const DB_PORT = 5432;
const DB_NAME = "postgres";

const connectionString = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASS)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const groqKey = process.env.GROQ_API_KEY || "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";

const openai = new OpenAI({ 
  apiKey: groqKey,
  baseURL: "https://api.groq.com/openai/v1"
});
const pgClient = new Client({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const allChemicals = CATEGORY_GROUPS.flatMap((g) => g.chemicals);

const pairs: { c1: string; c2: string }[] = [];
for (let i = 0; i < allChemicals.length; i++) {
  for (let j = i + 1; j < allChemicals.length; j++) {
    const [reactant_1, reactant_2] = [allChemicals[i].formula, allChemicals[j].formula].sort();
    pairs.push({ c1: reactant_1, c2: reactant_2 });
  }
}

const BATCH_SIZE = 10; // Batch nhỏ lại để xem kết quả nhanh hơn ở demo
const batches = [];
for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
  batches.push(pairs.slice(i, i + BATCH_SIZE));
}

async function initDB() {
  await pgClient.connect();
  console.log("✅ Đã kết nối tới cơ sở dữ liệu Supabase!");
  
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS chemical_reactions (
        id SERIAL PRIMARY KEY,
        reactant_1 VARCHAR(255) NOT NULL,
        reactant_2 VARCHAR(255) NOT NULL,
        has_reaction BOOLEAN NOT NULL,
        equation TEXT,
        product_formula TEXT,
        effect_type VARCHAR(50) DEFAULT 'NONE',
        precipitate_color VARCHAR(50),
        gas_formula VARCHAR(50),
        explanation_vi TEXT,
        UNIQUE(reactant_1, reactant_2)
    );
    CREATE INDEX IF NOT EXISTS idx_reactants ON chemical_reactions(reactant_1, reactant_2);
  `);
  console.log("✅ Bảng chemical_reactions đã sẵn sàng!");
}

async function processBatch(batch: { c1: string; c2: string }[], batchIndex: number) {
  console.log(`\n⏳ Đang xử lý Batch ${batchIndex + 1}/${batches.length} (${batch.length} cặp)...`);
  
  const prompt = `
Bạn là một chuyên gia Hóa học. Tôi sẽ cung cấp một danh sách các cặp hóa chất.
Hãy phân tích từng cặp và cho biết chúng có phản ứng với nhau hay không (ở điều kiện thường hoặc nung nóng).
Nếu có phản ứng, hãy điền đầy đủ phương trình và hiện tượng. Nếu không, hãy đặt has_reaction = false.
Chú ý:
- effect_type có thể là: "NONE", "GAS_BUBBLE", "PRECIPITATE", "COLOR_CHANGE", "HEAT", "EXPLOSION".
- Mọi giá trị null phải bị bỏ qua hoặc để chuỗi rỗng.
- Trả về ĐÚNG định dạng JSON này:
{
  "results": [
    {
      "reactant_1": "HCl",
      "reactant_2": "NaOH",
      "has_reaction": true,
      "equation": "HCl + NaOH -> NaCl + H2O",
      "product_formula": "NaCl + H2O",
      "effect_type": "HEAT",
      "precipitate_color": "",
      "gas_formula": "",
      "explanation_vi": "Phản ứng trung hoà toả nhiệt"
    }
  ]
}

Danh sách các cặp:
${JSON.stringify(batch, null, 2)}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Bạn là hệ thống xử lý dữ liệu. Bạn CHỈ được phép trả về duy nhất một object JSON chứa mảng 'results'. Không giải thích, không dùng markdown code block thừa." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) throw new Error("Empty response from OpenAI");
    
    const data = JSON.parse(responseText);
    
    // Ghi vào DB
    if (data.results && data.results.length > 0) {
      let inserted = 0;
      for (const res of data.results) {
        // Đảm bảo alphabet order để chống trùng lặp
        const [r1, r2] = [res.reactant_1, res.reactant_2].sort();
        
        await pgClient.query(`
          INSERT INTO chemical_reactions 
          (reactant_1, reactant_2, has_reaction, equation, product_formula, effect_type, precipitate_color, gas_formula, explanation_vi)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (reactant_1, reactant_2) DO UPDATE 
          SET has_reaction = EXCLUDED.has_reaction,
              equation = EXCLUDED.equation,
              product_formula = EXCLUDED.product_formula,
              effect_type = EXCLUDED.effect_type,
              precipitate_color = EXCLUDED.precipitate_color,
              gas_formula = EXCLUDED.gas_formula,
              explanation_vi = EXCLUDED.explanation_vi;
        `, [
          r1, r2, 
          res.has_reaction === true || res.has_reaction === "true", 
          res.equation || null, 
          res.product_formula || null, 
          res.effect_type || 'NONE', 
          res.precipitate_color || null, 
          res.gas_formula || null, 
          res.explanation_vi || null
        ]);
        inserted++;
      }
      console.log(`✅ Đã lưu ${inserted} phản ứng vào Supabase (Bỏ qua nếu đã tồn tại).`);
    }
  } catch (error: any) {
    console.error(`❌ Lỗi ở Batch ${batchIndex + 1}:`, error?.message || error);
  }
}

async function run() {
  await initDB();
  console.log(`🧪 Tổng số cặp hóa chất: ${pairs.length}`);
  
  for (let i = 0; i < batches.length; i++) {
    await processBatch(batches[i], i);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  console.log("\n🎉 HOÀN THÀNH CHẠY FULL DATA! Dữ liệu đã có trong Supabase.");
  await pgClient.end();
}

run();
