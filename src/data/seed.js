import { calculateBill, today } from "../utils/calculations";
export function createSeed() {
  const now = new Date();
  const date = (offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1, 12);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      "01",
    ].join("-");
  };
  const tariff = {
    label: "DEMONSTRATION VALUES — editable",
    blocks: [
      { limit: 30, rate: 8 },
      { limit: 60, rate: 12 },
      { limit: 90, rate: 20 },
      { limit: 120, rate: 30 },
      { limit: null, rate: 45 },
    ],
    fixed: 250,
    other: 0,
  };
  const list = [
    ["Ceiling Fan", "Cooling", 75, 8],
    ["Television", "Entertainment", 100, 5],
    ["Refrigerator", "Kitchen", 150, 10],
    ["LED Bulb", "Lighting", 12, 6],
    ["Rice Cooker", "Kitchen", 700, 1],
    ["Washing Machine", "Cleaning", 500, 1],
    ["Air Conditioner", "Cooling", 1200, 4],
  ];
  const readings = [8120, 8295, 8483, 8685].map((value, i) => ({
    id: "demo-meter-" + i,
    date: date(i - 3),
    value,
    notes: "Student-created demonstration reading",
  }));
  const bills = readings.slice(1).map((r, i) => ({
    id: "demo-bill-" + i,
    date: r.date,
    notes: "Demonstration interval ending " + r.date,
    tariff: JSON.parse(JSON.stringify(tariff)),
    ...calculateBill(r.value - readings[i].value, tariff),
  }));
  return {
    appliances: list.map(([name, category, watts, hours], i) => ({
      id: "demo-appliance-" + i,
      name,
      category,
      watts,
      hours,
      days: 30,
      createdAt: today(),
    })),
    readings,
    bills,
    budget: { amount: 10000 },
    tariff,
    preferences: { theme: "dark" },
  };
}
