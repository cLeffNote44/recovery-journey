'use client';

import { useState, type FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  organization: string;
  role: string;
  patientCount: string;
  message: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  organization: '',
  role: '',
  patientCount: '',
  message: '',
};

const roleOptions = [
  'Clinical Director',
  'Facility Administrator',
  'Counselor / Therapist',
  'IT / Technical',
  'Executive / Owner',
  'Other',
];

const patientCountOptions = [
  '1-25',
  '26-100',
  '101-250',
  '251-500',
  '500+',
];

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitted(true);
      setFormData(initialFormData);
    } catch {
      // Fallback: send via mailto if API not available
      const subject = encodeURIComponent(`Demo Request from ${formData.name} - ${formData.organization}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nOrganization: ${formData.organization}\nRole: ${formData.role}\nPatient Count: ${formData.patientCount}\n\nMessage:\n${formData.message}`
      );
      window.open(`mailto:contact@recoveryjourney.app?subject=${subject}&body=${body}`);
      setSubmitted(true);
      setFormData(initialFormData);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-8 rounded-2xl bg-navy-800/50 border border-teal-500/20">
        <div className="w-16 h-16 rounded-full bg-teal-600/10 flex items-center justify-center mx-auto mb-5">
          <Send className="w-7 h-7 text-teal-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Thank you for your interest
        </h3>
        <p className="text-slate-400 mb-6">
          We have received your demo request. A member of our team will reach
          out within one business day.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          Full Name <span className="text-teal-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-navy-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          placeholder="Jane Smith"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          Work Email <span className="text-teal-400">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-navy-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          placeholder="jane@facility.com"
        />
      </div>

      {/* Organization */}
      <div>
        <label
          htmlFor="organization"
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          Organization <span className="text-teal-400">*</span>
        </label>
        <input
          type="text"
          id="organization"
          name="organization"
          required
          value={formData.organization}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-navy-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          placeholder="Recovery Center Inc."
        />
      </div>

      {/* Role and Patient Count Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            Your Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-navy-800/50 border border-white/10 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors appearance-none"
          >
            <option value="">Select role</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="patientCount"
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            Number of Patients
          </label>
          <select
            id="patientCount"
            name="patientCount"
            value={formData.patientCount}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-navy-800/50 border border-white/10 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors appearance-none"
          >
            <option value="">Select range</option>
            {patientCountOptions.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-navy-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-none"
          placeholder="Tell us about your facility and what you are looking for..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-teal-500/25"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Request Demo
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 text-center">
        By submitting this form, you agree to our{' '}
        <a href="/privacy" className="text-teal-400 hover:underline">
          Privacy Policy
        </a>
        . We will never share your information with third parties.
      </p>
    </form>
  );
}
