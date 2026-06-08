package com.rainy.moneymanager.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ReminderAlarmReceiver extends BroadcastReceiver {

    public static final String EXTRA_ID = "reminder_id";
    public static final String EXTRA_TITLE = "reminder_title";
    public static final String EXTRA_BODY = "reminder_body";
    public static final String EXTRA_HOUR = "reminder_hour";
    public static final String EXTRA_MINUTE = "reminder_minute";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) {
            return;
        }

        int id = intent.getIntExtra(EXTRA_ID, -1);
        String title = intent.getStringExtra(EXTRA_TITLE);
        String body = intent.getStringExtra(EXTRA_BODY);
        int hour = intent.getIntExtra(EXTRA_HOUR, -1);
        int minute = intent.getIntExtra(EXTRA_MINUTE, -1);

        if (id == -1 || title == null) {
            return;
        }

        ReminderNotificationHelper.showReminder(context, id, title, body, true);

        if (hour >= 0 && minute >= 0) {
            long nextAt = ReminderScheduler.nextTriggerMillis(hour, minute);
            ReminderScheduler.scheduleAt(context, id, nextAt, title, body, hour, minute);
        }
    }
}
