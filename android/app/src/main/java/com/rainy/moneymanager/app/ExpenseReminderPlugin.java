package com.rainy.moneymanager.app;

import android.content.Intent;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

@CapacitorPlugin(name = "ExpenseReminder")
public class ExpenseReminderPlugin extends Plugin {

    @Override
    public void load() {
        super.load();
        flushPendingLaunch();
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        int[] ids = new int[] { 1001, 1002, 1003, 1999 };
        for (int id : ids) {
            ReminderScheduler.cancel(getContext(), id);
        }
        call.resolve();
    }

    @PluginMethod
    public void scheduleReminders(PluginCall call) {
        JSArray reminders = call.getArray("reminders");
        if (reminders == null) {
            call.reject("reminders array is required");
            return;
        }

        cancelAllInternal();

        try {
            for (int i = 0; i < reminders.length(); i++) {
                JSONObject reminder = reminders.getJSONObject(i);
                int id = reminder.getInt("id");
                String title = reminder.getString("title");
                String body = reminder.getString("body");
                int hour = reminder.getInt("hour");
                int minute = reminder.getInt("minute");
                long at = reminder.getLong("at");

                ReminderScheduler.scheduleAt(
                    getContext(),
                    id,
                    at,
                    title,
                    body,
                    hour,
                    minute
                );
            }
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not schedule reminders", error);
        }
    }

    @PluginMethod
    public void showNow(PluginCall call) {
        int id = call.getInt("id", 1999);
        String title = call.getString("title", "Reminder");
        String body = call.getString("body", "");

        ReminderNotificationHelper.showReminder(getContext(), id, title, body, true);
        notifyLaunch(title, body);
        call.resolve();
    }

    @PluginMethod
    public void scheduleAt(PluginCall call) {
        int id = call.getInt("id", 1999);
        String title = call.getString("title", "Reminder");
        String body = call.getString("body", "");
        long at = call.getLong("at", System.currentTimeMillis() + 60_000L);
        int hour = call.getInt("hour", -1);
        int minute = call.getInt("minute", -1);

        ReminderScheduler.scheduleAt(getContext(), id, at, title, body, hour, minute);
        call.resolve();
    }

    @PluginMethod
    public void consumePendingLaunch(PluginCall call) {
        flushPendingLaunch();
        call.resolve();
    }

    public void handleLaunchIntent(Intent intent) {
        if (intent == null) {
            return;
        }

        String title = intent.getStringExtra(ReminderAlarmReceiver.EXTRA_TITLE);
        if (title == null) {
            return;
        }

        String body = intent.getStringExtra(ReminderAlarmReceiver.EXTRA_BODY);
        ReminderLaunchStore.setPending(title, body != null ? body : "");
        flushPendingLaunch();
        intent.removeExtra(ReminderAlarmReceiver.EXTRA_TITLE);
        intent.removeExtra(ReminderAlarmReceiver.EXTRA_BODY);
    }

    private void cancelAllInternal() {
        int[] ids = new int[] { 1001, 1002, 1003, 1999 };
        for (int id : ids) {
            ReminderScheduler.cancel(getContext(), id);
        }
    }

    private void flushPendingLaunch() {
        if (!ReminderLaunchStore.hasPending()) {
            return;
        }

        String title = ReminderLaunchStore.consumeTitle();
        String body = ReminderLaunchStore.consumeBody();
        if (title != null) {
            notifyLaunch(title, body);
        }
    }

    private void notifyLaunch(String title, String body) {
        JSObject payload = new JSObject();
        payload.put("title", title);
        payload.put("body", body);
        notifyListeners("reminderLaunched", payload);
    }
}
