import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import "../i18n";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import Header from "@/components/Header"; // Import the Header component
import SearchComp from "@/components/SearchComp";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalProvider from "@/context/GlobalProvider";
import { CartProvider } from "@/context/CartProvider";
import { WatchlistProvider } from "@/context/WatchlistProvider";
import { LanguageProvider } from "@/context/LanguageProvider";
import { View } from "react-native";
import { Text } from "react-native";
import { FA5Style } from "@expo/vector-icons/build/FontAwesome5";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation("first");
  const colorScheme = useColorScheme();

  // 1) load fonts
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium":  require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold":    require("../assets/fonts/Poppins-Bold.ttf"),
    "League Spartan":  require("../assets/fonts/LeagueSpartan-Regular.ttf"),
  });

  // 2) hide splash when fonts ready
  useEffect(() => {
    if (fontError) console.error(fontError);
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // 3) internet toasts
  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        Toast.show({ type:"error", text1:t("no_internet"), text2:t("check_connection"), position:"top", autoHide:false });
      }
    });
    const unsub = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        Toast.show({ type:"error", text1:t("no_internet"), text2:t("check_connection"), position:"top", autoHide:false });
      } else {
        Toast.hide();
        Toast.show({ type:"success", text1:t("back_online"), position:"top", visibilityTime:2000 });
      }
    });
    return () => unsub();
  }, [t]);

  const toastConfig = {
    error: props => (
      <ErrorToast
        {...props}
        text1Style={{ fontSize:16, fontWeight:"bold", color:"red" }}
        text2Style={{ fontSize:15, color:"#333" }}
        style={{ borderLeftColor:"red", padding:12, borderRadius:8 }}
      />
    )
  };
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView
          style={[
            styles.safeArea,
            { backgroundColor: colorScheme === "dark" ? "#000" : "#fff" },
          ]}
        >
          {/* <Header /> */}

          {!fontsLoaded ? (
            <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
              <Text>{t("loading_fonts")/* you can add this key to your translations */}</Text>
            </View>
          ) : (
            <ErrorBoundary>
              <GlobalProvider>
                <CartProvider>
                  <WatchlistProvider>
                    <LanguageProvider>
                      {/* <SearchComp /> */}
                    <Stack>
                      <Stack.Screen
                        name="(auth)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="index"
                        options={{ headerShown: false }}
                      />

                      <Stack.Screen
                        name="carddetail"
                        options={{
                          headerShown: false,
                          // header: ({ navigation }) => (
                          //   <View
                          //     style={{
                          //       height: 60,
                          //       backgroundColor: "#fff",
                          //       flexDirection: "row",
                          //       alignItems: "center",
                          //       paddingHorizontal: 10,
                          //     }}
                          //   >
                          //     <TouchableOpacity
                          //       onPress={() => navigation.goBack()}
                          //       style={{ marginRight: 10, paddingHorizontal: 12 }}
                          //     >
                          //       <Ionicons
                          //         name="arrow-back"
                          //         size={24}
                          //         color="gray"
                          //       />
                          //     </TouchableOpacity>
                          //     <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                          //       Product Detail
                          //     </Text>
                          //   </View>
                          // ),
                        }}
                      />
                      <Stack.Screen
                        name="cartscreen"
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen
                        name="checkout"
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen
                        name="directpayment"
                        options={{
                          headerShown: false,
                        }}
                      />

                      <Stack.Screen name="+not-found" />
                    </Stack>
                   <Toast config={toastConfig} />
                    </LanguageProvider>
                  </WatchlistProvider>
                </CartProvider>
              </GlobalProvider>
          </ErrorBoundary>
          )}
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
