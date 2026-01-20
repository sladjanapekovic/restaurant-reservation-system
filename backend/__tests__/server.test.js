const request = require("supertest");
const { app, _reset } = require("../server");

beforeEach(() => {
  _reset();
});

describe("Backend API", () => {
  // 1
  test("GET /health returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  // 2
  test("GET /api/reservations initially returns empty array", async () => {
    const res = await request(app).get("/api/reservations");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  // 3
  test("POST /api/reservations fails with missing fields", async () => {
    const res = await request(app).post("/api/reservations").send({ name: "Ana" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // 4
  test("POST /api/reservations creates reservation", async () => {
    const payload = { name: "Ana", date: "2026-01-20", time: "18:00", guests: 2 };
    const res = await request(app).post("/api/reservations").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Ana");
  });

  // 5
  test("After POST, GET /api/reservations returns 1 item", async () => {
    await request(app).post("/api/reservations").send({
      name: "Marko", date: "2026-01-21", time: "19:00", guests: 4
    });
    const res = await request(app).get("/api/reservations");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // 6
  test("POST converts guests to number", async () => {
    const res = await request(app).post("/api/reservations").send({
      name: "Ema", date: "2026-01-22", time: "20:00", guests: "3"
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.guests).toBe(3);
    expect(typeof res.body.guests).toBe("number");
  });

  // 7
  test("DELETE /api/reservations/:id deletes existing reservation", async () => {
    const created = await request(app).post("/api/reservations").send({
      name: "Luka", date: "2026-01-23", time: "17:30", guests: 2
    });
    const id = created.body.id;

    const del = await request(app).delete(`/api/reservations/${id}`);
    expect(del.statusCode).toBe(200);
    expect(del.body).toEqual({ deleted: true });

    const list = await request(app).get("/api/reservations");
    expect(list.body).toEqual([]);
  });

  // 8
  test("DELETE /api/reservations/:id returns 404 if not found", async () => {
    const del = await request(app).delete("/api/reservations/999999");
    expect(del.statusCode).toBe(404);
    expect(del.body).toHaveProperty("error");
  });

  // 9
  test("Multiple reservations are stored", async () => {
    await request(app).post("/api/reservations").send({
      name: "A", date: "2026-01-24", time: "12:00", guests: 1
    });
    await request(app).post("/api/reservations").send({
      name: "B", date: "2026-01-24", time: "12:30", guests: 2
    });
    const res = await request(app).get("/api/reservations");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  // 10
  test("Reservation object contains expected fields", async () => {
    const res = await request(app).post("/api/reservations").send({
      name: "Nina", date: "2026-01-25", time: "21:00", guests: 5
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("date");
    expect(res.body).toHaveProperty("time");
    expect(res.body).toHaveProperty("guests");
  });
});
