import Link from 'next/link';
import { Shield } from 'lucide-react';
import { SplineBackground } from '@/components/home/SplineBackground';

export const metadata = {
  title: 'Legal & Compliance | Selsila',
  description: 'Privacy Policy and legal information for Selsila platform.',
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-black text-white pb-20 selection:bg-cyan-500/30 relative overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SplineBackground />
      <div className="fixed inset-0 bg-black/30 pointer-events-none z-[1]" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-4xl py-10">
        {/* Back Button */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">Legal & Compliance</h1>
        </div>

        {/* Privacy Policy Card */}
        <div className="w-full rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/20 p-6 sm:p-10 shadow-xl shadow-[#756BBA]/10">
          {/* Header */}
          <div className="flex items-start gap-3 mb-8">
            <Shield className="w-6 h-6 text-[#39AEC4] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#39AEC4] to-[#756BBA] bg-clip-text text-transparent mb-1">
                Privacy Policy
              </h2>
              <div className="text-xs text-gray-500 space-y-0.5 mt-2">
                <p className="font-semibold text-gray-400">Selsila World Ltd</p>
                <p>246436</p>
                <p>Ile Du Port, Mahe, Seychelles</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
            <p>
              At Selsila, accessible via{' '}
              <a
                href="https://www.selsiscan.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#39AEC4] hover:text-[#4EABC8] underline underline-offset-2 transition-colors"
              >
                www.selsiscan.online
              </a>
              , protecting the privacy of our users is a fundamental priority. This Privacy Policy
              outlines the specific types of data collected and recorded by our platform and details
              our methods for processing it. Should you have further inquiries or require additional
              clarification regarding our data practices, please contact our support team.
            </p>
            <p>
              This policy applies exclusively to our online operations and is valid for all
              participants interacting with the Selsila ecosystem. It governs information shared or
              collected through our digital interface and does not extend to data gathered offline
              or through external channels.
            </p>

            {/* Consent */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Consent</h3>
              <p>
                By using our website, you hereby consent to our Privacy Policy and agree to its
                terms.
              </p>
            </div>

            {/* Log Files */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Log Files</h3>
              <p>
                Selsila utilizes standard server log files, a common practice among hosting
                providers for analytical purposes. Collected data includes internet protocol (IP)
                addresses, browser types, Internet Service Providers (ISPs), date and time stamps,
                referring/exit pages, and click metrics. This data is not linked to any personally
                identifiable information. The purpose of this data collection is to analyze trends,
                administer the platform, monitor user movement within the site, and gather broad
                demographic information for improved functionality.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Information We Collect</h3>
              <p className="mb-3">
                We ensure transparency regarding data collection; you will always be informed why we
                are requesting specific information before you provide it.
              </p>
              <p className="mb-3">
                If you reach out to us directly, we may gather further details to assist you,
                including your name, contact information, the message content, and any files shared.
              </p>
              <p>
                During the account creation process, we may ask for details necessary for platform
                security and compliance, such as your name, company details, address, email, and
                phone number.
              </p>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                How We Use Your Information
              </h3>
              <p className="mb-3">
                We use the information we collect in various ways, including to:
              </p>
              <ul className="space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>Develop new products, services, features, and functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    Communicate with you, either directly or through one of our partners, including
                    for customer service, to provide you with updates and other information relating
                    to the website, and for marketing and promotional purposes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>Send you emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>Find and prevent fraud</span>
                </li>
              </ul>
            </div>

            {/* Privacy Rights */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                Privacy Rights (Do Not Sell My Personal Information)
              </h3>
              <p>
                Selsila respects your data privacy and is committed to complying with relevant data
                protection regulations. We do not sell your personal information for monetary gain.
                However, we may share certain data with service providers to ensure platform
                operations. You have the right to know, access, and request the deletion of your
                data by contacting us directly.
              </p>
            </div>

            {/* GDPR */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                GDPR Data Protection Rights
              </h3>
              <p className="mb-3">
                To ensure full transparency, Selsila outlines your comprehensive data protection
                rights under applicable regulations:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Right of Access:</span> You may
                    request copies of your personal data. A nominal administrative fee may apply.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Right to Rectification:</span> You
                    may request the correction of inaccurate information or the completion of
                    incomplete data.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Right to Erasure:</span> You may
                    request the deletion of your personal data, subject to specific legal
                    exceptions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Right to Restrict Processing:</span>{' '}
                    You may request limitations on how we process your personal data under certain
                    conditions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Right to Object:</span> You have the
                    right to object to our processing of your personal data under specific
                    circumstances.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Right to Data Portability:</span>{' '}
                    You may request that we transfer your collected data to another organization or
                    directly to you.
                  </span>
                </li>
              </ul>
              <p className="mt-4">
                We will respond to all requests within one month. Please contact our support team to
                exercise any of these rights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
