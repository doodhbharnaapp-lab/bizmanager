import React from "react";
import { TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface FABProps {
  onPress: () => void;
  icon?: string;
  bottom?: number;
}

export function FAB({ onPress, icon = "plus", bottom }: FABProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomOffset = bottom ?? (Platform.OS === "web" ? 100 : insets.bottom + 90);
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomOffset }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Feather name={icon as any} size={24} color={colors.primaryForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
