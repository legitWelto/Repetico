package com.example.app;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.media3.common.MediaItem;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.session.CommandButton;
import androidx.media3.session.MediaSession;
import androidx.media3.session.MediaSessionService;
import androidx.media3.session.SessionCommand;
import androidx.media3.session.SessionResult;

import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;

import java.util.List;

public class PlaybackService extends MediaSessionService {
    private MediaSession mediaSession = null;
    private ExoPlayer player = null;

    public static final String COMMAND_SPEED_UP = "custom_command_speed_up";
    public static final String COMMAND_SPEED_DOWN = "custom_command_speed_down";

    @Override
    public void onCreate() {
        super.onCreate();
        player = new ExoPlayer.Builder(this).build();
        
        // Define Custom Commands for the notification
        SessionCommand speedUpCommand = new SessionCommand(COMMAND_SPEED_UP, new Bundle());
        SessionCommand speedDownCommand = new SessionCommand(COMMAND_SPEED_DOWN, new Bundle());

        CommandButton speedUpBtn = new CommandButton.Builder()
                .setDisplayName("Speed Up")
                .setIconResId(android.R.drawable.ic_media_ff) // Replace with better icon if needed
                .setSessionCommand(speedUpCommand)
                .build();

        CommandButton speedDownBtn = new CommandButton.Builder()
                .setDisplayName("Speed Down")
                .setIconResId(android.R.drawable.ic_media_rew) // Replace with better icon if needed
                .setSessionCommand(speedDownCommand)
                .build();

        mediaSession = new MediaSession.Builder(this, player)
                .setCallback(new MediaSessionCallback())
                .setCustomLayout(List.of(speedDownBtn, speedUpBtn))
                .build();
    }

    @Nullable
    @Override
    public MediaSession onGetSession(@NonNull MediaSession.ControllerInfo controllerInfo) {
        return mediaSession;
    }

    @Override
    public void onDestroy() {
        if (mediaSession != null) {
            mediaSession.getPlayer().release();
            mediaSession.release();
            mediaSession = null;
        }
        super.onDestroy();
    }

    private class MediaSessionCallback implements MediaSession.Callback {
        @NonNull
        @Override
        public ListenableFuture<SessionResult> onCustomCommand(
                @NonNull MediaSession session,
                @NonNull MediaSession.ControllerInfo controller,
                @NonNull SessionCommand customCommand,
                @NonNull Bundle args) {
            
            // Handle custom commands
            if (customCommand.customAction.equals(COMMAND_SPEED_UP)) {
                // Broadcast to Capacitor plugin
                broadcastCommand(COMMAND_SPEED_UP);
                return Futures.immediateFuture(new SessionResult(SessionResult.RESULT_SUCCESS));
            } else if (customCommand.customAction.equals(COMMAND_SPEED_DOWN)) {
                // Broadcast to Capacitor plugin
                broadcastCommand(COMMAND_SPEED_DOWN);
                return Futures.immediateFuture(new SessionResult(SessionResult.RESULT_SUCCESS));
            }
            return Futures.immediateFuture(new SessionResult(SessionResult.RESULT_ERROR_NOT_SUPPORTED));
        }
    }

    private void broadcastCommand(String command) {
        Intent intent = new Intent("com.example.app.CUSTOM_MEDIA_COMMAND");
        intent.putExtra("command", command);
        sendBroadcast(intent);
    }
}
