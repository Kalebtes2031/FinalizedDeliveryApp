export default ({ config }) => ({
  ...config,

  extra: {
    ...config.extra,

    apiUrl: "https://yasonbackend.yasonsc.com",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/yasonlogodelivery.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#445399",
      },
    ],
    ["@maplibre/maplibre-react-native"],
    "expo-build-properties",
    "expo-dev-client",
  ],
});
