import { fetchDeliveryNeedOrderHistory } from "@/hooks/useFetch";
import React, { useState, useEffect, useRef } from "react";
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
  Dimensions,
} from "react-native";
import { Linking } from 'react-native';

import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedCountdown from "@/components/AnimatedCountdown";
import { useTranslation } from "react-i18next";
import OrderMapViewDelivery from "@/components/OrderMapViewDelivery";
// import DeliveryLocationTracker from "@/components/DeliveryLocationTracker";
import ShopTracking from "@/components/ShopTracking";
import { useFocusEffect } from "@react-navigation/native";
import Entypo from '@expo/vector-icons/Entypo';
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
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABS = ["active", "completed"];
const TAB_COUNT = TABS.length;
const INACTIVE_SCALE = 0.8;
const INACTIVE_OPACITY = 0.6;

const OrderTrackingScreen = () => {
  const { t, i18n } = useTranslation("track");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const sectionListRef = useRef(null);

  const handleTabPress = (index) => {
    setActiveTab(index);
    Animated.spring(scrollX, {
      toValue: index * SCREEN_WIDTH,
      useNativeDriver: true,
    }).start();

    sectionListRef.current?.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      animated: false,
    });
  };

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
  useFocusEffect(
    React.useCallback(() => {
      loadData();
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }, [])
  );

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

  const renderOrderItem = ({ item, section }) => {
    const hasCustomerCoords =
      item.customer_latitude != null && item.customer_longitude != null;
    const nowDate = new Date(now);
    const scheduled = new Date(item.scheduled_delivery);
    const isMissed = scheduled < nowDate && item.status !== "Delivered";

    const shouldShowMap = section.title === t("active") && hasCustomerCoords;
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
            <Text style={styles.orderNumber}>
              {t("order")} #Yas-{item.id}
            </Text>
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
            {shouldShowMap && (
              <OrderMapViewDelivery order={item} isDriver={true} />
            )}
            {/* <DeliveryLocationTracker deliveryPersonId="2" /> */}
          </View>
          <View style={styles.countdownWrapper}>
            {item.status !== "Delivered" && (
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
        {/* {!isMissed &&
        <ShopTracking status={item.status} prepared={item.prepared} />
       } */}

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
                    {i18n.language === "en"
                      ? product.variant.product.item_name
                      : product.variant.product.item_name_amh}
                  </Text>

                  <Text style={styles.productMeta}>
                    {product.quantity} x {product.variant.price}{" "}
                    {/* {i18n.language === "en" ? t("br") : ""}
                    {product.total_price}{" "}
                    {i18n.language === "amh" ? t("br") : ""} */}
                  </Text>
                </View>
                <View>
                  <Text style={styles.productName}>{t("subtotal")}</Text>

                  <Text style={styles.productMeta}>
                    {i18n.language === "en" ? t("br") : ""}
                    {product.total_price}{" "}
                    {i18n.language === "amh" ? t("br") : ""}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t("totalamount")}:</Text>
            <Text style={styles.totalValue}>
              {i18n.language === "en" ? t("br") : ""}
              {item.total}
              {i18n.language === "amh" ? t("br") : ""}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          {/* <Icon name="local-shipping" size={20} color={COLORS.secondary} /> */}
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
                    uri: `https://yasonbackend.yasonsc.com${item?.user?.image} `,
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ marginRight: 26 }}>{item.user.phone_number}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(`tel:${item.user.phone_number}`)
                  }
                  style={{borderWidth:1, padding:3, borderRadius:55, borderColor:"#4CAF50", backgroundColor:"#4CAF50"}}
                >
                  <Icon name="call" size={24} color="white" />
                </TouchableOpacity>
              </View>
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
      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          const dynamicWidth = isActive
            ? SCREEN_WIDTH * 0.4 // 40% width when active
            : (SCREEN_WIDTH * 0.4) / (TAB_COUNT - 1); // split remaining

          return (
            <Animated.View
              key={tab}
              style={[
                styles.tabWrapper,
                {
                  width: dynamicWidth,
                  transform: [{ scale: isActive ? 1 : INACTIVE_SCALE }],
                  opacity: isActive ? 1 : INACTIVE_OPACITY,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => handleTabPress(index)}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {t(tab)}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Animated Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
                  outputRange: [0, -SCREEN_WIDTH, -SCREEN_WIDTH * 2],
                }),
              },
            ],
          },
        ]}
      >
        {TABS.map((tab, index) => (
          <View
            key={tab}
            style={{ width: SCREEN_WIDTH - 23, marginHorizontal: 3 }}
          >
            <SectionList
              key={tab}
              ref={sectionListRef}
              sections={[
                {
                  title: t(tab),
                  data: orders.filter((o) => {
                    if (tab === "active") {
                      return (
                        o.status !== "Delivered" &&
                        new Date(o.scheduled_delivery) >= new Date()
                      );
                    }
                    // if (tab === "missed") {
                    //   return (
                    //     o.status !== "Delivered" &&
                    //     new Date(o.scheduled_delivery) < new Date()
                    //   );
                    // }
                    return o.status === "Delivered";
                  }),
                },
              ]}
              renderItem={(props) => renderOrderItem(props)}
              // renderSectionHeader={({ section }) => (
              //   <Text style={styles.sectionHeader}>{section.title}</Text>
              // )}
              renderSectionFooter={({ section }) => {
                if (section.data.length === 0) {
                  return (
                    <View style={styles.emptySectionContainer}>
                      <Text style={styles.emptySectionText}>
                        {t(`no${tab}delivery`)}
                      </Text>
                    </View>
                  );
                }
                return null;
              }}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    marginHorizontal: 26,
  },
  tabWrapper: {
    alignItems: "center",
    // paddingHorizontal: 12,
    // backgroundColor: "red",
  },
  tabButton: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#445399",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  tabButtonActive: {
    backgroundColor: "#4CAF50",
    // borderBottomWidth: 3,
    // borderBottomColor: "#FF9800",
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
    textAlign: "center",
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  activeTab: {
    // borderBottomWidth: 2,
    // borderBottomColor: COLORS.secondary,
    backgroundColor: "#4CAF50",
    // backgroundColor:"#EB5B00",
  },
  // tabText: {
  //   fontSize: 14,
  //   color:"white",
  //   fontWeight: "500",
  //   textAlign:"center",
  // },
  activeTabText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  contentContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 2,
    justifyContent: "center",
    gap: 16,
    // alignItems:"center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 64,
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
    color: "#445399",
    textAlign: "center",
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
    // padding: 12,
    gap: 6,
    // paddingleft: 16,
    borderRadius: 10,
    // backgroundColor:"red",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.15,
    // shadowRadius: 4,
    // elevation: 3,
    // marginBottom: 8,
  },

  headerLeft: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
  },

  countdownWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
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
