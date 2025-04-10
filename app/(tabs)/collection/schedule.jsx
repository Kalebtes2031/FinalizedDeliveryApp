// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { TextInput } from "react-native";

// const Schedule = () => {
//   const [text, setText] = useState("");
//   const router = useRouter();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.headerContainer}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
//             className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
//           >
//             <Ionicons name="arrow-back" size={24} color="#445399" />
//           </TouchableOpacity>
//         </View>
//         <Text
//           className="font-poppins-bold text-center text-primary mb-4"
//           style={styles.headerTitle}
//         >
//           Schedule Delivery
//         </Text>
//         <Text
//           style={{ fontSize: 18, paddingLeft: 8 }}
//           className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
//         >
//           Address
//         </Text>
//         <TextInput
//           style={{
//             height: 50,
//             width: "100%",
//             borderColor: "gray",
//             borderWidth: 1,
//             paddingHorizontal: 15,
//             marginBottom: 10,
//             borderRadius: 39,
//           }}
//           placeholder="Type your home address"
//           onChangeText={(value) => setText(value)}
//           value={text}
//         />
//         <View
//           style={{
//             padding: 10,
//           }}
//         >
//           <Image source={require("@/assets/images/map.png")} />
//         </View>
//         <Text
//           style={{ fontSize: 18, paddingLeft: 8, marginTop: 15 }}
//           className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
//         >
//           Date and Time
//         </Text>
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginHorizontal: 32,
//           }}
//         >
//           <Image source={require("@/assets/images/calender.png")} />
//           <Image source={require("@/assets/images/time.png")} />
//         </View>

//         <TouchableOpacity
//           style={styles.placeOrderButton}
//           // onPress={handlePlaceOrder}
//           onPress={() => router.replace("/(tabs)/orderinfo")}
//           //   disabled={isLoading}
//         >
//           <Text style={styles.placeOrderText}>
//             {/* {isLoading ? "Pay Now" : "Pay Now"} */}
//               CONFIRM ORDER
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };
// export default Schedule;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   container: {
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//   },
//   title: {
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 16,
//     color: "#7E0201",
//   },
//   instructions: {
//     fontSize: 14,
//     color: "#4B5563",
//     marginBottom: 8,
//   },
//   stepsContainer: {
//     marginLeft: 16,
//     marginBottom: 16,
//   },
//   stepText: {
//     fontSize: 14,
//     color: "#4B5563",
//     marginBottom: 4,
//   },
//   headerContainer: {
//     height: 60,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     // borderBottomWidth: 1,
//     // borderBottomColor: "#eee",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   placeOrderButton: {
//     backgroundColor: "#445399",
//     borderRadius: 38,
//     padding: 16,
//     alignItems: "center",
//     marginTop: 38,
//   },
//   placeOrderText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// }); console.log('orderId am:',orderId)

