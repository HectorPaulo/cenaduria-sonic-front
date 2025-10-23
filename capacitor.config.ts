import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'CenaduriaSonic',
  webDir: 'www',
  server: {
    url: 'http://175.1.54.122:8100',
    cleartext: true,
  }
};

export default config;
