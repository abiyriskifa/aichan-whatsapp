const { AichanHandler } = require("./model/aichanModel");
const { EditPhotoHandler } = require("./model/removeBackgroundModel");
const {
  ChekUserData,
  ChekStatusUser,
  AddUserData,
  UpdateUserData,
} = require("./model/userModel");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode");
const socketIO = require("socket.io");

// Port Setup
const port = process.env.PORT || 8000;
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = socketIO(server);

// Server HTML
app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: __dirname,
  });
});

// Setup Whatsapp Client
const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
  // Strategi Session Local
  authStrategy: new LocalAuth({
    dataPath: "./session",
  }),
});

// Socket IO & Whatsapp
io.on("connection", (socket) => {
  // pesan awal
  socket.emit("message", "Connectiong . . .");

  // Loading screen
  client.on("loading_screen", (percent, message) => {
    socket.emit("message", percent + "% " + message);
  });

  // QR Code
  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit("message", "QR Code received, scan please!");
    });
  });

  // WA Ready
  client.on("ready", () => {
    socket.emit("ready", "Whatsapp is ready!");
    socket.emit("message", "Whatsapp is ready!");
  });

  // WA Authenticate
  client.on("authenticated", () => {
    socket.emit("authenticated", "Whatsapp is authenticated!");
    socket.emit("message", "Whatsapp is authenticated!");
    console.log("AUTHENTICATED");
  });

  // WA Auth Gagal
  client.on("auth_failure", function (session) {
    socket.emit("message", "Auth failure, restarting...");
  });

  // WA Disconnect
  client.on("disconnected", (reason) => {
    socket.emit("message", "Whatsapp is disconnected!");
    client.destroy();
    client.initialize();
  });
});

// Client Chat
client.on("message", async (msg) => {
  // setup paramater
  var phone = msg.from;
  var text = msg.body.toLocaleLowerCase();

  // Aichan Mode
  if (ChekUserData(phone) === "valid" && ChekStatusUser(phone) === "active") {
    await AichanHandler(text, msg);
    UpdateUserData(phone, "active", text);
  }

  // Cek Pesan Aichan
  if (text.includes("ohayo aichan")) {
    // Cek Account
    if (ChekUserData(phone) == "valid") {
      UpdateUserData(phone, "active", text);
    } else {
      AddUserData(phone, "active", text);
    }
    // reply
    msg.reply("Aichan Actived! silahkan ajukan pertanyaan Anda.");
  }

  // Cek Remove BG
  if (text.includes("edit_bg")) {
    await EditPhotoHandler(text, msg);
  }

  console.log(msg);
});

// Jalankan Fungsi Whatsapp
client.initialize();

server.listen(port, function () {
  console.log("App running on *: " + port);
});
