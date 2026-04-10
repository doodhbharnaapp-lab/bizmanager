// import React, { useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Platform } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import { useQuery } from "@tanstack/react-query";
// import { useColors } from "@/hooks/useColors";
// import { useAuth } from "@/context/AuthContext";
// import { SearchBar } from "@/components/SearchBar";
// import { ListItem } from "@/components/ListItem";
// import { EmptyState } from "@/components/EmptyState";
// import { FAB } from "@/components/FAB";
// import { AppHeader } from "@/components/AppHeader";
// import { Badge } from "@/components/Badge";

// const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

// export default function PartiesScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { token } = useAuth();
//   const [tab, setTab] = useState<"customers" | "suppliers">("customers");
//   const [search, setSearch] = useState("");
//   const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

//   const { data: customers = [], isLoading: cLoading, refetch: cRefetch } = useQuery({
//     queryKey: ["customers"],
//     queryFn: async () => {
//       const res = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
//       return res.json();
//     },
//     enabled: !!token,
//   });

//   const { data: suppliers = [], isLoading: sLoading, refetch: sRefetch } = useQuery({
//     queryKey: ["suppliers"],
//     queryFn: async () => {
//       const res = await fetch(`${API_BASE}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
//       return res.json();
//     },
//     enabled: !!token,
//   });

//   const isLoading = tab === "customers" ? cLoading : sLoading;
//   const refetch = tab === "customers" ? cRefetch : sRefetch;
//   const data = (tab === "customers" ? customers : suppliers).filter((p: any) =>
//     p.name.toLowerCase().includes(search.toLowerCase()) ||
//     (p.phone || "").includes(search)
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <AppHeader title="Parties" subtitle="Customers & Suppliers" />
//       <ScrollView
//         contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
//         refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
//       >
//         <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
//           <TouchableOpacity style={[styles.tab, tab === "customers" && { backgroundColor: colors.primary }]} onPress={() => setTab("customers")} activeOpacity={0.8}>
//             <Text style={[styles.tabText, { color: tab === "customers" ? colors.primaryForeground : colors.mutedForeground }]}>Customers ({customers.length})</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tab, tab === "suppliers" && { backgroundColor: colors.primary }]} onPress={() => setTab("suppliers")} activeOpacity={0.8}>
//             <Text style={[styles.tabText, { color: tab === "suppliers" ? colors.primaryForeground : colors.mutedForeground }]}>Suppliers ({suppliers.length})</Text>
//           </TouchableOpacity>
//         </View>
//         <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${tab}...`} />
//         {data.length === 0 ? (
//           <EmptyState
//             icon={tab === "customers" ? "users" : "truck"}
//             title={`No ${tab} yet`}
//             description={`Add your first ${tab === "customers" ? "customer" : "supplier"}`}
//             actionLabel={tab === "customers" ? "Add Customer" : "Add Supplier"}
//             onAction={() => router.push(tab === "customers" ? "/customers/new" as any : "/suppliers/new" as any)}
//           />
//         ) : (
//           data.map((p: any) => (
//             <ListItem
//               key={p.id}
//               title={p.name}
//               subtitle={p.phone || p.email || ""}
//               value={p.balance > 0 ? `${p.balance.toFixed(0)}` : "Settled"}
//               valueSub={p.balance > 0 ? (tab === "customers" ? "to collect" : "to pay") : ""}
//               valueColor={p.balance > 0 ? colors.destructive : colors.success}
//               onPress={() => router.push(`/${tab}/${p.id}` as any)}
//               leftIcon={tab === "customers" ? "user" : "truck"}
//               rightElement={p.balance > 0 ? <Badge label="Due" variant="danger" /> : <Badge label="Clear" variant="success" />}
//             />
//           ))
//         )}
//       </ScrollView>
//       <FAB onPress={() => router.push(tab === "customers" ? "/customers/new" as any : "/suppliers/new" as any)} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   content: { padding: 16 },
//   tabs: { flexDirection: "row", borderRadius: 10, padding: 3, marginBottom: 12 },
//   tab: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
//   tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
// });



import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/Badge";
import { SwipeableRow } from "@/components/SwipeableRow";
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function PartiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"customers" | "suppliers">("customers");
  const [search, setSearch] = useState("");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Queries
  const { data: customers = [], isLoading: cLoading, refetch: cRefetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
    enabled: !!token,
  });

  const { data: suppliers = [], isLoading: sLoading, refetch: sRefetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      return res.json();
    },
    enabled: !!token,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const endpoint = tab === "customers" ? "customers" : "suppliers";
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab === "customers" ? "customers" : "suppliers"] });
    },
    onError: () => {
      Alert.alert('Error', `Failed to delete ${tab === "customers" ? "customer" : "supplier"}`);
    },
  });

  const isLoading = tab === "customers" ? cLoading : sLoading;
  const refetch = tab === "customers" ? cRefetch : sRefetch;

  // Enhanced search by name or srNumber
  const data = (tab === "customers" ? customers : suppliers).filter((p: any) => {
    const searchTerm = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchTerm) ||
      (p.phone || "").includes(search) ||
      (p.srNumber?.toString() || "").includes(searchTerm) ||
      (p.email || "").toLowerCase().includes(searchTerm)
    );
  });

  const handleDelete = (party: any) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${party.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(party.id)
        }
      ]
    );
  };

  const handleEdit = (party: any) => {
    router.push({
      pathname: tab === "customers" ? "/customers/edit" as any : "/suppliers/edit" as any,
      params: { id: party.id }
    });
  };

  const renderRightActions = (party: any) => {
    return (
      <View style={[styles.rightActions, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEdit(party)}
        >
          <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.destructive }]}
          onPress={() => handleDelete(party)}
        >
          <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Parties" subtitle="Customers & Suppliers" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          <TouchableOpacity
            style={[styles.tab, tab === "customers" && { backgroundColor: colors.primary }]}
            onPress={() => {
              setTab("customers");
              setSearch("");
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: tab === "customers" ? colors.primaryForeground : colors.mutedForeground }]}>
              Customers ({customers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "suppliers" && { backgroundColor: colors.primary }]}
            onPress={() => {
              setTab("suppliers");
              setSearch("");
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: tab === "suppliers" ? colors.primaryForeground : colors.mutedForeground }]}>
              Suppliers ({suppliers.length})
            </Text>
          </TouchableOpacity>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={`Search ${tab} by name, phone, or SR number...`}
        />

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
            <SwipeableRow
              key={p.id}
              rightActions={() => renderRightActions(p)}
              onPress={() => router.push(`/${tab}/${p.id}` as any)}
            >
              <ListItem
                title={p.name}
                subtitle={`${p.srNumber ? `SR: ${p.srNumber} | ` : ''}${p.phone || p.email || "No contact"}`}
                value={p.balance > 0 ? `${p.balance.toFixed(0)}` : "Settled"}
                valueSub={p.balance > 0 ? (tab === "customers" ? "to collect" : "to pay") : ""}
                valueColor={p.balance > 0 ? colors.destructive : colors.success}
                leftIcon={tab === "customers" ? "user" : "truck"}
                rightElement={p.balance > 0 ? <Badge label="Due" variant="danger" /> : <Badge label="Clear" variant="success" />}
              />
            </SwipeableRow>
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
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: '100%',
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});