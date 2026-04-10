import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";
import { SelectField } from "@/components/SelectField";
import { AppHeader } from "@/components/AppHeader";

const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function NewReturnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();
  const { productId: pId, type: t } = useLocalSearchParams();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [returnType, setReturnType] = useState((t as string) || "purchase_return");
  const [productId, setProductId] = useState((pId as string) || "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } });
      return r.json();
    },
    enabled: !!token,
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/purchases`, { headers: { Authorization: `Bearer ${token}` } });
      return r.json();
    },
    enabled: !!token && returnType === "purchase",
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/sales`, { headers: { Authorization: `Bearer ${token}` } });
      return r.json();
    },
    enabled: !!token && returnType === "sale",
  });

  const handleSubmit = async () => {
    if (!productId || !quantity) { Alert.alert("Fill all required fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          returnType,
          productId: parseInt(productId),
          quantity: parseFloat(quantity),
          reason,
          amount: refundAmount ? parseFloat(refundAmount) : 0,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["returns"] });
      router.back();
    } catch { Alert.alert("Failed to record return"); }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="New Return" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">
        <SelectField label="Return Type" value={returnType} onSelect={setReturnType}
          options={[{ label: "Purchase Return (to supplier)", value: "purchase_return" }, { label: "Sale Return (from customer)", value: "sale_return" }]} />
        <SelectField label="Product *" value={productId} onSelect={setProductId} placeholder="Select product..."
          options={products.map((p: any) => ({ label: `${p.name} (Stock: ${p.stockQty})`, value: String(p.id) }))} />
        <FormField label="Quantity *" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="1" />
        <FormField label="Refund Amount ()" value={refundAmount} onChangeText={setRefundAmount} keyboardType="numeric" placeholder="0.00" />
        <FormField label="Reason" value={reason} onChangeText={setReason} placeholder="Why is this being returned?" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: "top" }} />
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]}
          onPress={handleSubmit} disabled={loading} activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <><Feather name="rotate-ccw" size={20} color="#FFF" /><Text style={styles.submitText}>Record Return</Text></>}
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
