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

export default function PurchasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: purchases = [], isLoading, refetch } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/purchases`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const filtered = purchases.filter((p: any) =>
    p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Purchases" subtitle={`${purchases.length} entries`} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by supplier or invoice..." />
        {filtered.length === 0 ? (
          <EmptyState icon="shopping-cart" title="No purchases yet" description="Create your first purchase entry" actionLabel="New Purchase" onAction={() => router.push("/purchases/new")} />
        ) : (
          filtered.map((p: any) => (
            <ListItem
              key={p.id}
              title={p.supplierName}
              subtitle={`${p.invoiceNumber} · ${p.date}`}
              value={`₹${p.grandTotal.toFixed(0)}`}
              valueSub={`GST: ₹${p.totalGst.toFixed(0)}`}
              onPress={() => router.push(`/purchases/${p.id}` as any)}
              leftIcon="shopping-cart"
              rightElement={<Badge label={p.paymentMode.toUpperCase()} variant={p.paymentMode === "credit" ? "danger" : "success"} />}
            />
          ))
        )}
      </ScrollView>
      <FAB onPress={() => router.push("/purchases/new")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
});
