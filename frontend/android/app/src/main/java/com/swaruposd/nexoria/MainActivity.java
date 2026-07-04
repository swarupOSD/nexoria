package com.swaruposd.nexoria;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.Manifest;
import android.content.pm.PackageManager;
import android.app.PictureInPictureParams;
import android.util.Rational;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Request POST_NOTIFICATIONS permission for Android 13+ (Required for Foreground Service)
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        // Ensure WebView allows background media playback without explicit user gestures
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Setup Auto-PiP for Android 12+ (API 31+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PictureInPictureParams.Builder pipBuilder = new PictureInPictureParams.Builder();
            pipBuilder.setAspectRatio(new Rational(16, 9));
            pipBuilder.setAutoEnterEnabled(true);
            setPictureInPictureParams(pipBuilder.build());
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

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        // Fallback for Android 8.0 to 11 (API 26-30). Android 12+ handles it automatically via onResume.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            PictureInPictureParams.Builder pipBuilder = new PictureInPictureParams.Builder();
            pipBuilder.setAspectRatio(new Rational(16, 9));
            enterPictureInPictureMode(pipBuilder.build());
        }
    }
}
