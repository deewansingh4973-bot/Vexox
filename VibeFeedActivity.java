package com.vexox.engine;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager2.widget.ViewPager2;

import java.util.ArrayList;
import java.util.List;

public class VibeFeedActivity extends AppCompatActivity {

    private ViewPager2 vibeViewPager;
    private TextView toggleVibe;
    private TextView toggleBrain;
    private ImageButton btnLike;
    private ImageButton btnTip;
    private ImageButton btnShare;
    private ImageButton btnAutoDub;
    private FrameLayout arHudOverlay;
    private Vibrator vibrator;
    
    private boolean isBrainMode = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(Bundle savedInstanceState);
        setContentView(R.layout.activity_vibe_feed);
        
        // Hide System UI for immersive borderless experience
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            
        // Initialize Haptic Engine
        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);

        initViews();
        setupViewPager();
        setupListeners();
        
        // Check for Intent Data from Shared Element Transition
        String postID = getIntent().getStringExtra("POST_ID");
        if (postID != null) {
            playHapticFeedback(VibrationEffect.EFFECT_HEAVY_CLICK);
            // Load specific post based on postID pre-loaded in PredictiveCacheManager
        }
    }

    private void initViews() {
        vibeViewPager = findViewById(R.id.vibeViewPager);
        toggleVibe = findViewById(R.id.toggleVibe);
        toggleBrain = findViewById(R.id.toggleBrain);
        btnLike = findViewById(R.id.btnLike);
        btnTip = findViewById(R.id.btnTip);
        btnShare = findViewById(R.id.btnShare);
        btnAutoDub = findViewById(R.id.btnAutoDub);
        arHudOverlay = findViewById(R.id.arHudOverlay);
    }

    private void setupViewPager() {
        // Mock data for infinite vertical scrolling
        List<String> videoUrls = new ArrayList<>();
        videoUrls.add("https://vexox.io/cdn/video1.mp4");
        videoUrls.add("https://vexox.io/cdn/video2.mp4");
        videoUrls.add("https://vexox.io/cdn/video3.mp4");
        
        // Assuming a VideoPagerAdapter exists in the engine package
        // VideoPagerAdapter adapter = new VideoPagerAdapter(videoUrls);
        // vibeViewPager.setAdapter(adapter);
        
        vibeViewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                playHapticFeedback(VibrationEffect.EFFECT_TICK);
            }
        });
    }

    private void setupListeners() {
        toggleVibe.setOnClickListener(v -> switchDimension(false));
        toggleBrain.setOnClickListener(v -> switchDimension(true));

        btnLike.setOnClickListener(v -> {
            playHapticFeedback(VibrationEffect.EFFECT_CLICK);
            btnLike.setColorFilter(Color.parseColor("#E91E63"));
            // Trigger 3D Heart burst animation logic here
        });

        btnTip.setOnClickListener(v -> tossCoin());

        btnShare.setOnClickListener(v -> {
            playHapticFeedback(VibrationEffect.EFFECT_CLICK);
            // Initialize Quantum Share Sheet
        });

        btnAutoDub.setOnClickListener(v -> activateNeuralDubbing());
    }

    private void switchDimension(boolean toBrainMode) {
        if (isBrainMode == toBrainMode) return;
        isBrainMode = toBrainMode;
        
        playHapticFeedback(VibrationEffect.EFFECT_DOUBLE_CLICK);
        
        if (isBrainMode) {
            toggleBrain.setBackgroundResource(R.drawable.toggle_selected_bg);
            toggleBrain.setTextColor(Color.WHITE);
            toggleVibe.setBackground(null);
            toggleVibe.setTextColor(Color.parseColor("#B3FFFFFF"));
            
            arHudOverlay.setVisibility(View.VISIBLE);
            Toast.makeText(this, "Dimension Shift: 'Target 2027' Study Mode Active", Toast.LENGTH_SHORT).show();
        } else {
            toggleVibe.setBackgroundResource(R.drawable.toggle_selected_bg);
            toggleVibe.setTextColor(Color.WHITE);
            toggleBrain.setBackground(null);
            toggleBrain.setTextColor(Color.parseColor("#B3FFFFFF"));
            
            arHudOverlay.setVisibility(View.GONE);
            Toast.makeText(this, "Dimension Shift: Entertainment Vibe Active", Toast.LENGTH_SHORT).show();
        }
    }

    private void tossCoin() {
        playHapticFeedback(VibrationEffect.EFFECT_HEAVY_CLICK);
        Toast.makeText(this, "3D Vexox Gold Coin Tossed! 🪙", Toast.LENGTH_SHORT).show();
        
        // 3D physics simulation integration (OpenGL / Filament wrapper call)
        btnTip.animate().translationY(-50f).setDuration(150).withEndAction(() -> {
            btnTip.animate().translationY(0f).setDuration(250).start();
        }).start();
    }

    private void activateNeuralDubbing() {
        playHapticFeedback(VibrationEffect.EFFECT_TICK);
        btnAutoDub.setColorFilter(Color.parseColor("#9D4EDD"));
        Toast.makeText(this, "AI Neural Dubbing: Active", Toast.LENGTH_SHORT).show();
        
        // Simulate real-time Voice Cloning API stream attachment
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
             Toast.makeText(this, "Lip-sync synchronized.", Toast.LENGTH_SHORT).show();
        }, 1200);
    }

    private void playHapticFeedback(int effectId) {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                vibrator.vibrate(VibrationEffect.createPredefined(effectId));
            } else {
                vibrator.vibrate(50);
            }
        }
    }
}