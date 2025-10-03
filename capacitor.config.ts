import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'CenaduriaSonic',
  webDir: 'www',
  server: {
    url: 'http://192.168.0.9:8101',
    cleartext: true
  }
};

export default config;
