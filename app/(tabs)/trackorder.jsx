import { fetchDeliveryNeedOrderHistory } from "@/hooks/useFetch";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedCountdown from "@/components/AnimatedCountdown";
import { useTranslation } from "react-i18next";
import OrderMapViewDelivery from "@/components/OrderMapViewDelivery";
import DeliveryLocationTracker from "@/components/DeliveryLocationTracker";


// Color Constants
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

// const handleprsss = async (id) => {
//   const response = await confirmOrder(id);
//   loadData();
//   console.log("is it confirmed", response);
// };
// {item.status === "Accepted" && (
//   <TouchableOpacity
//     style={[styles.button, { backgroundColor: "#4CAF50" }]}
//     onPress={() => handleprsss(order.id)}
//   >
//     <Text style={styles.buttonText}>Confirm</Text>
//   </TouchableOpacity>
// )}

const OrderTrackingScreen = () => {
  const { t, i18n } = useTranslation("track");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchDeliveryNeedOrderHistory();
      // Sort orders descending by id
      const sortedData = data.sort((a, b) => b.id - a.id);
      setOrders(sortedData);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
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

  const renderOrderItem = ({ item }) => {
    const timeInfo =
      item.status === "Delivered"
        ? {
            status: "Delivered",
            color: COLORS.success,
            details: `Delivered on ${new Date(
              item.scheduled_delivery
            ).toLocaleDateString()}`,
          }
        : formatCountdown(item.scheduled_delivery);
        // console.log("Delivery Person ID:", item?.delivery_person?.user?.id);

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <LinearGradient
          colors={[`${timeInfo.color}25`, "#FFFFFF"]}
          style={styles.cardHeaderNew}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.orderNumber}>ORDER #{item.id}</Text>
          </View>
          <View
            style={{
              padding: 1,
              // height:200,
            }}
          >
            {/* <Image
              style={{
                padding: 1,
                height: 150,
                width: 300,
              }}
              source={require("@/assets/images/yasonmap.jpg")}
            /> */}
            {/* <OrderMapViewDelivery order={item} deliveryPersonId={item?.delivery_person?.user?.id} /> */}
            {/* <DeliveryLocationTracker deliveryPersonId="2" /> */}

          </View>
          <View style={styles.countdownWrapper}>
            {item.status === "Delivered" ? (
              <View style={styles.deliveredBadge}>
                <Icon name="check-circle" size={18} color={timeInfo.color} />
                <Text style={[styles.deliveredText, { color: timeInfo.color }]}>
                  Delivered
                </Text>
              </View>
            ) : (
              <AnimatedCountdown
                scheduledTime={item.scheduled_delivery}
                warningColor={COLORS.warning}
                successColor={COLORS.success}
              />
            )}
          </View>
        </LinearGradient>

        {/* Time Progress */}
        {/* <View style={styles.timeContainer}>
          <Text style={styles.timeMainText}>{timeInfo.details}</Text>
          {item.status !== "Delivered" && (
            <Text style={styles.timeSubText}>
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          )}
        </View> */}

        {/* Delivery Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.progressLabel}>{t("confirmed")}</Text>
          </View>

          <View
            style={[
              styles.progressLine,
              {
                backgroundColor: item.prepared ? COLORS.success : COLORS.muted,
              },
            ]}
          />

          <View style={styles.progressStep}>
            <Icon
              name={item.prepared ? "check-circle" : "radio-button-unchecked"}
              size={20}
              color={item.prepared ? COLORS.success : COLORS.muted}
            />
            <Text style={styles.progressLabel}>{t("prepared")}</Text>
          </View>

          <View
            style={[
              styles.progressLine,
              {
                // backgroundColor:
                //   item.status === "Accepted" ? COLORS.success : COLORS.muted,
                backgroundColor:
                  item.status === "Accepted" || item.status === "Delivered"
                    ? COLORS.success
                    : COLORS.muted,
              },
            ]}
          />

          <View style={styles.progressStep}>
            <Icon
              name={
                item.status === "Accepted" || "Delivered"
                  ? "check-circle"
                  : "radio-button-unchecked"
              }
              size={20}
              // color={
              //   item.status === "Accepted" || "Delivered"
              //     ? COLORS.success
              //     : COLORS.muted
              // }
              color={
                item.status === "Accepted" || item.status === "Delivered"
                  ? COLORS.success
                  : COLORS.muted
              }
            />
            <Text style={styles.progressLabel}>{t("accepted")}</Text>
          </View>
          <View
            style={[
              styles.progressLine,
              {
                backgroundColor:
                  item.status === "Delivered" ? COLORS.success : COLORS.muted,
              },
            ]}
          />

          <View style={styles.progressStep}>
            <Icon
              name={
                item.status === "Delivered"
                  ? "check-circle"
                  : "radio-button-unchecked"
              }
              size={20}
              color={
                item.status === "Delivered" ? COLORS.success : COLORS.muted
              }
            />
            <Text style={styles.progressLabel}>{t("delivered")}</Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>{t("summary")}</Text>

          {item.items.map((product, index) => (
            <View key={`item-${item.id}-${index}`} style={styles.productItem}>
              <Image
                source={{ uri: product.variant.product.image }}
                style={styles.productImage}
              />
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
                    {product.variant.product.item_name}
                  </Text>

                  <Text style={styles.productMeta}>
                    {product.quantity}x {product.variant.price}
                  </Text>
                </View>
                <View>
                  <Text style={styles.productName}>{t("subtotal")}</Text>

                  <Text style={styles.productMeta}>
                    Br{product.total_price}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t("totalamount")}:</Text>
            <Text style={styles.totalValue}>
              {t("br")}
              {item.total}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <Icon name="local-shipping" size={20} color={COLORS.secondary} />
          {/* <View style={styles.deliveryDetails}> */}
          {/* <Text style={styles.driverText}>
              {item.delivery_person || t("await")}
            </Text> */}
          {/* <Text style={styles.contactText}>Contact: {item.phone_number}</Text> */}
          {/* </View> */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <View>
              {item?.user?.image ? (
                <Image
                  source={{
                    uri: `http://192.168.100.51:8000${item?.user?.image} `,
                  }}
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
              <Text>
                {item?.user?.first_name} {item?.user?.last_name}
              </Text>
              <Text>{item.user.phone_number}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={[
          {
            title: t("active"),
            data: orders.filter((o) => o.status !== "Delivered"),
          },
          {
            title: t("completed"),
            data: orders.filter((o) => o.status === "Delivered"),
          },
        ]}
        renderItem={renderOrderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        // Add renderSectionFooter to handle empty sections
        renderSectionFooter={({ section }) => {
          if (section.data.length === 0) {
            return (
              <View style={styles.emptySectionContainer}>
                <Text style={styles.emptySectionText}>
                  {section.title === t("active")
                    ? t("noactivedelivery") // for example, "No active deliveries"
                    : t("nocompletedelivery")}{" "}
                  {/* e.g. "No completed deliveries" */}
                </Text>
              </View>
            );
          }
          return null;
        }}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={48} color={COLORS.muted} />
            <Text style={styles.emptyText}>{t("noorder")}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
  },
  cardHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  button: {
    width: 90,
    marginLeft: 22,
    paddingVertical: 10,
    borderRadius: 58,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.muted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  cardHeaderNew: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "start",
    padding: 12,
    gap: 12,
    paddingleft: 16,
    borderRadius: 10,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.15,
    // shadowRadius: 4,
    // elevation: 3,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D4150",
  },

  headerLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D4150",
  },
  countdownWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  deliveredText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  timeMainText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  timeSubText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  progressStep: {
    alignItems: "center",
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  detailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  productItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  productMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  deliveryDetails: {
    flex: 1,
  },
  driverText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  contactText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.muted,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.muted,
  },
});

export default OrderTrackingScreen;
