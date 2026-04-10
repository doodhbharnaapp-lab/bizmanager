import React from "react";
import { ScrollView, View, Text, StyleSheet, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { ListItem } from "@/components/ListItem";
import { SummaryCard } from "@/components/SummaryCard";
import { EmptyState } from "@/components/EmptyState";
import { Feather } from "@expo/vector-icons";
const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
function fmt(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n.toFixed(0)}`;
}
export default function CustomerReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });
  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sales`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });
  const totalPending = customers.reduce((s: number, c: any) => s + c.balance, 0);
  const totalRevenue = sales.reduce((s: number, sale: any) => s + sale.grandTotal, 0);
  const customerStats = customers.map((c: any) => {
    const custSales = sales.filter((s: any) => s.customerId === c.id);
    const totalBought = custSales.reduce((s: number, sale: any) => s + sale.grandTotal, 0);
    return { ...c, totalBought, salesCount: custSales.length };
  }).sort((a: any, b: any) => b.totalBought - a.totalBought);
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Customer Report" showBack subtitle={`${customers.length} customers`} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={styles.cardRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <SummaryCard label="Total Revenue" value={fmt(totalRevenue)} accent={colors.success}
              icon={<Feather name="trending-up" size={20} color={colors.success} />} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <SummaryCard label="Pending Collect" value={fmt(totalPending)} accent={colors.warning}
              icon={<Feather name="clock" size={20} color={colors.warning} />} />
          </View>
        </View>
        <Text style={[styles.sec, { color: colors.mutedForeground }]}>TOP CUSTOMERS</Text>
        {customerStats.length === 0 ? (
          <EmptyState icon="users" title="No customers yet" description="Add customers and record sales" />
        ) : (
          customerStats.map((c: any) => (
            <ListItem
              key={c.id}
              title={c.name}
              subtitle={`${c.salesCount} sales · ${c.phone || "No phone"}`}
              value={fmt(c.totalBought)}
              valueSub={c.balance > 0 ? `Due: ${c.balance.toFixed(0)}` : "Settled"}
              valueColor={c.balance > 0 ? colors.destructive : colors.success}
              onPress={() => router.push(`/customers/${c.id}` as any)}
              leftIcon="user"
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  cardRow: { flexDirection: "row", marginBottom: 4 },
  sec: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10, marginTop: 8 },
});
