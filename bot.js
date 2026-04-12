const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--blink-settings=imagesEnabled=false",
    ],
  },
});

client.on("qr", (qr) => {
  console.log("\n👇 SCAN THIS QR CODE:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("\n✅ BOT IS LIVE AND OPTIMIZED!");
});

let voteOptionIndex = 0;

// High-speed handler: Minimal processing before voting
client.on("message_create", (msg) => {
  // 1. Config Logic (Only if it's from you)
  // 2. Poll Logic (The Race)
  if (msg.type === "poll_creation") {
    const options = msg.pollOptions;

    msg.vote([options[voteOptionIndex].name]).catch(console.error);
    console.log(`🚀 Voted for: ${options[voteOptionIndex].name}`);
  }
  // console.log(msg);
  if (msg.id.fromMe && msg.body.startsWith("Vote-")) {
    voteOptionIndex = parseInt(msg.body.split("-")[1]) - 1;
    console.log(`⚙️ Vote index set to: ${voteOptionIndex}`);
    return;
  }
});

// IMPORTANT: This must be the last line
client.initialize();
