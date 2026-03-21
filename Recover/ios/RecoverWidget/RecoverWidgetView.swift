import SwiftUI
import WidgetKit

/**
 * Widget View
 *
 * Displays widget content based on size (small, medium, large)
 */
struct RecoverWidgetView: View {
    @Environment(\.widgetFamily) var family
    var entry: RecoverEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        @unknown default:
            SmallWidgetView(entry: entry)
        }
    }
}

/**
 * Small Widget (170x170)
 *
 * Shows: Days sober + streak indicator
 */
struct SmallWidgetView: View {
    var entry: RecoverEntry

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [Color.purple, Color.pink]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 8) {
                // Days sober counter
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(entry.daysSober)")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("Days Sober")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                // Streak indicator
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 6, height: 6)

                    Text("\(entry.streak) day streak")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                }
            }
            .padding(16)
        }
    }
}

/**
 * Medium Widget (360x170)
 *
 * Shows: Days sober + quote + streak
 */
struct MediumWidgetView: View {
    var entry: RecoverEntry

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [Color.purple, Color.pink]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack(spacing: 16) {
                // Left: Days sober
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(entry.daysSober)")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("Days Sober")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))

                    Spacer()

                    // Streak indicator
                    HStack(spacing: 4) {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 6, height: 6)

                        Text("\(entry.streak) day streak")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.9))
                    }
                }

                Divider()
                    .background(Color.white.opacity(0.3))

                // Right: Quote
                VStack(alignment: .leading, spacing: 4) {
                    Text("\"\(entry.quote)\"")
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(.white)
                        .lineLimit(4)
                        .italic()

                    Spacer()

                    Text("— \(entry.quoteAuthor)")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }
                .frame(maxWidth: .infinity)
            }
            .padding(16)
        }
    }
}

/**
 * Large Widget (360x376)
 *
 * Shows: Days sober + quote + milestone + streak
 */
struct LargeWidgetView: View {
    var entry: RecoverEntry

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [Color.purple, Color.pink]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 12) {
                // Top: Days sober
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(entry.daysSober)")
                        .font(.system(size: 56, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("Days Sober")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }

                // Middle: Quote
                VStack(alignment: .leading, spacing: 4) {
                    Text("\"\(entry.quote)\"")
                        .font(.system(size: 14, weight: .regular))
                        .foregroundColor(.white)
                        .lineLimit(5)
                        .italic()

                    Text("— \(entry.quoteAuthor)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }
                .padding(.vertical, 8)

                // Next milestone card
                VStack(alignment: .leading, spacing: 6) {
                    Text("NEXT MILESTONE")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white.opacity(0.7))
                        .tracking(1)

                    Text(entry.nextMilestone)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)

                    Text("\(entry.daysToMilestone) days to go")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white.opacity(0.15))
                )

                Spacer()

                // Bottom: Streak indicator
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 6, height: 6)

                    Text("\(entry.streak) day streak")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                }
            }
            .padding(16)
        }
    }
}
