import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
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

  const handleSubmit = async () => {
    if (!partyId || !amount) { Alert.alert("Fill all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ partyType, partyId: parseInt(partyId), amount: parseFloat(amount), paymentMode, notes }),
      });
      if (!res.ok) throw new Error("Failed");
      qc.invalidateQueries();
      router.back();
    } catch { Alert.alert("Failed to record payment"); }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Record Payment" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">
        <SelectField label="Party Type" value={partyType} onSelect={setPartyType}
          options={[{ label: "Customer", value: "customer" }, { label: "Supplier", value: "supplier" }]} />
        <FormField label="Party ID" value={partyId} onChangeText={setPartyId} placeholder="Enter party ID" keyboardType="numeric" />
        <FormField label="Amount (₹)" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />
        <SelectField label="Payment Mode" value={paymentMode} onSelect={setPaymentMode}
          options={[{ label: "Cash", value: "cash" }, { label: "UPI", value: "upi" }, { label: "Bank Transfer", value: "bank" }, { label: "Cheque", value: "cheque" }]} />
        <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional note" multiline numberOfLines={2} style={{ height: 60, textAlignVertical: "top" }} />
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#FFF" /> : <><Feather name="check" size={20} color="#FFF" /><Text style={styles.submitText}>Record Payment</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16, marginTop: 8 },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },
});
