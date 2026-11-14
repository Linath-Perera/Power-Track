import { AppAlert as Alert } from "../utils/dialog";
import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePower } from "../context/PowerContext";
export function Label({ children, muted = false, style, ...props }) {
  const { colors: c } = usePower();
  return (
    <Text
      {...props}
      style={[
        { color: muted ? c.muted : c.text, fontSize: 14, lineHeight: 21 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Page({ children }) {
  const { colors: c } = usePower();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Heading({ title, subtitle, icon }) {
  const { colors: c } = usePower();
  return (
    <View style={{ gap: 6, marginBottom: 4 }}>
      {icon && <Ionicons name={icon} size={30} color={c.green} />}
      <Label style={{ fontSize: 28, fontWeight: "800", lineHeight: 36 }}>
        {title}
      </Label>
      {subtitle && <Label muted>{subtitle}</Label>}
    </View>
  );
}
export function Card({ children, style, onPress }) {
  const { colors: c } = usePower();
  const Container = onPress ? Pressable : View;
  return (
    <Container
      {...(onPress ? { onPress, accessibilityRole: "button" } : {})}
      style={[
        {
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 18,
          borderWidth: 1,
          borderColor: c.border,
          gap: 10,
        },
        style,
      ]}
    >
      {children}
    </Container>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
  icon,
}) {
  const { colors: c } = usePower();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: danger ? c.danger : secondary ? c.raised : c.green,
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      })}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={19}
          color={secondary ? c.text : "#081321"}
        />
      )}
      <Text
        style={{
          fontWeight: "700",
          color: secondary ? c.text : "#081321",
          fontSize: 14,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Input({ label, value, onChangeText, error, ...props }) {
  const { colors: c } = usePower();
  return (
    <View style={{ gap: 7 }}>
      <Label style={{ fontWeight: "600" }}>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        value={String(value ?? "")}
        onChangeText={onChangeText}
        placeholderTextColor={c.muted}
        style={{
          color: c.text,
          backgroundColor: c.raised,
          borderColor: error ? c.danger : c.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          fontSize: 16,
          minHeight: 50,
        }}
        {...props}
      />
      {error && <Label style={{ color: c.danger }}>{error}</Label>}
    </View>
  );
}
export function Chips({ options, value, onChange }) {
  const { colors: c } = usePower();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {options.map((o) => {
        const label = typeof o === "string" ? o : o.label;
        const val = typeof o === "string" ? o : o.value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: value === val }}
            {...(Platform.OS === "web"
              ? { "aria-pressed": value === val }
              : {})}
            key={val}
            onPress={() => onChange(val)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: value === val ? c.green : c.raised,
            }}
          >
            <Text
              style={{
                color: value === val ? "#081321" : c.text,
                fontWeight: "600",
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
export function Empty({
  title = "Nothing here yet",
  text = "Add a record to get started.",
}) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: 30 }}>
      <Label style={{ fontSize: 28 }}>ϟ</Label>
      <Label style={{ fontWeight: "700", fontSize: 18 }}>{title}</Label>
      <Label muted style={{ textAlign: "center" }}>
        {text}
      </Label>
    </Card>
  );
}
export function Row({ label, value }) {
  return (
    <View
      style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}
    >
      <Label muted style={{ flex: 1 }}>
        {label}
      </Label>
      <Label style={{ fontWeight: "600", flex: 1, textAlign: "right" }}>
        {value}
      </Label>
    </View>
  );
}
export function ErrorText({ message }) {
  const { colors: c } = usePower();
  return message ? (
    <Label accessibilityRole="alert" style={{ color: c.danger }}>
      {message}
    </Label>
  ) : null;
}
export function confirmDelete(title, action) {
  Alert.alert(title, "This removes the saved record from this device.", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: () =>
        action().catch((e) => Alert.alert("Unable to delete", e.message)),
    },
  ]);
}
export function BudgetProgress({ summary }) {
  const { colors: c } = usePower();
  const tint =
    summary.level === "good"
      ? c.green
      : summary.level === "warning"
        ? c.yellow
        : c.danger;
  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          height: 9,
          backgroundColor: c.raised,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 9,
            width: Math.min(100, summary.percent) + "%",
            backgroundColor: tint,
          }}
        />
      </View>
      <Label style={{ color: tint }}>
        {summary.percent.toFixed(1)}% used
        {summary.level === "over"
          ? " · Budget reached or exceeded"
          : summary.level === "warning"
            ? " · You have reached 80% of your budget"
            : ""}
      </Label>
    </View>
  );
}
export const styles = StyleSheet.create({
  split: { flexDirection: "row", gap: 12 },
  section: { fontSize: 19, fontWeight: "700" },
  hero: { fontSize: 38, lineHeight: 46, fontWeight: "800" },
  tiny: { fontSize: 12, lineHeight: 18 },
});
