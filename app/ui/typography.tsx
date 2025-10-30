import React from "react";
import { Text, StyleSheet } from "react-native";
import { theme } from "./theme";

export const H1: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={styles.h1}>{children}</Text>
);
export const H2: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={styles.h2}>{children}</Text>
);
export const P: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={styles.p}>{children}</Text>
);
export const Span: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={styles.span}>{children}</Text>
);
export const Small: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={styles.small}>{children}</Text>
);

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "800", marginBottom: 8, color: theme.text },
  h2: { fontSize: 20, fontWeight: "700", marginBottom: 6, color: theme.text },
  p:  { fontSize: 16, lineHeight: 22, color: theme.textMuted, marginBottom: 6 },
  span: { fontSize: 16, lineHeight: 22, color: theme.textMuted },
  small: { fontSize: 13, color: "#BBBBBB" },
});
