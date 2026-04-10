import React, { useState, useRef } from "react";
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  RefreshControl, Platform, Alert, Share, ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

function formatCurrency(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n.toFixed(2)}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

type Period = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

interface DetailedReportData {
  summary: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    totalSalesCount: number;
    totalPurchasesCount: number;
    operatingExpenses: number;
    netProfit: number;
    netMargin: number;
  };
  revenueBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  }[];
  topProducts: {
    name: string;
    revenue: number;
    quantity: number;
    contribution: number;
  }[];
}

export default function ProfitLossDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const [period, setPeriod] = useState<Period>("monthly");
  const [exporting, setExporting] = useState(false);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: report, isLoading, refetch } = useQuery<DetailedReportData>({
    queryKey: ["profit-loss-detailed", period],
    queryFn: async () => {
      const url = `${API_BASE}/reports/profit-loss-detailed?period=${period}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
    enabled: !!token,
  });

  const periods: { label: string; value: Period; icon: string }[] = [
    { label: "Daily", value: "daily", icon: "today-outline" },
    { label: "Weekly", value: "weekly", icon: "calendar-outline" },
    { label: "Monthly", value: "monthly", icon: "calendar-outline" },
    { label: "Quarterly", value: "quarterly", icon: "calendar-outline" },
    { label: "Yearly", value: "yearly", icon: "calendar-outline" },
  ];

  const getPeriodTitle = (): string => {
    const now = new Date();
    switch (period) {
      case "daily": return now.toLocaleDateString();
      case "weekly": return `Week of ${now.toLocaleDateString()}`;
      case "monthly": return now.toLocaleString('default', { month: 'long', year: 'numeric' });
      case "quarterly": return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
      case "yearly": return now.getFullYear().toString();
      default: return "Current Period";
    }
  };

  const generatePDF = async () => {
    setExporting(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Profit & Loss Report - ${user?.businessName || "Business"}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              padding: 40px;
              background: white;
              color: #1a1a1a;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #0F4C81;
              margin-bottom: 8px;
            }
            .report-title {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
              margin: 10px 0;
            }
            .period-range {
              font-size: 16px;
              color: #6b7280;
              margin: 5px 0;
            }
            .date-generated {
              font-size: 11px;
              color: #9ca3af;
              margin-top: 10px;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .card {
              background: #f9fafb;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              border: 1px solid #e5e7eb;
            }
            .card-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .card-value {
              font-size: 28px;
              font-weight: bold;
              color: #111827;
            }
            .card-value.positive { color: #10b981; }
            .card-value.negative { color: #ef4444; }

            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              color: #1f2937;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .table th {
              background: #f3f4f6;
              padding: 12px;
              text-align: right;
              font-size: 12px;
              font-weight: 600;
              color: #6b7280;
              border-bottom: 2px solid #e5e7eb;
            }
            .table th:first-child { text-align: left; }
            .table td {
              padding: 10px 12px;
              text-align: right;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }
            .table td:first-child { text-align: left; font-weight: 500; }
            .profit-row { background-color: #f0fdf4; }
            .loss-row { background-color: #fef2f2; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 10px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${user?.businessName || "Business Name"}</div>
            <div class="report-title">PROFIT & LOSS STATEMENT</div>
            <div class="period-range">Period: ${getPeriodTitle()}</div>
            <div class="date-generated">Generated: ${new Date().toLocaleString()}</div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Revenue</div>
              <div class="card-value positive">${formatCurrency(report?.summary.totalRevenue || 0)}</div>
            </div>
            <div class="card">
              <div class="card-label">Gross Profit</div>
              <div class="card-value ${(report?.summary.grossProfit || 0) >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(report?.summary.grossProfit || 0)}
              </div>
            </div>
            <div class="card">
              <div class="card-label">Net Profit</div>
              <div class="card-value ${(report?.summary.netProfit || 0) >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(report?.summary.netProfit || 0)}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Profit & Loss Statement</div>
            <table class="table">
              <tr><th>Particulars</th><th>Amount</th><th>% of Revenue</th></tr>
              <tr><td>Total Revenue</td><td>${formatCurrency(report?.summary.totalRevenue || 0)}</td><td>100%</td></tr>
              <tr><td style="padding-left: 20px;">Cost of Goods Sold</td><td>${formatCurrency(report?.summary.totalCost || 0)}</td><td>${((report?.summary.totalCost || 0) / (report?.summary.totalRevenue || 1) * 100).toFixed(1)}%</td></tr>
              <tr class="profit-row"><td><strong>Gross Profit</strong></td><td><strong>${formatCurrency(report?.summary.grossProfit || 0)}</strong></td><td><strong>${(report?.summary.profitMargin || 0).toFixed(1)}%</strong></td></tr>
              <tr><td style="padding-left: 20px;">Operating Expenses</td><td>${formatCurrency(report?.summary.operatingExpenses || 0)}</td><td>${((report?.summary.operatingExpenses || 0) / (report?.summary.totalRevenue || 1) * 100).toFixed(1)}%</td></tr>
              <tr class="profit-row"><td><strong>Net Profit</strong></td><td><strong>${formatCurrency(report?.summary.netProfit || 0)}</strong></td><td><strong>${(report?.summary.netMargin || 0).toFixed(1)}%</strong></td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Revenue Breakdown</div>
            <table class="table">
              <tr><th>Category</th><th>Amount</th><th>Percentage</th></tr>
              ${report?.revenueBreakdown?.map(item => `
                <tr><td>${item.category}</td><td>${formatCurrency(item.amount)}</td><td>${item.percentage.toFixed(1)}%</td></tr>
              `).join('') || '<tr><td colspan="3">No data available</td></tr>'}
            </table>
          </div>

          <div class="section">
            <div class="section-title">Monthly Performance</div>
            <table class="table">
              <tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th><th>Margin</th></tr>
              ${report?.monthlyData?.map(item => `
                <tr class="${item.profit >= 0 ? 'profit-row' : 'loss-row'}">
                  <td>${item.month}</td>
                  <td>${formatCurrency(item.revenue)}</td>
                  <td>${formatCurrency(item.expenses)}</td>
                  <td>${formatCurrency(item.profit)}</td>
                  <td>${item.margin.toFixed(1)}%</td>
                </tr>
              `).join('') || '<tr><td colspan="5">No data available</td></tr>'}
            </table>
          </div>

          <div class="section">
            <div class="section-title">Top Products</div>
            <table class="table">
              <tr><th>Product</th><th>Revenue</th><th>Quantity</th><th>Contribution</th></tr>
              ${report?.topProducts?.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${formatCurrency(item.revenue)}</td>
                  <td>${formatNumber(item.quantity)}</td>
                  <td>${item.contribution.toFixed(1)}%</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No data available</td></tr>'}
            </table>
          </div>

          <div class="footer">
            <p>This is a computer-generated document. No signature required.</p>
            <p>© ${new Date().getFullYear()} ${user?.businessName || "Business Name"}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (Platform.OS === "ios" || Platform.OS === "android") {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Export Profit & Loss Report",
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device");
        }
      } else {
        // Web platform - open in new tab
        const pdfBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const pdfWindow = window.open();
        pdfWindow?.document.write(
          `<iframe src="data:application/pdf;base64,${pdfBase64}" style="width:100%;height:100%;" frameborder="0"></iframe>`
        );
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("Export Failed", "Unable to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Profit & Loss"
        showBack
        subtitle="Detailed Financial Report"
        rightComponent={
          <TouchableOpacity onPress={generatePDF} style={styles.exportButton} disabled={exporting}>
            {exporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="download-outline" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Period Selection */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>REPORT PERIOD</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
          <View style={styles.periodChips}>
            {periods.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.periodChip,
                  period === p.value && { backgroundColor: colors.primary }
                ]}
                onPress={() => setPeriod(p.value)}
              >
                <Ionicons
                  name={p.icon as any}
                  size={16}
                  color={period === p.value ? colors.primaryForeground : colors.mutedForeground}
                />
                <Text style={[
                  styles.periodChipText,
                  { color: period === p.value ? colors.primaryForeground : colors.mutedForeground }
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Date Range Display */}
        <View style={[styles.dateRangeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={[styles.dateRangeText, { color: colors.foreground }]}>
            {getPeriodTitle()}
          </Text>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButtonLarge, { backgroundColor: colors.primary }]}
          onPress={generatePDF}
          disabled={exporting}
        >
          <Ionicons name="document-text-outline" size={24} color="white" />
          <Text style={styles.exportButtonText}>
            {exporting ? "Generating PDF..." : "Download PDF Report"}
          </Text>
        </TouchableOpacity>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Total Revenue</Text>
            <Text style={[styles.metricValue, { color: "#10b981" }]}>
              {formatCurrency(report?.summary.totalRevenue || 0)}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Gross Profit</Text>
            <Text style={[styles.metricValue, { color: (report?.summary.grossProfit || 0) >= 0 ? "#10b981" : "#ef4444" }]}>
              {formatCurrency(report?.summary.grossProfit || 0)}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Net Profit</Text>
            <Text style={[styles.metricValue, { color: (report?.summary.netProfit || 0) >= 0 ? "#10b981" : "#ef4444" }]}>
              {formatCurrency(report?.summary.netProfit || 0)}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Profit Margin</Text>
            <Text style={[styles.metricValue, { color: (report?.summary.netMargin || 0) >= 0 ? "#10b981" : "#ef4444" }]}>
              {(report?.summary.netMargin || 0).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* P&L Statement Table */}
        <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tableTitle, { color: colors.foreground }]}>Profit & Loss Statement</Text>
          <View style={styles.plTable}>
            <View style={styles.plRow}>
              <Text style={[styles.plLabel, { color: colors.mutedForeground }]}>Revenue</Text>
              <Text style={[styles.plAmount, { color: "#10b981" }]}>{formatCurrency(report?.summary.totalRevenue || 0)}</Text>
            </View>
            <View style={[styles.plRow, styles.indented]}>
              <Text style={[styles.plLabel, { color: colors.mutedForeground }]}>Cost of Goods Sold</Text>
              <Text style={[styles.plAmount, { color: colors.warning }]}>{formatCurrency(report?.summary.totalCost || 0)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.plRow, styles.highlight]}>
              <Text style={[styles.plLabel, { fontWeight: "bold", color: colors.foreground }]}>Gross Profit</Text>
              <Text style={[styles.plAmount, { fontWeight: "bold", color: (report?.summary.grossProfit || 0) >= 0 ? "#10b981" : "#ef4444" }]}>
                {formatCurrency(report?.summary.grossProfit || 0)}
              </Text>
            </View>
            <View style={[styles.plRow, styles.indented]}>
              <Text style={[styles.plLabel, { color: colors.mutedForeground }]}>Operating Expenses</Text>
              <Text style={[styles.plAmount, { color: colors.mutedForeground }]}>{formatCurrency(report?.summary.operatingExpenses || 0)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.plRow, styles.totalRow]}>
              <Text style={[styles.plLabel, { fontWeight: "bold", fontSize: 16, color: colors.foreground }]}>Net Profit</Text>
              <Text style={[styles.plAmount, { fontWeight: "bold", fontSize: 18, color: (report?.summary.netProfit || 0) >= 0 ? "#10b981" : "#ef4444" }]}>
                {formatCurrency(report?.summary.netProfit || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Revenue Breakdown */}
        {report?.revenueBreakdown && report.revenueBreakdown.length > 0 && (
          <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.tableTitle, { color: colors.foreground }]}>Revenue Breakdown</Text>
            {report.revenueBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <Text style={[styles.breakdownText, { color: colors.foreground }]}>{item.category}</Text>
                  <Text style={[styles.breakdownPercent, { color: colors.mutedForeground }]}>{item.percentage.toFixed(1)}%</Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: "#10b981" }]}>{formatCurrency(item.amount)}</Text>
                <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressFill, { width: `${item.percentage}%`, backgroundColor: "#10b981" }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Monthly Performance */}
        {report?.monthlyData && report.monthlyData.length > 0 && (
          <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.tableTitle, { color: colors.foreground }]}>Monthly Performance</Text>
            {report.monthlyData.map((item, index) => (
              <View key={index} style={[styles.monthlyCard, { backgroundColor: item.profit >= 0 ? '#f0fdf4' : '#fef2f2' }]}>
                <View style={styles.monthlyHeader}>
                  <Text style={[styles.monthlyMonth, { color: colors.foreground, fontWeight: 'bold' }]}>{item.month}</Text>
                  <Text style={[styles.monthlyProfit, { color: item.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }]}>
                    {formatCurrency(item.profit)}
                  </Text>
                </View>
                <View style={styles.monthlyDetails}>
                  <View>
                    <Text style={[styles.monthlyLabel, { color: colors.mutedForeground }]}>Revenue</Text>
                    <Text style={[styles.monthlyValue, { color: "#10b981" }]}>{formatCurrency(item.revenue)}</Text>
                  </View>
                  <View>
                    <Text style={[styles.monthlyLabel, { color: colors.mutedForeground }]}>Expenses</Text>
                    <Text style={[styles.monthlyValue, { color: colors.warning }]}>{formatCurrency(item.expenses)}</Text>
                  </View>
                  <View>
                    <Text style={[styles.monthlyLabel, { color: colors.mutedForeground }]}>Margin</Text>
                    <Text style={[styles.monthlyValue, { color: item.margin >= 0 ? '#10b981' : '#ef4444' }]}>{item.margin.toFixed(1)}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Report generated on {new Date().toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },

  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 8 },
  periodScroll: { flexGrow: 0, marginBottom: 16 },
  periodChips: { flexDirection: "row", gap: 8 },
  periodChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f3f4f6" },
  periodChipText: { fontSize: 13, fontWeight: "500" },

  dateRangeBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  dateRangeText: { flex: 1, fontSize: 14, fontWeight: "500" },

  exportButtonLarge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 10, marginBottom: 20 },
  exportButtonText: { fontSize: 16, fontWeight: "600", color: "white" },

  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  metricCard: { flex: 1, minWidth: "47%", padding: 16, borderRadius: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  metricLabel: { fontSize: 12, marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: "bold" },

  tableContainer: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 20 },
  tableTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 16 },
  plTable: { marginTop: 4 },
  plRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  indented: { paddingLeft: 16 },
  highlight: { backgroundColor: "#f9fafb", borderRadius: 8, paddingVertical: 10 },
  totalRow: { marginTop: 4, paddingVertical: 12 },
  plLabel: { fontSize: 14 },
  plAmount: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, marginVertical: 4 },

  breakdownRow: { marginBottom: 12 },
  breakdownLabel: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  breakdownText: { fontSize: 13, fontWeight: "500" },
  breakdownPercent: { fontSize: 12 },
  breakdownAmount: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  monthlyCard: { padding: 12, borderRadius: 10, marginBottom: 10 },
  monthlyHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  monthlyMonth: { fontSize: 14 },
  monthlyProfit: { fontSize: 14 },
  monthlyDetails: { flexDirection: "row", justifyContent: "space-around" },
  monthlyLabel: { fontSize: 11, marginBottom: 4 },
  monthlyValue: { fontSize: 14, fontWeight: "600" },

  footer: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, alignItems: "center" },
  footerText: { fontSize: 11 },
  exportButton: { padding: 8 },
});