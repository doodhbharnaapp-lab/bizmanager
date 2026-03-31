import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Platform, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { SearchBar } from "@/components/SearchBar";
import { Badge } from "@/components/Badge";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function StockReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ["stock-report"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/reports/stock`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); },
    enabled: !!token,
  });

  const filtered = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()) || (i.category || "").toLowerCase().includes(search.toLowerCase()));
  const totalValue = filtered.reduce((s: number, i: any) => s + i.stockValue, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Stock Report" showBack subtitle={`Total Value: ₹${totalValue.toFixed(0)}`} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.hCell, { color: colors.mutedForeground, flex: 3 }]}>Product</Text>
          <Text style={[styles.hCell, { color: colors.mutedForeground }]}>Stock</Text>
          <Text style={[styles.hCell, { color: colors.mutedForeground }]}>Value</Text>
        </View>
        {filtered.map((item: any) => (
          <View key={item.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: item.isLowStock ? colors.destructive : colors.success }]}>
            <View style={{ flex: 3 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
              {item.category ? <Text style={[styles.cat, { color: colors.mutedForeground }]}>{item.category}</Text> : null}
              {item.rack ? <Text style={[styles.cat, { color: colors.mutedForeground }]}>Rack: {item.rack}</Text> : null}
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.stock, { color: item.isLowStock ? colors.destructive : colors.foreground }]}>{item.stockQty}</Text>
              {item.isLowStock && <Badge label="Low" variant="danger" />}
            </View>
            <Text style={[styles.value, { color: colors.foreground }]}>₹{item.stockValue.toFixed(0)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { flexDirection: "row", padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  hCell: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, borderWidth: 1, borderLeftWidth: 4, marginBottom: 8 },
  name: { fontSize: 14, fontFamily: "Inter_500Medium" },
  cat: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  stock: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1, textAlign: "center" },
  value: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right" },
});
