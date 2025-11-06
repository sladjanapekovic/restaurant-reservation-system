// ----- preprost "router" -----
const sections = ["home", "rezervacija", "moje"];
function show(id) {
  sections.forEach(s => document.getElementById(s).classList.toggle("hidden", s !== id));
  if (id === "moje") renderMyReservations();
}
document.getElementById("nav-home").addEventListener("click", e => { e.preventDefault(); show("home"); });
document.getElementById("nav-book").addEventListener("click", e => { e.preventDefault(); show("rezervacija"); });
document.getElementById("nav-my").addEventListener("click", e => { e.preventDefault(); show("moje"); });

// ----- "baza" v brskalniku -----
const KEY = "reservations";

// konfiguracija delovnega časa in terminov
const OPEN_HOUR = 10;       // 10:00
const CLOSE_HOUR = 22;      // 22:00
const SLOT_STEP_MIN = 30;   // termini na 30 min
const SLOT_MINUTES = 90;    // rezervacija zasede 90 min
const MAX_TABLES = 10;      // največ miz hkrati na termin

function getReservations() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function saveReservation(r) {
  const all = getReservations();
  all.push(r);
  localStorage.setItem(KEY, JSON.stringify(all));
}

// ----- helpers za termine -----
function pad2(n){ return n.toString().padStart(2,"0"); }
function makeSlotsForDate(/* dateStr */){
  const slots = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR - 1; h++) {
    for (let m = 0; m < 60; m += SLOT_STEP_MIN) {
      slots.push(`${pad2(h)}:${pad2(m)}`);
    }
  }
  return slots;
}
function toDT(d,t){ return new Date(`${d}T${t}:00`); }
function overlapsSlot(d1,t1,d2,t2){
  const aStart = toDT(d1,t1), aEnd = new Date(aStart.getTime() + SLOT_MINUTES*60000);
  const bStart = toDT(d2,t2), bEnd = new Date(bStart.getTime() + SLOT_MINUTES*60000);
  return aStart.toDateString()===bStart.toDateString() && aStart < bEnd && bStart < aEnd;
}
function reservationsInSlot(dateStr, timeStr){
  return getReservations().filter(r => overlapsSlot(r.date, r.time, dateStr, timeStr)).length;
}

// ----- elementi obrazca -----
const form = document.getElementById("bookingForm");
const confirmBox = document.getElementById("confirm");
const availabilityBox = document.getElementById("availability");
const timeSelect = document.getElementById("timeSelect");

// napolni dropdown "Ura" samo s prostimi termini
function refreshTimeOptions(){
  const date = form.elements["date"].value;
  if (!date) {
    timeSelect.innerHTML = `<option value="">— izberi termin —</option>`;
    document.getElementById("slotGrid").innerHTML = "";
    return;
  }
  const allSlots = makeSlotsForDate(date);
  const available = allSlots.filter(t => reservationsInSlot(date, t) < MAX_TABLES);

  timeSelect.innerHTML = `<option value="">— izberi termin —</option>` +
    available.map(t => `<option value="${t}">${t}</option>`).join("");

  timeSelect.value = "";         // počisti staro izbiro
  updateAvailability();          // osveži informativno sporočilo
  renderSlotGrid(date);          // osveži grid gumbov
}

// besedilni prikaz PROST/ZASEDEN za izbran termin
function updateAvailability() {
  const date = form.elements["date"].value;
  const time = form.elements["time"].value; // select
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!date || !time) {
    availabilityBox.textContent = "";
    submitBtn.disabled = false;
    return;
  }
  const used = reservationsInSlot(date, time);
  const free = MAX_TABLES - used;

  if (free > 0) {
    availabilityBox.textContent = `Termin je PROST — na voljo še ${free} miz(e).`;
    availabilityBox.style.color = "#2e7d32";
    submitBtn.disabled = false;
  } else {
    availabilityBox.textContent = "Termin je ZASEDEN — izberi drugo uro.";
    availabilityBox.style.color = "#c62828";
    submitBtn.disabled = true;
  }
}

// klikabilni gumbi terminov pod obrazcem
function renderSlotGrid(date) {
  const grid = document.getElementById("slotGrid");
  if (!date) { grid.innerHTML = ""; return; }

  const allSlots = makeSlotsForDate(date);
  grid.innerHTML = "";

  allSlots.forEach(t => {
    const used = reservationsInSlot(date, t);
    const free = MAX_TABLES - used > 0;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = t;
    btn.className = "slot-btn " + (free ? "free" : "busy");
    btn.disabled = !free;

    if (form.elements["time"].value === t) btn.classList.add("selected");

    if (free) {
      btn.addEventListener("click", () => {
        form.elements["time"].value = t;      // nastavi <select>
        updateAvailability();
        grid.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    }

    grid.appendChild(btn);
  });
}

// sprožimo osvežitve ob spremembah
form.elements["date"].addEventListener("change", refreshTimeOptions);
form.elements["guests"].addEventListener("change", refreshTimeOptions);
timeSelect.addEventListener("change", () => {
  updateAvailability();
  renderSlotGrid(form.elements["date"].value);
});

// oddaja obrazca
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name || !data.email || !data.phone || !data.date || !data.time || !data.guests) {
    confirmBox.textContent = "Prosimo izpolnite vsa obvezna polja.";
    confirmBox.classList.remove("hidden");
    confirmBox.style.background = "#fff7e6";
    return;
  }

  // varnostni check: še enkrat preveri zasedenost
  if (reservationsInSlot(data.date, data.time) >= MAX_TABLES) {
    updateAvailability();
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
  confirmBox.style.background = "";
  form.reset();

  // po oddaji: osveži termin liste in info
  refreshTimeOptions();
  renderSlotGrid(reservation.date);
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

// inicializacija
show("home");
