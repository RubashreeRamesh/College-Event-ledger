require("dotenv").config({ path: __dirname + '/.env' });

console.log("Loaded Mongo URI:", process.env.MONGODB_URI);
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const fs = require("fs");

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));



app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// MongoDB Schema (Ensure your database is connected properly)
const eventSchema = new mongoose.Schema({
  date: String,
  title: String,
  organizer: String,
  chiefGuest: String,
  purpose: String,
  schedule: String,
  description: String,
  eventPhotos: [String],
  invitationPhotos: [String],
});

const Event = mongoose.model("Event", eventSchema);

// Route to Save Event
app.post(
  "/save-event",
  upload.fields([{ name: "eventPhotos" }, { name: "invitationPhotos" }]),
  async (req, res) => {
    try {
      if (!req.body.date || !req.body.title) {
        return res.status(400).json({ error: "Date and Title are required!" });
      }
      const eventPhotos =
        req.files?.eventPhotos?.map((file) => `/uploads/${file.filename}`) ||
        [];
      const invitationPhotos =
        req.files?.invitationPhotos?.map(
          (file) => `/uploads/${file.filename}`
        ) || [];

      const newEvent = new Event({
        date: req.body.date,
        title: req.body.title,
        organizer: req.body.organizer,
        chiefGuest: req.body.chiefGuest,
        purpose: req.body.purpose,
        schedule: req.body.schedule,
        description: req.body.description,
        eventPhotos,
        invitationPhotos,
      });

      await newEvent.save();
      res.json({
        message: "Event saved successfully!",
        eventPhotos,
        invitationPhotos,
      });
    } catch (error) {
      console.error("❌ Backend Error:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error. Check logs for details." });
    }
  }
);
app.get("/get-event", async (req, res) => {
  try {
    const { date } = req.query; // Get date from query params
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required!" });
    }

    const event = await Event.findOne({ date });
    if (!event) {
      return res.status(404).json({ error: "No event found for this date." });
    }

    res.json(event);
  } catch (error) {
    console.error("❌ Error fetching event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: err.message });
  }
});

app.use("/uploads", express.static("uploads"));

app.listen(5000, () => console.log("✅ Server running on port 5000"));
