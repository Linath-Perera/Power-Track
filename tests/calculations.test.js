const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const load = (relative) =>
  import(
    "data:text/javascript;base64," +
      Buffer.from(
        fs.readFileSync(path.join(__dirname, "..", relative), "utf8"),
      ).toString("base64")
  );
const utils = load("src/utils/calculations.js");
test("appliance estimates respect watts, hours, and configured days", async () => {
  const u = await utils;
  const a = u.applianceValues({
    name: " Fan ",
    category: "Cooling",
    watts: "75",
    hours: "8",
    days: "30",
  });
  assert.equal(a.name, "Fan");
  assert.equal(u.dailyKwh(a), 0.6);
  assert.equal(u.monthlyKwh(a), 18);
  assert.ok(Math.abs(u.monthlyKwh({ ...a, days: 31 }) - 18.6) < 1e-9);
});
test("appliance validation rejects blank, negative, excessive and fractional inputs", async () => {
  const u = await utils;
  const a = { name: "Fan", category: "Cooling", watts: 75, hours: 8, days: 30 };
  for (const patch of [
    { name: "" },
    { watts: 0 },
    { watts: "bad" },
    { hours: 25 },
    { hours: -1 },
    { days: 0 },
    { days: 1.5 },
    { category: "Unknown" },
  ])
    assert.throws(() => u.applianceValues({ ...a, ...patch }));
  assert.equal(u.dailyKwh({ ...a, hours: 0 }), 0);
});
test("calendar validation rejects impossible dates and accepts leap days", async () => {
  const u = await utils;
  assert.equal(u.validDate("2024-02-29"), true);
  for (const s of ["2025-02-29", "2026-02-30", "04/11/2026", "2026-13-01", ""])
    assert.equal(u.validDate(s), false);
});
test("meter readings reject duplicates, negatives, future dates, and inconsistent edits", async () => {
  const u = await utils;
  const rows = [
    { id: "a", date: "2024-01-01", value: 100 },
    { id: "b", date: "2024-01-11", value: 130 },
    { id: "c", date: "2024-01-21", value: 155 },
  ];
  assert.equal(u.validateReadings([...rows].reverse())[0].id, "a");
  assert.throws(() =>
    u.validateReadings([...rows, { date: "2024-01-11", value: 135 }]),
  );
  assert.throws(() =>
    u.validateReadings([...rows, { date: "2024-01-15", value: 160 }]),
  );
  assert.throws(() => u.validateReadings([{ date: "2024-01-01", value: -1 }]));
  assert.throws(() => u.validateReadings([{ date: "2999-01-01", value: 1 }]));
  assert.equal(u.intervals(rows)[0].units, 30);
  assert.equal(u.intervals(rows)[0].average, 3);
  assert.equal(u.intervals(rows.filter((r) => r.id !== "b"))[0].units, 55);
  assert.equal(u.intervals([]).length, 0);
});
test("bill blocks are progressive with exact boundary, zero, and fractional units", async () => {
  const u = await utils;
  const t = {
    label: "Test",
    blocks: [
      { limit: 30, rate: 8 },
      { limit: 60, rate: 12 },
      { limit: null, rate: 20 },
    ],
    fixed: 250,
    other: 10,
  };
  assert.equal(u.calculateBill(0, t).total, 260);
  assert.equal(u.calculateBill(30, t).total, 500);
  assert.equal(u.calculateBill(60, t).total, 860);
  const b = u.calculateBill(65.5, t);
  assert.equal(b.energy, 710);
  assert.equal(b.total, 970);
  assert.deepEqual(
    b.breakdown.map((b) => b.units),
    [30, 30, 5.5],
  );
  assert.throws(() => u.calculateBill(-1, t));
  assert.throws(() => u.calculateBill("", t));
  assert.throws(() => u.calculateBill(Infinity, t));
});
test("tariff validation rejects gaps in unlimited block rules and negative rates", async () => {
  const u = await utils;
  const t = { label: "Test", fixed: 0, other: 0 };
  for (const blocks of [
    [],
    [{ limit: 30, rate: 1 }],
    [{ limit: null, rate: -1 }],
    [
      { limit: 30, rate: 1 },
      { limit: 20, rate: 2 },
      { limit: null, rate: 3 },
    ],
    [
      { limit: null, rate: 1 },
      { limit: null, rate: 2 },
    ],
  ])
    assert.throws(() => u.validateTariff({ ...t, blocks }));
  assert.equal(
    u.calculateBill(10, { ...t, blocks: [{ limit: null, rate: 2 }] }).total,
    20,
  );
});
test("budget warnings trigger at 80 and 100 percent", async () => {
  const u = await utils;
  assert.equal(u.budgetSummary(79, 100).level, "good");
  assert.equal(u.budgetSummary(80, 100).level, "warning");
  assert.equal(u.budgetSummary(100, 100).level, "over");
  assert.equal(u.budgetSummary(110, 100).remaining, -10);
});
test("month attribution uses interval ending month", async () => {
  const u = await utils;
  const rows = [
    { date: "2024-01-20", value: 100 },
    { date: "2024-02-10", value: 142 },
  ];
  assert.equal(u.meterForMonth(rows, "2024-01").length, 0);
  assert.equal(u.meterForMonth(rows, "2024-02")[0].units, 42);
});
test("demonstration data has coherent readings and independently calculated bills", async () => {
  const u = await utils;
  let source = fs.readFileSync(
    path.join(__dirname, "../src/data/seed.js"),
    "utf8",
  );
  source = source.replace(
    /["']\.\.\/utils\/calculations["']/,
    JSON.stringify(
      "data:text/javascript;base64," +
        Buffer.from(
          fs.readFileSync(
            path.join(__dirname, "../src/utils/calculations.js"),
            "utf8",
          ),
        ).toString("base64"),
    ),
  );
  const { createSeed } = await import(
    "data:text/javascript;base64," + Buffer.from(source).toString("base64")
  );
  const d = createSeed();
  u.validateReadings(d.readings);
  assert.equal(d.appliances.length, 7);
  d.bills.forEach((b, i) => {
    assert.equal(b.units, d.readings[i + 1].value - d.readings[i].value);
    assert.equal(b.total, u.calculateBill(b.units, b.tariff).total);
  });
});
