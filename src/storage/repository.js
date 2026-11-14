import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSeed } from "../data/seed";
import { createRepository } from "./core";
import {
  validateReadings,
  validateTariff,
  applianceValues,
  numeric,
  validDate,
} from "../utils/calculations";
function validate(data) {
  if (
    !Array.isArray(data.appliances) ||
    !Array.isArray(data.readings) ||
    !Array.isArray(data.bills) ||
    !["light", "dark"].includes(data.preferences?.theme)
  )
    throw new Error(
      "Local data format is invalid. Stored data has not been overwritten.",
    );
  validateReadings(data.readings);
  validateTariff(data.tariff);
  numeric(data.budget?.amount, "Saved budget", 0.01, 1000000000);
  data.appliances.forEach(applianceValues);
  data.bills.forEach((b) => {
    if (!validDate(b.date) || !Array.isArray(b.breakdown) || !b.tariff)
      throw new Error("Invalid saved bill.");
    numeric(b.units, "Saved units");
    numeric(b.total, "Saved total");
  });
}
export const { loadData, saveCollection, resetData } = createRepository(
  AsyncStorage,
  createSeed,
  validate,
);
