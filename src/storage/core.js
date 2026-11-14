// The adapter is injected so persistence behavior can be tested without a device.
export const COLLECTIONS = [
  "appliances",
  "readings",
  "bills",
  "budget",
  "tariff",
  "preferences",
];
export const PREFIX = "@powertrack/v1/";
export function createRepository(storage, createSeed, validate = () => {}) {
  async function loadData() {
    const rows = await storage.multiGet(COLLECTIONS.map((k) => PREFIX + k));
    const marker = await storage.getItem(PREFIX + "initialized");
    if (!marker) {
      const seed = createSeed();
      await storage.multiSet(
        COLLECTIONS.filter((_, i) => rows[i][1] === null).map((k) => [
          PREFIX + k,
          JSON.stringify(seed[k]),
        ]),
      );
      await storage.setItem(PREFIX + "initialized", "1");
      return loadData();
    }
    const data = {};
    rows.forEach(([, raw], i) => {
      if (raw === null)
        throw new Error(
          "Missing local collection: " +
            COLLECTIONS[i] +
            ". Stored data has not been overwritten.",
        );
      data[COLLECTIONS[i]] = JSON.parse(raw);
    });
    validate(data);
    return data;
  }
  async function saveCollection(key, value) {
    if (!COLLECTIONS.includes(key)) throw new Error("Unknown collection.");
    await storage.setItem(PREFIX + key, JSON.stringify(value));
  }
  async function resetData() {
    const seed = createSeed();
    await storage.multiSet(
      COLLECTIONS.map((k) => [PREFIX + k, JSON.stringify(seed[k])]),
    );
    return seed;
  }
  return { loadData, saveCollection, resetData };
}
