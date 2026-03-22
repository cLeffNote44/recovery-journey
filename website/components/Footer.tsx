import Link from 'next/link';


const footerLinks = {
  Product: [
    { href: '/recover-app', label: 'Patient App' },
    { href: '/journey-portal', label: 'Clinician Portal' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/compliance', label: 'Compliance' },
    { href: '/contact', label: 'Request Demo' },
  ],
  Company: [
    { href: '/contact', label: 'Contact' },
    { href: '/compliance', label: 'Security' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/compliance', label: 'HIPAA Compliance' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5 mb-4">
              <img
                src="/brand-recover-icon.jpg"
                alt=""
                className="h-8 w-8 rounded-md object-cover"
              />
              <img
                src="/brand-journey-icon.jpg"
                alt=""
                className="h-8 w-8 rounded-md object-cover"
              />
              <span className="text-lg font-bold tracking-tight ml-1">
                <span className="text-blue-400">Recover</span><span className="text-teal-400">Journey</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              HIPAA and 42 CFR Part 2 compliant recovery management platform for
              rehab facilities and addiction counselors.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-900/30 text-teal-400 border border-teal-800/50">
                HIPAA Compliant
              </span>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@recoverjourney.com"
                  className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                >
                  hello@recoverjourney.com
                </a>
              </li>
              <li>
                <span className="text-sm text-slate-400">
                  Response within 24 hours
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} RecoverJourney. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
