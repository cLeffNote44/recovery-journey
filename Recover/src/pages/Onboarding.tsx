import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { OnboardingStep } from '@/components/OnboardingStep';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import { requestNotificationPermission, isNative } from '@/lib/notifications';
import {
  Award, Bell, Calendar, Heart, Shield, Sparkles, User, Clock, Brain, TrendingUp, Zap
} from 'lucide-react';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const {
    setUserProfile,
    setSobrietyDate,
    setContacts,
    setNotificationSettings,
    setOnboardingCompleted,
    notificationSettings,
    contacts,
  } = useAppData();

  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sobrietyDateInput, setSobrietyDateInput] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reminderTime, setReminderTime] = useState('09:00');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorPhone, setSponsorPhone] = useState('');

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToEnd = () => {
    setCurrentStep(totalSteps);
  };

  const completeOnboarding = () => {
    // Create and save user profile
    const profile = {
      name: userName,
      dateOfBirth: dateOfBirth,
      sobrietyDate: sobrietyDateInput,
      createdAt: new Date().toISOString()
    };

    // Update all state
    setUserProfile(profile);
    setSobrietyDate(sobrietyDateInput);

    // Save sponsor contact if provided
    if (sponsorName && sponsorPhone) {
      setContacts([
        ...contacts,
        {
          id: Date.now(),
          name: sponsorName,
          role: 'Sponsor',
          phone: sponsorPhone,
        },
      ]);
    }

    // Save notification settings
    setNotificationSettings({
      ...notificationSettings,
      dailyReminderTime: reminderTime,
    });

    // Mark onboarding as completed
    setOnboardingCompleted(true);

    // Force a direct save to localStorage as a fallback
    // This ensures data is persisted even if state updates haven't completed
    try {
      const stored = localStorage.getItem('recovery_journey_data');
      if (stored) {
        const data = JSON.parse(stored);
        data.userProfile = profile;
        data.sobrietyDate = sobrietyDateInput;
        data.onboardingCompleted = true;
        localStorage.setItem('recovery_journey_data', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error force-saving to localStorage:', error);
    }

    // Wait for state updates to propagate before navigating
    setTimeout(() => {
      setLocation('/app');
    }, 300);
  };

  const requestNotifications = async () => {
    if (isNative()) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationSettings({
          ...notificationSettings,
          enabled: true,
        });
      }
    }
    handleNext();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep
            title="Welcome to Recover"
            description="Your personal companion for sobriety and recovery"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-3xl">
                  <Award className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Your Complete Recovery Companion
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  AI-powered risk prediction, dual progress tracking, evidence-based recovery skills, emergency support, and comprehensive wellness tools all in one place.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2">
                    <Award className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300">Dual Progress Tracking</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-2">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm text-gray-300">AI Risk Prediction</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300">7 Recovery Skills</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300">Emergency Support</p>
                </div>
              </div>
            </div>
          </OnboardingStep>
        );

      case 2:
        return (
          <OnboardingStep
            title="Create Your Profile"
            description="Let's personalize your recovery journey"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!userName.trim() || !dateOfBirth || !sobrietyDateInput}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-slate-600 to-gray-700 p-4 rounded-2xl">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name" className="text-white text-base">
                    Your Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="user-name"
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-of-birth" className="text-white text-base">
                    Date of Birth <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="date-of-birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sobriety-date" className="text-white text-base">
                    Sobriety Start Date <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="sobriety-date"
                    type="date"
                    value={sobrietyDateInput}
                    onChange={(e) => setSobrietyDateInput(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-200">
                    <strong>Note:</strong> Your profile information is stored securely on your device. To reset the app and go through onboarding again, you'll need to delete your profile from Settings.
                  </p>
                </div>
              </div>
            </div>
          </OnboardingStep>
        );

      case 3:
        return (
          <OnboardingStep
            title="Add Your Sponsor"
            description="Quick access to your support network when you need it most"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            showSkip
            onSkip={handleNext}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsor-name" className="text-white text-base">
                    Sponsor Name (Optional)
                  </Label>
                  <Input
                    id="sponsor-name"
                    type="text"
                    placeholder="John Doe"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsor-phone" className="text-white text-base">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="sponsor-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={sponsorPhone}
                    onChange={(e) => setSponsorPhone(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  You can add more support contacts later in the Contacts tab.
                </p>
              </div>
            </div>
          </OnboardingStep>
        );

      case 4:
        return (
          <OnboardingStep
            title="Daily Reminder"
            description="Stay accountable with a daily check-in reminder"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-slate-600 to-gray-700 p-4 rounded-2xl">
                  <Clock className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="text-white text-base">
                  Preferred Reminder Time
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400">
                  We'll send you a daily reminder to complete your check-in and
                  log your progress.
                </p>
              </div>
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  💡 <strong>Tip:</strong> Choose a time when you can take a
                  moment for self-reflection, like morning coffee or evening
                  wind-down.
                </p>
              </div>
            </div>
          </OnboardingStep>
        );

      case 5:
        return (
          <OnboardingStep
            title="Enable Notifications"
            description={
              isNative()
                ? 'Get reminders and celebrate milestones'
                : 'Notifications are available on mobile devices'
            }
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={isNative() ? requestNotifications : handleNext}
            onBack={handleBack}
            nextLabel={isNative() ? 'Allow Notifications' : 'Next'}
            showSkip
            onSkip={handleNext}
          >
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-slate-600 to-gray-700 p-4 rounded-2xl">
                  <Bell className="w-12 h-12 text-white" />
                </div>
              </div>
              {isNative() ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Daily Check-In</p>
                        <p className="text-sm text-gray-400">
                          Never forget your daily accountability
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Streak Alerts</p>
                        <p className="text-sm text-gray-400">
                          Keep your momentum going
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Milestone Celebrations</p>
                        <p className="text-sm text-gray-400">
                          Get recognized for your progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <p className="text-white font-medium">Meeting Reminders</p>
                        <p className="text-sm text-gray-400">
                          Never miss your support meetings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-300">
                    Notifications are currently only available when using the app
                    on iOS or Android devices. You can enable them later in
                    Settings.
                  </p>
                </div>
              )}
            </div>
          </OnboardingStep>
        );

      case 6:
        return (
          <OnboardingStep
            title="You're All Set!"
            description="Ready to start your recovery journey?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={completeOnboarding}
            onBack={handleBack}
            nextLabel="Get Started"
          >
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-3xl">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Your Journey Begins Now
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  Recover is ready to support you every step of the way.
                  Remember: One day at a time. You've got this! 💪
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-lg p-6 mt-8">
                <p className="text-white font-medium mb-2">Quick Start Guide:</p>
                <ul className="text-sm text-gray-300 space-y-2 text-left max-w-md mx-auto">
                  <li>• Check your dual progress counter (Days Sober + Check-In Streak)</li>
                  <li>• Complete your first daily check-in to start building your streak</li>
                  <li>• Practice the 7 recovery skills when you need support</li>
                  <li>• Set up your emergency action plan and crisis contacts</li>
                  <li>• Explore meditation, journaling, and wellness tools</li>
                  <li>• Track patterns with AI-powered risk prediction</li>
                </ul>
              </div>
            </div>
          </OnboardingStep>
        );

      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
}
