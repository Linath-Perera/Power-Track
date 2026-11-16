import React from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PowerProvider, usePower } from "./src/context/PowerContext";
import Navigation from "./src/navigation";
import { Label, Button } from "./src/components/UI";
function Root() {
  const { loading, error, retry, colors: c, data } = usePower();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar
        barStyle={
          data?.preferences.theme === "light" ? "dark-content" : "light-content"
        }
      />
      {loading || error ? (
        <View
          style={{ flex: 1, padding: 30, justifyContent: "center", gap: 20 }}
        >
          <Label style={{ fontSize: 36, fontWeight: "800", color: c.green }}>
            ϟ PowerTrack
          </Label>
          <Label muted>Your energy. In perspective.</Label>
          {loading ? (
            <ActivityIndicator size="large" color={c.green} />
          ) : (
            <>
              <Label>{error}</Label>
              <Button title="Retry storage" onPress={retry} />
            </>
          )}
        </View>
      ) : (
        <Navigation />
      )}
    </View>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <PowerProvider>
        <Root />
      </PowerProvider>
    </SafeAreaProvider>
  );
}
