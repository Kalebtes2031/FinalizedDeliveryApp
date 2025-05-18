// // OrderMapViewDelivery.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { StyleSheet } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import { ref, onValue } from "firebase/database";
// import { database } from "@/firebaseConfig";

// const OrderMapViewDelivery = ({ order, deliveryPersonId }) => {
//   const mapRef = useRef(null);
//   const [deliveryLocation, setDeliveryLocation] = useState(null);

//   // Extract customer's static location from the order object.
//   const customerLocation = {
//     latitude: Number(order.customer_latitude),
//     longitude: Number(order.customer_longitude),
//   };

//   useEffect(() => {
//     if (!deliveryPersonId) return;
//     const deliveryRef = ref(database, `locations/delivery_persons/${deliveryPersonId}`);
//     const unsubscribe = onValue(deliveryRef, (snapshot) => {
//       const data = snapshot.val();
//       console.log("Firebase delivery data:", data); // Log data received
//       if (data) {
//         const liveLocation = {
//           latitude: data.latitude,
//           longitude: data.longitude,
//         };
//         setDeliveryLocation(liveLocation);
//         // Animate region only if the data is valid.
//         if (mapRef.current) {
//           const newRegion = {
//             latitude: (customerLocation.latitude + liveLocation.latitude) / 2,
//             longitude: (customerLocation.longitude + liveLocation.longitude) / 2,
//             latitudeDelta: Math.max(
//               Math.abs(customerLocation.latitude - liveLocation.latitude) * 2.5,
//               0.05
//             ),
//             longitudeDelta: Math.max(
//               Math.abs(customerLocation.longitude - liveLocation.longitude) * 2.5,
//               0.05
//             ),
//           };
//           mapRef.current.animateToRegion(newRegion, 1000);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, [deliveryPersonId, customerLocation]);

//   return (
//     <MapView
//       ref={mapRef}
//       style={styles.map}
//       initialRegion={{
//         latitude: customerLocation.latitude,
//         longitude: customerLocation.longitude,
//         latitudeDelta: 0.05,
//         longitudeDelta: 0.05,
//       }}
//     >
//       {/* Marker for the customer’s location */}
//       <Marker coordinate={customerLocation} title="Customer" pinColor="blue" />

//       {/* Marker for the live delivery person's location */}
//       {deliveryLocation && (
//         <>
//           <Marker coordinate={deliveryLocation} title="Your Location" pinColor="red" />
//           <Polyline
//             coordinates={[customerLocation, deliveryLocation]}
//             strokeColor="#1E90FF"
//             strokeWidth={3}
//           />
//         </>
//       )}
//     </MapView>
//   );
// };

// const styles = StyleSheet.create({
//   map: {
//     width: 300,
//     height: 150,
//     borderRadius: 4,
//   },
// });

// export default OrderMapViewDelivery;

// OrderMapViewDelivery.jsx
// OrderMapViewDelivery.jsx
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { ref, onValue, set } from "firebase/database";
import { database } from "@/firebaseConfig";
import Entypo from "@expo/vector-icons/Entypo";

const {
  MapView,
  Camera,
  RasterSource,
  RasterLayer,
  ShapeSource,
  LineLayer,
  MarkerView,
} = MapLibreGL;

// Helper to fetch a road‑network route from OSRM
// async function fetchShortestRoadRoute(start, end) {
//   const url =
//     `https://router.project-osrm.org/route/v1/driving/` +
//     `${start[0]},${start[1]};${end[0]},${end[1]}` +
//     `?overview=full&geometries=geojson&alternatives=true`;

//   const resp = await fetch(url);
//   const json = await resp.json();
//   if (json.code === "Ok" && Array.isArray(json.routes) && json.routes.length) {
//     // Pick the route with the smallest 'distance' (in meters)
//     const shortest = json.routes.reduce((best, route) =>
//       route.distance < best.distance ? route : best
//     , json.routes[0]);

//     return shortest.geometry.coordinates; // array of [lon, lat]
//   }
//   // fallback to straight line if something went wrong
//   return [start, end];
// }

