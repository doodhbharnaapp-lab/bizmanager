// // import React, { useState } from "react";
// // import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
// // import { useSafeAreaInsets } from "react-native-safe-area-context";
// // import { router, useLocalSearchParams } from "expo-router";
// // import { Feather } from "@expo/vector-icons";
// // import { useQueryClient, useQuery } from "@tanstack/react-query";
// // import { useColors } from "@/hooks/useColors";
// // import { useAuth } from "@/context/AuthContext";
// // import { FormField } from "@/components/FormField";
// // import { SelectField } from "@/components/SelectField";
// // import { AppHeader } from "@/components/AppHeader";
// // const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
// // export default function NewPaymentScreen() {
// //   const colors = useColors();
// //   const insets = useSafeAreaInsets();
// //   const { token } = useAuth();
// //   const qc = useQueryClient();
// //   const { partyType: pt, partyId: pid } = useLocalSearchParams();
// //   const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
// //   const [partyType, setPartyType] = useState((pt as string) || "customer");
// //   const [partyId, setPartyId] = useState((pid as string) || "");
// //   const [amount, setAmount] = useState("");
// //   const [paymentMode, setPaymentMode] = useState("cash");
// //   const [notes, setNotes] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const { data: customers = [] } = useQuery({
// //     queryKey: ["customers"],
// //     queryFn: async () => {
// //       const r = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
// //       return r.json();
// //     },
// //     enabled: !!token,
// //   });
// //   const { data: suppliers = [] } = useQuery({
// //     queryKey: ["suppliers"],
// //     queryFn: async () => {
// //       const r = await fetch(`${API_BASE}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
// //       return r.json();
// //     },
// //     enabled: !!token,
// //   });
// //   const partyOptions = partyType === "customer"
// //     ? customers.map((c: any) => ({ label: `${c.name}${c.balance > 0 ? ` (Due ${c.balance.toFixed(0)})` : ""}`, value: String(c.id) }))
// //     : suppliers.map((s: any) => ({ label: `${s.name}${s.balance > 0 ? ` (Due ${s.balance.toFixed(0)})` : ""}`, value: String(s.id) }));
// //   const selectedParty = partyType === "customer"
// //     ? customers.find((c: any) => String(c.id) === partyId)
// //     : suppliers.find((s: any) => String(s.id) === partyId);
// //   const handlePartyTypeChange = (v: string) => {
// //     setPartyType(v);
// //     setPartyId("");
// //   };
// //   const handleSubmit = async () => {
// //     if (!partyId) { Alert.alert("Please select a " + partyType); return; }
// //     if (!amount || parseFloat(amount) <= 0) { Alert.alert("Enter a valid amount"); return; }
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE}/payments`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
// //         body: JSON.stringify({
// //           partyType,
// //           partyId: parseInt(partyId),
// //           amount: parseFloat(amount),
// //           paymentMode,
// //           notes,
// //         }),
// //       });
// //       if (!res.ok) {
// //         const err = await res.json();
// //         throw new Error(err.error || "Failed");
// //       }
// //       qc.invalidateQueries();
// //       Alert.alert("Success", "Payment recorded successfully", [{ text: "OK", onPress: () => router.back() }]);
// //     } catch (e: any) {
// //       Alert.alert("Error", e.message || "Failed to record payment");
// //     }
// //     setLoading(false);
// //   };
// //   return (
// //     <View style={[styles.container, { backgroundColor: colors.background }]}>
// //       <AppHeader title="Record Payment" showBack />
// //       <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">
// //         <SelectField
// //           label="Party Type"
// //           value={partyType}
// //           onSelect={handlePartyTypeChange}
// //           options={[{ label: "Customer (collecting payment)", value: "customer" }, { label: "Supplier (making payment)", value: "supplier" }]}
// //         />
// //         <SelectField
// //           label={partyType === "customer" ? "Customer *" : "Supplier *"}
// //           value={partyId}
// //           onSelect={setPartyId}
// //           placeholder={`Select ${partyType}...`}
// //           options={partyOptions}
// //         />
// //         {selectedParty && selectedParty.balance > 0 && (
// //           <View style={[styles.balanceInfo, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
// //             <Feather name="info" size={16} color={colors.warning} />
// //             <Text style={[styles.balanceText, { color: colors.warning }]}>
// //               Outstanding due: {selectedParty.balance.toFixed(2)}
// //             </Text>
// //             <TouchableOpacity onPress={() => setAmount(String(selectedParty.balance.toFixed(2)))}>
// //               <Text style={[styles.fillBtn, { color: colors.warning }]}>Fill</Text>
// //             </TouchableOpacity>
// //           </View>
// //         )}
// //         <FormField
// //           label="Amount () *"
// //           value={amount}
// //           onChangeText={setAmount}
// //           placeholder="0.00"
// //           keyboardType="numeric"
// //         />
// //         <SelectField
// //           label="Payment Mode"
// //           value={paymentMode}
// //           onSelect={setPaymentMode}
// //           options={[
// //             { label: "Cash", value: "cash" },
// //             { label: "UPI", value: "upi" },
// //             { label: "Bank Transfer", value: "bank" },
// //             { label: "Cheque", value: "cheque" },
// //           ]}
// //         />
// //         <FormField
// //           label="Notes (Optional)"
// //           value={notes}
// //           onChangeText={setNotes}
// //           placeholder="Reference number, remarks..."
// //           multiline
// //           numberOfLines={2}
// //           style={{ height: 70, textAlignVertical: "top" }}
// //         />
// //         <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
// //           <Text style={[styles.summaryTitle, { color: colors.mutedForeground }]}>PAYMENT SUMMARY</Text>
// //           <View style={styles.summaryRow}>
// //             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Party</Text>
// //             <Text style={[styles.summaryValue, { color: colors.foreground }]}>{selectedParty?.name || "—"}</Text>
// //           </View>
// //           <View style={styles.summaryRow}>
// //             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Amount</Text>
// //             <Text style={[styles.summaryAmount, { color: colors.primary }]}>{amount || "0.00"}</Text>
// //           </View>
// //           <View style={styles.summaryRow}>
// //             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Via</Text>
// //             <Text style={[styles.summaryValue, { color: colors.foreground }]}>{paymentMode.toUpperCase()}</Text>
// //           </View>
// //         </View>
// //         <TouchableOpacity
// //           style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]}
// //           onPress={handleSubmit}
// //           disabled={loading}
// //           activeOpacity={0.85}
// //         >
// //           {loading ? (
// //             <ActivityIndicator color="#FFF" />
// //           ) : (
// //             <>
// //               <Feather name="check-circle" size={20} color="#FFF" />
// //               <Text style={styles.submitText}>
// //                 {partyType === "customer" ? "Collect Payment" : "Record Payment"}
// //               </Text>
// //             </>
// //           )}
// //         </TouchableOpacity>
// //       </ScrollView>
// //     </View>
// //   );
// // }
// // const styles = StyleSheet.create({
// //   container: { flex: 1 },
// //   content: { padding: 16 },
// //   balanceInfo: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
// //   balanceText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
// //   fillBtn: { fontSize: 13, fontFamily: "Inter_700Bold", textDecorationLine: "underline" },
// //   summaryBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
// //   summaryTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
// //   summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
// //   summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
// //   summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
// //   summaryAmount: { fontSize: 22, fontFamily: "Inter_700Bold" },
// //   submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16, marginTop: 4 },
// //   submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },
// // });
// import React, { useState } from "react";
// import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput, Modal } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router, useLocalSearchParams } from "expo-router";
// import { Feather } from "@expo/vector-icons";
// import { useQueryClient, useQuery } from "@tanstack/react-query";
// import { useColors } from "@/hooks/useColors";
// import { useAuth } from "@/context/AuthContext";
// import { FormField } from "@/components/FormField";
// import { SelectField } from "@/components/SelectField";
// import { AppHeader } from "@/components/AppHeader";
// const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
// export default function NewPaymentScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { token } = useAuth();
//   const qc = useQueryClient();
//   const { partyType: pt, partyId: pid } = useLocalSearchParams();
//   const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
//   const [partyType, setPartyType] = useState((pt as string) || "customer");
//   const [partyId, setPartyId] = useState((pid as string) || "");
//   const [amount, setAmount] = useState("");
//   const [paymentMode, setPaymentMode] = useState("cash");
//   const [notes, setNotes] = useState("");
//   const [paymentDate, setPaymentDate] = useState(() => {
//     // Default to today's date in YYYY-MM-DD format
//     const today = new Date();
//     return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
//   });
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { data: customers = [] } = useQuery({
//     queryKey: ["customers"],
//     queryFn: async () => {
//       const r = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
//       return r.json();
//     },
//     enabled: !!token,
//   });
//   const { data: suppliers = [] } = useQuery({
//     queryKey: ["suppliers"],
//     queryFn: async () => {
//       const r = await fetch(`${API_BASE}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
//       return r.json();
//     },
//     enabled: !!token,
//   });
//   const partyOptions = partyType === "customer"
//     ? customers.map((c: any) => ({ label: `${c.name}${c.balance > 0 ? ` (Due ${c.balance.toFixed(0)})` : ""}`, value: String(c.id) }))
//     : suppliers.map((s: any) => ({ label: `${s.name}${s.balance > 0 ? ` (Due ${s.balance.toFixed(0)})` : ""}`, value: String(s.id) }));
//   const selectedParty = partyType === "customer"
//     ? customers.find((c: any) => String(c.id) === partyId)
//     : suppliers.find((s: any) => String(s.id) === partyId);
//   const handlePartyTypeChange = (v: string) => {
//     setPartyType(v);
//     setPartyId("");
//   };
// const handleSubmit = async () => {
//   if (!partyId) { Alert.alert("Please select a " + partyType); return; }
//   if (!amount || parseFloat(amount) <= 0) { Alert.alert("Enter a valid amount"); return; }
//   if (!paymentDate) { Alert.alert("Please select payment date"); return; }
//   setLoading(true);
//   try {
//     const res = await fetch(`${API_BASE}/payments`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       body: JSON.stringify({
//         partyType,
//         partyId: parseInt(partyId),
//         amount: parseFloat(amount),
//         paymentMode,
//         notes,
//         date: paymentDate,
//       }),
//     });
//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.error || "Failed");
//     }
//     qc.invalidateQueries();
//     // ✅ RESET FORM AFTER SUCCESS
//     setPartyId("");
//     setAmount("");
//     setPaymentMode("cash");
//     setNotes("");
//     // Reset to today's date
//     const today = new Date();
//     setPaymentDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
//     Alert.alert("Success", "Payment recorded successfully", [
//       {
//         text: "OK",
//         onPress: () => {
//           // Optional: Stay on same screen for next entry
//           // router.back(); // Remove this if you want to stay
//         }
//       }
//     ]);
//   } catch (e: any) {
//     Alert.alert("Error", e.message || "Failed to record payment");
//   }
//   setLoading(false);
// };
//   // Simple date picker modal
//   const DatePickerModal = () => {
//     const [year, setYear] = useState(paymentDate.split('-')[0]);
//     const [month, setMonth] = useState(paymentDate.split('-')[1]);
//     const [day, setDay] = useState(paymentDate.split('-')[2]);
//     const handleConfirm = () => {
//       const newDate = `${year}-${month}-${day}`;
//       setPaymentDate(newDate);
//       setShowDatePicker(false);
//     };
//     return (
//       <Modal
//         visible={showDatePicker}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowDatePicker(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
//             <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Payment Date</Text>
//             <View style={styles.datePickerRow}>
//               <View style={styles.datePickerColumn}>
//                 <Text style={[styles.datePickerLabel, { color: colors.mutedForeground }]}>Year</Text>
//                 <TextInput
//                   value={year}
//                   onChangeText={setYear}
//                   placeholder="YYYY"
//                   keyboardType="numeric"
//                   maxLength={4}
//                   style={[styles.datePickerInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
//                 />
//               </View>
//               <View style={styles.datePickerColumn}>
//                 <Text style={[styles.datePickerLabel, { color: colors.mutedForeground }]}>Month</Text>
//                 <TextInput
//                   value={month}
//                   onChangeText={setMonth}
//                   placeholder="MM"
//                   keyboardType="numeric"
//                   maxLength={2}
//                   style={[styles.datePickerInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
//                 />
//               </View>
//               <View style={styles.datePickerColumn}>
//                 <Text style={[styles.datePickerLabel, { color: colors.mutedForeground }]}>Day</Text>
//                 <TextInput
//                   value={day}
//                   onChangeText={setDay}
//                   placeholder="DD"
//                   keyboardType="numeric"
//                   maxLength={2}
//                   style={[styles.datePickerInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
//                 />
//               </View>
//             </View>
//             <View style={styles.modalActions}>
//               <TouchableOpacity onPress={() => setShowDatePicker(false)} style={[styles.modalBtn, { backgroundColor: colors.mutedForeground + "20" }]}>
//                 <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleConfirm} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
//                 <Text style={[styles.modalBtnText, { color: "#fff" }]}>Confirm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <AppHeader title="Record Payment" showBack />
//       <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">
//         <SelectField
//           label="Party Type"
//           value={partyType}
//           onSelect={handlePartyTypeChange}
//           options={[
//             { label: "Customer (collecting payment)", value: "customer" },
//             { label: "Supplier (making payment)", value: "supplier" }
//           ]}
//         />
//         <SelectField
//           label={partyType === "customer" ? "Customer *" : "Supplier *"}
//           value={partyId}
//           onSelect={setPartyId}
//           placeholder={`Select ${partyType}...`}
//           options={partyOptions}
//         />
//         {selectedParty && selectedParty.balance > 0 && (
//           <View style={[styles.balanceInfo, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
//             <Feather name="info" size={16} color={colors.warning} />
//             <Text style={[styles.balanceText, { color: colors.warning }]}>
//               Outstanding due: {selectedParty.balance.toFixed(2)}
//             </Text>
//             <TouchableOpacity onPress={() => setAmount(String(selectedParty.balance.toFixed(2)))}>
//               <Text style={[styles.fillBtn, { color: colors.warning }]}>Fill</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         {/* NEW: Payment Date Field */}
//         <View style={[styles.dateField, { borderColor: colors.border }]}>
//           <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Payment Date *</Text>
//           <TouchableOpacity
//             style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
//             onPress={() => setShowDatePicker(true)}
//           >
//             <Feather name="calendar" size={18} color={colors.primary} />
//             <Text style={[styles.dateButtonText, { color: colors.foreground }]}>
//               {new Date(paymentDate).toLocaleDateString('en-IN')}
//             </Text>
//             <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
//           </TouchableOpacity>
//         </View>
//         <FormField
//           label="Amount () *"
//           value={amount}
//           onChangeText={setAmount}
//           placeholder="0.00"
//           keyboardType="numeric"
//         />
//         <SelectField
//           label="Payment Mode"
//           value={paymentMode}
//           onSelect={setPaymentMode}
//           options={[
//             { label: "Cash", value: "cash" },
//             { label: "UPI", value: "upi" },
//             { label: "Bank Transfer", value: "bank" },
//             { label: "Cheque", value: "cheque" },
//           ]}
//         />
//         <FormField
//           label="Notes (Optional)"
//           value={notes}
//           onChangeText={setNotes}
//           placeholder="Reference number, remarks..."
//           multiline
//           numberOfLines={2}
//           style={{ height: 70, textAlignVertical: "top" }}
//         />
//         <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
//           <Text style={[styles.summaryTitle, { color: colors.mutedForeground }]}>PAYMENT SUMMARY</Text>
//           <View style={styles.summaryRow}>
//             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Date</Text>
//             <Text style={[styles.summaryValue, { color: colors.foreground }]}>{new Date(paymentDate).toLocaleDateString('en-IN')}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Party</Text>
//             <Text style={[styles.summaryValue, { color: colors.foreground }]}>{selectedParty?.name || "—"}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Amount</Text>
//             <Text style={[styles.summaryAmount, { color: colors.primary }]}>{amount || "0.00"}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Via</Text>
//             <Text style={[styles.summaryValue, { color: colors.foreground }]}>{paymentMode.toUpperCase()}</Text>
//           </View>
//         </View>
//         <TouchableOpacity
//           style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]}
//           onPress={handleSubmit}
//           disabled={loading}
//           activeOpacity={0.85}
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFF" />
//           ) : (
//             <>
//               <Feather name="check-circle" size={20} color="#FFF" />
//               <Text style={styles.submitText}>
//                 {partyType === "customer" ? "Collect Payment" : "Record Payment"}
//               </Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//       <DatePickerModal />
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   content: { padding: 16 },
//   balanceInfo: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
//   balanceText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
//   fillBtn: { fontSize: 13, fontFamily: "Inter_700Bold", textDecorationLine: "underline" },
//   summaryBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
//   summaryTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
//   summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
//   summaryAmount: { fontSize: 22, fontFamily: "Inter_700Bold" },
//   submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16, marginTop: 4 },
//   submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },
//   // New date picker styles
//   dateField: { marginBottom: 16 },
//   dateLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
//   dateButton: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
//   dateButtonText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
//   modalContent: { width: "80%", borderRadius: 16, borderWidth: 1, padding: 20 },
//   modalTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 20, textAlign: "center" },
//   datePickerRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
//   datePickerColumn: { flex: 1 },
//   datePickerLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
//   datePickerInput: { padding: 10, borderRadius: 8, borderWidth: 1, textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
//   modalActions: { flexDirection: "row", gap: 12 },
//   modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
//   modalBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
// });


