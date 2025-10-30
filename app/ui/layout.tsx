import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { theme } from "./theme";

export const Div: React.FC<React.PropsWithChildren<{ style?: any; onPress?: () => void }>> = ({ children, style, onPress }) => {
  if (onPress) return <Pressable style={style} onPress={onPress}>{children}</Pressable>;
  return <View style={style}>{children}</View>;
};

export const Card: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardGlow} />
    {children}
  </View>
);

export const Row: React.FC<React.PropsWithChildren<{ style?: any }>> = ({ children, style }) => (
  <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.outline,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: theme.glow,
  },
});
