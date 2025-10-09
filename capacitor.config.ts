import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'CenaduriaSonic',
  webDir: 'www',
  // Development server settings for Android emulator live-reload.
  // 10.0.2.2 maps to the host machine from the Android emulator.
  server: {
    url: 'http://10.0.2.2:8100',
    cleartext: true,
  },
};

export default config;
