import React, { useEffect, useState, useCallback } from "react";
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
import { AcceptOrders, fetchAssignedOrders } from "@/hooks/useFetch";
import { useFocusEffect } from "@react-navigation/native";

const OrderRequest = () => {
  const { t, i18n } = useTranslation("cartscreen");
  const { watchlist } = useWatchlist();
  const { cart, loadCartData, updateItemQuantity, removeItemFromCart } =
    useCart();
  const [localLoading, setLocalLoading] = useState(null);
  const [orders, setOrders] = useState([]);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAssignedDeliveryOrders();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAssignedDeliveryOrders();
    }, [])
  );
  const handleQuantityUpdate = async (itemId, newQuantity) => {};
  const handleRemoveCartItems = async (id) => {};

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
      fetchAssignedDeliveryOrders();

      Toast.show({
        type: "success",
        text1: t("ordernu"),
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
                {t("assignedorders")}
              </Text>
              <View style={{ width: 33 }}></View>
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
              {t("thereisno")}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            onRefresh={onRefresh}
            refreshing={refreshing}
          >
            {/* <Header /> */}
            {/* <View style={styles.headerContainer}>
             
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    marginHorizontal: 10,
                    paddingHorizontal: 2,
                    borderWidth: 1,
                    borderRadius: 52,
                    paddingVertical: 2,
                    borderColor: "#445399",
                  }}
                  className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
                >
                  <Ionicons name="arrow-back" size={24} color="#445399" />
                </TouchableOpacity>
                <Text
                  className="font-poppins-bold text-center text-primary mb-4"
                  style={styles.headerTitle}
                >
                  {t("assignedorders")}
                </Text>
                <View></View>
              </View>
            </View> */}
            {/* fhdg */}
            <View style={styles.header}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.categoryTitle}> {t("assignedorders")}</Text>
                <View></View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  style={styles.productImage}
                  source={require("@/assets/images/deliverytruck.png")}
                />
              </View>
              {/* <Text style={styles.categoryTitle2}>
              {orders.length} {t('accepted')}
            </Text> */}
            </View>
            <View style={styles.scrollContainers}>
              {orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "start",
                      alignItems: "start",
                    }}
                  >
                    {/* Order Header */}
                    <Text style={styles.orderNumber}>
                      {t("num")} #Yas-{order.id}
                    </Text>

                    {order.items.map((item) => (
                      <View
                        key={item.id}
                        style={{
                          marginLeft: 3,
                          flexDirection: "row",
                          justifyContent: "start",
                          alignItems: "start",
                          marginBottom: 12,
                          // gap:6
                        }}
                      >
                        <View>
                          <Image
                            source={{
                              uri:
                                item.variant.product?.image ||
                                "https://via.placeholder.com/60",
                            }}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 8,
                              marginRight: 12,
                            }}
                          />
                          <Text>
                            {t("price")} / {t(`${item.variant?.unit}`)}{" "}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingRight: 22,
                          }}
                        >
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>
                              {i18n.language === "en"
                                ? item.variant.product.item_name
                                : item.variant.product.item_name_amh}
                            </Text>

                            <Text
                              style={{
                                fontSize: 12,
                                color: "#94A3B8",
                                marginTop: 4,
                              }}
                            >
                              {item.quantity} x{" "}
                              {i18n.language === "en" ? t("br") : ""}
                              {item.price}{" "}
                              {i18n.language === "amh" ? t("br") : ""}
                            </Text>
                          </View>
                          <View>
                            <Text
                              style={{
                                fontSize: 16,
                                // fontWeight: "600",
                                marginBottom: 4,
                              }}
                            >
                              {t("subtotal")}
                            </Text>

                            <Text
                              style={{
                                fontSize: 12,
                                color: "#94A3B8",
                                marginTop: 4,
                              }}
                            >
                              {i18n.language === "en" ? t("br") : ""}
                              {item.total_price}{" "}
                              {i18n.language === "amh" ? t("br") : ""}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}

                    {/* Total Items */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        borderTopWidth: 1,
                        borderTopColor: "#445399",
                        borderBottomWidth: 1,
                        borderBottomColor: "#445399",
                        marginBottom: 4,
                        paddingBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-end",
                          justifyContent: "flex-start",
                          marginTop: 6,
                          gap: 4,
                          // justifyContent: "space-between",
                          // marginTop: 16,
                          // paddingTop: 16,
                          // borderTopWidth: 1,
                          // borderTopColor: "#F1F5F9",
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: 600 }}>
                          {t("totalamount")}:
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                          {i18n.language === "en" ? t("br") : ""}
                          {order.total} {i18n.language === "amh" ? t("br") : ""}
                        </Text>
                      </View>
                    </View>

                    {/* Scheduled Time */}
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          marginBottom: 4,
                          color: "#445399",
                          fontWeight: 600,
                          width:"26%"
                        }}
                      >
                        {" "}
                        {t("scheduled")}
                      </Text>
                      <Text style={styles.orderInfo}>
                        : {new Date(order.scheduled_delivery).toLocaleString()}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      {/* <TouchableOpacity
                        style={[styles.button, { backgroundColor: "#E2052A" }]}
                        onPress={() => handleIgnore(order.id)}
                      >
                        <Text style={styles.buttonText}>Ignore</Text>
                      </TouchableOpacity> */}

                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: "#445399" }]}
                        onPress={() => handleAccept(order.id)}
                      >
                        <Text style={styles.buttonText}>{t("accept")}</Text>
                      </TouchableOpacity>
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  header: {
    height: 130,
    backgroundColor: "#445399",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 13,
  },
  backButton: {
    // position: "absolute",
    // left: 20,
    // top: 40,
    backgroundColor: "#445399",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: "white",
  },
  categoryTitle: {
    // position: "absolute",
    // top: 100,
    // left: 20,
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 32,
  },
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
    paddingHorizontal: 14,

    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  orderCard: {
    // backgroundColor: "#D6F3D5",
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    padding: 12,
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
    marginBottom: 12,
    textAlign: "center",
    color: "#445399",
    borderBottomWidth: 1,
    borderBottomColor: "#445399",
    paddingBottom: 6,
  },

  orderInfo: {
    fontSize: 14,
    marginBottom: 4,
    color: "#445399",
    fontWeight: 600,
    fontStyle: "italic",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
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
    width:"100%",
    textAlign:"center",
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
  // backButton: {
  //   marginRight: 10,
  //   paddingHorizontal: 12,
  // },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#445399",
    marginRight: 16,
    marginTop: 16,
  },
  // ... keep the rest of your existing styles
  scrollContainers: {
    paddingHorizontal: 12,
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

export default OrderRequest;
