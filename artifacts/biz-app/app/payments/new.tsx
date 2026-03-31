import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";
import { SelectField } from "@/components/SelectField";
import { AppHeader } from "@/components/AppHeader";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function NewPaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();
  const { partyType: pt, partyId: pid } = useLocalSearchParams();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [partyType, setPartyType] = useState((pt as string) || "customer");
  const [partyId, setPartyId] = useState((pid as string) || "");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      return r.json();
    },
    enabled: !!token,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
      return r.json();
    },
    enabled: !!token,
  });

  const partyOptions = partyType === "customer"
    ? customers.map((c: any) => ({ label: `${c.name}${c.balance > 0 ? ` (Due ₹${c.balance.toFixed(0)})` : ""}`, value: String(c.id) }))
    : suppliers.map((s: any) => ({ label: `${s.name}${s.balance > 0 ? ` (Due ₹${s.balance.toFixed(0)})` : ""}`, value: String(s.id) }));

  const selectedParty = partyType === "customer"
    ? customers.find((c: any) => String(c.id) === partyId)
    : suppliers.find((s: any) => String(s.id) === partyId);

  const handlePartyTypeChange = (v: string) => {
    setPartyType(v);
    setPartyId("");
  };

  const handleSubmit = async () => {
    if (!partyId) { Alert.alert("Please select a " + partyType); return; }
    if (!amount || parseFloat(amount) <= 0) { Alert.alert("Enter a valid amount"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          partyType,
          partyId: parseInt(partyId),
          amount: parseFloat(amount),
          paymentMode,
          notes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      qc.invalidateQueries();
      Alert.alert("Success", "Payment recorded successfully", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to record payment");
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Record Payment" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">

        <SelectField
          label="Party Type"
          value={partyType}
          onSelect={handlePartyTypeChange}
          options={[{ label: "Customer (collecting payment)", value: "customer" }, { label: "Supplier (making payment)", value: "supplier" }]}
        />

        <SelectField
          label={partyType === "customer" ? "Customer *" : "Supplier *"}
          value={partyId}
          onSelect={setPartyId}
          placeholder={`Select ${partyType}...`}
          options={partyOptions}
        />

        {selectedParty && selectedParty.balance > 0 && (
          <View style={[styles.balanceInfo, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
            <Feather name="info" size={16} color={colors.warning} />
            <Text style={[styles.balanceText, { color: colors.warning }]}>
              Outstanding due: ₹{selectedParty.balance.toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => setAmount(String(selectedParty.balance.toFixed(2)))}>
              <Text style={[styles.fillBtn, { color: colors.warning }]}>Fill</Text>
            </TouchableOpacity>
          </View>
        )}

        <FormField
          label="Amount (₹) *"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <SelectField
          label="Payment Mode"
          value={paymentMode}
          onSelect={setPaymentMode}
          options={[
            { label: "Cash", value: "cash" },
            { label: "UPI", value: "upi" },
            { label: "Bank Transfer", value: "bank" },
            { label: "Cheque", value: "cheque" },
          ]}
        />

        <FormField
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Reference number, remarks..."
          multiline
          numberOfLines={2}
          style={{ height: 70, textAlignVertical: "top" }}
        />

        <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.mutedForeground }]}>PAYMENT SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Party</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{selectedParty?.name || "—"}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Amount</Text>
            <Text style={[styles.summaryAmount, { color: colors.primary }]}>₹{amount || "0.00"}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Via</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{paymentMode.toUpperCase()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#FFF" />
              <Text style={styles.submitText}>
                {partyType === "customer" ? "Collect Payment" : "Record Payment"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  balanceInfo: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  balanceText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  fillBtn: { fontSize: 13, fontFamily: "Inter_700Bold", textDecorationLine: "underline" },
  summaryBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  summaryTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  summaryAmount: { fontSize: 22, fontFamily: "Inter_700Bold" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16, marginTop: 4 },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },
});
