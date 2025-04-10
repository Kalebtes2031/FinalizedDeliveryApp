// OrderMapViewDelivery.jsx
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebaseConfig";

const OrderMapViewDelivery = ({ order, deliveryPersonId }) => {
  const mapRef = useRef(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  // Extract customer's static location from the order object.
  const customerLocation = {
    latitude: Number(order.customer_latitude),
    longitude: Number(order.customer_longitude),
  };

  useEffect(() => {
    if (!deliveryPersonId) return;
    const deliveryRef = ref(database, `locations/delivery_persons/${deliveryPersonId}`);
    const unsubscribe = onValue(deliveryRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase delivery data:", data); // Log data received
      if (data) {
        const liveLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setDeliveryLocation(liveLocation);
        // Animate region only if the data is valid.
        if (mapRef.current) {
          const newRegion = {
            latitude: (customerLocation.latitude + liveLocation.latitude) / 2,
            longitude: (customerLocation.longitude + liveLocation.longitude) / 2,
            latitudeDelta: Math.max(
              Math.abs(customerLocation.latitude - liveLocation.latitude) * 2.5,
              0.05
            ),
            longitudeDelta: Math.max(
              Math.abs(customerLocation.longitude - liveLocation.longitude) * 2.5,
              0.05
            ),
          };
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    });
    return () => unsubscribe();
  }, [deliveryPersonId, customerLocation]);
  
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {/* Marker for the customer’s location */}
      <Marker coordinate={customerLocation} title="Customer" pinColor="blue" />

      {/* Marker for the live delivery person's location */}
      {deliveryLocation && (
        <>
          <Marker coordinate={deliveryLocation} title="Your Location" pinColor="red" />
          <Polyline
            coordinates={[customerLocation, deliveryLocation]}
            strokeColor="#1E90FF"
            strokeWidth={3}
          />
        </>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: 300,
    height: 150,
    borderRadius: 4,
  },
});

export default OrderMapViewDelivery;
