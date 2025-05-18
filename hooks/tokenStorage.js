// hooks/tokenStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const setTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.multiSet([
    ["access", accessToken],
    ["refresh", refreshToken],
  ]);
};

export const getAccessToken = async () => {
  return AsyncStorage.getItem("access");
};

export const getRefreshToken = async () => {
  return AsyncStorage.getItem("refresh");
};

export const removeTokens = async () => {
  await AsyncStorage.multiRemove(["access", "refresh"]);
};
