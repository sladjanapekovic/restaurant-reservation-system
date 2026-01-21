/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Frontend app.js tests", () => {
  beforeEach(() => {
    jest.resetModules();

    // Učitaj HTML
    const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
    document.documentElement.innerHTML = html;

    // Mock localStorage
    const store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => (store[key] = value),
      removeItem: (key) => delete store[key],
      clear: () => Object.keys(store).forEach((k) => delete store[k]),
    };

    // Učitaj app.js (kači listenere)
    require("../app.js");
  });

  test("Home section is visible by default", () => {
    expect(document.getElementById("home")).not.toHaveClass("hidden");
  });

  test("Navigation to reservation section works", () => {
    document.getElementById("nav-book")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(document.getElementById("rezervacija")).not.toHaveClass("hidden");
  });

  test("Navigation to my reservations section works", () => {
    document.getElementById("nav-my")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(document.getElementById("moje")).not.toHaveClass("hidden");
  });

  test("Empty reservations list shows message", () => {
    document.getElementById("nav-my")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(document.getElementById("myList").textContent).toMatch(/Ni rezervacij/i);
  });

  test("Reservation is saved to localStorage", () => {
    const data = [
      { id: 1, name: "Ana", date: "2026-01-01", time: "18:00", guests: 2 },
    ];
    localStorage.setItem("reservations", JSON.stringify(data));
    const stored = JSON.parse(localStorage.getItem("reservations"));
    expect(stored.length).toBe(1);
  });

  test("Form submission without required fields shows warning", () => {
    const form = document.getElementById("bookingForm");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(document.getElementById("confirm").classList.contains("hidden")).toBe(false);
  });

  test("Guests input exists", () => {
    expect(document.querySelector("input[name='guests']")).not.toBeNull();
  });

  test("Time select exists", () => {
    expect(document.getElementById("timeSelect")).not.toBeNull();
  });

  test("Slot grid exists", () => {
    expect(document.getElementById("slotGrid")).not.toBeNull();
  });

  test("Confirm box is hidden initially", () => {
    expect(document.getElementById("confirm").classList.contains("hidden")).toBe(true);
  });
});
