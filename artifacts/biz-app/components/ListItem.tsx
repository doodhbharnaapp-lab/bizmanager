import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  valueSub?: string;
  valueColor?: string;
  onPress?: () => void;
  leftIcon?: string;
  rightElement?: React.ReactNode;
}

export function ListItem({ title, subtitle, value, valueSub, valueColor, onPress, leftIcon, rightElement }: ListItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {leftIcon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
          <Feather name={leftIcon as any} size={18} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {(value || rightElement) ? (
        <View style={styles.right}>
          {value ? (
            <>
              <Text style={[styles.value, { color: valueColor || colors.foreground }]}>{value}</Text>
              {valueSub ? <Text style={[styles.valueSub, { color: colors.mutedForeground }]}>{valueSub}</Text> : null}
            </>
          ) : null}
          {rightElement}
          {onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 4 }} /> : null}
        </View>
      ) : onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  right: { alignItems: "flex-end", marginLeft: 8 },
  value: { fontSize: 15, fontFamily: "Inter_700Bold" },
  valueSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
