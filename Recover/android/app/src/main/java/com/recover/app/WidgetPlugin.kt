package com.recover.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Capacitor Plugin for Widget Communication (Android)
 *
 * Handles data transfer between the main app and widget via SharedPreferences
 */
@CapacitorPlugin(name = "WidgetPlugin")
class WidgetPlugin : Plugin() {

    private val PREFS_NAME = "com.recover.app.widget"
    private val WIDGET_DATA_KEY = "widgetData"

    @PluginMethod
    fun updateWidgetData(call: PluginCall) {
        val dataString = call.getString("data")

        if (dataString == null) {
            call.reject("Missing data parameter")
            return
        }

        try {
            // Write to SharedPreferences
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(WIDGET_DATA_KEY, dataString).apply()

            call.resolve(
                com.getcapacitor.JSObject().put("success", true)
            )
        } catch (e: Exception) {
            call.reject("Failed to save widget data: ${e.message}")
        }
    }

    @PluginMethod
    fun reloadWidgets(call: PluginCall) {
        try {
            // Trigger widget update
            val intent = Intent(context, RecoverWidgetProvider::class.java)
            intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val widgetComponent = ComponentName(context, RecoverWidgetProvider::class.java)
            val widgetIds = appWidgetManager.getAppWidgetIds(widgetComponent)

            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
            context.sendBroadcast(intent)

            call.resolve(
                com.getcapacitor.JSObject().put("success", true)
            )
        } catch (e: Exception) {
            call.reject("Failed to reload widgets: ${e.message}")
        }
    }

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        call.resolve(
            com.getcapacitor.JSObject().put("available", true)
        )
    }
}
