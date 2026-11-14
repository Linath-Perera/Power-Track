const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const core = import(
  "data:text/javascript;base64," +
    Buffer.from(
      fs.readFileSync(path.join(__dirname, "../src/storage/core.js"), "utf8"),
    ).toString("base64")
);
function adapter(initial = []) {
  const map = new Map(initial);
  return {
    map,
    async multiGet(keys) {
      return keys.map((k) => [k, map.get(k) ?? null]);
    },
    async getItem(k) {
      return map.get(k) ?? null;
    },
    async multiSet(rows) {
      rows.forEach(([k, v]) => map.set(k, v));
    },
    async setItem(k, v) {
      map.set(k, v);
    },
  };
}
const seed = () => ({
  appliances: [{ name: "Demo" }],
  readings: [],
  bills: [],
  budget: { amount: 100 },
  tariff: { blocks: [] },
  preferences: { theme: "dark" },
});
test("first launch seeds separate collections; reopening preserves edits and deletions", async () => {
  const { createRepository, COLLECTIONS, PREFIX } = await core;
  const storage = adapter(),
    repo = createRepository(storage, seed);
  const first = await repo.loadData();
  assert.equal(first.appliances[0].name, "Demo");
  assert.equal(storage.map.size, COLLECTIONS.length + 1);
  await repo.saveCollection("appliances", []);
  const reopened = await createRepository(storage, seed).loadData();
  assert.deepEqual(reopened.appliances, []);
  assert.ok(storage.map.has(PREFIX + "budget"));
});
test("interrupted initial seed preserves already written user collections", async () => {
  const { createRepository, PREFIX } = await core;
  const storage = adapter([
    [PREFIX + "appliances", JSON.stringify([{ name: "Mine" }])],
  ]);
  assert.equal(
    (await createRepository(storage, seed).loadData()).appliances[0].name,
    "Mine",
  );
});
test("storage errors propagate, and corruption does not silently reseed", async () => {
  const { createRepository, PREFIX } = await core;
  const storage = adapter(),
    repo = createRepository(storage, seed);
  await repo.loadData();
  storage.map.set(PREFIX + "appliances", "invalid JSON");
  await assert.rejects(repo.loadData());
  assert.equal(storage.map.get(PREFIX + "appliances"), "invalid JSON");
  storage.setItem = async () => {
    throw Error("disk full");
  };
  await assert.rejects(
    repo.saveCollection("budget", { amount: 9 }),
    /disk full/,
  );
  await assert.rejects(repo.saveCollection("unknown", []), /Unknown/);
});
test("reset deliberately restores the complete demonstration dataset", async () => {
  const { createRepository } = await core;
  const repo = createRepository(adapter(), seed);
  await repo.loadData();
  await repo.saveCollection("appliances", []);
  await repo.resetData();
  assert.equal((await repo.loadData()).appliances[0].name, "Demo");
});
