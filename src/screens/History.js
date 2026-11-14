import React, { useEffect, useState } from "react";
import { usePower } from "../context/PowerContext";
import {
  Page,
  Heading,
  Card,
  Label,
  Input,
  Button,
  Row,
  Chips,
  Empty,
  confirmDelete,
} from "../components/UI";
import { intervals, monthKey, number, money } from "../utils/calculations";
import { BillBreakdown } from "./Calculator";
export function History({ route, navigation }) {
  const { data } = usePower();
  const [type, setType] = useState(route.params?.initialType || "all"),
    [month, setMonth] = useState("All months"),
    [sort, setSort] = useState("Newest"),
    [search, setSearch] = useState("");
  useEffect(() => {
    if (route.params?.initialType) setType(route.params.initialType);
  }, [route.params?.initialType]);
  const all = [
    ...data.readings.map((r) => ({ ...r, type: "meter" })),
    ...data.bills.map((r) => ({ ...r, type: "bill" })),
  ];
  const months = [
    "All months",
    ...new Set(
      all
        .map((r) => monthKey(r.date))
        .sort()
        .reverse(),
    ),
  ];
  const records = all
    .filter(
      (r) =>
        (type === "all" || r.type === type) &&
        (month === "All months" || monthKey(r.date) === month) &&
        [r.id, r.date, r.notes, r.type, r.value, r.units, r.total]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort(
      (a, b) => (sort === "Newest" ? -1 : 1) * a.date.localeCompare(b.date),
    );
  return (
    <Page>
      <Heading
        title="Your energy journal"
        subtitle="All records stay on this device."
      />
      <Input
        label="Search history"
        placeholder="Date, note, ID, units…"
        value={search}
        onChangeText={setSearch}
      />
      <Chips
        options={[
          { label: "All records", value: "all" },
          { label: "Meter readings", value: "meter" },
          { label: "Bill estimates", value: "bill" },
        ]}
        value={type}
        onChange={setType}
      />
      <Chips options={months} value={month} onChange={setMonth} />
      <Chips options={["Newest", "Oldest"]} value={sort} onChange={setSort} />
      <Label muted>{records.length} matching records</Label>
      {!records.length && (
        <Empty
          title="No matching records"
          text="Try a different filter, or save a meter reading or bill."
        />
      )}
      {records.map((r) => (
        <Card
          key={r.type + r.id}
          onPress={() =>
            navigation.navigate("RecordDetails", { id: r.id, type: r.type })
          }
        >
          <Row
            label={r.type === "meter" ? "Meter reading" : "Saved bill estimate"}
            value={r.date}
          />
          <Label style={{ fontSize: 22, fontWeight: "700" }}>
            {r.type === "meter" ? number(r.value) + " kWh" : money(r.total)}
          </Label>
          {r.type === "bill" && (
            <Label muted>{number(r.units)} kWh · saved tariff snapshot</Label>
          )}
          {r.notes ? <Label muted>{r.notes}</Label> : null}
          <Label muted style={{ fontSize: 11 }}>
            ID: {r.id}
          </Label>
        </Card>
      ))}
    </Page>
  );
}
export function RecordDetails({ route, navigation }) {
  const { data, update } = usePower();
  const { id, type } = route.params;
  const key = type === "meter" ? "readings" : "bills";
  const r = data[key].find((x) => x.id === id);
  if (!r)
    return (
      <Page>
        <Empty title="Record no longer exists" />
      </Page>
    );
  const interval =
    type === "meter" ? intervals(data.readings).find((x) => x.id === id) : null;
  return (
    <Page>
      <Heading
        title={type === "meter" ? "Meter reading" : "Saved bill estimate"}
        subtitle={r.date}
      />
      <Card>
        <Row label="Record ID" value={r.id} />
        <Row label="Date" value={r.date} />
        <Row
          label={type === "meter" ? "Cumulative meter value" : "Consumed units"}
          value={number(type === "meter" ? r.value : r.units) + " kWh"}
        />
        {type === "meter" && (
          <>
            <Row
              label="Previous reading date"
              value={interval?.start || "Baseline"}
            />
            <Row
              label="Interval consumption"
              value={
                interval
                  ? number(interval.units) + " kWh"
                  : "No previous reading"
              }
            />
          </>
        )}
        <Label muted>Notes</Label>
        <Label>{r.notes || "No notes saved."}</Label>
      </Card>
      {type === "bill" && (
        <>
          <BillBreakdown bill={r} />
          <Card>
            <Label style={{ fontWeight: "700" }}>Saved tariff snapshot</Label>
            <Label muted>{r.tariff.label}</Label>
            {r.tariff.blocks.map((b, i) => (
              <Row
                key={i}
                label={
                  "Up to " + (b.limit === null ? "unlimited" : b.limit + " kWh")
                }
                value={money(b.rate) + "/kWh"}
              />
            ))}
            <Label muted>
              This saved estimate is preserved when current tariffs change.
            </Label>
          </Card>
        </>
      )}
      {type === "meter" && (
        <Button
          title="Edit reading"
          onPress={() => navigation.navigate("MeterForm", { id })}
        />
      )}
      <Button
        title="Delete record"
        danger
        onPress={() =>
          confirmDelete("Delete this record?", async () => {
            await update(key, (list) => list.filter((x) => x.id !== id));
            navigation.goBack();
          })
        }
      />
      {type === "meter" && (
        <Label muted>
          Deleting a reading reconnects the adjacent readings and recalculates
          their interval. Saved bill calculations stay unchanged.
        </Label>
      )}
    </Page>
  );
}
