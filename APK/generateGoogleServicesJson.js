require("dotenv").config();
const fs = require("fs");

// Verifique se todas as variáveis necessárias estão definidas
const requiredEnvVars = [
  "GOOGLE_PROJECT_NUMBER",
  "GOOGLE_PROJECT_ID",
  "GOOGLE_STORAGE_BUCKET",
  "GOOGLE_MOBILE_SDK_APP_ID",
  "ANDROID_PACKAGE_NAME",
  "GOOGLE_API_KEY",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing environment variable: ${varName}`);
    process.exit(1);
  }
});

const googleServices = {
  project_info: {
    project_number: process.env.GOOGLE_PROJECT_NUMBER,
    project_id: process.env.GOOGLE_PROJECT_ID,
    storage_bucket: process.env.GOOGLE_STORAGE_BUCKET,
  },
  client: [
    {
      client_info: {
        mobilesdk_app_id: process.env.GOOGLE_MOBILE_SDK_APP_ID,
        android_client_info: {
          package_name: process.env.ANDROID_PACKAGE_NAME,
        },
      },
      oauth_client: [],
      api_key: [
        {
          current_key: process.env.GOOGLE_API_KEY,
        },
      ],
      services: {
        appinvite_service: {
          other_platform_oauth_client: [],
        },
      },
    },
  ],
  configuration_version: "1",
};

// Salve o JSON gerado em um arquivo
fs.writeFileSync(
  "google-services.json",
  JSON.stringify(googleServices, null, 2)
);
