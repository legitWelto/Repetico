package com.example.app;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;

import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.PlaybackParameters;
import androidx.media3.common.Player;
import androidx.media3.session.MediaController;
import androidx.media3.session.SessionToken;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.MoreExecutors;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@CapacitorPlugin(name = "AudioPlayerPlugin")
public class AudioPlayerPlugin extends Plugin {

    private MediaController mediaController = null;
    private ListenableFuture<MediaController> controllerFuture = null;
    
    private List<Section> sections = new ArrayList<>();
    private String currentSectionName = "";
    
    private double loopStart = 0;
    private double loopEnd = 0;
    private boolean autoLoop = false;
    private int loopDelay = 0;
    
    private Handler progressHandler = new Handler(Looper.getMainLooper());
    private Runnable progressRunnable;

    private static class Section {
        String name;
        double start;
        double end;
    }

    private final BroadcastReceiver commandReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String command = intent.getStringExtra("command");
            if (PlaybackService.COMMAND_SPEED_UP.equals(command)) {
                adjustSpeed(0.05f);
            } else if (PlaybackService.COMMAND_SPEED_DOWN.equals(command)) {
                adjustSpeed(-0.05f);
            }
        }
    };

    @Override
    public void load() {
        super.load();
        SessionToken sessionToken = new SessionToken(getContext(), new ComponentName(getContext(), PlaybackService.class));
        controllerFuture = new MediaController.Builder(getContext(), sessionToken).buildAsync();
        controllerFuture.addListener(() -> {
            try {
                mediaController = controllerFuture.get();
                setupPlayerListeners();
            } catch (ExecutionException | InterruptedException e) {
                e.printStackTrace();
            }
        }, MoreExecutors.directExecutor());

        getContext().registerReceiver(commandReceiver, new IntentFilter("com.example.app.CUSTOM_MEDIA_COMMAND"), Context.RECEIVER_NOT_EXPORTED);
        
        setupProgressPolling();
    }

    private void setupPlayerListeners() {
        if (mediaController == null) return;
        mediaController.addListener(new Player.Listener() {
            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                if (isPlaying) {
                    progressHandler.post(progressRunnable);
                    notifyListeners("onPlay", new JSObject());
                } else {
                    progressHandler.removeCallbacks(progressRunnable);
                    notifyListeners("onPause", new JSObject());
                }
            }

            @Override
            public void onPlaybackStateChanged(int playbackState) {
                if (playbackState == Player.STATE_READY) {
                    JSObject info = new JSObject();
                    info.put("duration", mediaController.getDuration() / 1000.0);
                    notifyListeners("onLoaded", info);
                }
            }
        });
    }

    private void setupProgressPolling() {
        progressRunnable = new Runnable() {
            @Override
            public void run() {
                if (mediaController != null && mediaController.isPlaying()) {
                    double currentTime = mediaController.getCurrentPosition() / 1000.0;
                    
                    // Notify JS
                    JSObject progress = new JSObject();
                    progress.put("currentTime", currentTime);
                    notifyListeners("onProgress", progress);

                    checkLoop(currentTime);
                    checkSectionChange(currentTime);

                    progressHandler.postDelayed(this, 100);
                }
            }
        };
    }

    private void checkLoop(double currentTime) {
        if (autoLoop && loopEnd > 0 && currentTime >= loopEnd) {
            mediaController.seekTo((long) (loopStart * 1000));
            if (loopDelay > 0) {
                mediaController.pause();
                progressHandler.postDelayed(() -> mediaController.play(), loopDelay);
            }
        }
    }

    private void checkSectionChange(double currentTime) {
        for (Section section : sections) {
            if (currentTime >= section.start && currentTime <= section.end) {
                if (!section.name.equals(currentSectionName)) {
                    currentSectionName = section.name;
                    
                    // Update Media3 Metadata
                    MediaMetadata metadata = new MediaMetadata.Builder()
                            .setTitle(currentSectionName)
                            .setArtist("")
                            .setAlbumTitle("Repetico")
                            .build();
                    mediaController.setPlaylistMetadata(metadata);

                    // Notify JS
                    JSObject sectionInfo = new JSObject();
                    sectionInfo.put("sectionName", currentSectionName);
                    notifyListeners("onSectionChange", sectionInfo);
                }
                break;
            }
        }
    }

    private void adjustSpeed(float delta) {
        if (mediaController == null) return;
        float currentSpeed = mediaController.getPlaybackParameters().speed;
        float newSpeed = Math.max(0.25f, Math.min(2.0f, currentSpeed + delta));
        mediaController.setPlaybackParameters(new PlaybackParameters(newSpeed));
        
        // Notify JS about speed change so UI can update
        JSObject info = new JSObject();
        info.put("rate", newSpeed);
        notifyListeners("onSpeedChange", info);
    }

    @PluginMethod
    public void load(PluginCall call) {
        String url = call.getString("url");
        JSArray sectionsArray = call.getArray("sections");
        
        sections.clear();
        if (sectionsArray != null) {
            for (int i = 0; i < sectionsArray.length(); i++) {
                try {
                    JSONObject obj = sectionsArray.getJSONObject(i);
                    Section s = new Section();
                    s.name = obj.getString("name");
                    s.start = obj.getDouble("start");
                    s.end = obj.getDouble("end");
                    sections.add(s);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }

        if (mediaController != null) {
            MediaItem mediaItem = MediaItem.fromUri(url);
            mediaController.setMediaItem(mediaItem);
            mediaController.prepare();
            call.resolve();
        } else {
            call.reject("MediaController not initialized");
        }
    }

    @PluginMethod
    public void play(PluginCall call) {
        if (mediaController != null) {
            mediaController.play();
            call.resolve();
        }
    }

    @PluginMethod
    public void pause(PluginCall call) {
        if (mediaController != null) {
            mediaController.pause();
            call.resolve();
        }
    }

    @PluginMethod
    public void seek(PluginCall call) {
        Double seconds = call.getDouble("seconds");
        if (mediaController != null && seconds != null) {
            mediaController.seekTo((long) (seconds * 1000));
            call.resolve();
        }
    }

    @PluginMethod
    public void setSpeed(PluginCall call) {
        Double rate = call.getDouble("rate");
        if (mediaController != null && rate != null) {
            mediaController.setPlaybackParameters(new PlaybackParameters(rate.floatValue()));
            call.resolve();
        }
    }

    @PluginMethod
    public void setLoop(PluginCall call) {
        loopStart = call.getDouble("start", 0.0);
        loopEnd = call.getDouble("end", 0.0);
        autoLoop = call.getBoolean("autoLoop", false);
        loopDelay = call.getInt("delay", 0);
        call.resolve();
    }

    @PluginMethod
    public void destroy(PluginCall call) {
        if (mediaController != null) {
            mediaController.stop();
            mediaController.release();
            mediaController = null;
        }
        call.resolve();
    }
}
