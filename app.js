// preprost "router" za prikaz razdelkov
const sections = ["home", "rezervacija", "moje"];
function show(id) {
  sections.forEach(s => document.getElementById(s).classList.toggle("hidden", s !== id));
  if (id === "moje") renderMyReservations();
}
document.getElementById("nav-home").addEventListener("click", e => { e.preventDefault(); show("home"); });
document.getElementById("nav-book").addEventListener("click", e => { e.preventDefault(); show("rezervacija"); });
document.getElementById("nav-my").addEventListener("click", e => { e.preventDefault(); show("moje"); });

// lokalna "baza": localStorage
const KEY = "reservations";

// NOVO: pravila zasedenosti
const MAX_TABLES = 5;        // koliko miz je na voljo v enem terminu
const SLOT_MINUTES = 120;    // trajanje termina (2 uri)

function getReservations() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function saveReservation(r) {
  const all = getReservations();
  all.push(r);
  localStorage.setItem(KEY, JSON.stringify(all));
}

// ---------- Availability helpers ----------
function toDateTimeISO(d, t) {
  // d: "YYYY-MM-DD", t: "HH:MM"
  return new Date(`${d}T${t}:00`);
}
function isSameSlot(aDate, aTime, bDate, bTime) {
  const a = toDateTimeISO(aDate, aTime);
  const b = toDateTimeISO(bDate, bTime);
  const diffMinutes = Math.abs(a - b) / 60000;
  return (a.toDateString() === b.toDateString()) && diffMinutes < SLOT_MINUTES;
}
function countReservationsInSlot(date, time) {
  return getReservations().filter(r => isSameSlot(r.date, r.time, date, time)).length;
}

// ---------- Form handling ----------
const form = document.getElementById("bookingForm");
const confirmBox = document.getElementById("confirm");
const availabilityBox = document.getElementById("availability");

function updateAvailability() {
  const date = form.elements["date"].value;
  const time = form.elements["time"].value;

  // če datum/ura nista še izbrana
  if (!date || !time) {
    availabilityBox.textContent = "";
    form.querySelector("button[type=submit]").disabled = false;
    return;
  }

  const used = countReservationsInSlot(date, time);
  const free = MAX_TABLES - used;

  if (free > 0) {
    availabilityBox.textContent = `Termin je PROST — na voljo še ${free} miz(e).`;
    availabilityBox.style.color = "#2e7d32";
    form.querySelector("button[type=submit]").disabled = false;
  } else {
    availabilityBox.textContent = "Termin je ZASEDEN — izberi drugo uro.";
    availabilityBox.style.color = "#c62828";
    form.querySelector("button[type=submit]").disabled = true;
  }
}

// poslušalci na poljih datum/ura
form.elements["date"].addEventListener("change", updateAvailability);
form.elements["time"].addEventListener("change", updateAvailability);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  // osnovna validacija
  if (!data.name || !data.email || !data.phone || !data.date || !data.time || !data.guests) {
    confirmBox.textContent = "Prosimo izpolnite vsa obvezna polja.";
    confirmBox.classList.remove("hidden");
    confirmBox.style.background = "#fff7e6"; // opozorilo
    return;
  }

  const reservation = {
    id: crypto.randomUUID(),
    ...data,
    guests: Number(data.guests),
    createdAt: new Date().toISOString()
  };

  saveReservation(reservation);

  confirmBox.textContent = `Rezervacija oddana ✅  (${reservation.date} ob ${reservation.time}, ${reservation.guests} osebi)`;
  confirmBox.classList.remove("hidden");
  confirmBox.style.background = ""; // reset
  form.reset();

  // osveži prikaz zasedenosti za trenutno izbran termin (zdaj prazen)
  updateAvailability();

  // po oddaji pokažemo "Moje rezervacije"
  show("moje");
});

// prikaz seznama rezervacij
function renderMyReservations() {
  const list = document.getElementById("myList");
  const all = getReservations()
    .sort((a,b)=>a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  list.innerHTML = all.length ? "" : "<li>Ni rezervacij.</li>";
  all.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${r.date} ob ${r.time}</strong> — ${r.guests} oseb<br/>
      Na ime: ${r.name} • ${r.phone} • ${r.email}
      ${r.note ? `<div>Opomba: ${r.note}</div>` : ""}
    `;
    list.appendChild(li);
  });
}

// ob prvem nalaganju prikaži "Domov"
show("home");
