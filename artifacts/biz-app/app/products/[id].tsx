import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/Badge";
import { FormField } from "@/components/FormField";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const qc = useQueryClient();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [adjusting, setAdjusting] = useState(false);
  const [adjustment, setAdjustment] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  const { data: product, isLoading, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token && !!id,
  });

  const handleAdjust = async () => {
    if (!adjustment) return;
    setAdjustLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/${id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adjustment: parseFloat(adjustment) }),
      });
      if (!res.ok) throw new Error("Failed");
      qc.invalidateQueries({ queryKey: ["product", id] });
      qc.invalidateQueries({ queryKey: ["products"] });
      refetch();
      setAdjusting(false); setAdjustment("");
    } catch { Alert.alert("Failed to adjust stock"); }
    setAdjustLoading(false);
  };

  if (isLoading || !product) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Product" showBack />
      <View style={styles.loading}><Text style={{ color: colors.mutedForeground }}>Loading...</Text></View>
    </View>
  );

  const isLow = product.stockQty <= (product.lowStockThreshold || 10);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={product.name} showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.infoCol}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{product.category || "—"}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Rack</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{product.rack || "—"}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <View style={styles.infoCol}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Purchase Price</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>₹{product.purchasePrice}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Selling Price</Text>
              <Text style={[styles.value, { color: colors.primary }]}>₹{product.sellingPrice}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>GST</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{product.gstPercent}%</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stockRow}>
            <View>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Stock</Text>
              <Text style={[styles.stockVal, { color: isLow ? colors.destructive : colors.success }]}>{product.stockQty} {product.unit || "pcs"}</Text>
            </View>
            {isLow && <Badge label="LOW STOCK" variant="danger" />}
            <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: colors.primary + "18" }]} onPress={() => setAdjusting(!adjusting)}>
              <Feather name="edit-2" size={14} color={colors.primary} />
              <Text style={[styles.adjustBtnText, { color: colors.primary }]}>Adjust</Text>
            </TouchableOpacity>
          </View>
          {adjusting && (
            <View style={styles.adjustForm}>
              <FormField label="Adjustment (+/−)" value={adjustment} onChangeText={setAdjustment} keyboardType="numeric" placeholder="e.g. 10 or -5" />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdjust} disabled={adjustLoading} activeOpacity={0.85}>
                {adjustLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={{ color: "#FFF", fontFamily: "Inter_600SemiBold" }}>Save Adjustment</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + "18", borderColor: colors.success + "30" }]} onPress={() => router.push("/sales/new")} activeOpacity={0.8}>
            <Feather name="file-text" size={20} color={colors.success} />
            <Text style={[styles.actionLabel, { color: colors.success }]}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "30" }]} onPress={() => router.push("/purchases/new")} activeOpacity={0.8}>
            <Feather name="shopping-cart" size={20} color={colors.warning} />
            <Text style={[styles.actionLabel, { color: colors.warning }]}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "30" }]} onPress={() => router.push(`/returns/new?productId=${id}` as any)} activeOpacity={0.8}>
            <Feather name="rotate-ccw" size={20} color={colors.destructive} />
            <Text style={[styles.actionLabel, { color: colors.destructive }]}>Return</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  box: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  row: { flexDirection: "row" },
  infoCol: { flex: 1 },
  label: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  value: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginVertical: 14 },
  stockRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stockVal: { fontSize: 28, fontFamily: "Inter_700Bold" },
  adjustBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  adjustBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  adjustForm: { marginTop: 14 },
  saveBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 16 },
  actionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
