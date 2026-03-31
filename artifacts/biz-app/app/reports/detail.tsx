import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

type Period = "monthly" | "quarterly" | "yearly";

export default function ProfitLossDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [period, setPeriod] = useState<Period>("monthly");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: pl, isLoading, refetch } = useQuery({
    queryKey: ["profit-loss", period],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/reports/profit-loss?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const { data: trends = [] } = useQuery({
    queryKey: ["dashboard-trends", period],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/trends?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const periods: { label: string; value: Period }[] = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Profit & Loss" showBack subtitle="Detailed report" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={[styles.periodTabs, { backgroundColor: colors.muted }]}>
          {periods.map(p => (
            <TouchableOpacity
              key={p.value}
              style={[styles.periodTab, period === p.value && { backgroundColor: colors.primary }]}
              onPress={() => setPeriod(p.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodTabText, { color: period === p.value ? colors.primaryForeground : colors.mutedForeground }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Summary</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="Total Revenue" value={fmt(pl?.totalRevenue || 0)} valueColor={colors.success} />
          <Row label="Total Cost of Goods" value={fmt(pl?.totalCost || 0)} valueColor={colors.warning} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="Gross Profit" value={fmt(pl?.grossProfit || 0)} valueColor={pl?.grossProfit >= 0 ? colors.success : colors.destructive} bold />
          <Row label="Profit Margin" value={`${(pl?.profitMargin || 0).toFixed(1)}%`} valueColor={pl?.grossProfit >= 0 ? colors.success : colors.destructive} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="Total Sales Count" value={String(pl?.totalSalesCount || 0)} valueColor={colors.foreground} />
          <Row label="Total Purchases Count" value={String(pl?.totalPurchasesCount || 0)} valueColor={colors.foreground} />
        </View>

        {trends.length > 0 && (
          <>
            <Text style={[styles.sec, { color: colors.mutedForeground }]}>PERIOD BREAKDOWN</Text>
            <View style={[styles.tableBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.th, { color: colors.mutedForeground, flex: 2 }]}>Period</Text>
                <Text style={[styles.th, { color: colors.mutedForeground }]}>Sales</Text>
                <Text style={[styles.th, { color: colors.mutedForeground }]}>Purchases</Text>
                <Text style={[styles.th, { color: colors.mutedForeground }]}>Profit</Text>
              </View>
              {trends.map((t: any, i: number) => (
                <View key={i} style={[styles.tableRow, { borderBottomColor: colors.border, borderBottomWidth: i < trends.length - 1 ? 0.5 : 0 }]}>
                  <Text style={[styles.td, { color: colors.foreground, flex: 2 }]}>{t.label}</Text>
                  <Text style={[styles.td, { color: colors.success }]}>{fmt(t.sales)}</Text>
                  <Text style={[styles.td, { color: colors.warning }]}>{fmt(t.purchases)}</Text>
                  <Text style={[styles.td, { color: t.profit >= 0 ? colors.success : colors.destructive }]}>{fmt(t.profit)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Row({ label, value, valueColor, bold }: { label: string; value: string; valueColor: string; bold?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor, fontFamily: bold ? "Inter_700Bold" : "Inter_600SemiBold", fontSize: bold ? 18 : 15 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  periodTabs: { flexDirection: "row", borderRadius: 10, padding: 3, marginBottom: 16 },
  periodTab: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  periodTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  summaryTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  divider: { height: 1, marginVertical: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  rowLabel: { fontSize: 14 },
  rowValue: {},
  sec: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10 },
  tableBox: { borderRadius: 12, borderWidth: 1, padding: 12 },
  tableHeader: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1 },
  th: { flex: 1, fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  tableRow: { flexDirection: "row", paddingVertical: 10 },
  td: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right" },
});
