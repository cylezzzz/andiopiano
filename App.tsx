import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AndioApp from "./app/screens/ProfileScreen"; // oder falls anders: "./andio_piano_main"

export default function App() {
  return (
    <SafeAreaProvider>
      <AndioApp />
    </SafeAreaProvider>
  );
}
