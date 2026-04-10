// import React from "react";
// import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useLocalSearchParams, router } from "expo-router";
// import { Feather } from "@expo/vector-icons";
// import { useQuery } from "@tanstack/react-query";
// import { useColors } from "@/hooks/useColors";
// import { useAuth } from "@/context/AuthContext";
// import { AppHeader } from "@/components/AppHeader";
// import { ListItem } from "@/components/ListItem";
// import { Badge } from "@/components/Badge";
// const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
// export default function CustomerDetailScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { id } = useLocalSearchParams();
//   const { token } = useAuth();
//   const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
//   const { data: customer } = useQuery({ queryKey: ["customer", id], queryFn: async () => { const r = await fetch(`${API_BASE}/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); }, enabled: !!token && !!id });
//   const { data: ledger } = useQuery({ queryKey: ["customer-ledger", id], queryFn: async () => { const r = await fetch(`${API_BASE}/customers/${id}/ledger`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); }, enabled: !!token && !!id });
//   if (!customer) return <View style={[styles.container, { backgroundColor: colors.background }]}><AppHeader title="Customer" showBack /><View style={styles.loading}><Text style={{ color: colors.mutedForeground }}>Loading...</Text></View></View>;
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <AppHeader title={customer.name} showBack />
//       <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
//         <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
//           {customer.phone ? <View style={styles.infoRow}><Feather name="phone" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>{customer.phone}</Text></View> : null}
//           {customer.email ? <View style={styles.infoRow}><Feather name="mail" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>{customer.email}</Text></View> : null}
//           {customer.address ? <View style={styles.infoRow}><Feather name="map-pin" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>{customer.address}</Text></View> : null}
//           {customer.gstNumber ? <View style={styles.infoRow}><Feather name="credit-card" size={16} color={colors.mutedForeground} /><Text style={[styles.infoText, { color: colors.foreground }]}>GST: {customer.gstNumber}</Text></View> : null}
//           <View style={[styles.balanceRow, { borderTopColor: colors.border }]}>
//             <Text style={[styles.balLabel, { color: colors.mutedForeground }]}>Outstanding Balance</Text>
//             <Text style={[styles.balance, { color: customer.balance > 0 ? colors.destructive : colors.success }]}>{customer.balance.toFixed(2)}</Text>
//           </View>
//         </View>
//         <View style={styles.actions}>
//           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]} onPress={() => router.push("/sales/new")} activeOpacity={0.8}>
//             <Feather name="file-text" size={18} color={colors.success} />
//             <Text style={[styles.actionText, { color: colors.success }]}>New Sale</Text>
//           </TouchableOpacity>
//           {customer.balance > 0 && (
//             <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]} onPress={() => router.push(`/payments/new?partyType=customer&partyId=${id}` as any)} activeOpacity={0.8}>
//               <Feather name="credit-card" size={18} color={colors.primary} />
//               <Text style={[styles.actionText, { color: colors.primary }]}>Collect</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//         {ledger?.entries?.length > 0 && (
//           <>
//             <Text style={[styles.secTitle, { color: colors.mutedForeground }]}>LEDGER</Text>
//             {ledger.entries.map((e: any) => (
//               <ListItem key={e.id} title={e.description} subtitle={e.date}
//                 value={e.debit > 0 ? `${e.debit.toFixed(0)}` : `-${e.credit.toFixed(0)}`}
//                 valueColor={e.debit > 0 ? colors.destructive : colors.success}
//                 valueSub={`Balance: ${e.balance.toFixed(0)}`} leftIcon="list" />
//             ))}
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loading: { flex: 1, justifyContent: "center", alignItems: "center" },
//   content: { padding: 16 },
//   infoCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
//   infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
//   infoText: { fontSize: 14, fontFamily: "Inter_400Regular" },
//   balanceRow: { borderTopWidth: 1, paddingTop: 14, marginTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   balLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
//   balance: { fontSize: 22, fontFamily: "Inter_700Bold" },
//   actions: { flexDirection: "row", gap: 10, marginBottom: 16 },
//   actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14 },
//   actionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
//   secTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10 },
// });
// import React, { useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Platform,
//   TextInput,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useLocalSearchParams, router } from "expo-router";
// import { Feather } from "@expo/vector-icons";
// import { useQuery } from "@tanstack/react-query";
// import { useColors } from "@/hooks/useColors";
// import { useAuth } from "@/context/AuthContext";
// import { AppHeader } from "@/components/AppHeader";
// const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
// interface LedgerEntry {
//   id: string;
//   date: string;
//   description: string;
//   debit: number;
//   credit: number;
//   balance: number;
//   type: "sale" | "purchase" | "payment";
//   invoiceNo?: string;
// }
// interface Customer {
//   id: string;
//   name: string;
//   phone?: string;
//   email?: string;
//   address?: string;
//   gstNumber?: string;
//   balance: number;
// }
// export default function CustomerDetailScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { id } = useLocalSearchParams();
//   const { token } = useAuth();
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [showPdfModal, setShowPdfModal] = useState(false);
//   const [generatingPdf, setGeneratingPdf] = useState(false);
//   const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
//   const { data: customer, isLoading: customerLoading } = useQuery<Customer>({
//     queryKey: ["customer", id],
//     queryFn: async () => {
//       const r = await fetch(`${API_BASE}/customers/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return r.json();
//     },
//     enabled: !!token && !!id,
//   });
//   const { data: ledger, refetch } = useQuery<{ entries: LedgerEntry[]; summary: { totalDebit: number; totalCredit: number; closingBalance: number } }>({
//     queryKey: ["customer-ledger", id, fromDate, toDate],
//     queryFn: async () => {
//       let url = `${API_BASE}/customers/${id}/ledger`;
//       const params = new URLSearchParams();
//       if (fromDate) params.append("fromDate", fromDate);
//       if (toDate) params.append("toDate", toDate);
//       if (params.toString()) url += `?${params.toString()}`;
//       const r = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return r.json();
//     },
//     enabled: !!token && !!id,
//   });
//   const handleApplyFilter = () => {
//     refetch();
//   };
//   const handleClearFilter = () => {
//     setFromDate("");
//     setToDate("");
//     setTimeout(() => refetch(), 100);
//   };
//   const generatePDFReport = () => {
//     if (!customer || !ledger) return;
//     setGeneratingPdf(true);
//     try {
//       const htmlContent = generateLedgerHTML(customer, ledger, fromDate, toDate);
//       const fileName = `Ledger_${customer.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
//       // For web platform - create download link
//       if (Platform.OS === "web") {
//         const blob = new Blob([htmlContent], { type: "text/html" });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.download = fileName;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//       } else {
//         // For native - would need expo-file-system, but for now alert
//         alert("PDF generation for native requires additional setup. The HTML content is ready.");
//         console.log("HTML Content:", htmlContent);
//       }
//     } catch (error) {
//       console.error("Error generating report:", error);
//       alert("Failed to generate report");
//     } finally {
//       setGeneratingPdf(false);
//       setShowPdfModal(false);
//     }
//   };
//   if (customerLoading) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         <AppHeader title="Customer" showBack />
//         <View style={styles.loading}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text style={[{ color: colors.mutedForeground, marginTop: 12 }]}>Loading customer details...</Text>
//         </View>
//       </View>
//     );
//   }
//   if (!customer) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background }]}>
//         <AppHeader title="Customer" showBack />
//         <View style={styles.loading}>
//           <Text style={[{ color: colors.mutedForeground }]}>Customer not found</Text>
//         </View>
//       </View>
//     );
//   }
//   const totalDebit = ledger?.summary?.totalDebit || 0;
//   const totalCredit = ledger?.summary?.totalCredit || 0;
//   const closingBalance = ledger?.summary?.closingBalance || customer.balance;
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <AppHeader title={customer.name} showBack />
//       <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
//         {/* Customer Info Card */}
//         <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
//           <View style={styles.infoHeader}>
//             <Feather name="user" size={20} color={colors.primary} />
//             <Text style={[styles.customerName, { color: colors.foreground }]}>{customer.name}</Text>
//           </View>
//           {customer.phone ? (
//             <View style={styles.infoRow}>
//               <Feather name="phone" size={16} color={colors.mutedForeground} />
//               <Text style={[styles.infoText, { color: colors.foreground }]}>{customer.phone}</Text>
//             </View>
//           ) : null}
//           {customer.email ? (
//             <View style={styles.infoRow}>
//               <Feather name="mail" size={16} color={colors.mutedForeground} />
//               <Text style={[styles.infoText, { color: colors.foreground }]}>{customer.email}</Text>
//             </View>
//           ) : null}
//           {customer.address ? (
//             <View style={styles.infoRow}>
//               <Feather name="map-pin" size={16} color={colors.mutedForeground} />
//               <Text style={[styles.infoText, { color: colors.foreground }]}>{customer.address}</Text>
//             </View>
//           ) : null}
//           {customer.gstNumber ? (
//             <View style={styles.infoRow}>
//               <Feather name="credit-card" size={16} color={colors.mutedForeground} />
//               <Text style={[styles.infoText, { color: colors.foreground }]}>GST: {customer.gstNumber}</Text>
//             </View>
//           ) : null}
//           <View style={[styles.balanceRow, { borderTopColor: colors.border }]}>
//             <Text style={[styles.balLabel, { color: colors.mutedForeground }]}>Outstanding Balance</Text>
//             <Text style={[styles.balance, { color: customer.balance > 0 ? colors.destructive : colors.success }]}>
//               {Math.abs(customer.balance).toFixed(2)} {customer.balance > 0 ? "(Dr)" : "(Cr)"}
//             </Text>
//           </View>
//         </View>
//         {/* Action Buttons */}
//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}
//             onPress={() => router.push("/sales/new")}
//             activeOpacity={0.8}
//           >
//             <Feather name="file-text" size={18} color={colors.success} />
//             <Text style={[styles.actionText, { color: colors.success }]}>New Sale</Text>
//           </TouchableOpacity>
//           {customer.balance > 0 ? (
//             <TouchableOpacity
//               style={[styles.actionBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
//               onPress={() => router.push(`/payments/new?partyType=customer&partyId=${id}` as any)}
//               activeOpacity={0.8}
//             >
//               <Feather name="credit-card" size={18} color={colors.primary} />
//               <Text style={[styles.actionText, { color: colors.primary }]}>Collect Payment</Text>
//             </TouchableOpacity>
//           ) : null}
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
//             onPress={() => setShowPdfModal(true)}
//             activeOpacity={0.8}
//           >
//             <Feather name="download" size={18} color={colors.primary} />
//             <Text style={[styles.actionText, { color: colors.primary }]}>PDF Report</Text>
//           </TouchableOpacity>
//         </View>
//         {/* Date Filter Section */}
//         <View style={[styles.filterSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
//           <Text style={[styles.filterTitle, { color: colors.foreground }]}>
//             <Feather name="calendar" size={14} color={colors.primary} /> Filter by Date
//           </Text>
//           <View style={styles.dateInputs}>
//             <View style={styles.dateInputWrapper}>
//               <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>From Date</Text>
//               <TextInput
//                 placeholder="YYYY-MM-DD"
//                 placeholderTextColor={colors.mutedForeground + "80"}
//                 value={fromDate}
//                 onChangeText={setFromDate}
//                 style={[
//                   styles.dateInput,
//                   {
//                     backgroundColor: colors.background,
//                     borderColor: colors.border,
//                     color: colors.foreground,
//                   },
//                 ]}
//               />
//             </View>
//             <View style={styles.dateInputWrapper}>
//               <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>To Date</Text>
//               <TextInput
//                 placeholder="YYYY-MM-DD"
//                 placeholderTextColor={colors.mutedForeground + "80"}
//                 value={toDate}
//                 onChangeText={setToDate}
//                 style={[
//                   styles.dateInput,
//                   {
//                     backgroundColor: colors.background,
//                     borderColor: colors.border,
//                     color: colors.foreground,
//                   },
//                 ]}
//               />
//             </View>
//           </View>
//           <View style={styles.filterActions}>
//             <TouchableOpacity
//               style={[styles.filterBtn, { backgroundColor: colors.primary }]}
//               onPress={handleApplyFilter}
//             >
//               <Feather name="search" size={14} color="#fff" />
//               <Text style={styles.filterBtnText}>Apply Filter</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.filterBtn, { backgroundColor: colors.mutedForeground + "20", borderColor: colors.border }]}
//               onPress={handleClearFilter}
//             >
//               <Feather name="x" size={14} color={colors.foreground} />
//               <Text style={[styles.filterBtnText, { color: colors.foreground }]}>Clear</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         {/* Summary Cards */}
//         {ledger?.entries && ledger.entries.length > 0 ? (
//           <View style={styles.summaryContainer}>
//             <View style={[styles.summaryCard, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "30" }]}>
//               <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Debit</Text>
//               <Text style={[styles.summaryValue, { color: colors.destructive }]}>{totalDebit.toFixed(2)}</Text>
//               <Text style={[styles.summarySubLabel, { color: colors.mutedForeground }]}>Sales & Purchases</Text>
//             </View>
//             <View style={[styles.summaryCard, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
//               <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Credit</Text>
//               <Text style={[styles.summaryValue, { color: colors.success }]}>{totalCredit.toFixed(2)}</Text>
//               <Text style={[styles.summarySubLabel, { color: colors.mutedForeground }]}>Payments Received</Text>
//             </View>
//             <View style={[styles.summaryCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
//               <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Closing Balance</Text>
//               <Text style={[styles.summaryValue, { color: closingBalance > 0 ? colors.destructive : colors.success }]}>
//                 {Math.abs(closingBalance).toFixed(2)}
//               </Text>
//               <Text style={[styles.summarySubLabel, { color: closingBalance > 0 ? colors.destructive : colors.success }]}>
//                 {closingBalance > 0 ? "Customer owes you" : "You owe customer"}
//               </Text>
//             </View>
//           </View>
//         ) : null}
//         {/* Ledger Table */}
//         {ledger?.entries && ledger.entries.length > 0 ? (
//           <View style={styles.ledgerSection}>
//             <Text style={[styles.secTitle, { color: colors.mutedForeground }]}>
//               TRANSACTION HISTORY ({ledger.entries.length} entries)
//             </Text>
//             {/* Table Header */}
//             <View style={[styles.tableHeader, { backgroundColor: colors.primary + "15", borderBottomColor: colors.border }]}>
//               <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, flex: 1.5 }]}>Date</Text>
//               <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, flex: 2.5 }]}>Description</Text>
//               <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, flex: 1, textAlign: "right" }]}>Debit</Text>
//               <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, flex: 1, textAlign: "right" }]}>Credit</Text>
//               <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, flex: 1, textAlign: "right" }]}>Balance</Text>
//             </View>
//             {/* Table Rows */}
//             {ledger.entries.map((entry: LedgerEntry, index: number) => (
//               <View
//                 key={entry.id}
//                 style={[
//                   styles.tableRow,
//                   index !== ledger.entries.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
//                   index % 2 === 0 && { backgroundColor: colors.mutedForeground + "5" },
//                 ]}
//               >
//                 <Text style={[styles.tableCell, { color: colors.foreground, flex: 1.5 }]}>
//                   {new Date(entry.date).toLocaleDateString()}
//                 </Text>
//                 <View style={{ flex: 2.5 }}>
//                   <Text style={[styles.tableCell, { color: colors.foreground }]} numberOfLines={1}>
//                     {entry.description}
//                   </Text>
//                   {entry.invoiceNo ? (
//                     <Text style={[styles.invoiceNo, { color: colors.mutedForeground }]}>
//                       INV: {entry.invoiceNo}
//                     </Text>
//                   ) : null}
//                 </View>
//                 <Text style={[styles.tableCell, { color: colors.destructive, flex: 1, textAlign: "right" }]}>
//                   {entry.debit > 0 ? `${entry.debit.toFixed(2)}` : "-"}
//                 </Text>
//                 <Text style={[styles.tableCell, { color: colors.success, flex: 1, textAlign: "right" }]}>
//                   {entry.credit > 0 ? `${entry.credit.toFixed(2)}` : "-"}
//                 </Text>
//                 <Text
//                   style={[
//                     styles.tableCell,
//                     { flex: 1, textAlign: "right" },
//                     entry.balance > 0 ? { color: colors.destructive } : { color: colors.success },
//                   ]}
//                 >
//                   {Math.abs(entry.balance).toFixed(2)}
//                 </Text>
//               </View>
//             ))}
//             {/* Footer Total Row */}
//             <View style={[styles.tableFooter, { borderTopColor: colors.border, backgroundColor: colors.mutedForeground + "10" }]}>
//               <Text style={[styles.tableFooterText, { color: colors.foreground, flex: 4 }]}>Total</Text>
//               <Text style={[styles.tableFooterText, { color: colors.destructive, flex: 1, textAlign: "right" }]}>
//                 {totalDebit.toFixed(2)}
//               </Text>
//               <Text style={[styles.tableFooterText, { color: colors.success, flex: 1, textAlign: "right" }]}>
//                 {totalCredit.toFixed(2)}
//               </Text>
//               <Text style={[styles.tableFooterText, { flex: 1, textAlign: "right" }, closingBalance > 0 ? { color: colors.destructive } : { color: colors.success }]}>
//                 {Math.abs(closingBalance).toFixed(2)}
//               </Text>
//             </View>
//           </View>
//         ) : (
//           <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
//             <Feather name="inbox" size={48} color={colors.mutedForeground} />
//             <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No ledger entries found</Text>
//             <Text style={[styles.emptySubText, { color: colors.mutedForeground + "80" }]}>
//               {fromDate || toDate ? "Try changing the date filter" : "Create a sale or record a payment to get started"}
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//       {/* PDF Options Modal */}
//       <Modal
//         visible={showPdfModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowPdfModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: colors.foreground }]}>Export Report</Text>
//               <TouchableOpacity onPress={() => setShowPdfModal(false)}>
//                 <Feather name="x" size={24} color={colors.mutedForeground} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.modalBody}>
//               <Feather name="file-text" size={40} color={colors.primary} />
//               <Text style={[styles.modalText, { color: colors.foreground }]}>
//                 Generate complete ledger report
//               </Text>
//               <Text style={[styles.modalSubText, { color: colors.mutedForeground }]}>
//                 Customer: {customer.name}
//               </Text>
//               <Text style={[styles.modalSubText, { color: colors.mutedForeground }]}>
//                 Period: {fromDate || "Start"} to {toDate || "Today"}
//               </Text>
//             </View>
//             <TouchableOpacity
//               style={[styles.modalBtn, { backgroundColor: colors.primary }]}
//               onPress={generatePDFReport}
//               disabled={generatingPdf}
//             >
//               {generatingPdf ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <React.Fragment>
//                   <Feather name="download" size={18} color="#fff" />
//                   <Text style={styles.modalBtnText}>Generate Report</Text>
//                 </React.Fragment>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }
// function generateLedgerHTML(customer: Customer, ledger: any, fromDate: string, toDate: string): string {
//   const entries = ledger.entries || [];
//   const summary = ledger.summary || { totalDebit: 0, totalCredit: 0, closingBalance: customer.balance };
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Customer Ledger - ${customer.name}</title>
//   <style>
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body {
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
//       background: #f5f5f5;
//       padding: 20px;
//     }
//     .report {
//       max-width: 1200px;
//       margin: 0 auto;
//       background: white;
//       border-radius: 12px;
//       box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//       overflow: hidden;
//     }
//     .header {
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       color: white;
//       padding: 30px;
//     }
//     .header h1 { font-size: 24px; margin-bottom: 8px; }
//     .header p { opacity: 0.9; font-size: 13px; }
//     .info-section {
//       padding: 20px 30px;
//       background: #f8f9fa;
//       border-bottom: 1px solid #e0e0e0;
//       display: grid;
//       grid-template-columns: repeat(2, 1fr);
//       gap: 10px;
//     }
//     .info-item { font-size: 13px; }
//     .info-label { font-weight: 600; color: #666; }
//     .balance-section {
//       padding: 20px 30px;
//       background: #fff3e0;
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//     }
//     .balance-label { font-size: 16px; font-weight: 600; color: #e65100; }
//     .balance-amount { font-size: 28px; font-weight: bold; color: #e65100; }
//     .summary {
//       display: grid;
//       grid-template-columns: repeat(3, 1fr);
//       gap: 15px;
//       padding: 20px 30px;
//       background: #f5f5f5;
//     }
//     .summary-card {
//       background: white;
//       padding: 15px;
//       border-radius: 8px;
//       text-align: center;
//       border: 1px solid #e0e0e0;
//     }
//     .summary-label { font-size: 12px; color: #666; margin-bottom: 8px; }
//     .summary-value { font-size: 20px; font-weight: bold; }
//     .debit { color: #dc3545; }
//     .credit { color: #28a745; }
//     .table-container { padding: 0 30px 30px 30px; }
//     table {
//       width: 100%;
//       border-collapse: collapse;
//       margin-top: 20px;
//     }
//     th {
//       background: #667eea;
//       color: white;
//       padding: 12px;
//       text-align: left;
//       font-size: 12px;
//       font-weight: 600;
//     }
//     td {
//       padding: 10px 12px;
//       border-bottom: 1px solid #e0e0e0;
//       font-size: 13px;
//     }
//     .text-right { text-align: right; }
//     .footer {
//       padding: 20px;
//       background: #f8f9fa;
//       text-align: center;
//       font-size: 11px;
//       color: #999;
//       border-top: 1px solid #e0e0e0;
//     }
//     @media print {
//       body { background: white; padding: 0; }
//       .report { box-shadow: none; }
//     }
//   </style>
// </head>
// <body>
//   <div class="report">
//     <div class="header">
//       <h1>Customer Ledger Report</h1>
//       <p>Generated on ${new Date().toLocaleString()}</p>
//     </div>
//     <div class="info-section">
//       <div class="info-item"><span class="info-label">Customer:</span> ${customer.name}</div>
//       ${customer.phone ? `<div class="info-item"><span class="info-label">Phone:</span> ${customer.phone}</div>` : ""}
//       ${customer.email ? `<div class="info-item"><span class="info-label">Email:</span> ${customer.email}</div>` : ""}
//       ${customer.gstNumber ? `<div class="info-item"><span class="info-label">GST:</span> ${customer.gstNumber}</div>` : ""}
//       <div class="info-item"><span class="info-label">Period:</span> ${fromDate || "Start"} to ${toDate || "Today"}</div>
//     </div>
//     <div class="balance-section">
//       <span class="balance-label">Outstanding Balance</span>
//       <span class="balance-amount">${Math.abs(customer.balance).toFixed(2)} ${customer.balance > 0 ? "Dr" : "Cr"}</span>
//     </div>
//     <div class="summary">
//       <div class="summary-card"><div class="summary-label">Total Debit</div><div class="summary-value debit">${summary.totalDebit.toFixed(2)}</div></div>
//       <div class="summary-card"><div class="summary-label">Total Credit</div><div class="summary-value credit">${summary.totalCredit.toFixed(2)}</div></div>
//       <div class="summary-card"><div class="summary-label">Closing Balance</div><div class="summary-value ${summary.closingBalance > 0 ? 'debit' : 'credit'}">${Math.abs(summary.closingBalance).toFixed(2)}</div></div>
//     </div>
//     <div class="table-container">
//       <h3 style="margin-bottom: 15px;">Transaction Details</h3>
//       ${entries.length > 0 ? `
//       <table>
//         <thead>
//           <tr><th>Date</th><th>Description</th><th class="text-right">Debit ()</th><th class="text-right">Credit ()</th><th class="text-right">Balance ()</th></tr>
//         </thead>
//         <tbody>
//           ${entries.map((e: any) => `
//             <tr>
//               <td>${new Date(e.date).toLocaleDateString()}</td>
//               <td>${e.description}${e.invoiceNo ? ` (INV: ${e.invoiceNo})` : ""}</td>
//               <td class="text-right debit">${e.debit > 0 ? `${e.debit.toFixed(2)}` : "-"}</td>
//               <td class="text-right credit">${e.credit > 0 ? `${e.credit.toFixed(2)}` : "-"}</td>
//               <td class="text-right ${e.balance > 0 ? 'debit' : 'credit'}">${Math.abs(e.balance).toFixed(2)}</td>
//             </tr>
//           `).join("")}
//         </tbody>
//       </table>
//       ` : "<p style='text-align: center; padding: 40px; color: #999;'>No transactions found</p>"}
//     </div>
//     <div class="footer">
//       <p>Computer generated report - No signature required</p>
//       <p>${customer.name} - Customer Ledger Report</p>
//     </div>
//   </div>
// </body>
// </html>`;
// }
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loading: { flex: 1, justifyContent: "center", alignItems: "center" },
//   content: { padding: 16 },
//   infoCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
//   infoHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
//   customerName: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
//   infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
//   infoText: { fontSize: 14, fontFamily: "Inter_400Regular" },
//   balanceRow: { borderTopWidth: 1, paddingTop: 14, marginTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   balLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
//   balance: { fontSize: 22, fontFamily: "Inter_700Bold" },
//   actions: { flexDirection: "row", gap: 10, marginBottom: 20 },
//   actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 12 },
//   actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
//   filterSection: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 20 },
//   filterTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
//   dateInputs: { flexDirection: "row", gap: 12, marginBottom: 12 },
//   dateInputWrapper: { flex: 1 },
//   dateLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
//   dateInput: { padding: 10, borderRadius: 8, borderWidth: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
//   filterActions: { flexDirection: "row", gap: 10, marginTop: 4 },
//   filterBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
//   filterBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_500Medium" },
//   summaryContainer: { flexDirection: "row", gap: 12, marginBottom: 24 },
//   summaryCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
//   summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 4 },
//   summaryValue: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
//   summarySubLabel: { fontSize: 9, fontFamily: "Inter_400Regular" },
//   ledgerSection: { marginTop: 8, marginBottom: 16 },
//   secTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 12 },
//   tableHeader: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
//   tableHeaderText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
//   tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 8 },
//   tableCell: { fontSize: 12, fontFamily: "Inter_400Regular" },
//   invoiceNo: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
//   tableFooter: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, marginTop: 4 },
//   tableFooterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
//   emptyState: { borderRadius: 12, borderWidth: 1, padding: 40, alignItems: "center", gap: 12, marginTop: 20 },
//   emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
//   emptySubText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
//   modalContent: { width: "85%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
//   modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0" },
//   modalTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
//   modalBody: { padding: 24, alignItems: "center", gap: 12 },
//   modalText: { fontSize: 16, fontFamily: "Inter_500Medium", textAlign: "center" },
//   modalSubText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
//   modalBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, margin: 20, marginTop: 0, borderRadius: 10 },
//   modalBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
// });
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: "sale" | "purchase" | "payment";
  invoiceNo?: string;
}
interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  balance: number;
}
export default function CustomerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data: customer, isLoading: customerLoading, refetch: refetchCustomer } = useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return r.json();
    },
    enabled: !!token && !!id,
  });
