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

        // Request POST_NOTIFICATIONS permission for Android 13+
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        // Allow media to play without a user gesture inside WebView
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);

            // CRITICAL: Tell the WebView to keep playing audio in background
            // This prevents Android from pausing audio when the screen locks
            webView.setKeepScreenOn(false); // Don't force screen on; just keep audio
        }
    }

    @Override
    public void onResume() {
        super.onResume();

        // Resume WebView timers and rendering when app comes back to foreground
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
            this.bridge.getWebView().onResume();
        }

        // Setup Auto-PiP for Android 12+ so minimizing the app keeps audio alive
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
        // CRITICAL: When the app is paused (goes to background/PiP), do NOT pause the WebView.
        // This is what keeps audio playing in background.
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
            this.bridge.getWebView().onResume();
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        // Even when fully stopped, keep WebView audio alive
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
            this.bridge.getWebView().onResume();
        }
    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        // Manually enter PiP for Android 8.0 to 11 (API 26-30).
        // Android 12+ handles it automatically via setAutoEnterEnabled above.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            PictureInPictureParams.Builder pipBuilder = new PictureInPictureParams.Builder();
            pipBuilder.setAspectRatio(new Rational(16, 9));
            enterPictureInPictureMode(pipBuilder.build());
        }
    }
}
