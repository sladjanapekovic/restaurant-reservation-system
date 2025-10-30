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

function getReservations() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function saveReservation(r) {
  const all = getReservations();
  all.push(r);
  localStorage.setItem(KEY, JSON.stringify(all));
}

const form = document.getElementById("bookingForm");
const confirmBox = document.getElementById("confirm");

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
  // po oddaji pokažemo "Moje rezervacije"
  show("moje");
});

function renderMyReservations() {
  const list = document.getElementById("myList");
  const all = getReservations().sort((a,b)=>a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
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
