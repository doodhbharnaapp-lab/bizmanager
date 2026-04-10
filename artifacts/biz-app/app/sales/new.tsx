import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";
import { SelectField } from "@/components/SelectField";
import { AppHeader } from "@/components/AppHeader";

const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface CartItem { productId: number; productName: string; quantity: number; sellingPrice: number; gstPercent: number; }

export default function NewSaleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [customerId, setCustomerId] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [isGstInvoice, setIsGstInvoice] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: async () => { const r = await fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); }, enabled: !!token });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: async () => { const r = await fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } }); return r.json(); }, enabled: !!token });

  const selectedProduct = products.find((p: any) => String(p.id) === selectedProductId);
  const subtotal = cart.reduce((s, i) => s + i.quantity * i.sellingPrice, 0);
  const totalGst = isGstInvoice ? cart.reduce((s, i) => s + i.quantity * i.sellingPrice * i.gstPercent / 100, 0) : 0;
  const grandTotal = subtotal + totalGst;

  const addToCart = () => {
    if (!selectedProductId || !qty || !price) { Alert.alert("Please select a product, quantity and price"); return; }
    const existing = cart.findIndex(c => c.productId === parseInt(selectedProductId));
    const item: CartItem = { productId: parseInt(selectedProductId), productName: selectedProduct?.name || "", quantity: parseFloat(qty), sellingPrice: parseFloat(price), gstPercent: selectedProduct?.gstPercent || 0 };
    if (existing >= 0) { const updated = [...cart]; updated[existing] = item; setCart(updated); }
    else setCart([...cart, item]);
    setSelectedProductId(""); setQty("1"); setPrice("");
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { Alert.alert("Add at least one item"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: customerId ? parseInt(customerId) : undefined, items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, sellingPrice: i.sellingPrice, gstPercent: i.gstPercent })), paymentMode, isGstInvoice }),
      });
      if (!res.ok) throw new Error("Failed");
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      router.back();
    } catch { Alert.alert("Failed to create sale"); }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="New Sale" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]} keyboardShouldPersistTaps="handled">
        <SelectField label="Customer (Optional)" value={customerId} onSelect={setCustomerId} placeholder="Walk-in customer"
          options={[{ label: "Walk-in Customer", value: "" }, ...customers.map((c: any) => ({ label: c.name, value: String(c.id) }))]} />
        <SelectField label="Payment Mode" value={paymentMode} onSelect={setPaymentMode}
          options={[{ label: "Cash", value: "cash" }, { label: "UPI", value: "upi" }, { label: "Credit (Udhari)", value: "credit" }, { label: "Bank Transfer", value: "bank" }]} />
        <TouchableOpacity style={[styles.gstToggle, { backgroundColor: isGstInvoice ? colors.primary + "20" : colors.muted, borderColor: isGstInvoice ? colors.primary : colors.border }]}
          onPress={() => setIsGstInvoice(!isGstInvoice)} activeOpacity={0.8}>
          <Feather name={isGstInvoice ? "check-square" : "square"} size={18} color={isGstInvoice ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.gstLabel, { color: isGstInvoice ? colors.primary : colors.foreground }]}>GST Invoice</Text>
        </TouchableOpacity>

        <Text style={[styles.sec, { color: colors.mutedForeground }]}>ADD ITEMS</Text>
        <SelectField label="Product" value={selectedProductId} onSelect={(v) => { setSelectedProductId(v); const p = products.find((pr: any) => String(pr.id) === v); if (p) setPrice(String(p.sellingPrice)); }}
          placeholder="Select product..."
          options={products.map((p: any) => ({ label: `${p.name} (Stock: ${p.stockQty})`, value: String(p.id) }))} />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <FormField label="Qty" value={qty} onChangeText={setQty} keyboardType="numeric" placeholder="1" />
          </View>
          <View style={{ flex: 2 }}>
            <FormField label="Price ()" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" />
          </View>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={addToCart} activeOpacity={0.8}>
          <Feather name="plus" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        {cart.length > 0 && (
          <View style={[styles.cartBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cartTitle, { color: colors.foreground }]}>Cart ({cart.length} items)</Text>
            {cart.map((item, i) => (
              <View key={i} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cartItemName, { color: colors.foreground }]}>{item.productName}</Text>
                  <Text style={[styles.cartItemSub, { color: colors.mutedForeground }]}>{item.quantity} x {item.sellingPrice}</Text>
                </View>
                <Text style={[styles.cartItemTotal, { color: colors.foreground }]}>{(item.quantity * item.sellingPrice).toFixed(0)}</Text>
                <TouchableOpacity onPress={() => setCart(cart.filter((_, idx) => idx !== i))} style={{ marginLeft: 12 }}>
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={[styles.totals, { borderTopColor: colors.border }]}>
              <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text><Text style={[styles.totalVal, { color: colors.foreground }]}>{subtotal.toFixed(2)}</Text></View>
              {isGstInvoice && <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>GST</Text><Text style={[styles.totalVal, { color: colors.foreground }]}>{totalGst.toFixed(2)}</Text></View>}
              <View style={styles.totalRow}><Text style={[styles.grandLabel, { color: colors.foreground }]}>Grand Total</Text><Text style={[styles.grandVal, { color: colors.primary }]}>{grandTotal.toFixed(2)}</Text></View>
            </View>
          </View>
        )}

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#FFF" /> : <><Feather name="check" size={20} color="#FFF" /><Text style={styles.submitText}>Create Sale</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  sec: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  row: { flexDirection: "row" },
  gstToggle: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 14 },
  gstLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, paddingVertical: 12, marginBottom: 16 },
  addBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FFF" },
  cartBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cartTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  cartItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5 },
  cartItemName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  cartItemSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  cartItemTotal: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  totals: { borderTopWidth: 1, paddingTop: 12, gap: 6 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  totalVal: { fontSize: 14, fontFamily: "Inter_500Medium" },
  grandLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  grandVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16, marginTop: 8 },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },
});
