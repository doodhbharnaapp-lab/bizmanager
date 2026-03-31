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

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

export default function SupplierReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: suppliers = [], isLoading, refetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/purchases`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const totalDue = suppliers.reduce((s: number, sup: any) => s + sup.balance, 0);
  const totalPurchased = purchases.reduce((s: number, p: any) => s + p.grandTotal, 0);

  const supplierStats = suppliers.map((sup: any) => {
    const supPurchases = purchases.filter((p: any) => p.supplierId === sup.id);
    const totalBought = supPurchases.reduce((s: number, p: any) => s + p.grandTotal, 0);
    return { ...sup, totalBought, purchaseCount: supPurchases.length };
  }).sort((a: any, b: any) => b.totalBought - a.totalBought);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Supplier Report" showBack subtitle={`${suppliers.length} suppliers`} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={styles.cardRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <SummaryCard label="Total Purchased" value={fmt(totalPurchased)} accent={colors.warning}
              icon={<Feather name="shopping-cart" size={20} color={colors.warning} />} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <SummaryCard label="Total Due" value={fmt(totalDue)} accent={colors.destructive}
              icon={<Feather name="alert-circle" size={20} color={colors.destructive} />} />
          </View>
        </View>

        <Text style={[styles.sec, { color: colors.mutedForeground }]}>BY SUPPLIER</Text>
        {supplierStats.length === 0 ? (
          <EmptyState icon="truck" title="No suppliers yet" description="Add suppliers and record purchases" />
        ) : (
          supplierStats.map((s: any) => (
            <ListItem
              key={s.id}
              title={s.name}
              subtitle={`${s.purchaseCount} purchases · ${s.phone || "No phone"}`}
              value={fmt(s.totalBought)}
              valueSub={s.balance > 0 ? `Due: ₹${s.balance.toFixed(0)}` : "Settled"}
              valueColor={s.balance > 0 ? colors.destructive : colors.success}
              onPress={() => router.push(`/suppliers/${s.id}` as any)}
              leftIcon="truck"
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
