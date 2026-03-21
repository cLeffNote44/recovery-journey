import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { 
  Award, 
  Brain, 
  Calendar, 
  CheckCircle, 
  Heart, 
  Moon, 
  Shield, 
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Download,
  Github
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const features = [
    {
      icon: Award,
      title: "Dual Progress Tracking",
      description: "Track both days sober (from start date) and check-in streak. Never lose sight of your progress.",
      gradient: "from-slate-600 to-gray-700"
    },
    {
      icon: TrendingUp,
      title: "AI Risk Prediction",
      description: "Smart algorithm analyzes your patterns and alerts you to potential relapse risks early.",
      gradient: "from-red-500 to-orange-600"
    },
    {
      icon: Brain,
      title: "7 Recovery Skills",
      description: "Evidence-based coping strategies: grounding, urge surfing, mindfulness, HALT, and more.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: Shield,
      title: "Emergency Support",
      description: "Instant access to crisis hotlines, emergency contacts, and your relapse prevention plan.",
      gradient: "from-red-600 to-blue-600"
    },
    {
      icon: CheckCircle,
      title: "Daily Check-Ins",
      description: "Build accountability with mood tracking, HALT assessments, and daily reflections.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Zap,
      title: "Craving Management",
      description: "Log cravings with triggers, intensity, and coping strategies. Identify patterns to stay ahead.",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: Heart,
      title: "Meditation & Mindfulness",
      description: "Guided meditation with breathing exercises, body scans, and loving-kindness practice.",
      gradient: "from-blue-500 to-rose-600"
    },
    {
      icon: Sparkles,
      title: "Achievement System",
      description: "Unlock 40+ badges across 6 categories. Celebrate milestones with Bronze, Silver, and Gold tiers.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Progress Sharing",
      description: "Generate HIPAA-compliant reports for therapists and sponsors with granular privacy controls.",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: Calendar,
      title: "Meeting & Event Tracker",
      description: "Log support meetings, therapy sessions, and recovery events with notes and reminders.",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Beautiful charts showing mood trends, craving patterns, and recovery insights.",
      gradient: "from-violet-500 to-blue-600"
    },
    {
      icon: Moon,
      title: "Mobile Features",
      description: "Native iOS/Android apps, home screen widgets, biometric lock, and local notifications.",
      gradient: "from-slate-600 to-gray-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <img
              src="/site-logo.png"
              alt="Site Logo"
              className="w-48 h-48 md:w-64 md:h-64 mx-auto object-contain drop-shadow-2xl"
            />
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Your Complete Sobriety Companion
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Track your progress, build healthy habits, and stay accountable with a comprehensive recovery app featuring mood tracking, meditation, relapse prevention planning, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-8 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all transform hover:scale-105"
                onClick={() => setLocation('/app')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Launch App
              </Button>
            <a href="/sobriety-app-v5-complete.zip" download>
              <Button size="lg" variant="outline" className="border-2 border-blue-500 text-blue-300 hover:bg-blue-500/10 px-8 py-6 text-lg rounded-2xl">
                <Download className="w-5 h-5 mr-2" />
                Download v5.0
              </Button>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            Everything You Need for Recovery
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            A comprehensive toolkit built on evidence-based recovery principles from AA, NA, CBT, DBT, and mindfulness practices.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl">
                  <CardHeader>
                    <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-2xl w-fit mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* What's New in v5 */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border-2 border-blue-500/50 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-400" />
              What's New in Version 5.0
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">📊 Dual Progress Widget</h3>
                <p className="text-gray-300">Beautiful home screen widget showing both Days Sober (from start date) AND Check-In Streak. Motivational messages adapt to your progress.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">🤖 AI Risk Prediction</h3>
                <p className="text-gray-300">Smart algorithm analyzes check-ins, moods, cravings, and meetings to predict relapse risk with proactive interventions.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">🧠 7 Recovery Skills</h3>
                <p className="text-gray-300">Master evidence-based coping strategies: Grounding, Cognitive Restructuring, Urge Surfing, Mindfulness, HALT Response, Distraction, and Reaching Out.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">🚨 Emergency Support</h3>
                <p className="text-gray-300">One-tap access to crisis hotlines, emergency contacts, and your personalized action plan when you need help most.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">🏆 Achievement Badges</h3>
                <p className="text-gray-300">Unlock 40+ badges with Bronze, Silver, and Gold tiers across sobriety, check-ins, meditation, cravings, meetings, and gratitude.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">📱 Mobile Widgets</h3>
                <p className="text-gray-300">iOS and Android home screen widgets show your progress at a glance with auto-updates and theme customization.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Your Daily Workflow
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-green-500/50">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Morning Check-In</h3>
              <p className="text-gray-400">Start your day with a check-in and mood selection. Build your streak one day at a time.</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-slate-600 to-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-blue-500/50">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track & Log</h3>
              <p className="text-gray-400">Log cravings, meetings, growth, and challenges throughout your day. Identify patterns.</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-blue-500/50">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Evening Reflection</h3>
              <p className="text-gray-400">Meditate, journal gratitude, and review your analytics. Celebrate your progress.</p>
            </div>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                Your Privacy Matters
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                <div className="space-y-2 mt-4">
                  <p>✅ <strong>100% Local Storage</strong> - All data stays on your device</p>
                  <p>✅ <strong>No Account Required</strong> - Start using immediately</p>
                  <p>✅ <strong>No External Servers</strong> - Complete privacy and control</p>
                  <p>✅ <strong>Export Anytime</strong> - Download your data as JSON backup</p>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 shadow-2xl shadow-blue-500/50">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Your Recover Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands using this comprehensive recovery companion. One day at a time. You've got this. 💪
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-lg font-bold">
                <Sparkles className="w-5 h-5 mr-2" />
                Launch App Now
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-2xl">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p className="mb-2">Recover v5.0 - Built with ❤️ for the recovery community</p>
          <p>Not a substitute for professional treatment. Consult healthcare providers for serious issues.</p>
          <p className="mt-4">Crisis Support: <strong className="text-blue-400">988 Suicide & Crisis Lifeline</strong></p>
          <Link href="/privacy">
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer mt-4 inline-block">Privacy Policy</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

