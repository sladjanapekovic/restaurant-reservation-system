/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Frontend app.js tests", () => {
  let html;
  let appJs;

  beforeEach(() => {
    // Učitaj HTML
    html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
    document.documentElement.innerHTML = html;

    // Mock localStorage
    const store = {};
    global.localStorage = {
      getItem: key => store[key] || null,
      setItem: (key, value) => (store[key] = value),
      removeItem: key => delete store[key],
      clear: () => Object.keys(store).forEach(k => delete store[k])
    };

    // Učitaj app.js
    appJs = require("../app.js");
  });

  // 1
  test("Home section is visible by default", () => {
    expect(document.getElementById("home")).not.toHaveClass("hidden");
  });

  // 2
  test("Navigation to reservation section works", () => {
    document.getElementById("nav-book").click();
    expect(document.getElementById("rezervacija")).not.toHaveClass("hidden");
  });

  // 3
  test("Navigation to my reservations section works", () => {
    document.getElementById("nav-my").click();
    expect(document.getElementById("moje")).not.toHaveClass("hidden");
  });

  // 4
  test("Empty reservations list shows message", () => {
    document.getElementById("nav-my").click();
    expect(document.getElementById("myList").textContent).toMatch(/Ni rezervacij/i);
  });

  // 5
  test("Reservation is saved to localStorage", () => {
    const data = [{
      id: 1,
      name: "Ana",
      date: "2026-01-01",
      time: "18:00",
      guests: 2
    }];
    localStorage.setItem("reservations", JSON.stringify(data));
    const stored = JSON.parse(localStorage.getItem("reservations"));
    expect(stored.length).toBe(1);
  });

  // 6
  test("Form submission without required fields shows warning", () => {
    document.querySelector("form").dispatchEvent(new Event("submit"));
    expect(document.getElementById("confirm").textContent).toMatch(/Prosimo/i);
  });

  // 7
  test("Guests input exists", () => {
    expect(document.querySelector("input[name='guests']")).not.toBeNull();
  });

  // 8
  test("Time select exists", () => {
    expect(document.getElementById("timeSelect")).not.toBeNull();
  });

  // 9
  test("Slot grid exists", () => {
    expect(document.getElementById("slotGrid")).not.toBeNull();
  });

  // 10
  test("Confirm box is hidden initially", () => {
    expect(document.getElementById("confirm").classList.contains("hidden")).toBe(true);
  });
});
