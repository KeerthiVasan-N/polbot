const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "wwebjs_auth" }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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
  console.log("\n✅ BOT IS LIVE! Listening for polls...");
  console.log(
    "Send 'vote-1', 'vote-2', etc. to yourself to change the vote option.\n",
  );
});

// Default vote option index (0-based), controlled by sending "vote-1", "vote-2", etc. to yourself
let voteOptionIndex = 0;

// Listen for config messages sent to yourself
function handleConfigMessage(msg) {
  if (!msg.fromMe) return;
  const text = (msg.body || "").trim().toLowerCase();

  // "vote-1", "vote-2", etc. to change vote option
  const match = text.match(/^vote-(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1) {
      voteOptionIndex = num - 1;
      console.log(
        `⚙️ Vote option changed to: option ${num} (index ${voteOptionIndex})`,
      );
    }
  }

  // "reset" to logout and re-scan QR on next start
  if (text === "reset") {
    console.log("🔄 Logging out... Restart the bot to scan a new QR.");
    client
      .logout()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }

  // "shutdown" to cancel the current running process and shut down the computer
  if (text === "shutdown") {
    console.log("⚠️ Shutting down the system...");
    const { exec } = require("child_process");
    exec("shutdown /s /t 0", (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error shutting down: ${error.message}`);
        return;
      }
      console.log("✅ System shutdown initiated.");
      process.exit(0); // Exit the current process
    });
  }
}

// Poll vote handler
async function handlePollMessage(msg) {
  try {
    if (msg.type !== "poll_creation") return;

    const pollName = msg.pollName || msg.body || "(unnamed poll)";
    const options = msg.pollOptions || [];

    if (!options.length) {
      console.log(`📊 Poll detected: "${pollName}" — but no options found.`);
      return;
    }

    const idx = Math.min(voteOptionIndex, options.length - 1);
    const chosen = options[idx];

    await msg.vote([chosen.name]);
    console.log(
      `📊 Poll detected: "${pollName}" — voting for option ${idx + 1}: "${chosen.name}"`,
    );
    console.log(`🗳️ ✅ Voted for "${chosen.name}" in poll "${pollName}"`);
  } catch (error) {
    console.log("❌ Failed to vote:", error?.message || error);
  }
}

// message_create fires for all messages (sent and received)
client.on("message_create", (msg) => {
  handleConfigMessage(msg);
  handlePollMessage(msg);
});

console.log("Starting WhatsApp bot...");
client.initialize();
