import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.workspace.soulmatch',
  appName: 'SoulMatch',
  webDir: 'dist/public',
  server: {
    url: 'http://192.168.1.6:5173',
    cleartext: true
  }
};

export default config;
