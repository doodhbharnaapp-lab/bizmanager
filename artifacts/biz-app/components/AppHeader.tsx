import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

export function AppHeader({ title, subtitle, showBack, rightComponent }: AppHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="arrow-left" size={22} color={colors.primaryForeground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.primaryForeground }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.primaryForeground + "BB" }]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{rightComponent}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 14, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "flex-start" },
  titleWrap: { flex: 1, alignItems: "center" },
  title: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  right: { width: 36, alignItems: "flex-end" },
});
