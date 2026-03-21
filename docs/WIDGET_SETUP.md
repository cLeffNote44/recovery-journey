# Native Widget Setup Guide

This guide explains how to complete the setup of native home screen widgets for iOS and Android.

## Overview

The widget implementation consists of:
- **TypeScript Bridge**: Communication layer between app and widgets ✅ Complete
- **iOS WidgetKit Extension**: Swift code for iOS widgets ✅ Complete
- **Android AppWidget**: Kotlin code for Android widgets ✅ Complete
- **Configuration**: Xcode and Android Studio setup ⚠️ **YOU MUST DO THIS**

## Prerequisites

- **iOS**: macOS with Xcode 13+ installed
- **Android**: Android Studio installed
- Completed: All TypeScript, Swift, and Kotlin code is already written

---

## Part 1: iOS Widget Setup (Xcode Required)

### Step 1: Open Project in Xcode

```bash
cd source/ios/App
open App.xcworkspace
```

**Important**: Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

### Step 2: Create App Group

App Groups allow data sharing between the main app and widget extension.

1. In Xcode, select the **App** target (blue icon at top of file navigator)
2. Click **Signing & Capabilities** tab
3. Click **+ Capability** button
4. Search for and add **App Groups**
5. Click the **+** button under App Groups
6. Enter: `group.com.recover.app`
7. Click **OK**

### Step 3: Add Widget Extension Target

1. In Xcode menu: **File** → **New** → **Target**
2. Choose **iOS** → **Widget Extension**
3. Click **Next**
4. Configure the extension:
   - **Product Name**: `RecoverWidget`
   - **Team**: Select your development team
   - **Organization Identifier**: `com.recover`
   - **Include Configuration Intent**: ❌ Uncheck
   - **Include Live Activity**: ❌ Uncheck
5. Click **Finish**
6. When prompted "Activate 'RecoverWidget' scheme?", click **Activate**

### Step 4: Delete Auto-Generated Files

Xcode creates default widget files we don't need:

1. In the Project Navigator, find the **RecoverWidget** folder
2. Delete these auto-generated files (Move to Trash):
   - `RecoverWidget.swift` (the auto-generated one)
   - `RecoverWidgetBundle.swift`
   - `Assets.xcassets` (if present)

### Step 5: Add Our Widget Files

1. Right-click the **RecoverWidget** folder
2. Select **Add Files to "App"...**
3. Navigate to `source/ios/RecoverWidget/`
4. Select both:
   - `RecoverWidget.swift`
   - `RecoverWidgetView.swift`
5. Make sure **"RecoverWidget" target** is checked
6. Click **Add**

### Step 6: Add App Group to Widget Extension

1. Select the **RecoverWidget** target (in left sidebar)
2. Click **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **App Groups**
5. Check the box next to `group.com.recover.app` (same as main app)

### Step 7: Register Plugin in Main App

1. In Project Navigator, find **App** folder → **App** subfolder
2. Right-click and select **Add Files to "App"...**
3. Navigate to `source/ios/App/App/`
4. Select `WidgetPlugin.swift`
5. Make sure **"App" target** is checked (not RecoverWidget)
6. Click **Add**

7. Open `AppDelegate.swift` (in App folder)
8. Add this import at the top:
   ```swift
   import Capacitor
   ```

9. Find the `application(_ application: UIApplication, didFinishLaunchingWithOptions...)` method
10. **Before** the return statement, add:
    ```swift
    // Register widget plugin
    self.bridge?.registerPluginInstance(WidgetPlugin())
    ```

### Step 8: Build and Run

1. Select **App** scheme (top-left dropdown)
2. Choose **iPhone 14** or newer simulator (widgets require iOS 14+)
3. Click **Run** (▶️ button)
4. Wait for app to build and launch

### Step 9: Add Widget to Simulator

1. While app is running, press **Home** button in simulator (Cmd+Shift+H)
2. Long-press on home screen
3. Tap **+** button in top-left corner
4. Scroll down to find **Recover**
5. Choose widget size (Small, Medium, or Large)
6. Tap **Add Widget**
7. Widget should appear showing your data!

---

