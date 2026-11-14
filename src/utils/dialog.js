import { Alert, Platform } from "react-native";
// React Native's Alert has no web implementation; keep preview interactions functional.
export const AppAlert = {
  alert(title, message, buttons) {
    if (Platform.OS !== "web") return Alert.alert(title, message, buttons);
    if (!buttons || buttons.length < 2) {
      globalThis.alert(title + "\n\n" + (message || ""));
      buttons?.[0]?.onPress?.();
      return;
    }
    if (globalThis.confirm(title + "\n\n" + (message || "")))
      buttons.find((b) => b.style !== "cancel")?.onPress?.();
  },
};
