import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { SummaryCard } from "@/components/SummaryCard";
import { ListItem } from "@/components/ListItem";
import { AppHeader } from "@/components/AppHeader";
const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
function fmt(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n.toFixed(0)}`;
}
export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { data: pl, isLoading: plLoading, refetch: plRefetch } = useQuery({
    queryKey: ["profit-loss"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/reports/profit-loss`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });
  const { data: topProducts = [], refetch: topRefetch } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/reports/top-products?limit=5`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });
  const { data: stockReport = [], refetch: stockRefetch } = useQuery({
    queryKey: ["stock-report"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/reports/stock`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });
  const lowStockItems = stockReport.filter((i: any) => i.isLowStock);
  const totalStockValue = stockReport.reduce((s: number, i: any) => s + i.stockValue, 0);
  const refetch = () => { plRefetch(); topRefetch(); stockRefetch(); };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Reports" subtitle="Business analytics" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        refreshControl={<RefreshControl refreshing={plLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PROFIT & LOSS</Text>
        <SummaryCard label="Total Revenue" value={fmt(pl?.totalRevenue || 0)} accent={colors.success}
          icon={<Feather name="trending-up" size={20} color={colors.success} />} />
        <SummaryCard label="Total Cost" value={fmt(pl?.totalCost || 0)} accent={colors.warning}
          icon={<Feather name="trending-down" size={20} color={colors.warning} />} />
        <SummaryCard label="Gross Profit" value={fmt(pl?.grossProfit || 0)}
          sub={`Margin: ${(pl?.profitMargin || 0).toFixed(1)}%`}
          accent={pl?.grossProfit >= 0 ? colors.success : colors.destructive}
          icon={<Feather name="dollar-sign" size={20} color={pl?.grossProfit >= 0 ? colors.success : colors.destructive} />} />
        <TouchableOpacity
          style={[styles.viewMore, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
          onPress={() => router.push("/reports/detail" as any)} activeOpacity={0.8}
        >
          <Text style={[styles.viewMoreText, { color: colors.primary }]}>View Detailed P&L Report</Text>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>STOCK VALUE</Text>
        <SummaryCard label="Total Stock Value" value={fmt(totalStockValue)}
          sub={`${lowStockItems.length} items low on stock`}
          accent={colors.accent}
          icon={<Feather name="package" size={20} color={colors.accent} />} />
        <TouchableOpacity
          style={[styles.viewMore, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
          onPress={() => router.push("/reports/stock" as any)} activeOpacity={0.8}
        >
          <Text style={[styles.viewMoreText, { color: colors.primary }]}>View Full Stock Report</Text>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
        {topProducts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TOP PRODUCTS</Text>
            {topProducts.map((p: any, i: number) => (
              <ListItem
                key={p.id}
                title={`${i + 1}. ${p.name}`}
                subtitle={`Sold: ${p.totalSold} units`}
                value={fmt(p.totalRevenue)}
                valueSub={`Profit: ${fmt(p.totalProfit)}`}
                valueColor={colors.success}
                leftIcon="award"
              />
            ))}
          </>
        )}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MORE REPORTS</Text>
        {[
          { label: "Supplier Reports", icon: "truck", route: "/reports/suppliers" },
          { label: "Customer Reports", icon: "users", route: "/reports/customers" },
          { label: "Stock Analysis", icon: "package", route: "/reports/stock" },
        ].map(item => (
          <ListItem key={item.label} title={item.label} leftIcon={item.icon} onPress={() => router.push(item.route as any)} />
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10, marginTop: 12 },
  viewMore: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 4 },
  viewMoreText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
