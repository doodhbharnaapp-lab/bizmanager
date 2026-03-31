import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name) { setError("Name is required"); setLoading(false); return; }
        await register(name, email, password, "admin");
      }
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <View style={[styles.bg, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 20, backgroundColor: colors.primary }]}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primaryForeground + "20" }]}>
          <Feather name="trending-up" size={32} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.appName, { color: colors.primaryForeground }]}>BizManager</Text>
        <Text style={[styles.tagline, { color: colors.primaryForeground + "CC" }]}>Purchase & Sales Management</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, mode === "login" && { backgroundColor: colors.primary }]} onPress={() => setMode("login")} activeOpacity={0.8}>
                <Text style={[styles.tabText, { color: mode === "login" ? colors.primaryForeground : colors.mutedForeground }]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, mode === "register" && { backgroundColor: colors.primary }]} onPress={() => setMode("register")} activeOpacity={0.8}>
                <Text style={[styles.tabText, { color: mode === "register" ? colors.primaryForeground : colors.mutedForeground }]}>Register</Text>
              </TouchableOpacity>
            </View>
            {mode === "register" && (
              <FormField label="Business Name" value={name} onChangeText={setName} placeholder="Enter your name" autoCapitalize="words" />
            )}
            <FormField label="Email" value={email} onChangeText={setEmail} placeholder="email@business.com" keyboardType="email-address" autoCapitalize="none" />
            <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
            {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.primaryForeground} /> : (
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>{mode === "login" ? "Sign In" : "Create Account"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: { alignItems: "center", paddingBottom: 32, paddingHorizontal: 24 },
  logoWrap: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular" },
  form: { padding: 20 },
  card: { borderRadius: 16, padding: 20, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tabs: { flexDirection: "row", backgroundColor: "#0001", borderRadius: 10, padding: 3, marginBottom: 20 },
  tab: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12, textAlign: "center" },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
