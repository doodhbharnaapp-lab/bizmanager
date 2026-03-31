import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const colors = useColors();
  const bg = variant === "success" ? colors.success + "20"
    : variant === "warning" ? colors.warning + "20"
    : variant === "danger" ? colors.destructive + "20"
    : variant === "info" ? colors.accent + "20"
    : colors.muted;
  const fg = variant === "success" ? colors.success
    : variant === "warning" ? colors.warning
    : variant === "danger" ? colors.destructive
    : variant === "info" ? colors.accent
    : colors.mutedForeground;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