## Part 2: Android Widget Setup (Android Studio Required)

### Step 1: Open Project in Android Studio

```bash
cd source/android
```

Then in Android Studio:
1. **File** → **Open**
2. Select the `android` folder
3. Click **OK**
4. Wait for Gradle sync to complete

### Step 2: Register Widget Plugin

1. Open `MainActivity.kt` (located in `app/src/main/java/com/recover/app/`)
2. Find the `onCreate()` method
3. Inside `onCreate()`, find this line:
   ```kotlin
   registerPlugin(SomeExistingPlugin::class.java)
   ```
4. Add below it:
   ```kotlin
   registerPlugin(WidgetPlugin::class.java)
   ```

### Step 3: Add Widget to AndroidManifest.xml

1. Open `AndroidManifest.xml` (in `app/src/main/`)
2. Find the `<application>` tag
3. **Before** the closing `</application>` tag, add:

```xml
<!-- Widget Provider -->
<receiver
    android:name=".RecoverWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/recover_widget_info" />
</receiver>
```

### Step 4: Add String Resources

1. Open `res/values/strings.xml`
2. Add these strings:

```xml
<string name="widget_description">Track your sobriety progress</string>
```

### Step 5: Add Placeholder Preview Image (Optional but Recommended)

Create a simple preview image:

1. Right-click `res/drawable` folder
2. Select **New** → **Image Asset**
3. **Icon Type**: Action Bar and Tab Icons
4. **Name**: `widget_preview`
5. **Asset Type**: Clip Art
6. **Clip Art**: Choose a star or similar icon
7. Click **Next** → **Finish**

Or skip this - Android will auto-generate a preview.

### Step 6: Build and Run

1. Click **Sync Project with Gradle Files** (📁 with arrow icon)
2. Select a device/emulator (Android 8.0+)
3. Click **Run** (▶️ button)
4. Wait for app to build and install

### Step 7: Add Widget to Home Screen

1. While app is running, go to **Home screen**
2. Long-press on empty space
3. Tap **Widgets** (or look for widgets icon)
4. Scroll to find **Recover**
5. Long-press and drag widget to home screen
6. Choose widget size if prompted
7. Widget should appear showing your data!

---

## Part 3: Testing the Widgets

### Test Widget Data Update

1. Open the Recover app
2. Navigate to **Settings** → **Widgets**
3. Verify widget is enabled
4. Click **Update Now** button
5. Go to home screen
6. Widget should show updated data within a few seconds

**Note**: On iOS, widgets may take up to 1 minute to refresh due to system throttling.

### Test Different Widget Sizes

**iOS:**
- Small (2x2 grid cells) - Shows days sober + streak
- Medium (4x2 grid cells) - Adds motivational quote
- Large (4x4 grid cells) - Adds next milestone

**Android:**
- Small (2x2 cells) - Days sober + streak
- Medium (4x2 cells) - Adds quote
- Large (4x4 cells) - Adds milestone card

### Test Widget Click

1. Tap the widget on your home screen
2. Should open the Recover app
3. Should navigate to home screen

---

## Troubleshooting

### iOS Issues

**"No such module 'WidgetKit'"**
- Minimum deployment target must be iOS 14.0+
- Check: Target → General → Minimum Deployments → iOS 14.0

**Widget shows placeholder data**
- Verify App Group is enabled in BOTH targets
- Check App Group identifier matches exactly: `group.com.recover.app`
- Try running app first, then adding widget

**Widget not appearing in widget gallery**
- Clean build folder: Product → Clean Build Folder (Cmd+Shift+K)
- Rebuild: Product → Build (Cmd+B)
- Restart simulator

**Widget not updating**
- Check WidgetPlugin is registered in AppDelegate.swift
- Verify updateWidgetData is being called (check console logs)
- Widgets update on system's schedule (may take up to 1 hour)

### Android Issues

**"Unresolved reference: WidgetPlugin"**
- Make sure all Kotlin files are in correct package: `com.recover.app`
- Sync Gradle: Tools → Gradle → Sync Project with Gradle Files

**Widget not appearing in widget picker**
- Verify widget receiver is declared in AndroidManifest.xml
- Check `android:exported="true"` is set
- Reinstall app completely (uninstall first)

