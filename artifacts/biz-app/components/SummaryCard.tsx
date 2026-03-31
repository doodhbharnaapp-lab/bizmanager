import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
}

export function SummaryCard({ label, value, sub, accent, icon }: SummaryCardProps) {
  const colors = useColors();
  const accentColor = accent || colors.primary;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: accentColor }]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
          {sub ? <Text style={[styles.sub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
        </View>
        {icon ? <View style={[styles.iconWrap, { backgroundColor: accentColor + "18" }]}>{icon}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  info: { flex: 1 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 24, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginLeft: 12 },
});
