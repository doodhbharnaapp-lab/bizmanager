// import React, { useState } from "react";
// import { ScrollView, View, Text, StyleSheet, Platform, RefreshControl } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useQuery } from "@tanstack/react-query";
// import { useColors } from "@/hooks/useColors";
// import { useAuth } from "@/context/AuthContext";
// import { AppHeader } from "@/components/AppHeader";
// import { SearchBar } from "@/components/SearchBar";
// import { Badge } from "@/components/Badge";
// const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
// export default function StockReportScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { token } = useAuth();
//   const [search, setSearch] = useState("");
//   const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
//   const { data: items = [], isLoading, refetch } = useQuery({
//     queryKey: ["stock-report"],
//     queryFn: async () => { const r = await fetch(`${API_BASE}/reports/stock`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); },
//     enabled: !!token,
//   });
//   const filtered = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()) || (i.category || "").toLowerCase().includes(search.toLowerCase()));
//   const totalValue = filtered.reduce((s: number, i: any) => s + i.stockValue, 0);
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <AppHeader title="Stock Report" showBack subtitle={`Total Value: ${totalValue.toFixed(0)}`} />
//       <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
//         refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}>
//         <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
//         <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
//           <Text style={[styles.hCell, { color: colors.mutedForeground, flex: 3 }]}>Product</Text>
//           <Text style={[styles.hCell, { color: colors.mutedForeground }]}>Stock</Text>
//           <Text style={[styles.hCell, { color: colors.mutedForeground }]}>Value</Text>
//         </View>
//         {filtered.map((item: any) => (
//           <View key={item.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: item.isLowStock ? colors.destructive : colors.success }]}>
//             <View style={{ flex: 3 }}>
//               <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
//               {item.category ? <Text style={[styles.cat, { color: colors.mutedForeground }]}>{item.category}</Text> : null}
//               {item.rack ? <Text style={[styles.cat, { color: colors.mutedForeground }]}>Rack: {item.rack}</Text> : null}
//             </View>
//             <View style={{ alignItems: "center" }}>
//               <Text style={[styles.stock, { color: item.isLowStock ? colors.destructive : colors.foreground }]}>{item.stockQty}</Text>
//               {item.isLowStock && <Badge label="Low" variant="danger" />}
//             </View>
//             <Text style={[styles.value, { color: colors.foreground }]}>{item.stockValue.toFixed(0)}</Text>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   content: { padding: 16 },
//   header: { flexDirection: "row", padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
//   hCell: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
//   row: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, borderWidth: 1, borderLeftWidth: 4, marginBottom: 8 },
//   name: { fontSize: 14, fontFamily: "Inter_500Medium" },
//   cat: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
//   stock: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1, textAlign: "center" },
//   value: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right" },
// });

// import React, { useState, useMemo } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   StyleSheet,
//   Platform,
//   RefreshControl,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useQuery } from "@tanstack/react-query";
// import { useColors } from "@/hooks/useColors";
// import { useAuth } from "@/context/AuthContext";
// import { AppHeader } from "@/components/AppHeader";
// import { SearchBar } from "@/components/SearchBar";
// import { Badge } from "@/components/Badge";

// const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

// // ─── Types ────────────────────────────────────────────────────────────────────
// type FilterType = "all" | "low" | "high";

// type DatePreset = {
//   label: string;
//   key: string;
//   getRange: () => { from: Date; to: Date };
// };

// // ─── Date Helpers ─────────────────────────────────────────────────────────────
// function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r; }
// function endOfDay(d: Date)   { const r = new Date(d); r.setHours(23,59,59,999); return r; }

// function fmtDate(d: Date) {
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }
// function fmtISO(d: Date) { return d.toISOString().split("T")[0]; }

// const DATE_PRESETS: DatePreset[] = [
//   {
//     label: "Today", key: "today",
//     getRange: () => { const n = new Date(); return { from: startOfDay(n), to: endOfDay(n) }; },
//   },
//   {
//     label: "This Week", key: "week",
//     getRange: () => {
//       const n = new Date(), f = new Date(n);
//       f.setDate(n.getDate() - n.getDay());
//       return { from: startOfDay(f), to: endOfDay(n) };
//     },
//   },
//   {
//     label: "This Month", key: "month",
//     getRange: () => {
//       const n = new Date();
//       return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: endOfDay(n) };
//     },
//   },
//   {
//     label: "Last Month", key: "lastmonth",
//     getRange: () => {
//       const n = new Date();
//       return {
//         from: new Date(n.getFullYear(), n.getMonth() - 1, 1),
//         to: endOfDay(new Date(n.getFullYear(), n.getMonth(), 0)),
//       };
//     },
//   },
//   {
//     label: "This Quarter", key: "quarter",
//     getRange: () => {
//       const n = new Date(), q = Math.floor(n.getMonth() / 3);
//       return { from: new Date(n.getFullYear(), q * 3, 1), to: endOfDay(n) };
//     },
//   },
//   {
//     label: "Last 30 Days", key: "30d",
//     getRange: () => {
//       const n = new Date(), f = new Date(n);
//       f.setDate(n.getDate() - 30);
//       return { from: startOfDay(f), to: endOfDay(n) };
//     },
//   },
//   {
//     label: "Last 90 Days", key: "90d",
//     getRange: () => {
//       const n = new Date(), f = new Date(n);
//       f.setDate(n.getDate() - 90);
//       return { from: startOfDay(f), to: endOfDay(n) };
//     },
//   },
// ];

