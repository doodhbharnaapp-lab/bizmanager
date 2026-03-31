import React from "react";
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { SummaryCard } from "@/components/SummaryCard";
import { ListItem } from "@/components/ListItem";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token, logout } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 30000,
  });

  const { data: trends } = useQuery({
    queryKey: ["dashboard-trends"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/trends?period=monthly`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const { data: recentSales } = useQuery({
    queryKey: ["recent-sales"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sales`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      return data.slice(0, 5);
    },
    enabled: !!token,
  });

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 80 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: Platform.OS === "web" ? 67 + 12 : insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.primaryForeground + "CC" }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: colors.primaryForeground }]}>{user?.name || "Admin"}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { backgroundColor: colors.primaryForeground + "20" }]}>
            <Feather name="log-out" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.date, { color: colors.primaryForeground + "99" }]}>{today}</Text>
      </View>

      <View style={styles.section}>
        {summary?.lowStockCount > 0 && (
          <TouchableOpacity
            style={[styles.alert, { backgroundColor: colors.warning + "20", borderColor: colors.warning }]}
            onPress={() => router.push("/products?lowStock=true")}
            activeOpacity={0.8}
          >
            <Feather name="alert-triangle" size={16} color={colors.warning} />
            <Text style={[styles.alertText, { color: colors.warning }]}>
              {summary.lowStockCount} product{summary.lowStockCount > 1 ? "s" : ""} running low on stock
            </Text>
            <Feather name="chevron-right" size={14} color={colors.warning} />
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TODAY</Text>
        <View style={styles.cardRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <SummaryCard label="Sales" value={fmt(summary?.todaySales || 0)} accent={colors.success}
              icon={<Feather name="trending-up" size={20} color={colors.success} />} />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <SummaryCard label="Purchases" value={fmt(summary?.todayPurchases || 0)} accent={colors.warning}
              icon={<Feather name="shopping-cart" size={20} color={colors.warning} />} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>THIS MONTH</Text>
        <SummaryCard label="Total Sales" value={fmt(summary?.totalSalesThisMonth || 0)}
          sub={`Purchases: ${fmt(summary?.totalPurchasesThisMonth || 0)}`}
          accent={colors.primary} icon={<Feather name="bar-chart-2" size={20} color={colors.primary} />} />
        <SummaryCard label="Gross Profit" value={fmt(summary?.grossProfit || 0)}
          accent={summary?.grossProfit >= 0 ? colors.success : colors.destructive}
          icon={<Feather name="dollar-sign" size={20} color={summary?.grossProfit >= 0 ? colors.success : colors.destructive} />} />

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>OUTSTANDING</Text>
        <View style={styles.cardRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <SummaryCard label="To Collect" value={fmt(summary?.pendingFromCustomers || 0)} sub="from customers" accent={colors.accent}
              icon={<Feather name="users" size={20} color={colors.accent} />} />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <SummaryCard label="To Pay" value={fmt(summary?.pendingToSuppliers || 0)} sub="to suppliers" accent={colors.destructive}
              icon={<Feather name="truck" size={20} color={colors.destructive} />} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>QUICK ACTIONS</Text>
        <View style={styles.quickGrid}>
          {[
            { label: "New Sale", icon: "plus-circle", route: "/sales/new", color: colors.success },
            { label: "New Purchase", icon: "shopping-cart", route: "/purchases/new", color: colors.warning },
            { label: "Products", icon: "package", route: "/(tabs)/products", color: colors.primary },
            { label: "Reports", icon: "bar-chart", route: "/(tabs)/reports", color: colors.accent },
          ].map(a => (
            <TouchableOpacity key={a.label} style={[styles.quickAction, { backgroundColor: a.color + "18", borderColor: a.color + "30" }]}
              onPress={() => router.push(a.route as any)} activeOpacity={0.8}>
              <Feather name={a.icon as any} size={22} color={a.color} />
              <Text style={[styles.quickLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {recentSales && recentSales.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>RECENT SALES</Text>
            {recentSales.map((s: any) => (
              <ListItem key={s.id} title={s.customerName || "Walk-in"} subtitle={s.date}
                value={`₹${s.grandTotal.toFixed(0)}`} valueSub={s.paymentMode}
                valueColor={s.paymentMode === "credit" ? colors.destructive : colors.success}
                onPress={() => router.push(`/sales/${s.id}` as any)} />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  date: { fontSize: 13, fontFamily: "Inter_400Regular" },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  section: { padding: 16, marginTop: -8 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  cardRow: { flexDirection: "row" },
  alert: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  alertText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  quickAction: { width: "47%", padding: 16, borderRadius: 12, alignItems: "center", gap: 8, borderWidth: 1 },
  quickLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