// Update your useQuery for ledger to properly handle the API response
const { data: ledger, refetch: refetchLedger, isLoading: ledgerLoading } = useQuery<{
  entries: LedgerEntry[];
  summary: { totalDebit: number; totalCredit: number; closingBalance: number }
}>({
  queryKey: ["customer-ledger", id, fromDate, toDate],
  queryFn: async () => {
    let url = `${API_BASE}/customers/${id}/ledger`;
    const params = new URLSearchParams();
    // FIX 2: Ensure dates are properly formatted and sent
    if (fromDate && fromDate.trim()) {
      // Convert to YYYY-MM-DD format if needed
      const formattedFromDate = formatDateForAPI(fromDate);
      params.append("fromDate", formattedFromDate);
    }
    if (toDate && toDate.trim()) {
      const formattedToDate = formatDateForAPI(toDate);
      params.append("toDate", formattedToDate);
    }
    if (params.toString()) url += `?${params.toString()}`;
    console.log("Fetching ledger with URL:", url); // Debug log
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    console.log("API Response:", data); // Debug log
    // FIX 1: Handle different possible response structures
    return {
      entries: data.entries || data.data?.entries || [],
      summary: {
        totalDebit: data.summary?.totalDebit || data.totalDebit || 0,
        totalCredit: data.summary?.totalCredit || data.totalCredit || 0,
        closingBalance: data.summary?.closingBalance || data.closingBalance || customer?.balance || 0
      }
    };
  },
  enabled: !!token && !!id,
});
// Helper function to format dates for API
// In your CustomerDetailScreen.tsx
function formatDateForAPI(dateString: string): string {
  if (!dateString || dateString.trim() === "") return "";
  // If already in YYYY-MM-DD format
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Validate it's a real date
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return dateString;
    }
  }
  // Handle DD-MM-YYYY format
  if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }
  // Handle DD/MM/YYYY format
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }
  console.warn("Invalid date format:", dateString);
  return "";
}
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCustomer(), refetchLedger()]);
    setRefreshing(false);
  };
