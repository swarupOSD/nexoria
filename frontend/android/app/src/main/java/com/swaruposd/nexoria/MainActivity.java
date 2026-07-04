package com.swaruposd.nexoria;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Ensure WebView allows background media playback without explicit user gestures
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }

        // Start Foreground Service to keep WebView alive in the background
        Intent serviceIntent = new Intent(this, BackgroundAudioService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Prevent Capacitor from pausing the WebView when the app goes to the background
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
            this.bridge.getWebView().onResume();
        }
    }
}
