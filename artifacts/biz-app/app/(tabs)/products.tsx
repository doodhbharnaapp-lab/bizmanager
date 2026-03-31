import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, RefreshControl, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { Badge } from "@/components/Badge";
import { AppHeader } from "@/components/AppHeader";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { lowStock } = useLocalSearchParams();
  const [search, setSearch] = useState("");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["products", lowStock],
    queryFn: async () => {
      const url = lowStock === "true" ? `${API_BASE}/products?lowStock=true` : `${API_BASE}/products`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Products" subtitle={`${products.length} items`}
        rightComponent={
          <TouchableOpacity onPress={() => router.push("/products/categories" as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="filter" size={20} color="#FFF" />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
        {filtered.length === 0 ? (
          <EmptyState icon="package" title="No products found" description="Add your first product to get started" actionLabel="Add Product" onAction={() => router.push("/products/new")} />
        ) : (
          filtered.map((p: any) => (
            <ListItem
              key={p.id}
              title={p.name}
              subtitle={[p.category, p.rack].filter(Boolean).join(" · ")}
              value={`₹${p.sellingPrice}`}
              valueSub={`Stock: ${p.stockQty} ${p.unit || "pcs"}`}
              valueColor={p.stockQty <= (p.lowStockThreshold || 10) ? colors.destructive : colors.foreground}
              onPress={() => router.push(`/products/${p.id}` as any)}
              leftIcon="package"
              rightElement={p.stockQty <= (p.lowStockThreshold || 10) ? <Badge label="Low" variant="danger" /> : undefined}
            />
          ))
        )}
      </ScrollView>
      <FAB onPress={() => router.push("/products/new")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
});
