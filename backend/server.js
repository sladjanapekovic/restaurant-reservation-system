const express = require("express");
const app = express();

app.use(express.json());

let reservations = [];

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get all reservations
app.get("/api/reservations", (req, res) => {
  res.json(reservations);
});

// Create reservation
app.post("/api/reservations", (req, res) => {
  const { name, date, time, guests } = req.body || {};

  if (!name || !date || !time || !guests) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const reservation = {
    id: Date.now(),
    name,
    date,
    time,
    guests: Number(guests),
  };

  reservations.push(reservation);
  res.status(201).json(reservation);
});

// Delete reservation
app.delete("/api/reservations/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = reservations.length;

  reservations = reservations.filter((r) => r.id !== id);

  if (reservations.length === before) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json({ deleted: true });
});

// ✅ Render/Cloud: koristi PORT iz environment-a
const PORT = process.env.PORT || 3000;

// ✅ Pokreni server samo kad se fajl izvršava direktno (ne u testovima)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = {
  app,
  _reset: () => (reservations = []),
};
