import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/Badge";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function PartiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [tab, setTab] = useState<"customers" | "suppliers">("customers");
  const [search, setSearch] = useState("");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: customers = [], isLoading: cLoading, refetch: cRefetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const { data: suppliers = [], isLoading: sLoading, refetch: sRefetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const isLoading = tab === "customers" ? cLoading : sLoading;
  const refetch = tab === "customers" ? cRefetch : sRefetch;
  const data = (tab === "customers" ? customers : suppliers).filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || "").includes(search)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Parties" subtitle="Customers & Suppliers" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          <TouchableOpacity style={[styles.tab, tab === "customers" && { backgroundColor: colors.primary }]} onPress={() => setTab("customers")} activeOpacity={0.8}>
            <Text style={[styles.tabText, { color: tab === "customers" ? colors.primaryForeground : colors.mutedForeground }]}>Customers ({customers.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === "suppliers" && { backgroundColor: colors.primary }]} onPress={() => setTab("suppliers")} activeOpacity={0.8}>
            <Text style={[styles.tabText, { color: tab === "suppliers" ? colors.primaryForeground : colors.mutedForeground }]}>Suppliers ({suppliers.length})</Text>
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${tab}...`} />
        {data.length === 0 ? (
          <EmptyState
            icon={tab === "customers" ? "users" : "truck"}
            title={`No ${tab} yet`}
            description={`Add your first ${tab === "customers" ? "customer" : "supplier"}`}
            actionLabel={tab === "customers" ? "Add Customer" : "Add Supplier"}
            onAction={() => router.push(tab === "customers" ? "/customers/new" as any : "/suppliers/new" as any)}
          />
        ) : (
          data.map((p: any) => (
            <ListItem
              key={p.id}
              title={p.name}
              subtitle={p.phone || p.email || ""}
              value={p.balance > 0 ? `₹${p.balance.toFixed(0)}` : "Settled"}
              valueSub={p.balance > 0 ? (tab === "customers" ? "to collect" : "to pay") : ""}
              valueColor={p.balance > 0 ? colors.destructive : colors.success}
              onPress={() => router.push(`/${tab}/${p.id}` as any)}
              leftIcon={tab === "customers" ? "user" : "truck"}
              rightElement={p.balance > 0 ? <Badge label="Due" variant="danger" /> : <Badge label="Clear" variant="success" />}
            />
          ))
        )}
      </ScrollView>
      <FAB onPress={() => router.push(tab === "customers" ? "/customers/new" as any : "/suppliers/new" as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  tabs: { flexDirection: "row", borderRadius: 10, padding: 3, marginBottom: 12 },
  tab: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
