import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';
import { ref, set } from 'firebase/database';
import { database } from '@/firebaseConfig';

const DeliveryLocationTracker = ({ deliveryPersonId }) => {
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // update every 2 seconds
          distanceInterval: 5, // update when moved 5 meters
        },
        (loc) => {
          // Update Firebase delivery person node with live location
          set(ref(database, `locations/delivery_persons/${deliveryPersonId}`), {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: Date.now(),
          })
            .then(() => console.log('Delivery location updated'))
            .catch((error) => console.error('Error updating location:', error));
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [deliveryPersonId]);

  return (
    <View style={{ padding: 20 }}>
      {errorMsg ? (
        <Text>Error: {errorMsg}</Text>
      ) : (
        <Text>Tracking delivery location...</Text>
      )}
    </View>
  );
};

export default DeliveryLocationTracker;
