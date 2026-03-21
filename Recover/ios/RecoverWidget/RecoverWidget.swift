import WidgetKit
import SwiftUI

/**
 * Recover Widget Entry
 *
 * Represents a single point in time for the widget
 */
struct RecoverEntry: TimelineEntry {
    let date: Date
    let daysSober: Int
    let streak: Int
    let quote: String
    let quoteAuthor: String
    let nextMilestone: String
    let daysToMilestone: Int
}

/**
 * Timeline Provider
 *
 * Provides timeline entries to WidgetKit
 */
struct RecoverProvider: TimelineProvider {
    // App Group identifier - must match plugin
    private let appGroupIdentifier = "group.com.recover.app"
    private let widgetDataKey = "widgetData"

    func placeholder(in context: Context) -> RecoverEntry {
        RecoverEntry(
            date: Date(),
            daysSober: 0,
            streak: 0,
            quote: "One day at a time",
            quoteAuthor: "Anonymous",
            nextMilestone: "First Day",
            daysToMilestone: 1
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (RecoverEntry) -> ()) {
        let entry = loadWidgetData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<RecoverEntry>) -> ()) {
        let entry = loadWidgetData()

        // Update every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

        completion(timeline)
    }

    /// Load widget data from App Group shared storage
    private func loadWidgetData() -> RecoverEntry {
        guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier),
              let dataString = userDefaults.string(forKey: widgetDataKey),
              let jsonData = dataString.data(using: .utf8),
              let widgetData = try? JSONDecoder().decode(WidgetData.self, from: jsonData) else {
            // Return default data if can't load
            return RecoverEntry(
                date: Date(),
                daysSober: 0,
                streak: 0,
                quote: "Start your recovery journey today",
                quoteAuthor: "Recover",
                nextMilestone: "First Day",
                daysToMilestone: 1
            )
        }

        return RecoverEntry(
            date: Date(),
            daysSober: widgetData.daysSober,
            streak: widgetData.streak,
            quote: widgetData.quote,
            quoteAuthor: widgetData.quoteAuthor,
            nextMilestone: widgetData.nextMilestone.name,
            daysToMilestone: widgetData.nextMilestone.daysRemaining
        )
    }
}

/**
 * Widget Data Model
 *
 * Must match TypeScript WidgetData interface
 */
struct WidgetData: Codable {
    let daysSober: Int
    let streak: Int
    let quote: String
    let quoteAuthor: String
    let lastCheckIn: String
    let nextMilestone: NextMilestone
    let timestamp: String

    struct NextMilestone: Codable {
        let days: Int
        let name: String
        let daysRemaining: Int
    }
}

/**
 * Widget Main Configuration
 */
@main
struct RecoverWidget: Widget {
    let kind: String = "RecoverWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RecoverProvider()) { entry in
            RecoverWidgetView(entry: entry)
        }
        .configurationDisplayName("Recover")
        .description("Track your sobriety progress")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

/**
 * Widget Preview for Xcode
 */
struct RecoverWidget_Previews: PreviewProvider {
    static var previews: some View {
        let entry = RecoverEntry(
            date: Date(),
            daysSober: 45,
            streak: 30,
            quote: "One day at a time",
            quoteAuthor: "Anonymous",
            nextMilestone: "Two Months",
            daysToMilestone: 15
        )

        Group {
            RecoverWidgetView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))

            RecoverWidgetView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))

            RecoverWidgetView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemLarge))
        }
    }
}
