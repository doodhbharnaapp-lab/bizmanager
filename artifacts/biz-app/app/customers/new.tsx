import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";
import { AppHeader } from "@/components/AppHeader";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function NewCustomerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [address, setAddress] = useState(""); const [gstNumber, setGstNumber] = useState(""); const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) { Alert.alert("Name is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, phone, email, address, gstNumber }) });
      if (!res.ok) throw new Error("Failed");
      qc.invalidateQueries({ queryKey: ["customers"] });
      router.back();
    } catch { Alert.alert("Failed to create customer"); }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="New Customer" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">
        <FormField label="Name *" value={name} onChangeText={setName} placeholder="Customer name" autoCapitalize="words" />
        <FormField label="Phone" value={phone} onChangeText={setPhone} placeholder="Mobile number" keyboardType="phone-pad" />
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Address" value={address} onChangeText={setAddress} placeholder="Full address" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: "top" }} />
        <FormField label="GST Number" value={gstNumber} onChangeText={setGstNumber} placeholder="GST registration number" autoCapitalize="characters" />
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#FFF" /> : <><Feather name="check" size={20} color="#FFF" /><Text style={styles.submitText}>Save Customer</Text></>}
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