// @/screens/ScheduleDeliveryScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, Overlay, Icon } from "@rneui/themed";
// import DateTimePicker from "expo-date-time-picker";
import {
  fetchOrderDetail,
  scheduleDelivery,
  scheduleDeliveryAndPickFromStore,
} from "@/hooks/useFetch";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import * as Animatable from "react-native-animatable";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TimePickerModal } from "react-native-paper-dates";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const ScheduleDeliveryScreen = () => {
  const { t, i18n } = useTranslation("schedule");
  const { orderId } = useLocalSearchParams();
  // let num = 40;
  // const orderId = num;
  const navigation = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [text, setText] = useState("");
  const [product, setProduct] = useState({});
  const [selectedOption, setSelectedOption] = useState("needDelivery");

  const fetchOrderData = async () => {
    const response = await fetchOrderDetail(orderId);
    setProduct(response);
    // console.log("orderId am:", orderId);
    console.log("detail info on order:", response);
  };
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    console.log("orderId am:", orderId);
    fetchOrderData();
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(new Date(date.timestamp));
    setCalendarOpen(false);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setSelectedDate(
        (prev) =>
          new Date(
            prev.setHours(selectedTime.getHours(), selectedTime.getMinutes())
          )
      );
    }
  };

  const validateDateTime = () => {
    const now = new Date();
    if (selectedDate <= now) {
      setError(t("please"));
      return false;
    }
    return true;
  };

  const handleSchedule = async () => {
    if (!validateDateTime()) return;

    setLoading(true);
    try {
      await scheduleDelivery(orderId, selectedDate.toISOString());
      navigation.push(
        `/(tabs)/orderinfo?orderId=${encodeURIComponent(
          JSON.stringify(orderId)
        )}`
      );
      // Show success toast here
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to schedule delivery");
    } finally {
      setLoading(false);
    }
  };
  const handleScheduleForPickFromStore = async () => {
    if (!validateDateTime()) return;

    setLoading(true);
    try {
      await scheduleDeliveryAndPickFromStore(
        orderId,
        selectedDate.toISOString()
      );
      navigation.push(
        `/(tabs)/orderinfo?orderId=${encodeURIComponent(
          JSON.stringify(orderId)
        )}`
      );
      // Show success toast here
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to schedule delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
          className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
        >
          <Ionicons name="arrow-back" size={24} color="#445399" />
        </TouchableOpacity>
      </View>
      <Text
        className="font-poppins-bold text-center text-primary mb-4"
        style={{ fontSize: 20, fontWeight: "bold" }}
      >
        {t("schedule")}
      </Text>
      <Text
        style={{ fontSize: 18, paddingLeft: 8 }}
        className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
      >
        {t("address")}
      </Text>
      <TextInput
        style={{
          height: 50,
          width: "100%",
          borderColor: "gray",
          borderWidth: 1,
          paddingHorizontal: 15,
          marginBottom: 10,
          borderRadius: 39,
        }}
        placeholder="Type your home address"
        onChangeText={(value) => setText(value)}
        value={text}
      />
      <View
        style={{
          padding: 10,
        }}
      >
        <Image source={require("@/assets/images/map.png")} />
      </View>
      <Text
        style={{ fontSize: 18, paddingLeft: 8, marginTop: 15 }}
        className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
      >
        {t("date")}
      </Text>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {error ? (
          <Animatable.View
            animation="shake"
            duration={500}
            style={styles.errorContainer}
          >
            <Icon name="error-outline" color="#ff4444" />
            <Text style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: 4,
          }}
        >
          <View style={styles.calendarContainer}>
            {calendarOpen && (
              <Calendar
                minDate={format(new Date(), "yyyy-MM-dd")}
                onDayPress={handleDateSelect}
                markedDates={{
                  [format(selectedDate, "yyyy-MM-dd")]: { selected: true },
                }}
                theme={{
                  backgroundColor: "#ffffff",
                  calendarBackground: "#ffffff",
                  selectedDayBackgroundColor: "#445399",
                  todayTextColor: "#445399",
                  arrowColor: "#445399",
                  monthTextColor: "#2d4150",
                  textDayFontWeight: "300",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "300",
                }}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock" type="feather" color="#2089dc" />
            <Text style={styles.timeText}>
              {format(selectedDate, "hh:mm a")}
            </Text>
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          // <Overlay
          //   isVisible={showTimePicker}
          //   onBackdropPress={() => setShowTimePicker(false)}
          // >
          <View style={styles.timePickerContainer}>
            <TimePickerModal
              visible={showTimePicker}
              onDismiss={() => {
                setShowTimePicker(false);
                setCalendarOpen(true);
              }}
              onConfirm={({ hours, minutes }) => {
                const newDate = new Date(selectedDate);
                newDate.setHours(hours, minutes);
                setSelectedDate(newDate);
                console.log(newDate);
                setShowTimePicker(false);
                setCalendarOpen(true);
              }}
              hours={selectedDate.getHours()}
              minutes={selectedDate.getMinutes()}
            />
          </View>
        )}

        <Button
          title={loading ? t("scheduling") : t("confirm")}
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={handleSchedule}
          disabled={loading}
          loading={loading}
          icon={
            <Icon
              name="check-circle"
              type="material"
              color="white"
              iconStyle={{ marginRight: 10 }}
            />
          }
        />

        <View style={{ marginTop: 20 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", padding: 5 }}
          >
            <View className="flex-row items-center gap-3 my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-500 font-poppins-medium">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>
          </View>
          <Button
            title={loading ? t("scheduling") : t("pick")}
            buttonStyle={styles.button1}
            containerStyle={styles.buttonContainer1}
            onPress={handleScheduleForPickFromStore}
            disabled={loading}
            loading={loading}
          />
          {/* <TouchableOpacity
            onPress={() => handleScheduleForPickFromStore()}
            style={{
              backgroundColor: "#55B051",
              borderRadius: 48,
              alignItems: "center",
              paddingVertical: 15,
            }}
          >
            <Text style={{ fontSize: 16, color: "#fff" }}>{t("pick")}</Text>
          </TouchableOpacity> */}
        </View>

        {/* <View style={{ marginTop: 12 }}>
        <Button title="Show Date Picker" onPress={showDatePicker} />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </View> */}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    // flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 15,
  },
  title: {
    marginBottom: 8,
    color: "#2d4150",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#86939e",
    textAlign: "center",
    marginBottom: 30,
  },
  calendarContainer: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 25,
    elevation: 3,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
    marginRight: 3,
  },
  timeText: {
    fontSize: 18,
    marginLeft: 10,
    color: "#2d4150",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#445399",
    borderRadius: 48,
    paddingVertical: 15,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 10,
  },
  button1: {
    backgroundColor: "#55B051",
    borderRadius: 48,
    paddingVertical: 15,
  },
  buttonContainer1: {
    marginTop: 20,
    borderRadius: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe9e9",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  errorText: {
    color: "#ff4444",
    marginLeft: 10,
    fontSize: 14,
  },
  timePickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
  },
  pickerItem: {
    fontSize: 20,
    color: "#2089dc",
  },
});

export default ScheduleDeliveryScreen;
