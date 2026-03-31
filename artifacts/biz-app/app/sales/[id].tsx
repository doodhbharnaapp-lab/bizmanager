import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/Badge";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function SaleDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: sale, isLoading } = useQuery({
    queryKey: ["sale", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sales/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token && !!id,
  });

  if (isLoading || !sale) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Sale Detail" showBack />
      <View style={styles.loading}><Text style={{ color: colors.mutedForeground }}>Loading...</Text></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Sale Detail" showBack subtitle={sale.invoiceNumber} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <View style={[styles.invoiceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={[styles.invoiceNum, { color: colors.primary }]}>{sale.invoiceNumber}</Text>
              <Text style={[styles.invoiceDate, { color: colors.mutedForeground }]}>{sale.date}</Text>
            </View>
            <Badge label={sale.paymentMode.toUpperCase()} variant={sale.paymentMode === "credit" ? "danger" : "success"} />
          </View>
          {sale.customerName && <Text style={[styles.party, { color: colors.foreground }]}>Customer: {sale.customerName}</Text>}
          {sale.isGstInvoice && <Badge label="GST Invoice" variant="info" />}
        </View>

        <Text style={[styles.sec, { color: colors.mutedForeground }]}>ITEMS</Text>
        <View style={[styles.itemsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(sale.items || []).map((item: any, i: number) => (
            <View key={i} style={[styles.item, { borderBottomColor: colors.border, borderBottomWidth: i < sale.items.length - 1 ? 0.5 : 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.foreground }]}>{item.productName}</Text>
                <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>{item.quantity} x ₹{item.sellingPrice} {item.gstPercent > 0 ? `(GST ${item.gstPercent}%)` : ""}</Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.foreground }]}>₹{item.totalAmount.toFixed(0)}</Text>
            </View>
          ))}
          <View style={[styles.totals, { borderTopColor: colors.border }]}>
            <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text><Text style={{ color: colors.foreground }}>₹{sale.subtotal.toFixed(2)}</Text></View>
            {sale.totalGst > 0 && <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>GST</Text><Text style={{ color: colors.foreground }}>₹{sale.totalGst.toFixed(2)}</Text></View>}
            <View style={styles.totalRow}><Text style={[styles.grandLabel, { color: colors.foreground }]}>Grand Total</Text><Text style={[styles.grandVal, { color: colors.primary }]}>₹{sale.grandTotal.toFixed(2)}</Text></View>
          </View>
        </View>

        {sale.notes && <View style={[styles.notes, { backgroundColor: colors.muted, borderRadius: 10 }]}><Text style={{ color: colors.mutedForeground }}>{sale.notes}</Text></View>}
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
  notes: { marginTop: 12, padding: 14 },
});
