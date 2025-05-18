import Card from "@/components/Card";
import Header from "@/components/Header";
import SearchComp from "@/components/SearchComp";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useNavigation } from "@react-navigation/native";
import {
  fetchAcceptedOrders,
  fetchAssignedOrders,
  fetchCategory,
  fetchDeliveredOrders,
  fetchNewImages,
  fetchOrdersHistoryTotal,
  fetchPopularProducts,
  changeAvailability,
  fetchAvailability,
} from "@/hooks/useFetch";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useRouter } from "expo-router";
import { useCart } from "@/context/CartProvider";
import { Ionicons } from "@expo/vector-icons";
import AvailabilityToggle from "@/components/AvailabilityToggle";
import LocationTracker from "@/LocationTracker";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

// Responsive scaling functions
const scaleWidth = (size) => (width / 375) * size; // 375 is standard mobile width
const scaleHeight = (size) => (height / 812) * size; // 812 is standard mobile height
const scaleFont = (size) => Math.round((size * width) / 375);

const ITEM_WIDTH = 335; // Adjust as needed

export default function HomeScreen() {
  const { t, i18n } = useTranslation("home");
  const { setCart, addItemToCart } = useCart();
  const { isLogged, user } = useGlobalContext();
  const route = useRouter();
  const colorScheme = useColorScheme();
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalOrders, setTotalOrders] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);

  const handleCartClick = (id) => {
    // navigate(`/shop/${id}`); // Redirect to /shop/:id
    console.log("Cart clicked!", id);
  };

  const fetchAssignedDeliveryOrders = async () => {
    try {
      const result = await fetchAssignedOrders();
      // Sort the orders in descending order (newest first)
      const sortedResult = result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedResult);
      console.log("Assigned orderss:", sortedResult);
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLocalLoading(false);
    }
  };
  const fetchOrdersHistoryTotals = async () => {
    try {
      const result = await fetchOrdersHistoryTotal();
      // Sort the orders in descending order (newest first)
      const sortedResult = result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setTotalOrders(sortedResult);
      console.log("Assigned orderss:", sortedResult);
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLocalLoading(false);
    }
  };
  const fetchAcceptedOrderss = async () => {
    try {
      const result = await fetchAcceptedOrders();
      // Sort the orders in descending order (newest first)
      const sortedResult = result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAcceptedOrders(sortedResult);
      console.log("Fetched orders:", sortedResult);
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDeliveredOrdersHistory = async () => {
    try {
      const result = await fetchDeliveredOrders();
      // Sort the orders in descending order (newest first)
      const sortedResult = result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setDeliveredOrders(sortedResult);
      console.log("Fetched orders:", sortedResult);
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // newestImages();
      // newPopular();
      fetchAssignedDeliveryOrders();
      fetchAcceptedOrderss();
      fetchOrdersHistoryTotals();
      fetchDeliveredOrdersHistory();
      console.log("am i logged in: ", isLogged);
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAssignedDeliveryOrders();
    fetchAcceptedOrderss();
    fetchOrdersHistoryTotals();
    fetchDeliveredOrdersHistory();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  // Hard-coded array of images with text captions (using local images)
  const images = [
    {
      image: require("@/assets/images/signup.png"),
      text: "Recomended Items Today",
    },
    {
      image: require("@/assets/images/signup.png"),
      text: "Recomended Items Today",
    },
    {
      image: require("@/assets/images/signup.png"),
      text: "Recomended Items Today",
    },
  ];

  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  // Scroll to the current index when it changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentIndex * ITEM_WIDTH,
        animated: true,
      });
    }
  }, [currentIndex]);

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour < 6) {
      setGreeting(t("night")); // Midnight to 6 AM
    } else if (currentHour < 12) {
      setGreeting(t("morning")); // 6 AM to 12 PM
    } else if (currentHour < 18) {
      setGreeting(t("afternoon")); // 12 PM to 6 PM
    } else {
      setGreeting(t("evening")); // 6 PM to Midnight
    }
  }, [i18n.language]);

  const handlecategory = async (categoryId, name, name_amh) => {
    route.push(
      `/(tabs)/categorydetail?categoryId=${categoryId}&name=${encodeURIComponent(
        name
      )}&name_amh=${encodeURIComponent(name_amh)}`
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}
    >
      <Header />
      {/* greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.userName}>
          {user?.first_name} {user?.last_name}
        </Text>
      </View>

      <View style={styles.ordersContainer}>
        <View style={styles.ordersHeader}>
          <Text style={styles.ordersHeaderText}>{t("orders")}</Text>
        </View>
        {/* two cards */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            onPress={() => route.push("/(tabs)/orderrequest")}
            style={styles.cardTouchable}
          >
            <View style={[styles.card, styles.assignedCard]}>
              <Text style={styles.cardNumber}>{orders.length}</Text>
              <Text style={styles.cardText}>{t("assigned")}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => route.push("/(tabs)/order")}
            style={styles.cardTouchable}
          >
            <View style={[styles.card, styles.acceptedCard]}>
              <Text style={styles.cardNumber}>{acceptedOrders.length}</Text>
              <Text style={styles.cardText}>{t("accepted")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => route.push("/(tabs)/orderinfo")}
        style={[styles.fullWidthTouchable,{borderColor:"#445399",}]}
      >
        <View style={[styles.fullWidthCard, styles.totalCard]}>
          <Text style={styles.fullWidthNumber}>{totalOrders.length}</Text>
          <Text style={styles.fullWidthText}>{t("total")}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => route.push("/(tabs)/orderdelivered")}
        style={[styles.fullWidthTouchable,{borderColor:"#4CAF50",}]}
      >
        <View style={[styles.fullWidthCard, styles.deliveredCard]}>
          <Text style={styles.fullWidthNumber}>{deliveredOrders.length}</Text>
          <Text style={styles.fullWidthText}>{t("delivered")}</Text>
        </View>
      </TouchableOpacity>

      {/* <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#445399",
            width: "85%",
            height: 200,
            borderRadius: 22,
            margin: 13,
            // padding:2,
          }}
        >
          <Text style={{ color: "white", fontSize: 22 }}> 35</Text>
          <Text style={{ textAlign: "center", color: "white", fontSize: 18 }}>
            {" "}
            Total Orders
          </Text>
        </View>
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: scaleWidth(20),
    marginTop: scaleHeight(10),
    marginBottom: scaleHeight(10),
    gap: scaleWidth(6),
  },
  greetingText: {
    fontSize: scaleFont(16),
    fontFamily: "Poppins-Medium",
    color: "#445399",
  },
  userName: {
    fontSize: scaleFont(16),
    fontStyle: "italic",
    color: "#445399",
    marginLeft: scaleWidth(8),
  },
  ordersContainer: {
    paddingBottom: scaleHeight(12),
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scaleWidth(16),
    marginVertical: scaleHeight(10),
    marginLeft:scaleWidth(4)
  },
  ordersHeaderText: {
    color: "#445399",
    fontSize: scaleFont(20),
    fontWeight: "bold",
    textAlign: "left",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: scaleWidth(17),
    gap: scaleWidth(1),
    alignItems:"center",
    // backgroundColor:"gray"
  },
  cardTouchable: {
    // aspectRatio: 0.9, // Maintain aspect ratio based on width
  //  backgroundColor:"red"
  },
  card: {
    
    borderRadius: scaleWidth(22),
    
    padding: scaleWidth(8),
    // Shadow properties
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    
  },
  assignedCard: {
    flexDirection:"column",
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.43,
    backgroundColor: "#445399",
  },
  acceptedCard: {
    flexDirection:"column",
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.43,
    backgroundColor: "#4CAF50",
  },
  cardNumber: {
    color: "white",
    fontSize: scaleFont(22),
    marginBottom: scaleHeight(8),
  },
  cardText: {
    color: "white",
    fontSize: scaleFont(18),
    textAlign: "center",
  },
  fullWidthTouchable: {
    width: "90%",
    alignSelf: "center",
    marginBottom: scaleHeight(15),
    marginTop: scaleHeight(7),
    borderWidth:1,
    
    borderRadius: scaleWidth(22),
  },
  fullWidthCard: {
    width: "100%",
    height: height * 0.20,
    borderRadius: scaleWidth(22),
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    // backgroundColor:"red",
    backgroundColor: "white",
  },
  deliveredCard: {
    backgroundColor: "white",
  },
  fullWidthNumber: {
    fontSize: scaleFont(22),
    marginBottom: scaleHeight(8),
    color:"#445399"
  },
  fullWidthText: {
    fontSize: scaleFont(18),
    textAlign: "center",
    color:"#445399"
  },
  imageContainer: {
    width: 96, // or 'w-24' converted to pixels, e.g., 96px
    height: 96, // same as above
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    borderColor: "rgba(0,0,0,0.2)", // slight border on left/right
    borderRadius: 24,
    backgroundColor: "#fff", // important for shadows
    // Shadow for iOS:
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // pushes shadow downward
    shadowOpacity: 0.3,
    shadowRadius: 1, // keep radius small so the top isn't blurred
    // For Android:
    elevation: 4, // for Android shadow
    // padding:2,
  },
  image1: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  popularContainer: {
    marginBottom: 36,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap", // Allows wrapping to the next row
    justifyContent: "space-between", // Adds spacing between cards
  },
  cardWrapper: {
    // backgroundColor: "#fff",
    width: "48%",
    marginBottom: 16, // Adds spacing between rows
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  headerContainer: {
    // Space between Header and SearchComp
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 12,
  },
  scrollView: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  card: {
    width: ITEM_WIDTH,
    height: 160,
    borderRadius: 20,
    overflow: "hidden", // Ensures the children are clipped to the borderRadius
    marginRight: 16, // Gap between cards
    position: "relative",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(101,100,114,0.2)",
  },
  textContainer: {
    position: "absolute",
    bottom: 10,
    padding: 16,
    width: 180,
    // backgroundColor: 'white'
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    letterSpacing: 0.5,
    lineHeight: 22,
    fontWeight: "700",
  },
  section: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBackground: {
    resizeMode: "cover",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  },
  contentContainer: {
    alignItems: "center",
    zIndex: 10,
  },
  exploreImage: {
    width: 200,
    height: 300,

    // borderWidth: 1,
    // borderColor: "#7E0201",
  },
  heading: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "italic",
    marginVertical: 10,
    width: 200,
  },
  heading1: {
    color: "#fff",
    textAlign: "start",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "italic",
    marginVertical: 10,
    width: 200,
  },
  heading2: {
    color: "#EFE1D1",
    textAlign: "start",
    fontSize: 8,
    fontWeight: "normal",
    marginBottom: 10,
    width: 200,
  },
  button: {
    width: 90,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7E0201",
    borderRadius: 28,
    marginRight: 106,
  },
  buttonText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "normal",
    textTransform: "uppercase",
  },
  paginationContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#97BD3D",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
});
