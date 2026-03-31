import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";
import { SelectField } from "@/components/SelectField";
import { AppHeader } from "@/components/AppHeader";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function NewProductScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [gstPercent, setGstPercent] = useState("0");
  const [rack, setRack] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [unit, setUnit] = useState("pcs");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !purchasePrice || !sellingPrice) { Alert.alert("Name, purchase price and selling price are required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, category, purchasePrice: parseFloat(purchasePrice), sellingPrice: parseFloat(sellingPrice), gstPercent: parseFloat(gstPercent), rack, stockQty: parseFloat(stockQty), lowStockThreshold: parseFloat(lowStockThreshold), unit }),
      });
      if (!res.ok) throw new Error("Failed");
      qc.invalidateQueries({ queryKey: ["products"] });
      router.back();
    } catch { Alert.alert("Failed to create product"); }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="New Product" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">
        <FormField label="Product Name *" value={name} onChangeText={setName} placeholder="e.g. Rice 25kg" autoCapitalize="words" />
        <FormField label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Grains, Electronics" autoCapitalize="words" />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}><FormField label="Purchase Price *" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="numeric" placeholder="0.00" /></View>
          <View style={{ flex: 1 }}><FormField label="Selling Price *" value={sellingPrice} onChangeText={setSellingPrice} keyboardType="numeric" placeholder="0.00" /></View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}><FormField label="GST %" value={gstPercent} onChangeText={setGstPercent} keyboardType="numeric" placeholder="0" /></View>
          <View style={{ flex: 2 }}><FormField label="Rack/Location" value={rack} onChangeText={setRack} placeholder="e.g. A-1, Shelf 3" /></View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}><FormField label="Opening Stock" value={stockQty} onChangeText={setStockQty} keyboardType="numeric" placeholder="0" /></View>
          <View style={{ flex: 1, marginRight: 8 }}><FormField label="Low Stock Alert" value={lowStockThreshold} onChangeText={setLowStockThreshold} keyboardType="numeric" placeholder="10" /></View>
          <View style={{ flex: 1 }}>
            <SelectField label="Unit" value={unit} onSelect={setUnit}
              options={[{ label: "pcs", value: "pcs" }, { label: "kg", value: "kg" }, { label: "g", value: "g" }, { label: "L", value: "L" }, { label: "mL", value: "mL" }, { label: "box", value: "box" }, { label: "dozen", value: "dozen" }]} />
          </View>
        </View>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#FFF" /> : <><Feather name="check" size={20} color="#FFF" /><Text style={styles.submitText}>Save Product</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  row: { flexDirection: "row" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16, marginTop: 8 },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },
});
