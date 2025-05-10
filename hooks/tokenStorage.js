// hooks/tokenStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const setTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.multiSet([
    ["accessToken", accessToken],
    ["refreshToken", refreshToken],
  ]);
};

export const getAccessToken = async () => {
  return AsyncStorage.getItem("accessToken");
};

export const getRefreshToken = async () => {
  return AsyncStorage.getItem("refreshToken");
};

export const removeTokens = async () => {
  await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
};
