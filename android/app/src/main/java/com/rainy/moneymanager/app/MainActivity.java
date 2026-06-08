package com.rainy.moneymanager.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ExpenseReminderPlugin.class);
        super.onCreate(savedInstanceState);
        handleReminderIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleReminderIntent(intent);
    }

    private void handleReminderIntent(Intent intent) {
        if (bridge == null) {
            return;
        }

        PluginHandle handle = bridge.getPlugin("ExpenseReminder");
        if (handle == null || handle.getInstance() == null) {
            return;
        }

        ((ExpenseReminderPlugin) handle.getInstance()).handleLaunchIntent(intent);
    }
}
