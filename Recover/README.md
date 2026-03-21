# Recover

> A comprehensive, privacy-first sobriety tracking and recovery support application

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?logo=vite)](https://vitejs.dev/)

## Overview

Recover is a feature-rich, privacy-focused application designed to support individuals on their sobriety journey. With daily check-ins, progress tracking, AI-powered risk prediction, and comprehensive recovery tools, this app provides the structure and motivation needed for long-term success.

**🔒 Privacy First:** All data is stored locally on your device. No server uploads, no tracking, complete privacy.

**🌐 Live Demo:** [https://source-ofvyduqto-cleffnote44s-projects.vercel.app](https://source-ofvyduqto-cleffnote44s-projects.vercel.app)

## Key Features

### Core Functionality
- **Dual Progress Tracking** - Track both current streak and total sober days this year
- **Daily Check-Ins** - Build accountability with mood tracking and HALT assessments
- **Smart Risk Prediction** - AI-powered relapse risk analysis with proactive interventions
- **Recovery Skills System** - 7 evidence-based coping skills with practice tracking
- **Emergency Support** - Quick access to crisis resources and support contacts

### Wellness Tools
- **Guided Meditation** - Multiple meditation types with progress tracking
- **Craving Management** - Log, analyze, and overcome cravings with proven techniques
- **Journal & Gratitude** - Reflect on your journey and practice gratitude
- **Meeting Tracker** - Log support group meetings with notes and contacts
- **HALT Check** - Assess Hunger, Anger, Loneliness, Tiredness states

### Progress & Motivation
- **Achievement System** - 40+ badges across 6 categories with Bronze/Silver/Gold tiers
- **Visual Analytics** - Beautiful charts showing mood trends, progress patterns, and insights
- **Milestone Celebrations** - Animated celebrations for achievements
- **Motivational Quotes** - Daily inspiration with custom quote support
- **Traffic Light System** - Visual relapse prevention planning tool

### Data & Privacy
- **Offline-First** - Works completely offline, no internet required
- **Local Storage** - All data stays on your device
- **Data Export** - Backup and restore your complete journey
- **Progress Sharing** - Generate HIPAA-compliant reports for therapists/sponsors
- **Cloud Sync (Optional)** - Sync across devices with end-to-end encryption

### Mobile Features
- **PWA Support** - Install as a native app on any platform
- **Capacitor Integration** - Native iOS/Android apps
- **Home Screen Widgets** - iOS/Android widgets showing your progress
- **Biometric Lock** - Face ID, Touch ID, or fingerprint security
- **Local Notifications** - Daily reminders and streak notifications

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 10.4.1+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/recovery-journey.git
cd recovery-journey/source

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Deployment

**Vercel (Recommended):**
```bash
npx vercel --prod
```

**Static Hosting:**
```bash
pnpm build
# Upload the dist/ folder to your hosting provider
```

## Documentation

- **[Features Guide](./docs/FEATURES.md)** - Comprehensive feature documentation
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Cloud sync configuration guide
- **[Widget Setup](./WIDGET_SETUP.md)** - Native iOS/Android widget configuration
- **[Roadmap](./docs/ROADMAP.md)** - Future plans and enterprise features
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture overview
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deployment instructions
- **[Contributing](./docs/CONTRIBUTING.md)** - How to contribute

## Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 4** - Styling framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **Framer Motion** - Animations

### Mobile
- **Capacitor 7** - Native app wrapper
- **PWA** - Progressive Web App support
- **Workbox** - Service worker and offline support

### State & Data
- **Zustand** - State management with persistence
- **localStorage** - Data persistence
- **Supabase** - Optional cloud sync and backup

## Project Structure

```
recovery-journey/
├── src/
│   ├── components/          # React components
│   │   ├── app/            # Application-specific components
│   │   │   ├── screens/    # Main screens
│   │   │   ├── prevention/ # Relapse prevention components
│   │   │   └── skills/     # Recovery skills components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Root component
├── public/                 # Static assets
├── docs/                   # Documentation
└── capacitor/              # Native app configuration
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful component and variable names
- Write accessible, semantic HTML
- Test on multiple devices and browsers
- Document new features and APIs

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/recovery-journey/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/recovery-journey/discussions)

## Acknowledgments

Built with dedication to support those on their recovery journey. This app incorporates evidence-based recovery practices and is designed with input from recovery professionals.

## Disclaimer

This application is a supportive tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions regarding substance use disorders.

---

**Made with ❤️ for the recovery community**
