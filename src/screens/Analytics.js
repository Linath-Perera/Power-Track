import React, { useState } from "react";
import { usePower } from "../context/PowerContext";
import {
  Page,
  Heading,
  Card,
  Label,
  Row,
  Chips,
  Empty,
  styles,
} from "../components/UI";
import UsageChart from "../components/UsageChart";
import { intervals, monthlyKwh, number, monthKey } from "../utils/calculations";
export default function Analytics() {
  const { data } = usePower();
  const [month, setMonth] = useState(monthKey());
  const records = intervals(data.readings);
  const months = [
    ...new Set([monthKey(), ...records.map((r) => monthKey(r.date))]),
  ]
    .sort()
    .reverse();
  const selected = records.filter((r) => monthKey(r.date) === month);
  const total = selected.reduce((s, r) => s + r.units, 0),
    days = selected.reduce((s, r) => s + r.days, 0);
  const monthly = Object.entries(
    records.reduce((a, r) => {
      const m = monthKey(r.date);
      a[m] = (a[m] || 0) + r.units;
      return a;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));
  const index = monthly.findIndex(([m]) => m === month),
    previous = index > 0 ? monthly[index - 1] : null;
  const appliances = [...data.appliances].sort(
    (a, b) => monthlyKwh(b) - monthlyKwh(a),
  );
  return (
    <Page>
      <Heading
        title="Understand your energy"
        subtitle="Recorded usage and appliance projections, clearly separated."
        icon="bar-chart-outline"
      />
      <Chips options={months} value={month} onChange={setMonth} />
      <Card>
        <Label style={styles.section}>Meter records · {month}</Label>
        <Row label="Interval consumption" value={number(total) + " kWh"} />
        <Row label="Recorded intervals" value={selected.length} />
        <Row label="Covered interval days" value={days} />
        <Row
          label="Weighted daily average"
          value={days ? number(total / days) + " kWh/day" : "—"}
        />
        <Label muted>
          Intervals are assigned to their ending month, even when they cross
          month boundaries. Daily averages are inferred across each interval;
          these are not individual daily readings.
        </Label>
        {previous && (
          <Label muted>
            Compared with {previous[0]}: {number(total - previous[1])} kWh{" "}
            {total >= previous[1] ? "higher" : "lower"} ({selected.length}{" "}
            intervals versus{" "}
            {records.filter((r) => monthKey(r.date) === previous[0]).length}).
            Coverage may differ.
          </Label>
        )}
      </Card>
      <Card>
        <UsageChart
          title="Daily average by recorded interval"
          subtitle="Inferred kWh/day · labels show interval end dates."
          data={selected.map((r) => ({
            label: r.date.slice(5),
            value: r.average,
          }))}
        />
      </Card>
      <Card>
        <UsageChart
          title="Historical monthly comparison"
          subtitle="Recorded kWh grouped by interval ending month."
          data={monthly.map(([m, value]) => ({ label: m.slice(2), value }))}
        />
      </Card>
      <Label style={styles.section}>Current appliance estimates</Label>
      <Label muted>
        Based on current watts, hours, and configured days. Month filter above
        applies only to meter records; appliance history is not fabricated.
      </Label>
      <Card>
        <UsageChart
          title="Top appliance consumption"
          subtitle="Estimated kWh per configured month."
          data={appliances.slice(0, 6).map((a) => ({
            label: a.name.length > 10 ? a.name.slice(0, 9) + "…" : a.name,
            value: monthlyKwh(a),
          }))}
        />
      </Card>
      {!appliances.length ? (
        <Empty
          title="No appliance estimates"
          text="Add appliances to compare their estimated consumption."
        />
      ) : (
        <Card>
          <Row
            label="Total estimated monthly usage"
            value={
              number(appliances.reduce((s, a) => s + monthlyKwh(a), 0)) + " kWh"
            }
          />
          {appliances.map((a, i) => (
            <Row
              key={a.id}
              label={i + 1 + ". " + a.name}
              value={number(monthlyKwh(a)) + " kWh"}
            />
          ))}
        </Card>
      )}
    </Page>
  );
}
