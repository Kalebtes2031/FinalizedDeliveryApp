// components/AvailabilityToggle.js
import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { fetchAvailability, changeAvailability } from "@/hooks/useFetch";

export default function AvailabilityToggle() {
  const [isAvailable, setIsAvailable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const knobPosition = useRef(new Animated.Value(0)).current;
  const trackColor = useRef(new Animated.Value(0)).current;

  // Animation configurations
  const config = {
    duration: 200,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false,
  };

  useEffect(() => {
    loadInitialStatus();
  }, []);

  useEffect(() => {
    animateToggle(isAvailable ? 1 : 0);
  }, [isAvailable]);

  const loadInitialStatus = async () => {
    try {
      const { is_available } = await fetchAvailability();
      setIsAvailable(is_available);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage("Connection Error - Pull to Refresh");
    } finally {
      setLoading(false);
    }
  };

  const animateToggle = (toValue) => {
    Animated.parallel([
      Animated.spring(knobPosition, {
        toValue: toValue * 22,
        ...config,
      }),
      Animated.timing(trackColor, {
        toValue,
        ...config,
      }),
    ]).start();
  };

  const handleToggle = async () => {
    if (loading) return;
    const newStatus = !isAvailable;

    try {
      setLoading(true);
      setErrorMessage(null);
      await changeAvailability(newStatus);
      setIsAvailable(newStatus);
    } catch (err) {
      setErrorMessage("Update Failed - Tap to Retry");
      animateToggle(isAvailable ? 1 : 0);
    } finally {
      setLoading(false);
    }
  };

  const interpolatedColor = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8F0", "#9AE6B4"],
  });

  if (loading && isAvailable === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.8}
        accessibilityLabel={`Current status: ${
          isAvailable ? "Available" : "Unavailable"
        }. Double tap to toggle`}
        accessibilityRole="switch"
      >
        <View style={styles.content}>
          <Text style={styles.statusText}>
            {isAvailable ? "Online" : "Unavailable"}
          </Text>
          <Animated.View
            style={[styles.track, { backgroundColor: interpolatedColor }]}
          >
            <Animated.View
              style={[
                styles.knob,
                {
                  transform: [{ translateX: knobPosition }],
                  backgroundColor: isAvailable ? "#48BB78" : "#A0AEC0",
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.knobText}>{isAvailable ? "✓" : "✕"}</Text>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableOpacity>

      {errorMessage && (
        <TouchableOpacity onPress={loadInitialStatus}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  knobText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3748",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 8,
    textDecorationLine: "underline",
  },
});
