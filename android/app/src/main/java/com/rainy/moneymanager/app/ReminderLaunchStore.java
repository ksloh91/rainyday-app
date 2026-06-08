package com.rainy.moneymanager.app;

public final class ReminderLaunchStore {

    private static String pendingTitle;
    private static String pendingBody;

    private ReminderLaunchStore() {}

    public static synchronized void setPending(String title, String body) {
        pendingTitle = title;
        pendingBody = body;
    }

    public static synchronized boolean hasPending() {
        return pendingTitle != null;
    }

    public static synchronized String consumeTitle() {
        String value = pendingTitle;
        pendingTitle = null;
        return value;
    }

    public static synchronized String consumeBody() {
        String value = pendingBody;
        pendingBody = null;
        return value != null ? value : "";
    }
}
