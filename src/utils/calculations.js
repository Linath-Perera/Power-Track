// Pure domain functions shared by every screen and the Node test suite.
export const CATEGORIES = [
  "Cooling",
  "Kitchen",
  "Lighting",
  "Entertainment",
  "Cleaning",
  "Other",
];
export const today = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};
export const monthKey = (date = today()) => date.slice(0, 7);
export const money = (n) =>
  "Rs. " +
  Number(n || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const number = (n) =>
  Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 2 });
export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
export function validDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
export function numeric(value, label, min = 0, max = Infinity) {
  if (
    String(value).trim() === "" ||
    !Number.isFinite(Number(value)) ||
    Number(value) < min ||
    Number(value) > max
  )
    throw new Error(
      label +
        " must be a number between " +
        min +
        " and " +
        (max === Infinity ? "a finite positive limit" : max) +
        ".",
    );
  return Number(value);
}
export function applianceValues(input) {
  const name = input.name.trim();
  if (!name) throw new Error("Enter an appliance name.");
  if (!CATEGORIES.includes(input.category))
    throw new Error("Choose an appliance category.");
  const watts = numeric(input.watts, "Power rating", 0.01, 1000000);
  const hours = numeric(input.hours, "Daily hours", 0, 24);
  const days = numeric(input.days, "Days per month", 1, 31);
  if (!Number.isInteger(days)) throw new Error("Days must be a whole number.");
  return { name, category: input.category, watts, hours, days };
}
export const dailyKwh = (a) => (a.watts * a.hours) / 1000;
export const monthlyKwh = (a) => dailyKwh(a) * a.days;
export function validateReadings(readings) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
  sorted.forEach((r, i) => {
    if (!validDate(r.date) || r.date > today())
      throw new Error(
        "Use a valid reading date, no later than today (YYYY-MM-DD).",
      );
    numeric(r.value, "Meter reading", 0, 1000000000);
    if (i && r.date === sorted[i - 1].date)
      throw new Error("A reading already exists on this date.");
    if (i && Number(r.value) < Number(sorted[i - 1].value))
      throw new Error(
        "Readings must increase over time. Check the previous and following readings.",
      );
  });
  return sorted;
}
export function intervals(readings) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.slice(1).map((r, i) => {
    const previous = sorted[i];
    const days = (Date.parse(r.date) - Date.parse(previous.date)) / 86400000;
    return {
      id: r.id,
      date: r.date,
      start: previous.date,
      units: r.value - previous.value,
      days,
      average: (r.value - previous.value) / days,
    };
  });
}
// Attribute each interval to its ending month; never imply exact calendar-month metered usage.
export const meterForMonth = (readings, month) =>
  intervals(readings).filter((r) => monthKey(r.date) === month);
export function validateTariff(t) {
  if (!t.blocks?.length) throw new Error("Add at least one tariff block.");
  let previous = 0;
  const blocks = t.blocks.map((b, i) => {
    const rate = numeric(b.rate, "Block rate", 0, 1000000);
    const limit =
      b.limit === null || b.limit === ""
        ? null
        : numeric(b.limit, "Upper unit limit", 0.01, 1000000000);
    if (i === t.blocks.length - 1 && limit !== null)
      throw new Error("The final block must have a blank limit (unlimited).");
    if (i < t.blocks.length - 1 && (limit === null || limit <= previous))
      throw new Error(
        "Block limits must increase; only the last may be unlimited.",
      );
    if (limit !== null) previous = limit;
    return { limit, rate };
  });
  return {
    label: String(t.label || "Custom tariff"),
    blocks,
    fixed: numeric(t.fixed, "Fixed charge", 0, 1000000),
    other: numeric(t.other, "Other charge", 0, 1000000),
  };
}
export function calculateBill(unitsInput, tariff) {
  const units = numeric(unitsInput, "Consumed units", 0, 1000000000);
  const t = validateTariff(tariff);
  let remaining = units,
    previous = 0;
  const breakdown = t.blocks.map((b) => {
    const quantity = Math.max(
      0,
      Math.min(remaining, b.limit === null ? remaining : b.limit - previous),
    );
    remaining -= quantity;
    const row = {
      from: previous,
      to: b.limit,
      rate: b.rate,
      units: quantity,
      amount: quantity * b.rate,
    };
    if (b.limit !== null) previous = b.limit;
    return row;
  });
  const energy = breakdown.reduce((s, b) => s + b.amount, 0);
  return {
    units,
    breakdown,
    energy,
    fixed: t.fixed,
    other: t.other,
    total: Math.round((energy + t.fixed + t.other) * 100) / 100,
  };
}
export function budgetSummary(cost, budget) {
  return {
    percent: budget > 0 ? (cost / budget) * 100 : 0,
    remaining: budget - cost,
    level: cost >= budget ? "over" : cost >= budget * 0.8 ? "warning" : "good",
  };
}
