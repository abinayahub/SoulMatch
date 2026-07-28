package com.soulmatch.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Force the app to render BELOW the status bar (disable edge-to-edge)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