// // ─── KPI Card ─────────────────────────────────────────────────────────────────
// function KPICard({ label, value, sub, valueColor, colors }: {
//   label: string; value: string; sub: string; valueColor?: string; colors: any;
// }) {
//   return (
//     <View style={[kpi.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
//       <Text style={[kpi.label, { color: colors.mutedForeground }]}>{label}</Text>
//       <Text style={[kpi.value, { color: valueColor ?? colors.foreground }]}>{value}</Text>
//       <Text style={[kpi.sub, { color: colors.mutedForeground }]}>{sub}</Text>
//     </View>
//   );
// }
// const kpi = StyleSheet.create({
//   card:  { flex: 1, borderRadius: 10, borderWidth: 1, padding: 10, marginHorizontal: 3 },
//   label: { fontSize: 9, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
//   value: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
//   sub:   { fontSize: 9, fontFamily: "Inter_400Regular", marginTop: 2 },
// });

// // ─── Stock Bar ────────────────────────────────────────────────────────────────
// function StockBar({ pct, isLow, colors }: { pct: number; isLow: boolean; colors: any }) {
//   const barColor = isLow ? colors.destructive : pct > 60 ? colors.success : "#F59E0B";
//   return (
//     <View style={bar.wrap}>
//       <View style={[bar.bg, { backgroundColor: colors.border }]}>
//         <View style={[bar.fill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: barColor }]} />
//       </View>
//       <Text style={[bar.pct, { color: colors.mutedForeground }]}>{pct}%</Text>
//     </View>
//   );
// }
// const bar = StyleSheet.create({
//   wrap: { flexDirection: "row", alignItems: "center", gap: 5 },
//   bg:   { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
//   fill: { height: 4, borderRadius: 2 },
//   pct:  { fontSize: 9, fontFamily: "Inter_400Regular", minWidth: 26, textAlign: "right" },
// });

// // ─── Category Section ─────────────────────────────────────────────────────────
// function CategorySection({ category, items, colors }: { category: string; items: any[]; colors: any }) {
//   const catValue   = items.reduce((s: number, i: any) => s + i.stockValue, 0);
//   const catQty     = items.reduce((s: number, i: any) => s + i.stockQty, 0);
//   const lowCount   = items.filter((i: any) => i.isLowStock).length;

//   return (
//     <View style={[cs.section, { borderColor: colors.border }]}>
//       {/* Category header */}
//       <View style={[cs.catHead, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//         <View style={{ flex: 1 }}>
//           <Text style={[cs.catName, { color: colors.foreground }]}>{category}</Text>
//           <Text style={[cs.catMeta, { color: colors.mutedForeground }]}>
//             {items.length} items · {catQty} units{lowCount > 0 ? ` · ⚠ ${lowCount} low` : ""}
//           </Text>
//         </View>
//         <Text style={[cs.catVal, { color: colors.foreground }]}>
//           {catValue.toLocaleString("en-IN")}
//         </Text>
//       </View>

//       {/* Column headers */}
//       <View style={[cs.colHead, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
//         <Text style={[cs.col, { color: colors.mutedForeground, flex: 2.5 }]}>PRODUCT</Text>
//         <Text style={[cs.col, { color: colors.mutedForeground, width: 34, textAlign: "center" }]}>MIN</Text>
//         <Text style={[cs.col, { color: colors.mutedForeground, width: 46, textAlign: "center" }]}>QTY</Text>
//         <Text style={[cs.col, { color: colors.mutedForeground, flex: 1.2 }]}>LEVEL</Text>
//         <Text style={[cs.col, { color: colors.mutedForeground, width: 68, textAlign: "right" }]}>VALUE</Text>
//       </View>

//       {/* Rows */}
//       {items.map((item: any, idx: number) => {
//         const pct    = Math.min(100, Math.round((item.stockQty / Math.max((item.minStock || 5) * 3, 1)) * 100));
//         const isLast = idx === items.length - 1;
//         return (
//           <View
//             key={item.id}
//             style={[
//               cs.row,
//               {
//                 borderLeftColor:   item.isLowStock ? colors.destructive : colors.success,
//                 borderBottomColor: isLast ? "transparent" : colors.border,
//               },
//             ]}
//           >
//             <View style={{ flex: 2.5 }}>
//               <Text style={[cs.name, { color: colors.foreground }]} numberOfLines={2}>
//                 {item.name}
//               </Text>
//               <Text style={[cs.meta, { color: colors.mutedForeground }]}>
//                 {[item.rack ? `Rack ${item.rack}` : null, item.unitCost ? `${item.unitCost}/unit` : null]
//                   .filter(Boolean).join(" · ")}
//               </Text>
//             </View>
//             <Text style={[cs.mono, { color: colors.mutedForeground, width: 34, textAlign: "center" }]}>
//               {item.minStock ?? "—"}
//             </Text>
//             <View style={{ width: 46, alignItems: "center" }}>
//               <Text style={[cs.qty, { color: item.isLowStock ? colors.destructive : colors.foreground }]}>
//                 {item.stockQty}
//               </Text>
//               {item.isLowStock && <Badge label="Low" variant="danger" />}
//             </View>
//             <View style={{ flex: 1.2 }}>
//               <StockBar pct={pct} isLow={item.isLowStock} colors={colors} />
//             </View>
//             <Text style={[cs.val, { color: colors.foreground, width: 68 }]}>
//               {item.stockValue.toLocaleString("en-IN")}
//             </Text>
//           </View>
//         );
//       })}
//     </View>
//   );
// }
// const cs = StyleSheet.create({
//   section: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
//   catHead: { flexDirection: "row", alignItems: "center", padding: 11, borderBottomWidth: 1 },
//   catName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
//   catMeta: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
//   catVal:  { fontSize: 14, fontFamily: "Inter_700Bold" },
//   colHead: { flexDirection: "row", alignItems: "center", paddingHorizontal: 11, paddingVertical: 5, borderBottomWidth: 1 },
//   col:     { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4 },
//   row:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 11, paddingVertical: 9, borderLeftWidth: 3, borderBottomWidth: 1, gap: 5 },
//   name:    { fontSize: 13, fontFamily: "Inter_500Medium" },
//   meta:    { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
//   mono:    { fontSize: 12, fontFamily: "Inter_400Regular" },
//   qty:     { fontSize: 14, fontFamily: "Inter_700Bold" },
//   val:     { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right" },
// });

