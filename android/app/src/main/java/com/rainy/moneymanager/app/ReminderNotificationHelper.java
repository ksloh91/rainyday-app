package com.rainy.moneymanager.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public final class ReminderNotificationHelper {

    public static final String CHANNEL_ID = "expense-reminders-high";

    private ReminderNotificationHelper() {}

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) {
            return;
        }

        NotificationChannel existing = manager.getNotificationChannel(CHANNEL_ID);
        if (existing != null) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Expense reminders",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Pop-up reminders to log spending");
        channel.enableVibration(true);
        channel.enableLights(true);
        channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        channel.setBypassDnd(false);

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        channel.setSound(sound, audioAttributes);

        manager.createNotificationChannel(channel);
    }

    public static void showReminder(
        Context context,
        int notificationId,
        String title,
        String body,
        boolean launchApp
    ) {
        ensureChannel(context);

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        );
        launchIntent.putExtra(ReminderAlarmReceiver.EXTRA_TITLE, title);
        launchIntent.putExtra(ReminderAlarmReceiver.EXTRA_BODY, body);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent fullScreenIntent = PendingIntent.getActivity(
            context,
            notificationId,
            launchIntent,
            flags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(fullScreenIntent)
            .setFullScreenIntent(fullScreenIntent, true)
            .setDefaults(NotificationCompat.DEFAULT_ALL);

        NotificationManagerCompat.from(context).notify(notificationId, builder.build());

        if (launchApp) {
            ReminderLaunchStore.setPending(title, body);
            context.startActivity(launchIntent);
        }
    }

    public static void cancel(Context context, int notificationId) {
        NotificationManagerCompat.from(context).cancel(notificationId);
    }
}
