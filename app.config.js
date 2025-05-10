

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
          "image": "./assets/images/yasonlogo.png",
          "imageWidth": 150,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
});