import { AppAlert as Alert } from "../utils/dialog";
import React, { useState } from "react";
import { View } from "react-native";
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
  confirmDelete,
  styles,
} from "../components/UI";
import {
  CATEGORIES,
  applianceValues,
  dailyKwh,
  monthlyKwh,
  number,
  uid,
  today,
} from "../utils/calculations";
export function Appliances({ navigation }) {
  const { data } = usePower();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("All");
  const records = data.appliances.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || a.category === category),
  );
  return (
    <Page>
      <Heading
        title="Your appliances"
        subtitle="Small habits. Measurable energy."
      />
      <Button
        title="Add appliance"
        icon="add"
        onPress={() => navigation.navigate("ApplianceForm")}
      />
      <Input
        label="Search appliances"
        placeholder="Search by name…"
        value={search}
        onChangeText={setSearch}
      />
      <Chips
        options={["All", ...CATEGORIES]}
        value={category}
        onChange={setCategory}
      />
      <Label muted>
        {records.length} appliance{records.length === 1 ? "" : "s"} · Estimated
        consumption
      </Label>
      {!records.length && (
        <Empty
          title="No appliances found"
          text="Try another search or add your first appliance."
        />
      )}
      {records.map((a) => (
        <Card
          key={a.id}
          onPress={() => navigation.navigate("ApplianceDetails", { id: a.id })}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Label style={styles.section}>{a.name}</Label>
            <Label>↗</Label>
          </View>
          <Label muted>
            {a.category} · {a.watts} W · {a.hours} h/day
          </Label>
          <Row
            label={a.days + " days / month"}
            value={number(monthlyKwh(a)) + " kWh"}
          />
        </Card>
      ))}
    </Page>
  );
}
export function ApplianceForm({ route, navigation }) {
  const { data, update } = usePower();
  const existing = data.appliances.find((a) => a.id === route.params?.id);
  const [form, setForm] = useState(
      existing || {
        name: "",
        category: "Cooling",
        watts: "",
        hours: "",
        days: "30",
      },
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const change = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const save = async () => {
    setError("");
    try {
      const values = applianceValues(form);
      setBusy(true);
      await update("appliances", (list) =>
        existing
          ? list.map((a) => (a.id === existing.id ? { ...a, ...values } : a))
          : [...list, { ...values, id: uid(), createdAt: today() }],
      );
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
        <Empty title="Appliance no longer exists" />
      </Page>
    );
  return (
    <Page>
      <Heading
        title={existing ? "Fine-tune your estimate" : "Add an appliance"}
        subtitle="Use average operating hours; cycling appliances vary."
      />
      <Input
        label="Appliance name"
        value={form.name}
        onChangeText={change("name")}
        maxLength={80}
      />
      <Label>Category</Label>
      <Chips
        options={CATEGORIES}
        value={form.category}
        onChange={change("category")}
      />
      <Input
        label="Power rating (watts)"
        value={form.watts}
        onChangeText={change("watts")}
        keyboardType="decimal-pad"
      />
      <Input
        label="Daily usage hours (0–24)"
        value={form.hours}
        onChangeText={change("hours")}
        keyboardType="decimal-pad"
      />
      <Input
        label="Days per month (1–31)"
        value={form.days}
        onChangeText={change("days")}
        keyboardType="number-pad"
      />
      <ErrorText message={error} />
      <Button
        disabled={busy}
        title={busy ? "Saving…" : "Save appliance"}
        onPress={save}
      />
    </Page>
  );
}
export function ApplianceDetails({ route, navigation }) {
  const { data, update } = usePower();
  const a = data.appliances.find((x) => x.id === route.params.id);
  if (!a)
    return (
      <Page>
        <Empty title="Appliance no longer exists" />
      </Page>
    );
  return (
    <Page>
      <Heading title={a.name} subtitle={a.category} icon="flash-outline" />
      <Card>
        <Row label="Power rating" value={a.watts + " W"} />
        <Row label="Average daily use" value={a.hours + " hours"} />
        <Row label="Configured month" value={a.days + " days"} />
        <Row
          label="Estimated daily consumption"
          value={number(dailyKwh(a)) + " kWh"}
        />
        <Row
          label="Estimated monthly consumption"
          value={number(monthlyKwh(a)) + " kWh"}
        />
        <Row label="Created" value={a.createdAt} />
        <Row label="ID" value={a.id} />
      </Card>
      <Card>
        <Label style={styles.section}>How it is calculated</Label>
        <Label muted>
          Daily: ({a.watts} W × {a.hours} hours) ÷ 1000 = {number(dailyKwh(a))}{" "}
          kWh
        </Label>
        <Label muted>
          Monthly: {number(dailyKwh(a))} kWh × {a.days} days ={" "}
          {number(monthlyKwh(a))} kWh
        </Label>
      </Card>
      <Button
        title="Edit appliance"
        onPress={() => navigation.navigate("ApplianceForm", { id: a.id })}
      />
      <Button
        title="Delete appliance"
        danger
        onPress={() =>
          confirmDelete("Delete " + a.name + "?", async () => {
            await update("appliances", (list) =>
              list.filter((x) => x.id !== a.id),
            );
            navigation.goBack();
          })
        }
      />
    </Page>
  );
}
