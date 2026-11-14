import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { loadData, saveCollection, resetData } from "../storage/repository";
import { palettes } from "../theme";
const Context = createContext(null);
export function PowerProvider({ children }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const queue = useRef(Promise.resolve());
  const retry = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await loadData());
    } catch (e) {
      setError("Could not load device storage. " + e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    retry();
  }, []);
  // Serialize writes; publish state only after persistence succeeds.
  const update = (key, transform) => {
    const job = queue.current
      .catch(() => {})
      .then(async () => {
        let current;
        // A ref avoids stale closures during rapid consecutive mutations.
        current = latest.current;
        const value =
          typeof transform === "function" ? transform(current[key]) : transform;
        await saveCollection(key, value);
        const next = { ...current, [key]: value };
        latest.current = next;
        setData(next);
      });
    queue.current = job;
    return job;
  };
  const latest = useRef(data);
  latest.current = data;
  const reset = () => {
    const job = queue.current
      .catch(() => {})
      .then(async () => {
        const next = await resetData();
        latest.current = next;
        setData(next);
      });
    queue.current = job;
    return job;
  };
  const colors = palettes[data?.preferences.theme || "dark"];
  return (
    <Context.Provider
      value={{ data, loading, error, retry, update, reset, colors }}
    >
      {children}
    </Context.Provider>
  );
}
export const usePower = () => useContext(Context);
