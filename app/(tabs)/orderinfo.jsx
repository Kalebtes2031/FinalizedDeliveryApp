import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCart } from "@/context/CartProvider";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useWatchlist } from "@/context/WatchlistProvider";
import { useTranslation } from "react-i18next";
import { AcceptOrders, fetchOrdersHistoryTotal } from "@/hooks/useFetch";
import { format } from "date-fns";

const OrderTotal = () => {
  const { t, i18n } = useTranslation("orderinfo");
  const { watchlist } = useWatchlist();
  const { cart, loadCartData, updateItemQuantity, removeItemFromCart } =
    useCart();
  const [localLoading, setLocalLoading] = useState(null);
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTotalHistoryOrders();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    fetchTotalHistoryOrders();
  }, []);
  const handleQuantityUpdate = async (itemId, newQuantity) => {};
  const handleRemoveCartItems = async (id) => {};

  const fetchTotalHistoryOrders = async () => {
    try {
      const result = await fetchOrdersHistoryTotal();
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

  const handlePress = (product) => {
    router.push(
      `/carddetail?product=${encodeURIComponent(JSON.stringify(product))}`
    );
  };
  if (!cart || !cart.items) {
    return (
      // <View style={styles.emptyContainer}>
      //   <MaterialIcons name="remove-shopping-cart" size={60} color="#ccc" />
      //   <Text style={styles.emptyText}>Your cart is empty</Text>
      // </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleIgnore = (orderId) => {
    console.log("Ignore order:", orderId);
    // your logic here
  };

  const handleAccept = async (orderId) => {
    try {
      const response = await AcceptOrders(orderId);
      console.log("Accept order:", response);
      fetchTotalHistoryOrders();

      Toast.show({
        type: "success",
        text1: `Order Yas-${orderId} has been accepted Successfully `,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to accept order",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {orders.length === 0 ? (
        <View>
          <View style={styles.headerContainer}>
            <Header />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "start",
                paddingHorizontal: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
                className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
              >
                <Ionicons name="arrow-back" size={24} color="#445399" />
              </TouchableOpacity>
              <Text
                className="font-poppins-bold text-center text-primary mb-4"
                style={styles.headerTitle}
              >
                {t('order')}
              </Text>
              <View></View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "column",
              gap: 12,
              justifyContent: "center",
              alignItems: "center",
              padding: 23,
              backgroundColor: "rgba(150, 166, 234, 0.4)",
              margin: 42,
              borderRadius: 19,
            }}
          >
            <View
              style={{
                width: 240,
                height: 240,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Image
                style={{ width: 240, height: 240 }}
                source={require("@/assets/images/noorder2.png")}
                resizeMode="contain"
              />
            </View>
            <Text
              className="text-primary font-poppins-bold"
              style={{
                fontSize: 16,
                fontWeight: 700,
                textAlign: "center",
                padding: 13,
                marginTop: 15,
              }}
            >
              {t('thereisno')}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* <Header /> */}
            <View style={styles.headerContainer}>
              <Header />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "start",
                  paddingHorizontal: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
                  className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
                >
                  <Ionicons name="arrow-back" size={24} color="#445399" />
                </TouchableOpacity>
                <Text
                  className="font-poppins-bold text-center text-primary mb-4"
                  style={styles.headerTitle}
                >
                  {t('history')}
                </Text>
                <View></View>
              </View>
            </View>

            <View style={styles.scrollContainers}>
              {orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {/* Order Header */}
                    <Text style={styles.orderNumber}>
                      {t('number')} Yas-{order.id}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 46,
                      }}
                    >
                      <View>
                        {/* Scheduled Time */}
                        <Text style={styles.orderInfo}>
                          {t('scheduled')}:{" "}
                          {format(
                            new Date(order.scheduled_delivery),
                            "MMM dd, yyyy"
                          )}
                        </Text>
                        {/* Scheduled Time */}
                        <Text style={styles.orderInfo}>
                          {t('orderstatus')}: {order.status}
                        </Text>
                        <Text style={styles.orderInfo}>
                          {t('paymentstatus')}: {order.payment_status}
                        </Text>
                      </View>
                      <View style={{ marginBottom: 12 }}>
                        {/* Total Items */}
                        <Text
                          className="underline text-gray-500"
                          style={{ fontSize: 18, marginBottom: 1 }}
                        >
                          {t('items')}:
                        </Text>
                        {order.items.map((item) => (
                          <View key={item.id} style={{ marginLeft: 13 }}>
                            <Text>
                              {i18n.language === "en"
                                ? item.variant.product?.item_name
                                : item.variant.product?.item_name_amh}{" "}
                              {parseInt(item.variant?.quantity)}
                              {item.variant?.unit}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <Text
                        className="text-end"
                        style={{ 
                          textAlign: "right", 
                           padding:2,
                           fontSize:16,
                           fontWeight:700
                        }}
                      >
                        {t('total')} {order.total} {t('br')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <Toast />
    </SafeAreaView>
  );
};

// Add these new styles to your StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
  headerContainer: {
    // height: 60,
    backgroundColor: "#fff",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  orderCard: {
    backgroundColor: "#D6F3D5",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },

  orderInfo: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: 12,
    width:"100%",
    gap: 10,
  },

  button: {
    flex: 0.4,
    paddingVertical: 10,
    borderRadius: 58,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // emptyContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // emptyText: {
  //   fontSize: 18,
  //   color: "#666",
  //   marginTop: 10,
  // },
  // headerContainer: {
  //   height: 60,
  //   backgroundColor: "#fff",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 10,
  // },
  iconWrapper: {
    position: "relative",
    marginRight: 16,
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#445399",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    // zIndex: 10, // Ensures the badge is on top
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  backButton: {
    marginRight: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // ... keep the rest of your existing styles
  scrollContainers: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#D6F3D5",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "500",
    minWidth: 24,
    textAlign: "center",
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  actionContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 4,
  },
  totalContainers: {
    flexDirection: "column",
    justifyContent: "center",
    // alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center text horizontally
    alignItems: "center", // Center text vertically
    paddingVertical: 10, // Ensure proper spacing
    paddingHorizontal: 16,
    backgroundColor: "#75767C",
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
    gap: 4,
    width: "70%", // Ensure proper width
    borderRadius: 42,
  },

  totalText: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  proceedCheckout: {
    paddingHorizontal: 12,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
});

export default OrderTotal;
