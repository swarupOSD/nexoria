package com.swaruposd.nexoria;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.Manifest;
import android.content.pm.PackageManager;
import android.app.PictureInPictureParams;
import android.util.Rational;
import android.view.View;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Request POST_NOTIFICATIONS permission for Android 13+
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();

            // Allow media to autoplay without user gesture
            settings.setMediaPlaybackRequiresUserGesture(false);

            // Enable JavaScript (needed for media session API)
            settings.setJavaScriptEnabled(true);

            // Allow mixed content (needed for some audio CDNs)
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

            // CRITICAL: Custom WebChromeClient to allow video/audio to enter PiP
            // This makes embedded YT/media iframes also support PiP
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onShowCustomView(View view, CustomViewCallback callback) {
                    super.onShowCustomView(view, callback);
                }
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();

        // Always keep WebView running
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
            this.bridge.getWebView().onResume();
        }

        // Setup Auto-PiP for Android 12+ — app automatically becomes small window when home is pressed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PictureInPictureParams params = new PictureInPictureParams.Builder()
                .setAspectRatio(new Rational(16, 9))
                .setAutoEnterEnabled(true)  // Auto-enter PiP when user presses home
                .build();
            setPictureInPictureParams(params);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // DO NOT pause the WebView — this keeps audio/video playing when in PiP
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
            this.bridge.getWebView().onResume();
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        // Keep WebView alive even when app is fully in background (not in PiP)
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
            this.bridge.getWebView().onResume();
        }
    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        // For Android 8 to 11: manually trigger PiP when user presses Home button
        // Android 12+ does this automatically via setAutoEnterEnabled(true) above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            PictureInPictureParams params = new PictureInPictureParams.Builder()
                .setAspectRatio(new Rational(16, 9))
                .build();
            enterPictureInPictureMode(params);
        }
    }
}
