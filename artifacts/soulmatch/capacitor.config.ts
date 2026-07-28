import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.workspace.soulmatch',
  appName: 'SoulMatch',
  webDir: 'dist/public',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#F8F3F7'
    }
  }
};

export default config;
