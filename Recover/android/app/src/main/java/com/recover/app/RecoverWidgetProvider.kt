package com.recover.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONObject

/**
 * Recover Widget Provider (Android)
 *
 * Provides home screen widgets showing sobriety progress
 */
class RecoverWidgetProvider : AppWidgetProvider() {

    private val PREFS_NAME = "com.recover.app.widget"
    private val WIDGET_DATA_KEY = "widgetData"

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update all widget instances
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // Called when the first widget is created
    }

    override fun onDisabled(context: Context) {
        // Called when the last widget is removed
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        // Load widget data from SharedPreferences
        val widgetData = loadWidgetData(context)

        // Determine widget size
        val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
        val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)

        val layoutId = when {
            minWidth >= 250 -> R.layout.widget_large  // Large widget
            minWidth >= 180 -> R.layout.widget_medium // Medium widget
            else -> R.layout.widget_small             // Small widget
        }

        // Build the widget view
        val views = RemoteViews(context.packageName, layoutId)

        // Set widget data
        views.setTextViewText(R.id.widget_days_sober, widgetData.daysSober.toString())
        views.setTextViewText(R.id.widget_streak, "${widgetData.streak} day streak")

        // For medium and large widgets, add quote
        if (layoutId != R.layout.widget_small) {
            views.setTextViewText(R.id.widget_quote, "\"${widgetData.quote}\"")
            views.setTextViewText(R.id.widget_quote_author, "— ${widgetData.quoteAuthor}")
        }

        // For large widget, add milestone
        if (layoutId == R.layout.widget_large) {
            views.setTextViewText(R.id.widget_milestone_name, widgetData.nextMilestoneName)
            views.setTextViewText(
                R.id.widget_milestone_days,
                "${widgetData.nextMilestoneDays} days to go"
            )
        }

        // Set click listener to open app
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun loadWidgetData(context: Context): WidgetData {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val dataString = prefs.getString(WIDGET_DATA_KEY, null)

        return if (dataString != null) {
            try {
                val json = JSONObject(dataString)
                val nextMilestone = json.getJSONObject("nextMilestone")

                WidgetData(
                    daysSober = json.optInt("daysSober", 0),
                    streak = json.optInt("streak", 0),
                    quote = json.optString("quote", "One day at a time"),
                    quoteAuthor = json.optString("quoteAuthor", "Anonymous"),
                    nextMilestoneName = nextMilestone.optString("name", "First Day"),
                    nextMilestoneDays = nextMilestone.optInt("daysRemaining", 1)
                )
            } catch (e: Exception) {
                // Return default data if parsing fails
                WidgetData()
            }
        } else {
            // Return default data if no data exists
            WidgetData()
        }
    }

    data class WidgetData(
        val daysSober: Int = 0,
        val streak: Int = 0,
        val quote: String = "Start your recovery journey today",
        val quoteAuthor: String = "Recover",
        val nextMilestoneName: String = "First Day",
        val nextMilestoneDays: Int = 1
    )
}
