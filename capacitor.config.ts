import type { CapacitorConfig } from "@capacitor/cli";

const liveReload = process.env.CAPACITOR_LIVE_RELOAD === "true";
/** Use http://localhost:3000 with `adb reverse tcp:3000 tcp:3000` over USB. */
const devServerUrl =
  process.env.CAPACITOR_SERVER_URL ?? "http://localhost:3000";

const config: CapacitorConfig = {
  appId: "com.rainy.moneymanager.app",
  appName: "Money Manager",
  webDir: "out",
  plugins: {
    FirebaseAuthentication: {
      providers: ["google.com"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_notification",
      iconColor: "#059669",
    },
  },
  server: liveReload
    ? {
        url: devServerUrl.replace(/\/$/, ""),
        cleartext: true,
        androidScheme: "http",
      }
    : {
        androidScheme: "https",
      },
};

export default config;
