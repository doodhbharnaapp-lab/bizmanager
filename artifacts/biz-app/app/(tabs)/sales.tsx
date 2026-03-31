import React, { useState } from "react";
import { ScrollView, View, StyleSheet, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/Badge";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function SalesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: sales = [], isLoading, refetch } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sales`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const filtered = sales.filter((s: any) =>
    (s.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    s.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((sum: number, s: any) => sum + s.grandTotal, 0);

  const modeVariant = (m: string) => m === "credit" ? "danger" : m === "upi" ? "info" : "success";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Sales" subtitle={`${sales.length} bills · ₹${total.toFixed(0)} total`} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by customer or invoice..." />
        {filtered.length === 0 ? (
          <EmptyState icon="file-text" title="No sales yet" description="Create your first sale entry" actionLabel="New Sale" onAction={() => router.push("/sales/new")} />
        ) : (
          filtered.map((s: any) => (
            <ListItem
              key={s.id}
              title={s.customerName || "Walk-in Customer"}
              subtitle={`${s.invoiceNumber} · ${s.date}`}
              value={`₹${s.grandTotal.toFixed(0)}`}
              valueSub={s.isGstInvoice ? "GST" : ""}
              valueColor={s.paymentMode === "credit" ? colors.destructive : colors.success}
              onPress={() => router.push(`/sales/${s.id}` as any)}
              leftIcon="file-text"
              rightElement={<Badge label={s.paymentMode.toUpperCase()} variant={modeVariant(s.paymentMode)} />}
            />
          ))
        )}
      </ScrollView>
      <FAB onPress={() => router.push("/sales/new")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
});
