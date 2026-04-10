import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, RefreshControl, Platform, TouchableOpacity, FlatList } from "react-native";
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
const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { lowStock } = useLocalSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });
  const allProducts = lowStock === "true"
    ? products.filter((p: any) => p.stockQty <= (p.lowStockThreshold || 10))
    : products;
  const categories = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean))) as string[];
  const filtered = allProducts.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={lowStock === "true" ? "Low Stock" : "Products"}
        subtitle={`${filtered.length} of ${products.length} items`}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            <TouchableOpacity
              style={[styles.catChip, { backgroundColor: !selectedCategory ? colors.primary : colors.muted, borderColor: !selectedCategory ? colors.primary : colors.border }]}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.catChipText, { color: !selectedCategory ? colors.primaryForeground : colors.mutedForeground }]}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, { backgroundColor: selectedCategory === cat ? colors.primary : colors.muted, borderColor: selectedCategory === cat ? colors.primary : colors.border }]}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catChipText, { color: selectedCategory === cat ? colors.primaryForeground : colors.mutedForeground }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {filtered.length === 0 ? (
          <EmptyState
            icon="package"
            title="No products found"
            description="Add your first product to get started"
            actionLabel="Add Product"
            onAction={() => router.push("/products/new")}
          />
        ) : (
          filtered.map((p: any) => (
            <ListItem
              key={p.id}
              title={p.name}
              subtitle={[p.category, p.rack].filter(Boolean).join(" · ")}
              value={`${p.sellingPrice}`}
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
  catRow: { flexDirection: "row", gap: 8, paddingBottom: 12 },
  catChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