// // ─── Main Screen ──────────────────────────────────────────────────────────────
// export default function StockReportScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { token } = useAuth();
//   const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

//   // Date range — default: This Month
//   const [activePreset, setActivePreset] = useState<string>("month");
//   const [dateRange, setDateRange]       = useState(() => DATE_PRESETS.find(p => p.key === "month")!.getRange());

//   // Item filters
//   const [search, setSearch]               = useState("");
//   const [activeFilter, setActiveFilter]   = useState<FilterType>("all");
//   const [exporting, setExporting]         = useState(false);

//   // ── Fetch — passes date params to your existing API endpoint ───────────────
//   const { data: items = [], isLoading, refetch } = useQuery({
//     queryKey: ["stock-report", fmtISO(dateRange.from), fmtISO(dateRange.to)],
//     queryFn: async () => {
//       const url = `${API_BASE}/reports/stock?from=${fmtISO(dateRange.from)}&to=${fmtISO(dateRange.to)}`;
//       const r   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
//       return r.json();
//     },
//     enabled: !!token,
//   });

//   // ── KPI totals ─────────────────────────────────────────────────────────────
//   const totalValue   = useMemo(() => items.reduce((s: number, i: any) => s + i.stockValue, 0), [items]);
//   const lowCount     = useMemo(() => items.filter((i: any) => i.isLowStock).length, [items]);
//   const avgUnitValue = items.length > 0 ? Math.round(totalValue / items.length) : 0;

