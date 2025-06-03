export default {
  expo: {
    scheme: "myapp",
    android: {
      package: "com.lukajlp.AgendaSaude",
      googleServicesFile: "./google-services.json",
      buildNumber: "1.0.0",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#58B678",
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_MAPS_KEY,
        },
      },
    },
    extra: {
      eas: {
        projectId: "6ce483c5-3632-470d-8ff5-26e0e1300f9c",
      },
    },
  },
};
