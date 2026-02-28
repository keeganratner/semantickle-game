import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as readline from "readline";
import { createReadStream } from "fs";
import { Open } from "unzipper";

const GLOVE_URL = "https://nlp.stanford.edu/data/glove.6B.zip";
const DATA_DIR = path.join(process.cwd(), "data");
const TEMP_DIR = path.join(process.cwd(), ".tmp-glove");
const ZIP_PATH = path.join(TEMP_DIR, "glove.6B.zip");
const TXT_PATH = path.join(TEMP_DIR, "glove.6B.100d.txt");

const MAX_WORDS = 30000;
const DIMENSIONS = 100;
const WORD_REGEX = /^[a-z]+$/;

const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their",
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
  "me", "when", "make", "can", "like", "time", "no", "just", "him",
  "know", "take", "people", "into", "year", "your", "good", "some",
  "could", "them", "see", "other", "than", "then", "now", "look",
  "only", "come", "its", "over", "think", "also", "back", "after",
  "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "am", "are", "was", "were", "been", "being", "has", "had", "having",
  "did", "does", "doing", "is", "very", "much", "many", "such", "own",
  "same", "may", "might", "must", "shall", "should", "ought", "need",
  "dare", "used", "each", "every", "both", "few", "more", "less",
  "still", "here", "where", "why", "too", "yet", "nor", "per", "via",
]);

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const follow = (url: string) => {
      https.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          follow(res.headers.location!);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const total = parseInt(res.headers["content-length"] || "0", 10);
        let downloaded = 0;
        const file = fs.createWriteStream(dest);

        res.on("data", (chunk: Buffer) => {
          downloaded += chunk.length;
          if (total > 0) {
            const pct = ((downloaded / total) * 100).toFixed(1);
            const mb = (downloaded / 1024 / 1024).toFixed(0);
            process.stdout.write(`\r  downloading... ${mb}MB (${pct}%)`);
          }
        });

        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log("\n  download complete.");
          resolve();
        });
        file.on("error", reject);
      }).on("error", reject);
    };
    follow(url);
  });
}

async function extractGlove100d(): Promise<void> {
  console.log("  extracting glove.6B.100d.txt...");
  const directory = await Open.file(ZIP_PATH);
  const entry = directory.files.find(
    (f) => f.path === "glove.6B.100d.txt"
  );
  if (!entry) {
    throw new Error("glove.6B.100d.txt not found in zip");
  }
  const stream = entry.stream();
  const out = fs.createWriteStream(TXT_PATH);
  await new Promise<void>((resolve, reject) => {
    stream.pipe(out);
    out.on("finish", resolve);
    out.on("error", reject);
  });
  console.log("  extraction complete.");
}

async function processEmbeddings(): Promise<void> {
  console.log(`  processing top ${MAX_WORDS} words (${DIMENSIONS}d)...`);

  const words: string[] = [];
  const allVectors: number[][] = [];

  const rl = readline.createInterface({
    input: createReadStream(TXT_PATH, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  for await (const line of rl) {
    if (words.length >= MAX_WORDS) break;

    const parts = line.split(" ");
    const word = parts[0];

    if (!WORD_REGEX.test(word)) continue;
    if (word.length < 2) continue;

    const vector = parts.slice(1, DIMENSIONS + 1).map(Number);
    if (vector.length !== DIMENSIONS) continue;

    words.push(word);
    allVectors.push(vector);
    lineCount++;

    if (lineCount % 5000 === 0) {
      process.stdout.write(`\r  processed ${lineCount} words...`);
    }
  }

  console.log(`\n  kept ${words.length} words.`);

  // Write words.json
  const wordsPath = path.join(DATA_DIR, "words.json");
  fs.writeFileSync(wordsPath, JSON.stringify(words));
  console.log(`  wrote ${wordsPath} (${(fs.statSync(wordsPath).size / 1024).toFixed(0)}KB)`);

  // Write vectors.bin (Float32, little-endian)
  const vectorsPath = path.join(DATA_DIR, "vectors.bin");
  const buffer = Buffer.alloc(words.length * DIMENSIONS * 4);
  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < DIMENSIONS; j++) {
      buffer.writeFloatLE(allVectors[i][j], (i * DIMENSIONS + j) * 4);
    }
  }
  fs.writeFileSync(vectorsPath, buffer);
  console.log(`  wrote ${vectorsPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);

  // Write daily-words.json (curated subset)
  const dailyWords = words.filter((word, idx) => {
    if (idx >= 15000) return false;
    if (word.length < 4 || word.length > 8) return false;
    if (STOP_WORDS.has(word)) return false;
    return true;
  });
  const dailyPath = path.join(DATA_DIR, "daily-words.json");
  fs.writeFileSync(dailyPath, JSON.stringify(dailyWords));
  console.log(`  wrote ${dailyPath} (${dailyWords.length} curated words)`);

  // Print samples
  console.log(`\n  sample words: ${words.slice(0, 10).join(", ")}`);
  console.log(`  sample daily words: ${dailyWords.slice(0, 10).join(", ")}`);
}

async function main() {
  console.log("semantickle: setting up word embeddings\n");

  // Check if data already exists
  if (
    fs.existsSync(path.join(DATA_DIR, "vectors.bin")) &&
    fs.existsSync(path.join(DATA_DIR, "words.json")) &&
    fs.existsSync(path.join(DATA_DIR, "daily-words.json"))
  ) {
    console.log("  data/ already exists. delete it to re-run setup.");
    return;
  }

  // Create dirs
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  try {
    // Step 1: Download
    if (!fs.existsSync(ZIP_PATH)) {
      console.log("step 1: downloading GloVe 6B (~822MB)...");
      await download(GLOVE_URL, ZIP_PATH);
    } else {
      console.log("step 1: zip already downloaded, skipping.");
    }

    // Step 2: Extract
    if (!fs.existsSync(TXT_PATH)) {
      console.log("\nstep 2: extracting 100d embeddings...");
      await extractGlove100d();
    } else {
      console.log("\nstep 2: txt already extracted, skipping.");
    }

    // Step 3: Process
    console.log("\nstep 3: processing embeddings...");
    await processEmbeddings();

    console.log("\nsetup complete!");
  } finally {
    // Cleanup temp
    console.log("\ncleaning up temp files...");
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    console.log("done.");
  }
}

main().catch((err) => {
  console.error("\nsetup failed:", err);
  process.exit(1);
});
