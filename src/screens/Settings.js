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
  Row,
  Chips,
  ErrorText,
  BudgetProgress,
  styles,
} from "../components/UI";
import {
  numeric,
  monthlyKwh,
  calculateBill,
  budgetSummary,
  money,
  validateTariff,
} from "../utils/calculations";
export function Settings({ navigation }) {
  const { data, update, reset } = usePower();
  const [amount, setAmount] = useState(String(data.budget.amount)),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const estimate = calculateBill(
    data.appliances.reduce((s, a) => s + monthlyKwh(a), 0),
    data.tariff,
  );
  const save = async () => {
    setBusy(true);
    try {
      const value = numeric(amount, "Monthly budget", 0.01, 1000000000);
      await update("budget", { amount: value });
      setError("");
      Alert.alert(
        "Budget saved",
        "Your monthly electricity limit has been updated.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const doReset = () =>
    Alert.alert(
      "Replace all data with demonstration data?",
      "This permanently replaces appliances, readings, saved bills, budget, tariffs, and theme on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset all data",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await reset();
              setAmount("10000");
              setError("");
              Alert.alert(
                "Demo restored",
                "Student-created demonstration records have been restored.",
              );
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  return (
    <Page>
      <Heading
        title="Make it yours"
        subtitle="Preferences and planning, stored offline."
        icon="settings-outline"
      />
      <Card>
        <Label style={styles.section}>Monthly electricity budget</Label>
        <Row label="Saved budget" value={money(data.budget.amount)} />
        <Row
          label="Current appliance projection"
          value={money(estimate.total)}
        />
        <BudgetProgress
          summary={budgetSummary(estimate.total, data.budget.amount)}
        />
        <Input
          label="Monthly limit (LKR)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Button title="Save budget" disabled={busy} onPress={save} />
      </Card>
      <ErrorText message={error} />
      <Card>
        <Label style={styles.section}>Appearance</Label>
        <Chips
          options={[
            { label: "Dark navy", value: "dark" },
            { label: "Light", value: "light" },
          ]}
          value={data.preferences.theme}
          onChange={async (theme) => {
            try {
              await update("preferences", { ...data.preferences, theme });
            } catch (e) {
              setError(e.message);
            }
          }}
        />
      </Card>
      <Button
        title="Configure electricity tariffs"
        secondary
        onPress={() => navigation.navigate("TariffSettings")}
      />
      <Button
        title="Open bill calculator"
        secondary
        onPress={() => navigation.navigate("Calculator")}
      />
      <Button
        title="Usage history"
        secondary
        onPress={() => navigation.navigate("History")}
      />
      <Card>
        <Label style={styles.section}>ϟ PowerTrack · 1.0.0</Label>
        <Label muted>Electricity Usage Manager · ICA 03</Label>
        <Label muted>
          Individual React Native university project. All records stay in local
          device storage. No account, public API, cloud database, or remote
          authentication.
        </Label>
        <Label muted>
          Appliance values and seeded readings are student-created
          demonstrations. Estimates are for planning and do not replace provider
          invoices.
        </Label>
        <Label muted>
          Deleting the application or clearing its storage removes local
          records.
        </Label>
      </Card>
      <Button
        title="Reset demonstration data"
        danger
        disabled={busy}
        onPress={doReset}
      />
    </Page>
  );
}
export function TariffSettings({ navigation }) {
  const { data, update } = usePower();
  const [label, setLabel] = useState(data.tariff.label),
    [fixed, setFixed] = useState(String(data.tariff.fixed)),
    [other, setOther] = useState(String(data.tariff.other)),
    [blocks, setBlocks] = useState(
      data.tariff.blocks.map((b) => ({
        limit: b.limit === null ? "" : String(b.limit),
        rate: String(b.rate),
      })),
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const change = (i, key, value) =>
    setBlocks((list) =>
      list.map((b, j) => (j === i ? { ...b, [key]: value } : b)),
    );
  const save = async () => {
    try {
      setError("");
      const tariff = validateTariff({ label, blocks, fixed, other });
      setBusy(true);
      await update("tariff", tariff);
      Alert.alert(
        "Tariff saved",
        "New calculations and dashboard estimates use these rates. Historical bills keep their saved rates.",
      );
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page>
      <Heading
        title="Your tariff, your estimate"
        subtitle="Progressive blocks · LKR per kWh"
      />
      <Card>
        <Label muted>
          First-launch rates are DEMONSTRATION VALUES, not official CEB or LECO
          tariffs. Enter your own verified rates. This model applies successive
          unit blocks plus one flat fixed charge and one flat other charge; it
          does not reproduce every utility billing rule.
        </Label>
      </Card>
      <Input
        label="Configuration label"
        value={label}
        onChangeText={setLabel}
        maxLength={100}
      />
      {blocks.map((b, i) => (
        <Card key={i}>
          <Label style={styles.section}>Block {i + 1}</Label>
          <Input
            label="Cumulative upper unit limit (blank = unlimited)"
            value={b.limit}
            onChangeText={(v) => change(i, "limit", v)}
            keyboardType="decimal-pad"
          />
          <Input
            label="Rate per kWh (LKR)"
            value={b.rate}
            onChangeText={(v) => change(i, "rate", v)}
            keyboardType="decimal-pad"
          />
          {blocks.length > 1 && (
            <Button
              title="Remove block"
              secondary
              onPress={() =>
                setBlocks((list) => list.filter((_, j) => i !== j))
              }
            />
          )}
        </Card>
      ))}
      <Button
        title="Add tariff block"
        secondary
        onPress={() => setBlocks((list) => [...list, { limit: "", rate: "0" }])}
      />
      <Label muted>
        Use increasing cumulative limits. Only the final block must be
        unlimited. For example: 30, 60, 90, then blank.
      </Label>
      <Input
        label="Flat fixed charge (LKR)"
        value={fixed}
        onChangeText={setFixed}
        keyboardType="decimal-pad"
      />
      <Input
        label="Flat other charge (LKR)"
        value={other}
        onChangeText={setOther}
        keyboardType="decimal-pad"
      />
      <ErrorText message={error} />
      <Button
        title={busy ? "Saving…" : "Save tariff configuration"}
        disabled={busy}
        onPress={save}
      />
    </Page>
  );
}
