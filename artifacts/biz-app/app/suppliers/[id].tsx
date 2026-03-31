import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { ListItem } from "@/components/ListItem";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function SupplierDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: supplier } = useQuery({ queryKey: ["supplier", id], queryFn: async () => { const r = await fetch(`${API_BASE}/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); }, enabled: !!token && !!id });
  const { data: ledger } = useQuery({ queryKey: ["supplier-ledger", id], queryFn: async () => { const r = await fetch(`${API_BASE}/suppliers/${id}/ledger`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); }, enabled: !!token && !!id });

  if (!supplier) return <View style={[styles.container, { backgroundColor: colors.background }]}><AppHeader title="Supplier" showBack /><View style={styles.loading}><Text style={{ color: colors.mutedForeground }}>Loading...</Text></View></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={supplier.name} showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {supplier.phone ? <View style={styles.infoRow}><Feather name="phone" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>{supplier.phone}</Text></View> : null}
          {supplier.email ? <View style={styles.infoRow}><Feather name="mail" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>{supplier.email}</Text></View> : null}
          {supplier.address ? <View style={styles.infoRow}><Feather name="map-pin" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>{supplier.address}</Text></View> : null}
          {supplier.gstNumber ? <View style={styles.infoRow}><Feather name="credit-card" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>GST: {supplier.gstNumber}</Text></View> : null}
          <View style={[styles.balanceRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.balLabel, { color: colors.mutedForeground }]}>Outstanding Balance</Text>
            <Text style={[styles.balance, { color: supplier.balance > 0 ? colors.destructive : colors.success }]}>₹{supplier.balance.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "30" }]} onPress={() => router.push("/purchases/new")} activeOpacity={0.8}>
            <Feather name="shopping-cart" size={18} color={colors.warning} />
            <Text style={[styles.actionText, { color: colors.warning }]}>New Purchase</Text>
          </TouchableOpacity>
          {supplier.balance > 0 && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]} onPress={() => router.push(`/payments/new?partyType=supplier&partyId=${id}` as any)} activeOpacity={0.8}>
              <Feather name="credit-card" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Pay</Text>
            </TouchableOpacity>
          )}
        </View>

        {ledger?.entries?.length > 0 && (
          <>
            <Text style={[styles.secTitle, { color: colors.mutedForeground }]}>LEDGER</Text>
            {ledger.entries.map((e: any) => (
              <ListItem key={e.id} title={e.description} subtitle={e.date}
                value={e.credit > 0 ? `₹${e.credit.toFixed(0)}` : `-₹${e.debit.toFixed(0)}`}
                valueColor={e.credit > 0 ? colors.destructive : colors.success}
                valueSub={`Balance: ₹${e.balance.toFixed(0)}`} leftIcon="list" />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  infoText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  balanceRow: { borderTopWidth: 1, paddingTop: 14, marginTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  balance: { fontSize: 22, fontFamily: "Inter_700Bold" },
  actions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14 },
  actionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  secTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10 },
});