// FIX: Improve filter handlers to ensure dates are properly set
const handleApplyFilter = () => {
  console.log("Applying filter - From:", fromDate, "To:", toDate); // Debug log
  // Validate dates
  if (fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) {
      alert("From date cannot be greater than To date");
      return;
    }
  }
  // Trigger refetch with new date parameters
  refetchLedger();
};
const handleClearFilter = () => {
  console.log("Clearing filters"); // Debug log
  setFromDate("");
  setToDate("");
  // Small delay to ensure state is updated before refetch
  setTimeout(() => {
    refetchLedger();
  }, 100);
};
async function generateLedgerPDF(
  customer: Customer,
  ledger: any,
  fromDate: string,
  toDate: string
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const entries = ledger.entries || [];
  const summary = ledger.summary || {
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: customer.balance
  };

  // ===== HEADER =====
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("CUSTOMER LEDGER", 14, 12);

  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text(customer.name, 14, 20);

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text(
    `Period: ${fromDate || "Start"} to ${toDate || "Today"}`,
    pageWidth - 14,
    20,
    { align: "right" }
  );

  doc.text(
    `Generated: ${fmtDate(new Date())} ${new Date().toLocaleTimeString("en-IN")}`,
    pageWidth - 14,
    26,
    { align: "right" }
  );

  // Customer details line
  let yOffset = 26;
  const details = [];
  if (customer.phone) details.push(`Phone: ${customer.phone}`);
  if (customer.address) details.push(`Address: ${customer.address}`);
  if (customer.gstNumber) details.push(`GST: ${customer.gstNumber}`);

  if (details.length > 0) {
    doc.text(details.join(" | "), 14, yOffset);
    yOffset += 6;
  }

  // ===== LEDGER TABLE =====
  const tableBody = entries
    .sort((a: LedgerEntry, b: LedgerEntry) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry: LedgerEntry) => [
      fmtDate(entry.date),
      entry.description + (entry.invoiceNo ? ` (INV: ${entry.invoiceNo})` : ""),
      entry.debit > 0 ? entry.debit.toLocaleString('en-IN') : "-",
      entry.credit > 0 ? entry.credit.toLocaleString('en-IN') : "-",
      `${Math.abs(entry.balance).toLocaleString('en-IN')} ${entry.balance > 0 ? "Dr" : "Cr"}`
    ]);

  autoTable(doc, {
    startY: yOffset + 4,
    head: [["Date", "Description", "Debit (Dr)", "Credit (Cr)", "Balance"]],
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fontStyle: "bold",
      fillColor: [98, 0, 238],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: "auto" },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 5;

  // ===== SUMMARY (SIMPLE LINE BELOW TABLE - NO BOXES) =====
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");

  doc.text(
    `Total Debit: ${summary.totalDebit.toLocaleString('en-IN')}    |    Total Credit: ${summary.totalCredit.toLocaleString('en-IN')}    |    Closing Balance: ${Math.abs(summary.closingBalance).toLocaleString('en-IN')} ${summary.closingBalance > 0 ? "Dr" : "Cr"}    |    Outstanding: ${Math.abs(customer.balance).toLocaleString('en-IN')} ${customer.balance > 0 ? "Dr" : "Cr"}`,
    14,
    finalY
  );

  // ===== FOOTER =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.height - 6,
      { align: "right" }
    );
  }

  return doc;
}
// Helper function for date formatting
const fmtDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const fmtDateForFilename = (date: Date) => {
  return date.toISOString().split('T')[0];
};
const generatePDFReport = async () => {
  if (!customer || !ledger) return;
  setGeneratingPdf(true);
  try {
    const doc = await generateLedgerPDF(customer, ledger, fromDate, toDate);
    const fileName = `Ledger_${customer.name.replace(/\s/g, "_")}_${fmtDateForFilename(new Date())}.pdf`;

    // For web platform
    if (Platform.OS === "web") {
      doc.save(fileName);
      alert("PDF downloaded successfully!");
    } else {
      // For Android - save and share
      // You'll need expo-file-system for native, but for now:
      alert("PDF generated! Check your downloads folder.");
      doc.save(fileName); // This works on Android too if jspdf is configured
    }
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate report: " + error?.message);
  } finally {
    setGeneratingPdf(false);
    setShowPdfModal(false);
  }
};
  if (customerLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Customer" showBack />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[{ color: colors.mutedForeground, marginTop: 12 }]}>Loading customer details...</Text>
        </View>
      </View>
    );
  }
  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Customer" showBack />
        <View style={styles.loading}>
          <Text style={[{ color: colors.mutedForeground }]}>Customer not found</Text>
        </View>
      </View>
    );
  }
 // FIX: Update the summary display to use proper values
