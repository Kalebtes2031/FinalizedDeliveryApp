import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Modal,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Link } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import Header from "@/components/Header";
import { fetchDeliveredOrders } from "@/hooks/useFetch";
import { format } from "date-fns";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { RadioButton } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import SearchProducts from "@/components/SearchComponent";
import AnimatedCountdown from "@/components/AnimatedCountdown";
import Icon from "react-native-vector-icons/MaterialIcons";



const COLORS = {
  primary: "#2D4150",
  secondary: "#445399",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#FF5722",
  background: "#F8FAFC",
  text: "#2D4150",
  muted: "#94A3B8",
};

const Order = () => {
  const { t, i18n } = useTranslation("order");
  const route = useRouter();
  const { isLogged } = useGlobalContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentType, setPaymentType] = useState("Direct Bank Payment");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAcceptedOrderss();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatCountdown = (scheduledTime) => {
    const scheduled = new Date(scheduledTime);
    const nowDate = new Date(now);
    const diff = scheduled - nowDate;

    if (diff < 0) {
      const daysLate = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return {
        status: "Delayed",
        color: COLORS.error,
        details: `${daysLate} day${daysLate !== 1 ? "s" : ""} overdue`,
      };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      status: `${days}d ${hours}h ${minutes}m ${seconds}s `,
      color: days === 0 && hours < 2 ? COLORS.warning : COLORS.success,
      details: `Due by ${new Date(scheduledTime).toLocaleString()}`,
    };
  };

  const openModal = (order, buttonType, amount) => {
    setSelectedOrder({ order, buttonType, amount });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setPaymentType("Direct Bank Payment");
  };

  const handleSubmitPayment = () => {
    const { order, buttonType, amount } = selectedOrder;
    if (paymentType === "Direct Bank Payment") {
      handleBankPayment(order, buttonType, amount);
    }
    closeModal();
  };
  const handleBankPayment = (order_id, buttonType, amount) => {
    if (buttonType === "advance") {
      amount = (amount * 0.3).toFixed(2);
    }
    console.log(order_id);
    console.log("another one: ", buttonType);
    console.log(amount);
    const paymentData = {
      orderId: order_id,
      amountToPay: amount,
      paymentStatus: buttonType,
    };
    route.push(
      `/(tabs)/collection/directpayment?paymentData=${encodeURIComponent(
        JSON.stringify(paymentData)
      )}`
    );
  };


  const fetchAcceptedOrderss = async () => {
    try {
      const result = await fetchDeliveredOrders();
      // Sort the orders in descending order (newest first)
      const sortedResult = result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedResult);
      console.log("Fetched orders:", sortedResult);
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogged) fetchAcceptedOrderss();
  }, [isLogged]);

  const renderOrderItems = (items) =>
    items.map((item) => (
      <View key={item.id} style={styles.itemContainer}>
        <View>
          <Image
            source={{
              uri:
                item.variant.product?.image || "https://via.placeholder.com/60",
            }}
            style={styles.productImage}
          />
          <Text>
            {t("price")} / {item.variant?.unit}{" "}
          </Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>
            {i18n.language === "en"
              ? item.variant.product?.item_name
              : item.variant.product?.item_name_amh}{" "}
            {parseInt(item.variant?.quantity)}
            {item.variant?.unit}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>
              {t("br")}
              {item.variant?.price}
            </Text>
            <Text style={styles.itemQuantity}>x {item.quantity}</Text>
          </View>
          <Text style={styles.itemTotal}>
            {t("total")}: {t("br")}
            {item.total_price}
          </Text>
        </View>
      </View>
    ));

  const renderOrderPaymentStatus = (status) => {
    let statusStyle = {};
    let statusText = '';
    
    switch (status.toLowerCase()) {
      case "Fully Paid":
        statusStyle = styles.statusCompleted;
        statusText="Fully Paid"
        break;
      case "pending":
        statusStyle = [styles.statusPending]
        statusText ="Pending"
        break;
      case "On Delivery":
        statusStyle = [styles.statusPending]
        statusText ="Cash on Delivery"
        break;
      case "cancelled":
        statusStyle = styles.statusCancelled;
        break;
      default:
        statusStyle = styles.statusDefault;
    }
    return (
      <View style={[styles.statusBadge, statusStyle]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };
  const renderOrderStatus = (status) => {
    let statusStyle = {};
    let statusText = '';
    
    switch (status.toLowerCase()) {
      case "Accepted":
        statusStyle = styles.statusCompleted;
        break;
      case "Delivered":
        statusStyle = styles.statusCompleted;
        break;
      case "Pending":
        statusStyle = [styles.statusPending]
        break;
      case "Assigned":
        statusStyle = [styles.statusPending]
        break;
      case "Ignored":
        statusStyle = styles.statusCancelled;
        break;
      default:
        statusStyle = styles.statusDefault;
    }
    return (
      <View style={[styles.statusBadge, statusStyle]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };

  const renderOrders = () => {
    if (loading) {
      return (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      );
    }

    if (!orders.length) {
      return <Text style={styles.noOrdersText}>{t("no")}</Text>;
    }

    return orders.map((order) => (
      <View key={order.id} style={styles.orderContainer}>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {/* <AnimatedCountdown
            scheduledTime={order.scheduled_delivery}
            warningColor={COLORS.warning}
            successColor={COLORS.success}
          /> */}
          <Text style={styles.metaText}>
            Order Date:{" "}
            {format(new Date(order.created_at), "MMM dd, yyyy HH:mm")}
          </Text>
        </View>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>
            {t("order")} Number Yas-{order.id}
          </Text>
         
        </View>
            <Text>Order Status:  {order.status}</Text>
            <Text>Payment Status:  {renderOrderPaymentStatus(order.payment_status)}</Text>
       

        <Text style={styles.sectionHeader}>{t("items")}</Text>
        {renderOrderItems(order.items)}
        <View style={styles.paymentStatusContainer}>
          <Text style={[styles.metaText, { marginRight: 5 }]}>
            Customer Contact Details:
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <View>
            {order.user.image ? (
              <Image
                source={{ uri: order.user.image }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 38,
                  marginRight: 12,
                  borderWidth: 1,
                }}
              />
            ) : (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 38,
                  marginRight: 12,
                  borderWidth: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name="person" size={40} color="#666" />
              </View>
            )}
           
          </View>
          <View>
            <Text>{order.user.first_name} {order.user.last_name}</Text>
            <Text>{order.user.phone_number}</Text>
          </View>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.orderTotal}>{t("ordertotal")}:</Text>
          <Text style={styles.orderTotal}>
            {t("br")}
            {order.total}
          </Text>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {!isLogged ? (
        <View style={styles.loginPromptContainer}>
          <Text style={styles.loginPromptText}>
            {"please"}{" "}
            <Link href="/(auth)/sign-in" style={styles.loginLink}>
              {"login"}
            </Link>{" "}
            {t("view")}
          </Text>
        </View>
      ) : (
        <View style={styles.mainContainer}>
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
                onPress={() => route.back()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <Text style={styles.categoryTitle}>Delivered Orders</Text>
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
            <Text style={styles.categoryTitle2}>
              {orders.length} Orders
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Fixed Search Container */}
            {/* <View style={styles.searchContainer}>
            <SearchProducts />
          </View> */}

            {renderOrders()}
          </ScrollView>
          <Modal
            visible={isModalOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t("choose")}</Text>
                <View style={styles.radioGroup}>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="Direct Bank Payment"
                      status={
                        paymentType === "Direct Bank Payment"
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => setPaymentType("Direct Bank Payment")}
                    />
                    <Text style={styles.radioLabel}>{t("bank")}</Text>
                  </View>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handleSubmitPayment}
                  >
                    <Text style={styles.proceedButtonText}>{t("proceed")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
};

export default Order;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    height: 230,
    backgroundColor: "#445399",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 23,
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
  },
  categoryTitle2: {
    position: "absolute",
    top: 180,
    left: 20,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
    paddingVertical: 40,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginPromptText: {
    fontSize: 16,
    color: "#666",
  },
  loginLink: {
    color: "#007AFF",
    fontWeight: "600",
  },
  pageTitle: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  ordersCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  orderContainer: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    // shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 22,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  orderMeta: {
    marginBottom: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#666",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "400",
    textTransform: "uppercase",
  },
  statusCompleted: {
    backgroundColor: "rgba(63, 176, 39, 0.8)",
  },
  statusPending: {
    backgroundColor: "#FFF3E0",
  },
  statusCancelled: {
    backgroundColor: "#FFEBEE",
  },
  statusDefault: {
    backgroundColor: "#F5F5F5",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  noOrdersText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
  paymentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "conter",
  },
  icon: {
    marginRight: 8,
    fontSize: 14, // Adjust for your needs
  },
  green: {
    color: "#16a34a", // Tailwind green-600
  },
  yellow: {
    color: "#facc15", // Tailwind yellow-500
  },
  orange: {
    color: "#f97316", // Tailwind orange-500
  },
  red: {
    color: "#ef4444", // Tailwind red-500
  },
  text: {
    fontWeight: "500", // Tailwind font-medium
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioLabel: {
    fontSize: 14,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 14,
  },
  proceedButton: {
    backgroundColor: "#a67c52", // Replace with your desired color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  button: {
    height: 30,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB", // Gray-300
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 12,
    fontFamily: "System", // Replace with your font family if custom
    color: "white",
  },
  partialPaymentButton: {
    backgroundColor: "#F59E0B", // Yellow-500
    marginTop: 12,
  },
  pendingButtonsContainer: {
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 28,
    marginTop: 12,
  },
  fullPaymentButton: {
    backgroundColor: "#A67C52", // Primary-lightbrown
  },
  advancePaymentButton: {
    backgroundColor: "#F97316", // Orange-500
  },
});
