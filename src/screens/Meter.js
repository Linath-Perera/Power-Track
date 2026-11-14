import React, { useState } from "react";
import { usePower } from "../context/PowerContext";
import {
  Page,
  Heading,
  Card,
  Label,
  Input,
  Button,
  Chips,
  Empty,
  Row,
  ErrorText,
  styles,
} from "../components/UI";
import {
  validateReadings,
  intervals,
  number,
  uid,
  today,
} from "../utils/calculations";
export function Meter({ navigation }) {
  const { data } = usePower();
  const [sort, setSort] = useState("Newest");
  const readings = [...data.readings].sort((a, b) =>
    sort === "Newest"
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date),
  );
  const usage = intervals(data.readings);
  const latest = [...data.readings].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  return (
    <Page>
      <Heading
        title="Meter readings"
        subtitle="Real readings. Clear intervals."
        icon="speedometer-outline"
      />
      {latest && (
        <Card>
          <Label muted>LATEST METER READING · {latest.date}</Label>
          <Label style={styles.hero}>
            {number(latest.value)} <Label>kWh</Label>
          </Label>
          <Label muted>
            Cumulative meter register, not monthly consumption.
          </Label>
        </Card>
      )}
      <Button
        title="Add meter reading"
        icon="add"
        onPress={() => navigation.navigate("MeterForm")}
      />
      <Chips options={["Newest", "Oldest"]} value={sort} onChange={setSort} />
      {!readings.length && (
        <Empty
          title="Start your reading history"
          text="Two readings establish your first consumption interval."
        />
      )}
      {readings.map((r) => {
        const interval = usage.find((x) => x.id === r.id);
        return (
          <Card
            key={r.id}
            onPress={() =>
              navigation.navigate("RecordDetails", { id: r.id, type: "meter" })
            }
          >
            <Row label={r.date} value={number(r.value) + " kWh"} />
            <Label style={{ fontWeight: "700" }}>
              {interval
                ? number(interval.units) + " kWh since " + interval.start
                : "Baseline reading"}
            </Label>
            {r.notes ? <Label muted>{r.notes}</Label> : null}
          </Card>
        );
      })}
      <Button
        title="View all usage history"
        secondary
        onPress={() => navigation.navigate("History")}
      />
    </Page>
  );
}
export function MeterForm({ route, navigation }) {
  const { data, update } = usePower();
  const existing = data.readings.find((r) => r.id === route.params?.id);
  const [date, setDate] = useState(existing?.date || today()),
    [value, setValue] = useState(existing ? String(existing.value) : ""),
    [notes, setNotes] = useState(existing?.notes || ""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const save = async () => {
    setError("");
    setBusy(true);
    try {
      if (value.trim() === "" || !Number.isFinite(Number(value)))
        throw new Error("Enter a valid nonnegative meter reading.");
      const record = {
        id: existing?.id || uid(),
        date: date.trim(),
        value: Number(value),
        notes: notes.trim(),
      };
      await update("readings", (list) => {
        const next = existing
          ? list.map((r) => (r.id === record.id ? record : r))
          : [...list, record];
        validateReadings(next);
        return next;
      });
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (route.params?.id && !existing)
    return (
      <Page>
        <Empty title="Reading no longer exists" />
      </Page>
    );
  return (
    <Page>
      <Heading
        title={existing ? "Update reading" : "Capture your meter"}
        subtitle="Enter the cumulative kWh value shown on your meter."
      />
      <Input
        label="Reading date (YYYY-MM-DD)"
        placeholder="2026-11-04"
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
        maxLength={10}
      />
      <Input
        label="Cumulative meter reading (kWh)"
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
      />
      <Input
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={500}
      />
      <Label muted>
        One reading per date. Readings must be nondecreasing chronologically,
        including when editing an older record.
      </Label>
      <ErrorText message={error} />
      <Button
        title={busy ? "Saving…" : "Save reading"}
        disabled={busy}
        onPress={save}
      />
    </Page>
  );
}
