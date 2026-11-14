import { AppAlert as Alert } from "../utils/dialog";
import React, { useState } from "react";

import { usePower } from "../context/PowerContext";
import {
  Page,
  Heading,
  Card,
  Label,
  Input,
  Button,
  Row,
  ErrorText,
  styles,
} from "../components/UI";
import {
  calculateBill,
  money,
  number,
  uid,
  today,
} from "../utils/calculations";
export function BillBreakdown({ bill }) {
  return (
    <Card>
      <Label style={styles.section}>Calculation breakdown</Label>
      {bill.breakdown
        .filter((b) => b.units > 0)
        .map((b, i) => (
          <Row
            key={i}
            label={number(b.units) + " kWh × " + money(b.rate)}
            value={money(b.amount)}
          />
        ))}
      <Row label="Consumed units" value={number(bill.units) + " kWh"} />
      <Row label="Energy charge" value={money(bill.energy)} />
      <Row label="Fixed charge" value={money(bill.fixed)} />
      <Row label="Other configured charge" value={money(bill.other)} />
      <Row label="Estimated total" value={money(bill.total)} />
    </Card>
  );
}
export function Calculator({ navigation }) {
  const { data, update } = usePower();
  const [units, setUnits] = useState(""),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [notes, setNotes] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  const calculate = () => {
    try {
      setResult({
        bill: calculateBill(units, data.tariff),
        tariff: JSON.parse(JSON.stringify(data.tariff)),
      });
      setError("");
      setSaved(false);
    } catch (e) {
      setError(e.message);
      setResult(null);
    }
  };
  const save = async () => {
    setBusy(true);
    try {
      await update("bills", (list) => [
        {
          ...result.bill,
          id: uid(),
          date: today(),
          notes: notes.trim(),
          tariff: result.tariff,
        },
        ...list,
      ]);
      setSaved(true);
      Alert.alert(
        "Calculation saved",
        "Your estimate is available offline in usage history.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page>
      <Heading
        title="Plan your electricity bill"
        subtitle="An offline estimate using your own tariff."
        icon="calculator-outline"
      />
      <Card>
        <Label style={{ fontWeight: "700" }}>{data.tariff.label}</Label>
        <Label muted>
          Demonstration configuration on first launch. Not official current CEB
          or LECO rates. Progressive blocks and a flat fixed charge apply;
          confirm your provider’s billing method before relying on estimates.
        </Label>
        <Button
          title="Configure tariffs"
          secondary
          onPress={() => navigation.navigate("TariffSettings")}
        />
      </Card>
      <Input
        label="Consumed electricity units (kWh)"
        value={units}
        onChangeText={(v) => {
          setUnits(v);
          setResult(null);
          setSaved(false);
        }}
        keyboardType="decimal-pad"
      />
      <ErrorText message={error} />
      <Button title="Calculate estimate" onPress={calculate} />
      {result && (
        <>
          <BillBreakdown bill={result.bill} />
          <Label muted>
            Calculated with: {result.tariff.label}. Saved history retains this
            tariff snapshot.
          </Label>
          <Input
            label="Calculation note (optional)"
            value={notes}
            onChangeText={setNotes}
            maxLength={500}
          />
          <Button
            title={
              saved ? "Saved to history" : busy ? "Saving…" : "Save calculation"
            }
            disabled={saved || busy}
            onPress={save}
          />
        </>
      )}
      <Button
        title="View saved calculations"
        secondary
        onPress={() => navigation.navigate("History", { initialType: "bill" })}
      />
    </Page>
  );
}
