import Foundation
import Capacitor
import WidgetKit

/**
 * Capacitor Plugin for Widget Communication
 *
 * Handles data transfer between the main app and widget extension via App Groups
 */
@objc(WidgetPlugin)
public class WidgetPlugin: CAPPlugin {

    // App Group identifier - must match in both app and widget extension
    private let appGroupIdentifier = "group.com.recover.app"
    private let widgetDataKey = "widgetData"

    @objc func updateWidgetData(_ call: CAPPluginCall) {
        guard let dataString = call.getString("data") else {
            call.reject("Missing data parameter")
            return
        }

        // Write to shared UserDefaults (App Group)
        if let userDefaults = UserDefaults(suiteName: appGroupIdentifier) {
            userDefaults.set(dataString, forKey: widgetDataKey)
            userDefaults.synchronize()

            call.resolve(["success": true])
        } else {
            call.reject("Failed to access App Group")
        }
    }

    @objc func reloadWidgets(_ call: CAPPluginCall) {
        // Reload all widgets of this app
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
            call.resolve(["success": true])
        } else {
            call.reject("Widgets require iOS 14+")
        }
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            call.resolve(["available": true])
        } else {
            call.resolve(["available": false])
        }
    }
}