const totalDebit = ledger?.summary?.totalDebit || 0;
const totalCredit = ledger?.summary?.totalCredit || 0;
const closingBalance = ledger?.summary?.closingBalance ?? customer?.balance ?? 0;
// Add debug logging for summary values
console.log("Summary values:", { totalDebit, totalCredit, closingBalance });
console.log("Ledger data:", ledger);  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={customer.name} showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Customer Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <Feather name="user" size={20} color={colors.primary} />
            <Text style={[styles.customerName, { color: colors.foreground }]}>{customer.name}</Text>
          </View>
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
  {customer.phone && (
    <View style={styles.infoRow}>
      <Feather name="phone" size={16} color={colors.mutedForeground} />
      <Text style={[styles.infoText, { color: colors.foreground }]}>{customer.phone}</Text>
    </View>
  )}
  {customer.email && (
    <View style={styles.infoRow}>
      <Feather name="mail" size={16} color={colors.mutedForeground} />
      <Text style={[styles.infoText, { color: colors.foreground }]}>{customer.email}</Text>
    </View>
  )}
  {customer.address && (
    <View style={styles.infoRow}>
      <Feather name="map-pin" size={16} color={colors.mutedForeground} />
      <Text style={[styles.infoText, { color: colors.foreground }]}>{customer.address}</Text>
    </View>
  )}
  {customer.gstNumber && (
    <View style={styles.infoRow}>
      <Feather name="credit-card" size={16} color={colors.mutedForeground} />
      <Text style={[styles.infoText, { color: colors.foreground }]}>GST: {customer.gstNumber}</Text>
    </View>
  )}
