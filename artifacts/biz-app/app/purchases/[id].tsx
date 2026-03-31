import React from "react";
import { ScrollView, View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/Badge";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function PurchaseDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: purchase, isLoading } = useQuery({
    queryKey: ["purchase", id],
    queryFn: async () => { const r = await fetch(`${API_BASE}/purchases/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); },
    enabled: !!token && !!id,
  });

  if (isLoading || !purchase) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Purchase" showBack />
      <View style={styles.loading}><Text style={{ color: colors.mutedForeground }}>Loading...</Text></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Purchase Detail" showBack subtitle={purchase.invoiceNumber} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <View style={[styles.invoiceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={[styles.invoiceNum, { color: colors.primary }]}>{purchase.invoiceNumber}</Text>
              <Text style={[styles.invoiceDate, { color: colors.mutedForeground }]}>{purchase.date}</Text>
            </View>
            <Badge label={purchase.paymentMode.toUpperCase()} variant={purchase.paymentMode === "credit" ? "danger" : "success"} />
          </View>
          <Text style={[styles.party, { color: colors.foreground }]}>Supplier: {purchase.supplierName}</Text>
        </View>

        <Text style={[styles.sec, { color: colors.mutedForeground }]}>ITEMS</Text>
        <View style={[styles.itemsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(purchase.items || []).map((item: any, i: number) => (
            <View key={i} style={[styles.item, { borderBottomColor: colors.border, borderBottomWidth: i < purchase.items.length - 1 ? 0.5 : 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.foreground }]}>{item.productName}</Text>
                <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>{item.quantity} x ₹{item.purchasePrice} + {item.gstPercent}% GST</Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.foreground }]}>₹{item.totalAmount.toFixed(0)}</Text>
            </View>
          ))}
          <View style={[styles.totals, { borderTopColor: colors.border }]}>
            <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text><Text style={{ color: colors.foreground }}>₹{purchase.subtotal.toFixed(2)}</Text></View>
            <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>GST</Text><Text style={{ color: colors.foreground }}>₹{purchase.totalGst.toFixed(2)}</Text></View>
            <View style={styles.totalRow}><Text style={[styles.grandLabel, { color: colors.foreground }]}>Grand Total</Text><Text style={[styles.grandVal, { color: colors.primary }]}>₹{purchase.grandTotal.toFixed(2)}</Text></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  invoiceBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  invoiceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  invoiceNum: { fontSize: 16, fontFamily: "Inter_700Bold" },
  invoiceDate: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  party: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 6 },
  sec: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10, marginTop: 12 },
  itemsBox: { borderRadius: 12, borderWidth: 1, padding: 16 },
  item: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  itemName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  itemSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  itemTotal: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  totals: { borderTopWidth: 1, paddingTop: 12, gap: 6, marginTop: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  grandLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  grandVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
});
