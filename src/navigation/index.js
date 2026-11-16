import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { usePower } from "../context/PowerContext";
import Dashboard from "../screens/Dashboard";
import {
  Appliances,
  ApplianceForm,
  ApplianceDetails,
} from "../screens/Appliances";
import { Meter, MeterForm } from "../screens/Meter";
import { Calculator } from "../screens/Calculator";
import Analytics from "../screens/Analytics";
import { History, RecordDetails } from "../screens/History";
import { Settings, TariffSettings } from "../screens/Settings";
const Tab = createBottomTabNavigator(),
  Stack = createNativeStackNavigator();
const icons = {
  Home: "grid-outline",
  Appliances: "flash-outline",
  Meter: "speedometer-outline",
  Analytics: "bar-chart-outline",
  Settings: "settings-outline",
};
function Tabs() {
  const insets = useSafeAreaInsets();
  const { colors: c } = usePower();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.green,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.nav,
          borderTopColor: c.border,
          paddingTop: 8,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      {[
        ["Home", Dashboard],
        ["Appliances", Appliances],
        ["Meter", Meter],
        ["Analytics", Analytics],
        ["Settings", Settings],
      ].map(([name, component]) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}
export default function Navigation() {
  const { data, colors: c } = usePower();
  const base = data.preferences.theme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer
      theme={{
        ...base,
        colors: {
          ...base.colors,
          background: c.bg,
          card: c.nav,
          text: c.text,
          border: c.border,
          primary: c.green,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: c.nav },
          headerTintColor: c.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen
          name="Main"
          component={Tabs}
          options={{
            title: "ϟ  PowerTrack",
            headerTitleStyle: { fontWeight: "800", color: c.green },
          }}
        />
        <Stack.Screen
          name="ApplianceForm"
          component={ApplianceForm}
          options={({ route }) => ({
            title: route.params?.id ? "Edit appliance" : "New appliance",
          })}
        />
        <Stack.Screen
          name="ApplianceDetails"
          component={ApplianceDetails}
          options={{ title: "Appliance details" }}
        />
        <Stack.Screen
          name="MeterForm"
          component={MeterForm}
          options={({ route }) => ({
            title: route.params?.id ? "Edit reading" : "New meter reading",
          })}
        />
        <Stack.Screen
          name="Calculator"
          component={Calculator}
          options={{ title: "Bill calculator" }}
        />
        <Stack.Screen
          name="History"
          component={History}
          options={{ title: "Usage history" }}
        />
        <Stack.Screen
          name="RecordDetails"
          component={RecordDetails}
          options={{ title: "Record details" }}
        />
        <Stack.Screen
          name="TariffSettings"
          component={TariffSettings}
          options={{ title: "Tariff configuration" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