//   // ── Filtered + grouped ─────────────────────────────────────────────────────
//   const filtered = useMemo(() => {
//     let list = [...items];
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter((i: any) =>
//         i.name.toLowerCase().includes(q) ||
//         (i.category || "").toLowerCase().includes(q) ||
//         (i.rack || "").toLowerCase().includes(q)
//       );
//     }
//     if (activeFilter === "low")  list = list.filter((i: any) => i.isLowStock);
//     if (activeFilter === "high") list = [...list].sort((a: any, b: any) => b.stockValue - a.stockValue).slice(0, 10);
//     return list;
//   }, [items, search, activeFilter]);

//   const filteredValue = useMemo(
//     () => filtered.reduce((s: number, i: any) => s + i.stockValue, 0),
//     [filtered]
//   );

//   const grouped = useMemo(() => {
//     const map: Record<string, any[]> = {};
//     filtered.forEach((i: any) => {
//       const cat = i.category || "Uncategorised";
//       if (!map[cat]) map[cat] = [];
//       map[cat].push(i);
//     });
//     return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
//   }, [filtered]);

//   // ── Date preset select ─────────────────────────────────────────────────────
//   function selectPreset(preset: DatePreset) {
//     setActivePreset(preset.key);
//     setDateRange(preset.getRange());
//   }

//   // ── PDF export — calls your backend PDF endpoint ───────────────────────────
//   async function handleExportPDF() {
//     setExporting(true);
//     try {
//       const r = await fetch(
//         `${API_BASE}/reports/stock/pdf?from=${fmtISO(dateRange.from)}&to=${fmtISO(dateRange.to)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (!r.ok) throw new Error("PDF generation failed");

//       if (Platform.OS === "web") {
//         const blob = await r.blob();
//         const url  = URL.createObjectURL(blob);
//         const a    = document.createElement("a");
//         a.href     = url;
//         a.download = `StockReport_${fmtISO(dateRange.from)}_${fmtISO(dateRange.to)}.pdf`;
//         a.click();
//         URL.revokeObjectURL(url);
//       } else {
//         /**
//          * Native: receive base64 PDF from backend and share via expo-file-system + expo-sharing.
//          * Uncomment and install these packages if not already present:
//          *
//          * import * as FileSystem from "expo-file-system";
//          * import * as Sharing from "expo-sharing";
//          *
//          * const { base64 } = await r.json();   // your API returns { base64: "..." }
//          * const path = FileSystem.cacheDirectory + `StockReport_${fmtISO(dateRange.from)}.pdf`;
//          * await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
//          * await Sharing.shareAsync(path, { mimeType: "application/pdf", dialogTitle: "Save Stock Report" });
//          */
//         Alert.alert(
//           "PDF Ready",
//           "Integrate expo-file-system + expo-sharing to open/share the PDF on device.",
//           [{ text: "OK" }]
//         );
//       }
//     } catch (e: any) {
//       Alert.alert("Export Failed", e?.message ?? "Could not generate PDF. Please try again.");
//     } finally {
//       setExporting(false);
//     }
//   }

//   const itemFilters: { key: FilterType; label: string }[] = [
//     { key: "all",  label: `All (${items.length})` },
//     { key: "low",  label: `Low Stock${lowCount > 0 ? ` (${lowCount})` : ""}` },
//     { key: "high", label: "Top 10 Value" },
//   ];

//   const reportTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

//   return (
//     <View style={[S.container, { backgroundColor: colors.background }]}>
//       <AppHeader
//         title="Stock Report"
//         showBack
//         subtitle={`${fmtDate(dateRange.from)} – ${fmtDate(dateRange.to)}`}
//       />

//       <ScrollView
//         contentContainerStyle={[S.content, { paddingBottom: bottomPad + 32 }]}
//         refreshControl={
//           <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
//         }
//       >
//         {/* ── Date Preset Tabs ───────────────────────────────────────────── */}
//         <Text style={[S.sectionLabel, { color: colors.mutedForeground }]}>DATE RANGE</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabRow} contentContainerStyle={{ paddingRight: 8 }}>
//           {DATE_PRESETS.map((preset) => (
//             <TouchableOpacity
//               key={preset.key}
//               onPress={() => selectPreset(preset)}
//               style={[
//                 S.tab,
//                 {
//                   borderColor:     colors.border,
//                   backgroundColor: activePreset === preset.key ? colors.foreground : colors.card,
//                 },
//               ]}
//             >
//               <Text style={[S.tabText, { color: activePreset === preset.key ? colors.background : colors.mutedForeground }]}>
//                 {preset.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Active date range pill */}
//         <View style={[S.dateRangePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
//           <Text style={[S.dateRangeText, { color: colors.mutedForeground }]}>Period  </Text>
//           <Text style={[S.dateRangeText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
//             {fmtDate(dateRange.from)}
//           </Text>
//           <Text style={[S.dateRangeText, { color: colors.mutedForeground }]}>  to  </Text>
//           <Text style={[S.dateRangeText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
//             {fmtDate(dateRange.to)}
//           </Text>
//         </View>

//         {/* ── KPI Row ────────────────────────────────────────────────────── */}
//         <View style={S.kpiRow}>
//           <KPICard label="Total Value" value={`${totalValue.toLocaleString("en-IN")}`} sub="all stock"    colors={colors} />
//           <KPICard label="SKUs"        value={`${items.length}`}                          sub="products"    colors={colors} />
//           <KPICard label="Low Stock"   value={`${lowCount}`}                              sub="need reorder" colors={colors}
//             valueColor={lowCount > 0 ? colors.destructive : colors.foreground} />
//           <KPICard label="Avg Value"   value={`${avgUnitValue.toLocaleString("en-IN")}`} sub="per SKU"    colors={colors}
//             valueColor={colors.success} />
//         </View>

//         {/* ── Export PDF ─────────────────────────────────────────────────── */}
//         <TouchableOpacity
//           onPress={handleExportPDF}
//           disabled={exporting || isLoading}
//           style={[S.exportBtn, { backgroundColor: colors.primary, opacity: exporting || isLoading ? 0.6 : 1 }]}
//         >
//           {exporting
//             ? <ActivityIndicator color="#fff" size="small" />
//             : <Text style={S.exportBtnText}>↓  Export PDF Report</Text>}
//         </TouchableOpacity>

//         <View style={[S.divider, { backgroundColor: colors.border }]} />

//         {/* ── Search ────────────────────────────────────────────────────── */}
//         <SearchBar value={search} onChangeText={setSearch} placeholder="Search product, category, rack..." />

//         {/* ── Item Filter Tabs ───────────────────────────────────────────── */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabRow} contentContainerStyle={{ paddingRight: 8 }}>
//           {itemFilters.map((f) => (
//             <TouchableOpacity
//               key={f.key}
//               onPress={() => setActiveFilter(f.key)}
//               style={[S.tab, { borderColor: colors.border, backgroundColor: activeFilter === f.key ? colors.foreground : colors.card }]}
//             >
//               <Text style={[S.tabText, { color: activeFilter === f.key ? colors.background : colors.mutedForeground }]}>
//                 {f.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* ── Summary Line ──────────────────────────────────────────────── */}
//         <View style={S.summaryRow}>
//           <Text style={[S.summaryText, { color: colors.mutedForeground }]}>
//             {filtered.length} of {items.length} items
//           </Text>
//           <Text style={[S.summaryBold, { color: colors.foreground }]}>
//             {filteredValue.toLocaleString("en-IN")}
//           </Text>
//         </View>

//         {/* ── Category Tables ────────────────────────────────────────────── */}
//         {grouped.length > 0
//           ? grouped.map(([cat, catItems]) => (
//               <CategorySection key={cat} category={cat} items={catItems} colors={colors} />
//             ))
//           : (
//             <View style={[S.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
//               <Text style={[S.emptyText, { color: colors.mutedForeground }]}>
//                 {isLoading ? "Loading..." : "No items match your filter."}
//               </Text>
//             </View>
//           )}

//         {/* ── Footer ────────────────────────────────────────────────────── */}
//         <View style={[S.footer, { borderTopColor: colors.border }]}>
//           <Text style={[S.footerText, { color: colors.mutedForeground }]}>
//             Generated: {fmtDate(new Date())} at {reportTime}
//           </Text>
//           <Text style={[S.footerText, { color: colors.mutedForeground }]}>
//             Values include all applicable taxes · Internal use only
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// // ─── Global Styles ────────────────────────────────────────────────────────────
// const S = StyleSheet.create({
//   container:     { flex: 1 },
//   content:       { padding: 16 },
//   sectionLabel:  { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, marginBottom: 6 },
//   tabRow:        { marginBottom: 10 },
//   tab:           { borderRadius: 20, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 5, marginRight: 7 },
//   tabText:       { fontSize: 12, fontFamily: "Inter_500Medium" },
//   dateRangePill: { flexDirection: "row", alignItems: "center", borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
//   dateRangeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
//   kpiRow:        { flexDirection: "row", marginHorizontal: -3, marginBottom: 14 },
//   exportBtn:     { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginBottom: 14 },
//   exportBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
//   divider:       { height: 1, marginBottom: 14 },
//   summaryRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
//   summaryText:   { fontSize: 12, fontFamily: "Inter_400Regular" },
//   summaryBold:   { fontSize: 12, fontFamily: "Inter_600SemiBold" },
//   empty:         { borderRadius: 12, borderWidth: 1, padding: 32, alignItems: "center" },
//   emptyText:     { fontSize: 14, fontFamily: "Inter_400Regular" },
//   footer:        { marginTop: 8, paddingTop: 14, borderTopWidth: 1, gap: 4 },
//   footerText:    { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
// });

import React, { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { SearchBar } from "@/components/SearchBar";
import { Badge } from "@/components/Badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
// NO Capacitor import needed!
const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterType = "all" | "low" | "high";

type DatePreset = {
  label: string;
  key: string;
  getRange: () => { from: Date; to: Date };
};

// ─── Date Helpers ─────────────────────────────────────────────────────────────
function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r; }
function endOfDay(d: Date)   { const r = new Date(d); r.setHours(23,59,59,999); return r; }

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtISO(d: Date) { return d.toISOString().split("T")[0]; }

const DATE_PRESETS: DatePreset[] = [
  {
    label: "Today", key: "today",
    getRange: () => { const n = new Date(); return { from: startOfDay(n), to: endOfDay(n) }; },
  },
  {
    label: "This Week", key: "week",
    getRange: () => {
      const n = new Date(), f = new Date(n);
      f.setDate(n.getDate() - n.getDay());
      return { from: startOfDay(f), to: endOfDay(n) };
    },
  },
  {
    label: "This Month", key: "month",
    getRange: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: endOfDay(n) };
    },
  },
  {
    label: "Last Month", key: "lastmonth",
    getRange: () => {
      const n = new Date();
      return {
        from: new Date(n.getFullYear(), n.getMonth() - 1, 1),
        to: endOfDay(new Date(n.getFullYear(), n.getMonth(), 0)),
      };
    },
  },
  {
    label: "This Quarter", key: "quarter",
    getRange: () => {
      const n = new Date(), q = Math.floor(n.getMonth() / 3);
      return { from: new Date(n.getFullYear(), q * 3, 1), to: endOfDay(n) };
    },
  },
  {
    label: "Last 30 Days", key: "30d",
    getRange: () => {
      const n = new Date(), f = new Date(n);
      f.setDate(n.getDate() - 30);
      return { from: startOfDay(f), to: endOfDay(n) };
    },
  },
  {
    label: "Last 90 Days", key: "90d",
    getRange: () => {
      const n = new Date(), f = new Date(n);
      f.setDate(n.getDate() - 90);
      return { from: startOfDay(f), to: endOfDay(n) };
    },
  },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, valueColor, colors }: {
  label: string; value: string; sub: string; valueColor?: string; colors: any;
}) {
  return (
    <View style={[kpi.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[kpi.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[kpi.value, { color: valueColor ?? colors.foreground }]}>{value}</Text>
      <Text style={[kpi.sub, { color: colors.mutedForeground }]}>{sub}</Text>
    </View>
  );
}
const kpi = StyleSheet.create({
  card:  { flex: 1, borderRadius: 10, borderWidth: 1, padding: 10, marginHorizontal: 3 },
  label: { fontSize: 9, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  value: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  sub:   { fontSize: 9, fontFamily: "Inter_400Regular", marginTop: 2 },
});

// ─── Stock Bar ────────────────────────────────────────────────────────────────
function StockBar({ pct, isLow, colors }: { pct: number; isLow: boolean; colors: any }) {
  const barColor = isLow ? colors.destructive : pct > 60 ? colors.success : "#F59E0B";
  return (
    <View style={bar.wrap}>
      <View style={[bar.bg, { backgroundColor: colors.border }]}>
        <View style={[bar.fill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: barColor }]} />
      </View>
      <Text style={[bar.pct, { color: colors.mutedForeground }]}>{pct}%</Text>
    </View>
  );
}
const bar = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  bg:   { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
  pct:  { fontSize: 9, fontFamily: "Inter_400Regular", minWidth: 26, textAlign: "right" },
});

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ category, items, colors }: { category: string; items: any[]; colors: any }) {
  const catValue   = items.reduce((s: number, i: any) => s + i.stockValue, 0);
  const catQty     = items.reduce((s: number, i: any) => s + i.stockQty, 0);
  const lowCount   = items.filter((i: any) => i.isLowStock).length;

  return (
    <View style={[cs.section, { borderColor: colors.border }]}>
      {/* Category header */}
      <View style={[cs.catHead, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[cs.catName, { color: colors.foreground }]}>{category}</Text>
          <Text style={[cs.catMeta, { color: colors.mutedForeground }]}>
            {items.length} items · {catQty} units{lowCount > 0 ? ` · ⚠ ${lowCount} low` : ""}
          </Text>
        </View>
        <Text style={[cs.catVal, { color: colors.foreground }]}>
          {catValue.toLocaleString("en-IN")}
        </Text>
      </View>

      {/* Column headers */}
      <View style={[cs.colHead, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[cs.col, { color: colors.mutedForeground, flex: 2.5 }]}>PRODUCT</Text>
        <Text style={[cs.col, { color: colors.mutedForeground, width: 34, textAlign: "center" }]}>MIN</Text>
        <Text style={[cs.col, { color: colors.mutedForeground, width: 46, textAlign: "center" }]}>QTY</Text>
        <Text style={[cs.col, { color: colors.mutedForeground, flex: 1.2 }]}>LEVEL</Text>
        <Text style={[cs.col, { color: colors.mutedForeground, width: 68, textAlign: "right" }]}>VALUE</Text>
      </View>

      {/* Rows */}
      {items.map((item: any, idx: number) => {
        const pct    = Math.min(100, Math.round((item.stockQty / Math.max((item.minStock || 5) * 3, 1)) * 100));
        const isLast = idx === items.length - 1;
        return (
          <View
            key={item.id}
            style={[
              cs.row,
              {
                borderLeftColor:   item.isLowStock ? colors.destructive : colors.success,
                borderBottomColor: isLast ? "transparent" : colors.border,
              },
            ]}
          >
            <View style={{ flex: 2.5 }}>
              <Text style={[cs.name, { color: colors.foreground }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[cs.meta, { color: colors.mutedForeground }]}>
                {[item.rack ? `Rack ${item.rack}` : null, item.unitCost ? `${item.unitCost}/unit` : null]
                  .filter(Boolean).join(" · ")}
              </Text>
            </View>
            <Text style={[cs.mono, { color: colors.mutedForeground, width: 34, textAlign: "center" }]}>
              {item.minStock ?? "—"}
            </Text>
            <View style={{ width: 46, alignItems: "center" }}>
              <Text style={[cs.qty, { color: item.isLowStock ? colors.destructive : colors.foreground }]}>
                {item.stockQty}
              </Text>
              {item.isLowStock && <Badge label="Low" variant="danger" />}
            </View>
            <View style={{ flex: 1.2 }}>
              <StockBar pct={pct} isLow={item.isLowStock} colors={colors} />
            </View>
            <Text style={[cs.val, { color: colors.foreground, width: 68 }]}>
              {item.stockValue.toLocaleString("en-IN")}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
const cs = StyleSheet.create({
  section: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
  catHead: { flexDirection: "row", alignItems: "center", padding: 11, borderBottomWidth: 1 },
  catName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  catMeta: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  catVal:  { fontSize: 14, fontFamily: "Inter_700Bold" },
  colHead: { flexDirection: "row", alignItems: "center", paddingHorizontal: 11, paddingVertical: 5, borderBottomWidth: 1 },
  col:     { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4 },
  row:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 11, paddingVertical: 9, borderLeftWidth: 3, borderBottomWidth: 1, gap: 5 },
  name:    { fontSize: 13, fontFamily: "Inter_500Medium" },
  meta:    { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  mono:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  qty:     { fontSize: 14, fontFamily: "Inter_700Bold" },
  val:     { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right" },
});

// ─── PDF Generator using jsPDF ────────────────────────────────────────────────
async function generatePDFWithjsPDF(
  dateRange: { from: Date; to: Date },
  items: any[],
  totalValue: number,
  lowCount: number,
  avgUnitValue: number
) {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape, A4
  const pageWidth = doc.internal.pageSize.width;

  // ─── Header ────────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Stock Report", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Period: ${fmtDate(dateRange.from)} to ${fmtDate(dateRange.to)}`, pageWidth / 2, 22, { align: "center" });
  doc.text(`Generated: ${fmtDate(new Date())} at ${new Date().toLocaleTimeString("en-IN")}`, pageWidth / 2, 28, { align: "center" });

  // ─── KPI Summary Table ─────────────────────────────────────────────────────
  const kpiData = [
    ["Total Value", `${totalValue.toLocaleString("en-IN")}`, "all stock"],
    ["SKUs", items.length.toString(), "products"],
    ["Low Stock", lowCount.toString(), "need reorder"],
    ["Avg Value", `${avgUnitValue.toLocaleString("en-IN")}`, "per SKU"],
  ];

  autoTable(doc, {
    startY: 35,
    body: kpiData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { fontStyle: "bold", textColor: [37, 99, 235], cellWidth: 50 },
      2: { textColor: [107, 114, 128], cellWidth: 50 },
    },
    margin: { left: 10, right: 10 },
  });

  // ─── Group items by category ───────────────────────────────────────────────
  const grouped: Record<string, any[]> = {};
  items.forEach((item: any) => {
    const cat = item.category || "Uncategorised";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  let currentY = doc.lastAutoTable.finalY + 10;

  // ─── Loop through categories ───────────────────────────────────────────────
  for (const [category, catItems] of Object.entries(grouped).sort()) {
    const catValue = catItems.reduce((s, i) => s + i.stockValue, 0);
    const catQty = catItems.reduce((s, i) => s + i.stockQty, 0);
    const lowCountInCat = catItems.filter((i: any) => i.isLowStock).length;

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Category header
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${category}`, 14, currentY);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(
      `${catItems.length} items · ${catQty} units${lowCountInCat > 0 ? ` · ⚠ ${lowCountInCat} low` : ""}`,
      14,
      currentY + 5
    );
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text(`${catValue.toLocaleString("en-IN")}`, pageWidth - 14, currentY + 3, { align: "right" });

    currentY += 12;

    // Prepare table data
    const tableBody = catItems.map((item: any) => {
      const pct = Math.min(100, Math.round((item.stockQty / Math.max((item.minStock || 5) * 3, 1)) * 100));
      const levelBar = `${pct}%`; // Just show percentage, can't draw bars in autoTable easily
      return [
        item.name,
        item.rack ? `Rack ${item.rack}` : "-",
        item.unitCost ? `${item.unitCost}` : "-",
        item.minStock ?? "—",
        item.stockQty,
        item.isLowStock ? "LOW" : "OK",
        levelBar,
        `${item.stockValue.toLocaleString("en-IN")}`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [[
        "Product", "Rack", "Unit Cost", "Min", "Qty", "Status", "Level", "Value"
      ]],
      body: tableBody,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 25, halign: "center" },
        7: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // ─── Footer on all pages ───────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Values include all applicable taxes · Internal use only · Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 8,
      { align: "center" }
    );
  }

  return doc;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function StockReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Date range — default: This Month
  const [activePreset, setActivePreset] = useState<string>("month");
  const [dateRange, setDateRange]       = useState(() => DATE_PRESETS.find(p => p.key === "month")!.getRange());

  // Item filters
  const [search, setSearch]               = useState("");
  const [activeFilter, setActiveFilter]   = useState<FilterType>("all");
  const [exporting, setExporting]         = useState(false);

  // ── Fetch — passes date params to your existing API endpoint ───────────────
  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ["stock-report", fmtISO(dateRange.from), fmtISO(dateRange.to)],
    queryFn: async () => {
      const url = `${API_BASE}/reports/stock?from=${fmtISO(dateRange.from)}&to=${fmtISO(dateRange.to)}`;
      const r   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return r.json();
    },
    enabled: !!token,
  });

  // ── KPI totals ─────────────────────────────────────────────────────────────
  const totalValue   = useMemo(() => items.reduce((s: number, i: any) => s + i.stockValue, 0), [items]);
  const lowCount     = useMemo(() => items.filter((i: any) => i.isLowStock).length, [items]);
  const avgUnitValue = items.length > 0 ? Math.round(totalValue / items.length) : 0;

  // ── Filtered + grouped ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...items];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i: any) =>
        i.name.toLowerCase().includes(q) ||
        (i.category || "").toLowerCase().includes(q) ||
        (i.rack || "").toLowerCase().includes(q)
      );
    }
    if (activeFilter === "low")  list = list.filter((i: any) => i.isLowStock);
    if (activeFilter === "high") list = [...list].sort((a: any, b: any) => b.stockValue - a.stockValue).slice(0, 10);
    return list;
  }, [items, search, activeFilter]);

  const filteredValue = useMemo(
    () => filtered.reduce((s: number, i: any) => s + i.stockValue, 0),
    [filtered]
  );

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((i: any) => {
      const cat = i.category || "Uncategorised";
      if (!map[cat]) map[cat] = [];
      map[cat].push(i);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // ── Date preset select ─────────────────────────────────────────────────────
  function selectPreset(preset: DatePreset) {
    setActivePreset(preset.key);
    setDateRange(preset.getRange());
  }
// Add this function before your StockReportScreen component
// ─── PDF Generator using jsPDF ────────────────────────────────────────────────
async function generateStockReportPDF(
  dateRange: { from: Date; to: Date },
  items: any[],
  totalValue: number,
  lowCount: number,
  avgUnitValue: number
) {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;

  // ===== HEADER =====
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("STOCK REPORT", 14, 12);

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text(
    `Period: ${fmtDate(dateRange.from)} to ${fmtDate(dateRange.to)}`,
    14,
    18
  );

  doc.text(
    `Generated: ${fmtDate(new Date())} ${new Date().toLocaleTimeString("en-IN")}`,
    pageWidth - 14,
    12,
    { align: "right" }
  );

  // ===== MAIN TABLE (NO GROUPING) =====
  const tableBody = items.map((item: any, index: number) => [
    index + 1, // Sr No
    item.name,
    item.category || "-",
    item.rack || "-",
    // item.unitCost ?? "-",
    // item.minStock ?? "-",
    item.stockQty,
    item.isLowStock ? "LOW" : "OK",
    item.stockValue,
  ]);

  autoTable(doc, {
    startY: 22,
    head: [[
      "Sr No",
      "Product",
      "Category",
      "Rack",
      // "Unit Cost",
      // "Min",
      "Qty",
      "Status",
      "Value"
    ]],
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fontStyle: "bold",
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      4: { halign: "right" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
      8: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  let finalY = doc.lastAutoTable.finalY + 5;

  // ===== SUMMARY (ONE LINE BELOW TABLE) =====
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");

  doc.text(
    `Total Value: ${totalValue.toLocaleString("en-IN")}    |    Total Products: ${items.length}    |    Low Stock: ${lowCount}    |    Avg Value: ${avgUnitValue.toLocaleString("en-IN")}`,
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




// Then in your StockReportScreen component, update handleExportPDF:
async function handleExportPDF() {
  if (items.length === 0) {
    Alert.alert("No Data", "No stock data available to export.");
    return;
  }

  setExporting(true);
  try {
    const doc = await generateStockReportPDF(
      dateRange,
      filtered, // Use filtered data (current view)
      totalValue,
      lowCount,
      avgUnitValue
    );

    const fileName = `Stock_Report_${fmtISO(dateRange.from)}_to_${fmtISO(dateRange.to)}.pdf`;

    // For web platform - simplest approach that always works
    doc.save(fileName);
    Alert.alert("Success", "PDF downloaded successfully!");

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    Alert.alert("Export Failed", error?.message || "Could not generate PDF. Please try again.");
  } finally {
    setExporting(false);
  }
}


  const itemFilters: { key: FilterType; label: string }[] = [
    { key: "all",  label: `All (${items.length})` },
    { key: "low",  label: `Low Stock${lowCount > 0 ? ` (${lowCount})` : ""}` },
    { key: "high", label: "Top 10 Value" },
  ];

  const reportTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={[S.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Stock Report"
        showBack
        subtitle={`${fmtDate(dateRange.from)} – ${fmtDate(dateRange.to)}`}
      />

      <ScrollView
        contentContainerStyle={[S.content, { paddingBottom: bottomPad + 32 }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* ── Date Preset Tabs ───────────────────────────────────────────── */}
        <Text style={[S.sectionLabel, { color: colors.mutedForeground }]}>DATE RANGE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabRow} contentContainerStyle={{ paddingRight: 8 }}>
          {DATE_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.key}
              onPress={() => selectPreset(preset)}
              style={[
                S.tab,
                {
                  borderColor:     colors.border,
                  backgroundColor: activePreset === preset.key ? colors.foreground : colors.card,
                },
              ]}
            >
              <Text style={[S.tabText, { color: activePreset === preset.key ? colors.background : colors.mutedForeground }]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active date range pill */}
        <View style={[S.dateRangePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[S.dateRangeText, { color: colors.mutedForeground }]}>Period  </Text>
          <Text style={[S.dateRangeText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {fmtDate(dateRange.from)}
          </Text>
          <Text style={[S.dateRangeText, { color: colors.mutedForeground }]}>  to  </Text>
          <Text style={[S.dateRangeText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {fmtDate(dateRange.to)}
          </Text>
        </View>

        {/* ── KPI Row ────────────────────────────────────────────────────── */}
        <View style={S.kpiRow}>
          <KPICard label="Total Value" value={`${totalValue.toLocaleString("en-IN")}`} sub="all stock"    colors={colors} />
          <KPICard label="SKUs"        value={`${items.length}`}                          sub="products"    colors={colors} />
          <KPICard label="Low Stock"   value={`${lowCount}`}                              sub="need reorder" colors={colors}
            valueColor={lowCount > 0 ? colors.destructive : colors.foreground} />
          <KPICard label="Avg Value"   value={`${avgUnitValue.toLocaleString("en-IN")}`} sub="per SKU"    colors={colors}
            valueColor={colors.success} />
        </View>

        {/* ── Export PDF ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleExportPDF}
          disabled={exporting || isLoading || items.length === 0}
          style={[S.exportBtn, { backgroundColor: colors.primary, opacity: exporting || isLoading || items.length === 0 ? 0.6 : 1 }]}
        >
          {exporting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={S.exportBtnText}>↓  Export PDF Report</Text>}
        </TouchableOpacity>

        <View style={[S.divider, { backgroundColor: colors.border }]} />

        {/* ── Search ────────────────────────────────────────────────────── */}
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search product, category, rack..." />

        {/* ── Item Filter Tabs ───────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabRow} contentContainerStyle={{ paddingRight: 8 }}>
          {itemFilters.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[S.tab, { borderColor: colors.border, backgroundColor: activeFilter === f.key ? colors.foreground : colors.card }]}
            >
              <Text style={[S.tabText, { color: activeFilter === f.key ? colors.background : colors.mutedForeground }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Summary Line ──────────────────────────────────────────────── */}
        <View style={S.summaryRow}>
          <Text style={[S.summaryText, { color: colors.mutedForeground }]}>
            {filtered.length} of {items.length} items
          </Text>
          <Text style={[S.summaryBold, { color: colors.foreground }]}>
            {filteredValue.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* ── Category Tables ────────────────────────────────────────────── */}
        {grouped.length > 0
          ? grouped.map(([cat, catItems]) => (
              <CategorySection key={cat} category={cat} items={catItems} colors={colors} />
            ))
          : (
            <View style={[S.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[S.emptyText, { color: colors.mutedForeground }]}>
                {isLoading ? "Loading..." : "No items match your filter."}
              </Text>
            </View>
          )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <View style={[S.footer, { borderTopColor: colors.border }]}>
          <Text style={[S.footerText, { color: colors.mutedForeground }]}>
            Generated: {fmtDate(new Date())} at {reportTime}
          </Text>
          <Text style={[S.footerText, { color: colors.mutedForeground }]}>
            Values include all applicable taxes · Internal use only
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Global Styles ────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container:     { flex: 1 },
  content:       { padding: 16 },
  sectionLabel:  { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, marginBottom: 6 },
  tabRow:        { marginBottom: 10 },
  tab:           { borderRadius: 20, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 5, marginRight: 7 },
  tabText:       { fontSize: 12, fontFamily: "Inter_500Medium" },
  dateRangePill: { flexDirection: "row", alignItems: "center", borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
  dateRangeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  kpiRow:        { flexDirection: "row", marginHorizontal: -3, marginBottom: 14 },
  exportBtn:     { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginBottom: 14 },
  exportBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  divider:       { height: 1, marginBottom: 14 },
  summaryRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryText:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryBold:   { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  empty:         { borderRadius: 12, borderWidth: 1, padding: 32, alignItems: "center" },
  emptyText:     { fontSize: 14, fontFamily: "Inter_400Regular" },
  footer:        { marginTop: 8, paddingTop: 14, borderTopWidth: 1, gap: 4 },
  footerText:    { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
});