import React from "react";
import { View } from "react-native";
import { usePower } from "../context/PowerContext";
import {
  Page,
  Heading,
  Card,
  Label,
  Row,
  Button,
  BudgetProgress,
  styles,
} from "../components/UI";
import UsageChart from "../components/UsageChart";
import {
  monthlyKwh,
  calculateBill,
  budgetSummary,
  money,
  number,
  monthKey,
  meterForMonth,
  intervals,
} from "../utils/calculations";
export default function Dashboard({ navigation }) {
  const { data, colors: c } = usePower();
  const estimated = data.appliances.reduce((s, a) => s + monthlyKwh(a), 0);
  const bill = calculateBill(estimated, data.tariff);
  const summary = budgetSummary(bill.total, data.budget.amount);
  const actual = meterForMonth(data.readings, monthKey());
  const month = new Date().toLocaleDateString("en-LK", {
    month: "long",
    year: "numeric",
  });
  const chart = Object.entries(
    intervals(data.readings).reduce((a, r) => {
      const m = monthKey(r.date);
      a[m] = (a[m] || 0) + r.units;
      return a;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([label, value]) => ({ label: label.slice(2), value }));
  return (
    <Page>
      <Heading
        title="Energy in perspective."
        subtitle={"Welcome home · " + month}
        icon="flash"
      />
      <Card style={{ backgroundColor: c.raised }}>
        <Label muted>APPLIANCE ESTIMATE · CONFIGURED DAYS</Label>
        <Label style={[styles.hero, { color: c.green }]}>
          {number(estimated)} <Label>kWh / month</Label>
        </Label>
        <Row label="Estimated monthly bill" value={money(bill.total)} />
        <Label muted style={styles.tiny}>
          Projection from your current appliance settings. Tariff:{" "}
          {data.tariff.label}. Not a utility invoice.
        </Label>
      </Card>
      <View style={styles.split}>
        <Card style={{ flex: 1 }}>
          <Label muted>Appliances</Label>
          <Label style={{ fontSize: 28, fontWeight: "800" }}>
            {data.appliances.length}
          </Label>
        </Card>
        <Card style={{ flex: 1 }}>
          <Label muted>Meter intervals ending this month</Label>
          <Label style={{ fontSize: 24, fontWeight: "800" }}>
            {actual.length
              ? number(actual.reduce((s, r) => s + r.units, 0)) + " kWh"
              : "No interval"}
          </Label>
        </Card>
      </View>
      <Card>
        <Row label="Monthly budget" value={money(data.budget.amount)} />
        <BudgetProgress summary={summary} />
        <Row
          label={summary.remaining < 0 ? "Over budget" : "Remaining budget"}
          value={money(Math.abs(summary.remaining))}
        />
        <Label muted style={styles.tiny}>
          Budget compares the appliance cost projection with your saved monthly
          limit.
        </Label>
      </Card>
      <Card>
        <UsageChart
          title="Recorded electricity usage"
          subtitle="kWh grouped by interval ending month; intervals can cross months."
          data={chart}
        />
      </Card>
      <Label style={styles.section}>Quick actions</Label>
      <View style={styles.split}>
        <View style={{ flex: 1 }}>
          <Button
            icon="calculator-outline"
            title="Calculate bill"
            onPress={() => navigation.navigate("Calculator")}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            icon="time-outline"
            title="History"
            secondary
            onPress={() => navigation.navigate("History")}
          />
        </View>
      </View>
      <Button
        title="Record meter reading"
        secondary
        onPress={() => navigation.navigate("MeterForm")}
      />
    </Page>
  );
}