**Widget shows error/blank**
- Check all layout IDs match between XML and Kotlin
- Verify all drawables exist (widget_background, etc.)
- Check Logcat for errors: View → Tool Windows → Logcat

**Widget not updating**
- Verify WidgetPlugin is registered in MainActivity
- Check SharedPreferences name matches: `com.recover.app.widget`
- Force update: Uninstall widget and re-add

---

## File Structure Reference

```
source/
├── src/
│   ├── lib/
│   │   └── widgets.ts                    # ✅ TypeScript widget logic
│   └── plugins/
│       └── widget-plugin.ts               # ✅ Capacitor plugin interface
│
├── ios/
│   ├── App/
│   │   └── App/
│   │       └── WidgetPlugin.swift         # ✅ iOS plugin implementation
│   └── RecoverWidget/                     # ⚠️ You create this in Xcode
│       ├── RecoverWidget.swift            # ✅ Widget entry & provider
│       └── RecoverWidgetView.swift        # ✅ SwiftUI views
│
└── android/
    └── app/src/main/
        ├── java/com/recover/app/
        │   ├── WidgetPlugin.kt            # ✅ Android plugin implementation
        │   └── RecoverWidgetProvider.kt   # ✅ Widget provider
        ├── res/
        │   ├── layout/
        │   │   ├── widget_small.xml       # ✅ Small widget layout
        │   │   ├── widget_medium.xml      # ✅ Medium widget layout
        │   │   └── widget_large.xml       # ✅ Large widget layout
        │   ├── drawable/
        │   │   ├── widget_background.xml  # ✅ Gradient background
        │   │   ├── streak_indicator.xml   # ✅ Green dot
        │   │   └── milestone_card_background.xml  # ✅ Card background
        │   └── xml/
        │       └── recover_widget_info.xml  # ✅ Widget metadata
        └── AndroidManifest.xml             # ⚠️ You must edit this
```

---

## What Happens When Widget Updates

1. User triggers update in app (or auto-update runs)
2. TypeScript calls `WidgetPlugin.updateWidgetData()`
3. **iOS**: Data written to `UserDefaults(suite: "group.com.recover.app")`
4. **Android**: Data written to `SharedPreferences("com.recover.app.widget")`
5. `WidgetPlugin.reloadWidgets()` called
6. **iOS**: `WidgetCenter.shared.reloadAllTimelines()` triggers refresh
7. **Android**: Broadcast sent to `RecoverWidgetProvider`
8. Widget reads data from shared storage
9. Widget UI updates on home screen

---

## Data Flow Diagram

```
┌─────────────────┐
│   Recover App   │
│  (TypeScript)   │
└────────┬────────┘
         │ updateWidgetData()
         ▼
┌─────────────────┐
│ WidgetPlugin.ts │
│  (Capacitor)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌──────┐
│ iOS │   │Android│
│Swift│   │Kotlin│
└──┬──┘   └───┬──┘
   │          │
   ▼          ▼
┌─────┐   ┌──────┐
│ User│   │Shared│
│Deflt│   │Prefs │
└──┬──┘   └───┬──┘
   │          │
   ▼          ▼
┌─────┐   ┌──────┐
│Widget│   │Widget│
│ Kit  │   │Provdr│
└──┬──┘   └───┬──┘
   │          │
   ▼          ▼
┌─────────────────┐
│  Home Screen    │
│     Widget      │
└─────────────────┘
```

---

## Next Steps

1. ✅ Complete Xcode setup (Part 1)
2. ✅ Complete Android Studio setup (Part 2)
3. ✅ Test widgets on both platforms (Part 3)
4. 🎉 Users can now add widgets to their home screens!

## Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Verify all files are in correct locations
3. Clean and rebuild both iOS and Android projects
4. Check console logs for errors
5. Ensure minimum OS versions: iOS 14+, Android 8+

## Additional Resources

- [iOS WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Android App Widgets Documentation](https://developer.android.com/develop/ui/views/appwidgets)
- [Capacitor Plugin Guide](https://capacitorjs.com/docs/plugins/creating-plugins)
