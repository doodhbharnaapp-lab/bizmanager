import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "inbox", title, description, actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={icon as any} size={32} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {description ? <Text style={[styles.desc, { color: colors.mutedForeground }]}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onAction} activeOpacity={0.8}>
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 8 },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  btn: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
