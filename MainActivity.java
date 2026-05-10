package com.vexox.engine;

import android.os.Bundle;
import android.widget.GridLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private ProgressBar targetProgressBar;
    private TextView progressText;
    private GridLayout quickActionsGrid;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(Bundle savedInstanceState);
        setContentView(R.layout.activity_main);
        
        targetProgressBar = findViewById(R.id.targetProgressBar);
        progressText = findViewById(R.id.progressText);
        quickActionsGrid = findViewById(R.id.quickActionsGrid);
        
        // Setup initial progress for Target 2027
        updateTargetProgress(75);
    }

    private void updateTargetProgress(int progress) {
        targetProgressBar.setProgress(progress);
        progressText.setText(progress + "%");
    }
}