import React, { useState, useRef } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput, Modal } from "react-native";
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
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const amountInputRef = useRef<any>(null);

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
    ? customers.map((c: any) => ({ label: `${c.name}${c.balance > 0 ? ` (Due ${c.balance.toFixed(0)})` : ""}`, value: String(c.id) }))
    : suppliers.map((s: any) => ({ label: `${s.name}${s.balance > 0 ? ` (Due ${s.balance.toFixed(0)})` : ""}`, value: String(s.id) }));

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
    if (!paymentDate) { Alert.alert("Please select payment date"); return; }

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
          date: paymentDate,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      qc.invalidateQueries();

      // Reset form
      setPartyId("");
      setAmount("");
      setPaymentMode("cash");
      setNotes("");
      const today = new Date();
      setPaymentDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);

      amountInputRef?.current?.focus();

      Alert.alert("Success", "Payment recorded successfully. You can add another payment.");

    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to record payment");
    }
    setLoading(false);
  };

  const DatePickerModal = () => {
    const [year, setYear] = useState(paymentDate.split('-')[0]);
    const [month, setMonth] = useState(paymentDate.split('-')[1]);
    const [day, setDay] = useState(paymentDate.split('-')[2]);

    const handleConfirm = () => {
      const newDate = `${year}-${month}-${day}`;
      setPaymentDate(newDate);
      setShowDatePicker(false);
    };

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Payment Date</Text>

            <View style={styles.datePickerRow}>
              <View style={styles.datePickerColumn}>
                <Text style={[styles.datePickerLabel, { color: colors.mutedForeground }]}>Year</Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                  style={[styles.datePickerInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                />
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={[styles.datePickerLabel, { color: colors.mutedForeground }]}>Month</Text>
                <TextInput
                  value={month}
                  onChangeText={setMonth}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                  style={[styles.datePickerInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                />
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={[styles.datePickerLabel, { color: colors.mutedForeground }]}>Day</Text>
                <TextInput
                  value={day}
                  onChangeText={setDay}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                  style={[styles.datePickerInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={[styles.modalBtn, { backgroundColor: colors.mutedForeground + "20" }]}>
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Record Payment" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">

        {/* Row 1: Party Type + Payment Date */}
        <View style={styles.gridRow}>
          <View style={styles.gridHalf}>
            <SelectField
              label="Party Type"
              value={partyType}
              onSelect={handlePartyTypeChange}
              options={[
                { label: "Customer", value: "customer" },
                { label: "Supplier", value: "supplier" }
              ]}
            />
          </View>
          <View style={styles.gridHalf}>
            <View style={styles.dateField}>
              <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Payment Date *</Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={18} color={colors.primary} />
                <Text style={[styles.dateButtonText, { color: colors.foreground }]}>
                  {new Date(paymentDate).toLocaleDateString('en-IN')}
                </Text>
                <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Row 2: Party Select (Full Width) */}
        <SelectField
          label={partyType === "customer" ? "Customer *" : "Supplier *"}
          value={partyId}
          onSelect={setPartyId}
          placeholder={`Select ${partyType}...`}
          options={partyOptions}
        />

        {/* Balance Info (Full Width) */}
        {selectedParty && selectedParty.balance > 0 && (
          <View style={[styles.balanceInfo, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
            <Feather name="info" size={16} color={colors.warning} />
            <Text style={[styles.balanceText, { color: colors.warning }]}>
              Outstanding due: {selectedParty.balance.toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => setAmount(String(selectedParty.balance.toFixed(2)))}>
              <Text style={[styles.fillBtn, { color: colors.warning }]}>Fill</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Row 3: Amount + Payment Mode */}
        <View style={styles.gridRow}>
          <View style={styles.gridHalf}>
            <FormField
              label="Amount () *"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              inputRef={amountInputRef}
            />
          </View>
          <View style={styles.gridHalf}>
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
          </View>
        </View>

        {/* Row 4: Notes (Full Width) */}
        <FormField
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Reference number, remarks..."
          multiline
          numberOfLines={2}
          style={{ height: 70, textAlignVertical: "top" }}
        />

        {/* Summary Box */}
        <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.mutedForeground }]}>PAYMENT SUMMARY</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Date</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{new Date(paymentDate).toLocaleDateString('en-IN')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Party</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]} numberOfLines={1}>{selectedParty?.name || "—"}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Amount</Text>
              <Text style={[styles.summaryAmount, { color: colors.primary }]}>₹{amount || "0"}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Via</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{paymentMode.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
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

      <DatePickerModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },

  // Grid styles
  gridRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
  gridHalf: { flex: 1 },

  balanceInfo: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  balanceText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  fillBtn: { fontSize: 13, fontFamily: "Inter_700Bold", textDecorationLine: "underline" },

  // Date field
  dateField: { marginBottom: 16 },
  dateLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  dateButton: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  dateButtonText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  // Summary grid
  summaryBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  summaryTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 12 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryItem: { flex: 1, minWidth: "45%" },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  summaryAmount: { fontSize: 18, fontFamily: "Inter_700Bold" },

  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16, marginTop: 8 },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "80%", borderRadius: 16, borderWidth: 1, padding: 20 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 20, textAlign: "center" },
  datePickerRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  datePickerColumn: { flex: 1 },
  datePickerLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  datePickerInput: { padding: 10, borderRadius: 8, borderWidth: 1, textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  modalBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});