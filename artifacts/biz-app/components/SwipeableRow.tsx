import React, { useRef } from 'react';
import { Animated, PanResponder, View, TouchableOpacity, StyleSheet } from 'react-native';

interface SwipeableRowProps {
  children: React.ReactNode;
  rightActions?: () => React.ReactNode;
  onPress?: () => void;
  onSwipeOpen?: () => void;
  onSwipeClose?: () => void;
  disableSwipe?: boolean;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  rightActions,
  onPress,
  onSwipeOpen,
  onSwipeClose,
  disableSwipe = false,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disableSwipe) return false;
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && gestureState.dx < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          pan.setValue(Math.max(gestureState.dx, -150));
        } else if (isOpen.current && gestureState.dx > 0) {
          pan.setValue(Math.max(-150 + gestureState.dx, -150));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          openRow();
        } else {
          closeRow();
        }
      },
    })
  ).current;

  const openRow = () => {
    if (!isOpen.current) {
      isOpen.current = true;
      Animated.spring(pan, {
        toValue: -150,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();
      onSwipeOpen?.();
    }
  };

  const closeRow = () => {
    if (isOpen.current) {
      isOpen.current = false;
      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();
      onSwipeClose?.();
    }
  };

  const handlePress = () => {
    if (isOpen.current) {
      closeRow();
    } else {
      onPress?.();
      closeRow();
    }
  };

  if (disableSwipe || !rightActions) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{children}</TouchableOpacity>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.rightActionsContainer}>
        {rightActions?.()}
      </View>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX: pan }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  content: {
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  rightActionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
});