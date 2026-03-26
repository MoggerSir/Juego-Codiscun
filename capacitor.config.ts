import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.empresa.juegomario",
  appName: "Juego Mario Empresa",
  webDir: "dist",
  server: {
    // url: 'http://192.168.1.x:3000',
    cleartext: true,
  },
  android: {
    buildOptions: {
      releaseType: "APK",
    },
  },
};

export default config;
