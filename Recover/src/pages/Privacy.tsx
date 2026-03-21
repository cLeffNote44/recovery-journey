import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Database, Bell, Trash2, Download } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  const lastUpdated = "November 18, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-blue-300 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Our Commitment to Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              Recover ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we handle information when you use our sobriety tracking application.
            </p>
            <p className="font-semibold text-blue-300">
              The short version: We don't collect, store, or transmit any of your personal data to external servers.
              Everything stays on your device.
            </p>
          </CardContent>
        </Card>

        {/* Data Storage */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Data Storage & Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <h3 className="font-semibold text-white">100% Local Storage</h3>
            <p>
              All data you enter into Recover is stored exclusively on your device using your browser's
              localStorage or the native app's local storage. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your profile information (name, date of birth, sobriety date)</li>
              <li>Daily check-ins and mood entries</li>
              <li>Journal entries (cravings, meetings, growth, challenges, gratitude)</li>
              <li>Meditation sessions</li>
              <li>Emergency contacts</li>
              <li>Goals and progress tracking</li>
              <li>Wellness data (sleep, exercise, nutrition, medications)</li>
              <li>App preferences and settings</li>
            </ul>

            <h3 className="font-semibold text-white mt-6">No External Servers</h3>
            <p>
              We do not operate any servers that collect or store your data. Your information never
              leaves your device unless you explicitly export it.
            </p>

            <h3 className="font-semibold text-white mt-6">No Account Required</h3>
            <p>
              Recover does not require you to create an account. There is no registration, no email
              collection, and no user tracking.
            </p>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              App Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>Recover may request the following permissions:</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white">Notifications (Optional)</h4>
                <p className="text-sm">
                  Used to send you daily check-in reminders, milestone celebrations, and meeting
                  reminders. All notification scheduling happens locally on your device.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white">Internet Access</h4>
                <p className="text-sm">
                  Required only for loading the initial app. The app functions fully offline after
                  first load. No data is transmitted over the internet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Control */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" />
              Your Control Over Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Export Your Data</h4>
                  <p className="text-sm">
                    You can export all your data as a JSON file at any time from the Settings screen.
                    This allows you to back up your information or transfer it to another device.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Delete Your Data</h4>
                  <p className="text-sm">
                    You can delete all your data at any time from the Settings screen. You can also
                    clear your browser's localStorage or uninstall the app to remove all data.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Parties */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              Recover does not integrate with any third-party analytics, advertising, or tracking services.
              We do not share, sell, or transmit your data to any third parties.
            </p>
            <p>
              If you choose to share reports with your therapist or sponsor using the PDF export feature,
              you control that sharing directly - we are not involved in that transmission.
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Security</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              Since all data is stored locally on your device, the security of your data depends on the
              security of your device. We recommend:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Using a device passcode or biometric lock</li>
              <li>Enabling the app's built-in biometric/PIN lock feature</li>
              <li>Keeping your device's operating system up to date</li>
              <li>Regularly backing up your data using the export feature</li>
            </ul>
          </CardContent>
        </Card>

        {/* Children */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              Recover is not intended for use by children under 13 years of age. We do not knowingly
              collect information from children under 13.
            </p>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected by
              updating the "Last updated" date at the top of this page. We encourage you to review
              this Privacy Policy periodically.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              If you have any questions about this Privacy Policy, please contact us through the
              app's support channels or by visiting our website.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8 pb-8">
          <p>Recover - Your Complete Sobriety Companion</p>
          <p className="mt-2">This privacy policy is effective as of {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}
