const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("\n👇 SCAN THIS QR CODE WITH WHATSAPP:");
  qrcode.generate(qr, { small: true });
});

client.on("loading_screen", (percent, message) => {
  console.log("Loading:", percent + "%", message);
});

client.on("authenticated", () => {
  console.log("✅ Authenticated!");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Auth failure:", msg);
});

client.on("ready", () => {
  console.log("\n✅ BOT IS LIVE! Listening for polls...\n");
});

// Shared vote handler for both events
async function handlePollMessage(msg) {
  try {
    if (msg.type !== "poll_creation") return;

    const pollName = msg.pollName || msg.body || "(unnamed poll)";
    const options = msg.pollOptions || [];
    const firstOption = options[0];

    if (!firstOption) {
      console.log(`📊 Poll detected: "${pollName}" — but no options found.`);
      return;
    }

    const firstOptionName = firstOption.name;
    console.log(
      `📊 Poll detected: "${pollName}" — voting for option 1: "${firstOptionName}"`,
    );

    await msg.vote([firstOptionName]);
    console.log(`🗳️ ✅ Voted for "${firstOptionName}" in poll "${pollName}"`);
  } catch (error) {
    console.log("❌ Failed to vote:", error?.message || error);
  }
}

// message_create fires for all messages (sent and received)
client.on("message_create", handlePollMessage);

console.log("Starting WhatsApp bot...");
client.initialize();