async function fetchRoadRoute(start, end) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start[0]},${start[1]};${end[0]},${end[1]}` +
    `?overview=full&geometries=geojson`;
  const resp = await fetch(url);
  const json = await resp.json();
  if (json.code === "Ok" && json.routes.length) {
    return json.routes[0].geometry.coordinates; // array of [lon, lat]
  }
  return [start, end]; // fallback straight line
}

export default function OrderTrackingMap({ order, isDriver }) {
  const cameraRef = useRef(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [bounds, setBounds] = useState(null);

  // Static customer position [lon, lat]
  const customerCoord = [
    Number(order.customer_longitude),
    Number(order.customer_latitude),
  ];

  // If this is the driver’s screen, start watching & writing location
  useEffect(() => {
    if (!isDriver) return;
    let subscriber;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setDeliveryLocation({ latitude, longitude });
          set(ref(database, `locations/orders/${order.id}`), {
            latitude,
            longitude,
            timestamp: Date.now(),
          });
        }
      );
    })();
    return () => subscriber && subscriber.remove();
  }, [isDriver, order.id]);

  // Listen + route + fit bounds
   // Listen + route + fit bounds
  useEffect(() => {
    const locRef = ref(database, `locations/orders/${order.id}`);
    const unsub = onValue(locRef, async (snap) => {
      const data = snap.val();
      if (!data?.latitude || !data?.longitude) return;

      const live = { latitude: Number(data.latitude), longitude: Number(data.longitude) };
      setDeliveryLocation(live);

      // compute real road route
      const start = customerCoord;
      const end = [live.longitude, live.latitude];
      const road = await fetchRoadRoute(start, end);
      setRouteCoords(road);

      // calculate bounds
      let lons = [start[0], end[0]];
      let lats = [start[1], end[1]];
      let ne = [Math.max(...lons), Math.max(...lats)];
      let sw = [Math.min(...lons), Math.min(...lats)];

      // Prevent zero‐area by expanding tiny bounds
      const MIN_DELTA = 0.0005; // approx 50m
      if (Math.abs(ne[0] - sw[0]) < MIN_DELTA) {
        ne[0] += MIN_DELTA;
        sw[0] -= MIN_DELTA;
      }
      if (Math.abs(ne[1] - sw[1]) < MIN_DELTA) {
        ne[1] += MIN_DELTA;
        sw[1] -= MIN_DELTA;
      }

      // Fit both in view
      cameraRef.current?.fitBounds(ne, sw, 50 /* padding */, 1000 /* ms */);
    });
    return () => unsub();
  }, [order.id]);

  // determine line coordinates
  const lineCoordinates = routeCoords.length
    ? routeCoords
    : deliveryLocation
    ? [customerCoord, [deliveryLocation.longitude, deliveryLocation.latitude]]
    : [];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
      >
        <RasterSource
          id="osmSource"
          tileUrlTemplates={[
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          ]}
          tileSize={256}
        >
          <RasterLayer id="osmLayer" />
        </RasterSource>

        {/* <Camera ref={cameraRef} centerCoordinate={customerCoord} zoomLevel={11} /> */}
        <Camera
          ref={cameraRef}
          {...(!deliveryLocation
            ? { centerCoordinate: customerCoord, zoomLevel: 11 }
            : {})}
        />
        {/* Customer pin */}
        <MarkerView coordinate={customerCoord}>
          {/* <View style={[styles.pin, { backgroundColor: "#007AFF" }]}>
            <Entypo name="location-pin" size={28} color="#fff" />
          </View> */}
          <View style={[styles.pin, { backgroundColor: "#445399" }]}>
            {/* <FontAwesome6 name="map-pin" size={28} color="#445399" /> */}
            <Entypo name="location-pin" size={28} color="#fff" />
            {/* <EvilIcons name="location" size={28} color="#445399" /> */}
          </View>
        </MarkerView>

        {/* Delivery pin */}
        {deliveryLocation && (
          <MarkerView
            coordinate={[deliveryLocation.longitude, deliveryLocation.latitude]}
          >
            <View style={[styles.pin, { backgroundColor: "#FF3B30" }]}>
              <Entypo name="location-pin" size={28} color="#fff" />
            </View>
          </MarkerView>
        )}

        {/* Road route polyline */}
        {deliveryLocation && (
          <ShapeSource
            id="route"
            shape={{
              type: "Feature",
              geometry: { type: "LineString", coordinates: lineCoordinates },
            }}
          >
            <LineLayer
              id="routeLine"
              style={{ lineColor: "#445399", lineWidth: 3 }}
            />
          </ShapeSource>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 430, overflow: "hidden" },
  map: { flex: 1 },
  // pin: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", elevation: 5 },
 pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