</View>
        </View>
        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}
            onPress={() => router.push("/sales/new")}
            activeOpacity={0.8}
          >
            <Feather name="file-text" size={18} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>New Sale</Text>
          </TouchableOpacity>
          {customer.balance > 0 ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
              onPress={() => router.push(`/payments/new?partyType=customer&partyId=${id}` as any)}
              activeOpacity={0.8}
            >
              <Feather name="credit-card" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Collect Payment</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
            onPress={() => setShowPdfModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="download" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>PDF Report</Text>
          </TouchableOpacity>
        </View>
        {/* Date Filter Section - Using native date input on Android */}
        <View style={[styles.filterSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
<View style={styles.dateInputs}>
  <View style={styles.dateInputWrapper}>
    <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>From Date</Text>
    {Platform.OS === 'web' ? (
      <input
        type="date"
        value={fromDate}
        onChange={(e) => {
          const newDate = e.target.value;
          setFromDate(newDate);
          console.log("From date changed to:", newDate);
        }}
        style={{
          width: '85%',
          padding: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.foreground,
          fontSize: 13,
          fontFamily: 'Inter_400Regular',
        }}
      />
    ) : (
      <TextInput
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.mutedForeground + "80"}
        value={fromDate}
        onChangeText={(text) => {
          // Only allow valid date format or empty string
          if (text === "" || text.match(/^\d{4}-\d{2}-\d{2}$/)) {
            setFromDate(text);
          }
        }}
        style={[
          styles.dateInput,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
      />
    )}
  </View>
  <View style={styles.dateInputWrapper}>
    <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>To Date</Text>
    {Platform.OS === 'web' ? (
      <input
        type="date"
        value={toDate}
        onChange={(e) => {
          const newDate = e.target.value;
          setToDate(newDate);
          console.log("To date changed to:", newDate);
        }}
        style={{
          width: '85%',
          padding: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.foreground,
          fontSize: 13,
          fontFamily: 'Inter_400Regular',
        }}
      />
    ) : (
      <TextInput
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.mutedForeground + "80"}
        value={toDate}
        onChangeText={(text) => {
          // Only allow valid date format or empty string
          if (text === "" || text.match(/^\d{4}-\d{2}-\d{2}$/)) {
            setToDate(text);
          }
        }}
        style={[
          styles.dateInput,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
      />
    )}
  </View>
</View>
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: colors.primary }]}
              onPress={handleApplyFilter}
            >
              <Feather name="search" size={14} color="#fff" />
              <Text style={styles.filterBtnText}>Apply Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: colors.mutedForeground + "20", borderColor: colors.border }]}
              onPress={handleClearFilter}
            >
              <Feather name="x" size={14} color={colors.foreground} />
              <Text style={[styles.filterBtnText, { color: colors.foreground }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Ledger Table with Horizontal Scroll */}
        {ledger?.entries && ledger.entries.length > 0 ? (
          <View style={styles.ledgerSection}>
            <View style={styles.ledgerHeader}>
              <Text style={[styles.secTitle, { color: colors.mutedForeground }]}>
                TRANSACTION HISTORY ({ledger.entries.length} entries)
              </Text>
              {ledgerLoading && <ActivityIndicator size="small" color={colors.primary} />}
            </View>
            {/* Horizontal Scroll View for Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Table Header */}
                <View style={[styles.tableHeader, { backgroundColor: colors.primary + "15", borderBottomColor: colors.border }]}>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, width: 100 }]}>Date</Text>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, width: 180 }]}>Description</Text>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, width: 100, textAlign: "right" }]}>Debit ()</Text>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, width: 100, textAlign: "right" }]}>Credit ()</Text>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, width: 110, textAlign: "right" }]}>Balance ()</Text>
                </View>
                {/* Table Rows */}
                {ledger.entries.map((entry: LedgerEntry, index: number) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.tableRow,
                      index !== ledger.entries.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                      index % 2 === 0 && { backgroundColor: colors.mutedForeground + "5" },
                    ]}
                  >
                    <Text style={[styles.tableCell, { color: colors.foreground, width: 100 }]}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Text>
                    <View style={{ width: 180 }}>
                      <Text style={[styles.tableCell, { color: colors.foreground }]} numberOfLines={1}>
                        {entry.description}
                      </Text>
                      {entry.invoiceNo ? (
                        <Text style={[styles.invoiceNo, { color: colors.mutedForeground }]}>
                          INV: {entry.invoiceNo}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.tableCell, { color: colors.destructive, width: 100, textAlign: "right" }]}>
                      {entry.debit > 0 ? `${entry.debit.toFixed(2)}` : "-"}
                    </Text>
                    <Text style={[styles.tableCell, { color: colors.success, width: 100, textAlign: "right" }]}>
                      {entry.credit > 0 ? `${entry.credit.toFixed(2)}` : "-"}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: 110, textAlign: "right" },
                        entry.balance > 0 ? { color: colors.destructive } : { color: colors.success },
                      ]}
                    >
                      {Math.abs(entry.balance).toFixed(2)} {entry.balance > 0 ? "Dr" : "Cr"}
                    </Text>
                  </View>
                ))}
                {/* Footer Total Row */}
                <View style={[styles.tableFooter, { borderTopColor: colors.border, backgroundColor: colors.mutedForeground + "10" }]}>
                  <Text style={[styles.tableFooterText, { color: colors.foreground, width: 280 }]}>Total</Text>
                  <Text style={[styles.tableFooterText, { color: colors.destructive, width: 100, textAlign: "right" }]}>
                    {totalDebit.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableFooterText, { color: colors.success, width: 100, textAlign: "right" }]}>
                    {totalCredit.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableFooterText, { width: 110, textAlign: "right" }, closingBalance > 0 ? { color: colors.destructive } : { color: colors.success }]}>
                    {Math.abs(closingBalance).toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No ledger entries found</Text>
            <Text style={[styles.emptySubText, { color: colors.mutedForeground + "80" }]}>
              {fromDate || toDate ? "Try changing the date filter" : "Create a sale or record a payment to get started"}
            </Text>
          </View>
        )}
      </ScrollView>
      {/* PDF Options Modal */}
      <Modal
        visible={showPdfModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPdfModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Export Report</Text>
              <TouchableOpacity onPress={() => setShowPdfModal(false)}>
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Feather name="file-text" size={40} color={colors.primary} />
              <Text style={[styles.modalText, { color: colors.foreground }]}>
                Generate complete ledger report
              </Text>
              <Text style={[styles.modalSubText, { color: colors.mutedForeground }]}>
                Customer: {customer.name}
              </Text>
              <Text style={[styles.modalSubText, { color: colors.mutedForeground }]}>
                Period: {fromDate || "Start"} to {toDate || "Today"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={generatePDFReport}
              disabled={generatingPdf}
            >
              {generatingPdf ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <React.Fragment>
                  <Feather name="download" size={18} color="#fff" />
                  <Text style={styles.modalBtnText}>Generate Report</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
function generateLedgerHTML(customer: Customer, ledger: any, fromDate: string, toDate: string): string {
  const entries = ledger.entries || [];
  const summary = ledger.summary || { totalDebit: 0, totalCredit: 0, closingBalance: customer.balance };
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Ledger - ${customer.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 16px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #6200ee 0%, #3700b3 100%);
      color: white;
      padding: 24px;
    }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { opacity: 0.87; font-size: 13px; }
    .info-section {
      padding: 20px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .info-item { font-size: 13px; }
    .info-label { font-weight: 600; color: #666; }
    .balance-section {
      padding: 20px 24px;
      background: #fff3e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .balance-label { font-size: 16px; font-weight: 500; color: #e65100; }
    .balance-amount { font-size: 28px; font-weight: bold; color: #e65100; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 20px 24px;
      background: #f5f5f5;
    }
    .summary-card {
      background: white;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .summary-label { font-size: 12px; color: #666; margin-bottom: 8px; }
    .summary-value { font-size: 20px; font-weight: bold; }
    .debit { color: #dc3545; }
    .credit { color: #28a745; }
    .table-wrapper { padding: 0 24px 24px 24px; overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      min-width: 800px;
    }
    th {
      background: #6200ee;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 500;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }
    .text-right { text-align: right; }
    .footer {
      padding: 16px 24px;
      background: #fafafa;
      text-align: center;
      font-size: 11px;
      color: #999;
      border-top: 1px solid #e0e0e0;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Customer Ledger Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <div class="info-section">
      <div class="info-item"><span class="info-label">Customer Name:</span> ${customer.name}</div>
      ${customer.phone ? `<div class="info-item"><span class="info-label">Phone:</span> ${customer.phone}</div>` : ""}
      ${customer.email ? `<div class="info-item"><span class="info-label">Email:</span> ${customer.email}</div>` : ""}
      ${customer.gstNumber ? `<div class="info-item"><span class="info-label">GST Number:</span> ${customer.gstNumber}</div>` : ""}
      <div class="info-item"><span class="info-label">Report Period:</span> ${fromDate || "Start"} to ${toDate || "Today"}</div>
    </div>
    <div class="balance-section">
      <span class="balance-label">Outstanding Balance</span>
      <span class="balance-amount">${Math.abs(customer.balance).toLocaleString("en-IN")} ${customer.balance > 0 ? "Dr" : "Cr"}</span>
    </div>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">Total Debit</div>
        <div class="summary-value debit">${summary.totalDebit.toLocaleString("en-IN")}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Total Credit</div>
        <div class="summary-value credit">${summary.totalCredit.toLocaleString("en-IN")}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Closing Balance</div>
        <div class="summary-value ${summary.closingBalance > 0 ? 'debit' : 'credit'}">${Math.abs(summary.closingBalance).toLocaleString("en-IN")}</div>
      </div>
    </div>
    <div class="table-wrapper">
      <h3 style="margin-bottom: 16px;">Transaction Details</h3>
      ${entries.length > 0 ? `
      <table>
        <thead>
          <tr><th>Date</th><th>Description</th><th class="text-right">Debit ()</th><th class="text-right">Credit ()</th><th class="text-right">Balance ()</th></tr>
        </thead>
        <tbody>
          ${entries.map((e: any) => `
            <tr>
              <td>${new Date(e.date).toLocaleDateString("en-IN")}</td>
              <td>${e.description}${e.invoiceNo ? ` (INV: ${e.invoiceNo})` : ""}</td>
              <td class="text-right debit">${e.debit > 0 ? `${e.debit.toLocaleString("en-IN")}` : "-"}</td>
              <td class="text-right credit">${e.credit > 0 ? `${e.credit.toLocaleString("en-IN")}` : "-"}</td>
              <td class="text-right ${e.balance > 0 ? 'debit' : 'credit'}">${Math.abs(e.balance).toLocaleString("en-IN")} ${e.balance > 0 ? "Dr" : "Cr"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ` : "<p style='text-align: center; padding: 40px; color: #999;'>No transactions found</p>"}
    </div>
    <div class="footer">
      <p>Computer generated report - No signature required</p>
      <p>${customer.name} - Customer Ledger Report</p>
    </div>
  </div>
</body>
</html>`;
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  customerName: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  infoText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  balanceRow: { borderTopWidth: 1, paddingTop: 14, marginTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  balance: { fontSize: 22, fontFamily: "Inter_700Bold" },
  actions: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 12 },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  filterSection: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 20 },
  filterTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  dateInputs: { flexDirection: "row", gap: 12, marginBottom: 12 },
  dateInputWrapper: { flex: 1 },
  dateLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  dateInput: { padding: 10, borderRadius: 8, borderWidth: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  filterActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  filterBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
  filterBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryContainer: { flexDirection: "row", gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 2 },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  summarySubLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  ledgerSection: { marginBottom: 16 },
  ledgerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  secTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  tableContainer: { borderWidth: 1, borderRadius: 8, overflow: "hidden", minWidth: 590 },
  tableHeader: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1 },
  tableHeaderText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12 },
  tableCell: { fontSize: 12, fontFamily: "Inter_400Regular" },
  invoiceNo: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  tableFooter: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: 1, marginTop: 0 },
  tableFooterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  emptyState: { borderRadius: 12, borderWidth: 1, padding: 40, alignItems: "center", gap: 12, marginTop: 20 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  emptySubText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0" },
  modalTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  modalBody: { padding: 24, alignItems: "center", gap: 12 },
  modalText: { fontSize: 16, fontFamily: "Inter_500Medium", textAlign: "center" },
  modalSubText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  modalBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, margin: 20, marginTop: 0, borderRadius: 10 },
  modalBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});