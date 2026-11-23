package com.starlightyard.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;
import android.widget.Toast;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * 별빛 마당 — the web app (app/src/main/assets/www) shown full screen in a WebView.
 * Files are served from https://appassets.androidplatform.net/ so the canvas drawing, saved data (localStorage)
 * and the sharing/cloud server all behave as on the web.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/www/index.html";
    private static final int REQ_PICK_FILE = 41;
    private static final int REQ_SAVE_FILE = 42;

    private WebView webView;
    private ValueCallback<Uri[]> pendingPick;
    private String pendingSaveText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Draw edge to edge and pad the page by the system bars / notch / keyboard, the same on every Android version.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#E6E1EE"));
        setContentView(root);
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), root);
        bars.setAppearanceLightStatusBars(true);
        bars.setAppearanceLightNavigationBars(true);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets sys = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            v.setPadding(sys.left, sys.top, sys.right, Math.max(sys.bottom, ime.bottom));
            return WindowInsetsCompat.CONSUMED;
        });

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#E6E1EE"));
        root.addView(webView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                 // ignore the phone's font-size setting so the layout stays as designed
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);            // the app handles its own pinch zoom on the yard
        s.setBuiltInZoomControls(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);

        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assets.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (HOST.equals(uri.getHost())) return false;          // our own pages (e.g. visiting a friend's yard)
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (ActivityNotFoundException ignored) { }
                return true;                                            // anything else opens in the browser
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingPick != null) pendingPick.onReceiveValue(null);
                pendingPick = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_PICK_FILE);
                } catch (ActivityNotFoundException e) {
                    pendingPick = null;
                    return false;
                }
                return true;
            }
        });

        webView.addJavascriptInterface(new Bridge(), "StarlightAndroid");

        // Back: Android 13+ uses the back callback (required when targeting Android 16); older versions use onBackPressed.
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }

        if (savedInstanceState != null) webView.restoreState(savedInstanceState);
        else webView.loadUrl(START_URL);
    }

    /** Small helpers the page can call: saving a backup file and copying text. */
    private class Bridge {
        @JavascriptInterface
        public void saveFile(String name, String text) {
            runOnUiThread(() -> {
                pendingSaveText = text;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/json");
                i.putExtra(Intent.EXTRA_TITLE, name);
                try {
                    startActivityForResult(i, REQ_SAVE_FILE);
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(MainActivity.this, "파일을 저장할 수 없어요", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void copyText(String text) {
            runOnUiThread(() -> {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("별빛 마당", text));
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_PICK_FILE) {
            if (pendingPick != null) {
                pendingPick.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                pendingPick = null;
            }
        } else if (requestCode == REQ_SAVE_FILE) {
            String text = pendingSaveText;
            pendingSaveText = null;
            if (resultCode != RESULT_OK || data == null || data.getData() == null || text == null) return;
            try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                if (out != null) out.write(text.getBytes(StandardCharsets.UTF_8));
                Toast.makeText(this, "백업 파일을 저장했어요", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                Toast.makeText(this, "백업 파일을 저장하지 못했어요", Toast.LENGTH_SHORT).show();
            }
        }
    }

    /** Back button: close an open sheet or leave lantern view first; otherwise leave the app. */
    private void handleBack() {
        String js = "(function(){"
                + "var open=[].slice.call(document.querySelectorAll('.veil')).filter(function(v){return !v.hidden;});"
                + "if(open.length){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return 'sheet';}"
                + "var b=document.getElementById('lanternExit'),bar=document.getElementById('lanternBar');"
                + "if(document.documentElement.classList.contains('lantern-mode')&&b&&bar&&!bar.hidden){b.click();return 'lantern';}"
                + "return 'none';})()";
        webView.evaluateJavascript(js, value -> {
            if (value == null || value.contains("none")) finish();
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();   // Android 12 and older
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            ((ViewGroup) webView.getParent()).removeView(webView);
            webView.destroy();
        }
        super.onDestroy();
    }
}
