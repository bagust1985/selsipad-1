import Link from 'next/link';
import { FileText } from 'lucide-react';
import { SplineBackground } from '@/components/home/SplineBackground';

export const metadata = {
  title: 'Terms & Conditions | Selsila',
  description: 'Terms and Conditions for the Selsila platform.',
};

export default function TermsPage() {
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
          <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
        </div>

        {/* Terms Card */}
        <div className="w-full rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/20 p-6 sm:p-10 shadow-xl shadow-[#756BBA]/10">
          {/* Header */}
          <div className="flex items-start gap-3 mb-8">
            <FileText className="w-6 h-6 text-[#39AEC4] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#39AEC4] to-[#756BBA] bg-clip-text text-transparent">
                Terms of Condition
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
            <p>
              Welcome to Selsila. By accessing our platform, you are engaging with an ecosystem
              designed for the evolution of technology in line with the wealth resilience of the
              community.
            </p>
            <p>
              Selsila provides a decentralized interface that facilitates access to various
              blockchain protocols. Please be advised that Selsila is a non-custodial service
              provider; we do not manage, store, or have access to your private keys or digital
              assets. All interactions and transactions are executed directly on-chain at the
              user&apos;s own risk.
            </p>
            <p>
              Use of this Interface constitutes your agreement that Selsila is not liable for any
              financial losses, smart contract failures, or third-party exploits. You are
              responsible for your own due diligence and compliance with local regulations before
              participating in any launchpad or DEX activities.
            </p>
            <p>
              The terms and conditions by which you may access and use the Interface. You must read
              this Agreement carefully. By accessing or using the Interface, you signify that you
              have read, understand, and agree to be bound by this Agreement in its entirety. If you
              do not agree, you are not authorized to access or use the Interface and should not use
              the Interface.
            </p>
            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
              <p className="text-yellow-400/90 text-xs leading-relaxed">
                <span className="font-semibold">NOTICE:</span> Please read this Agreement carefully
                as it governs your use of the Interface. This Agreement contains important
                information, including a binding arbitration provision and a class action waiver,
                both of which impact your rights as to how disputes are resolved. The Interface is
                only available to you and you should only access the Interface — if you agree
                completely with these terms.
              </p>
            </div>

            {/* Modification */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                Modification of this Agreement
              </h3>
              <p>
                Any updates to this Agreement are effective immediately upon posting. By continuing
                to access or use the Interface after updates are published, you confirm your
                acceptance of the modified terms. If you do not agree to the revised Agreement, you
                must immediately cease accessing and using the Interface.
              </p>
            </div>

            {/* Eligibility */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                Eligibility and Compliance
              </h3>
              <p className="mb-3">
                To access or use the Selsila Interface, you must possess the legal capacity to enter
                into a binding contract. By using the Interface, you represent and warrant that you
                are of legal age in your jurisdiction (at least 18 years old) and have the full
                authority to agree to these Terms on behalf of yourself or any entity you represent.
              </p>
              <p className="mb-3">Furthermore, you represent that you are not:</p>
              <ul className="space-y-2 ml-4 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-0.5 text-xs font-semibold">(a)</span>
                  <span>
                    Subject to economic sanctions or designated as a prohibited party by any
                    governmental authority, including the U.S. Department of the Treasury&apos;s
                    Office of Foreign Assets Control (OFAC);
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-0.5 text-xs font-semibold">(b)</span>
                  <span>
                    A citizen, resident, or organized within a territory subject to comprehensive
                    U.S. sanctions.
                  </span>
                </li>
              </ul>
              <p>
                You agree that your use of Selsila will fully comply with all applicable laws and
                regulations, and you will not utilize the platform to facilitate any illegal
                activities.
              </p>
            </div>

            {/* Proprietary Rights */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Proprietary Rights</h3>
              <p>
                All intellectual property rights within the Interface including software, branding,
                content, and designs are owned solely by Selsila. Use of these assets is governed
                strictly by our copyright licenses and Trademark Guidelines.
              </p>
            </div>

            {/* Additional Rights */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Additional Rights</h3>
              <p>
                We maintain the right, though not the duty, to: (a) alter, substitute, or
                discontinue any part of the Interface at any time; (b) moderate, hide, or remove any
                platform content; and (c) comply with government or court-ordered investigations by
                disclosing relevant user information or content as directed.
              </p>
            </div>

            {/* Privacy */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Privacy</h3>
              <p className="mb-3">
                When interacting with the Selsila Interface, our data collection is limited to
                blockchain wallet addresses, transaction hashes, and token identifiers (names and
                symbols). We do not directly collect personal identifiers such as names or emails.
                However, we utilize third-party service providers who may access publicly available
                information; we do not govern their data practices and recommend reviewing their
                respective privacy policies. By using the Interface, you consent to our data
                protocols and our providers&apos; handling of your information.
              </p>
              <p>
                We utilize collected data to identify, prevent, and mitigate financial crime or
                illicit activity. To support platform integrity, we may share this data with
                blockchain analytics firms dedicated to safety and security. Furthermore, you
                acknowledge that transactions on public blockchains (like Ethereum) are transparent
                by design. Selsila is not responsible for any information that becomes public
                through your on-chain actions.
              </p>
            </div>

            {/* Prohibited Activities */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Prohibited Activities</h3>
              <p className="mb-3">
                By accessing or using the Interface, you agree not to engage in, or attempt to
                engage in, any of the following prohibited behaviors:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">
                      Intellectual Property Infringement:
                    </span>{' '}
                    Actions that violate copyrights, trademarks, patents, publicity rights, privacy
                    rights, or other proprietary rights protected by law.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Cyberattacks:</span> Actions
                    intended to compromise the security, integrity, or functionality of any computer
                    system, network, or device, including the deployment of viruses or
                    denial-of-service attacks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Fraud and Misrepresentation:</span>{' '}
                    Actions designed to defraud Selsila or any third party, including providing
                    false or misleading information to unlawfully acquire property.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Market Manipulation:</span> Actions
                    that violate trading regulations, including, but not limited to, &quot;rug
                    pulls&quot;, pump-and-dump schemes, and wash trading.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">
                      Securities and Derivatives Violations:
                    </span>{' '}
                    Actions that violate laws regarding the trading of securities or derivatives,
                    such as unregistered offerings or offering prohibited leveraged products to
                    retail customers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#39AEC4] mt-1.5 text-[8px]">●</span>
                  <span>
                    <span className="text-white/70 font-medium">Unlawful Conduct:</span> Actions
                    that violate any applicable laws or regulations in any relevant jurisdiction.
                  </span>
                </li>
              </ul>
            </div>

            {/* Not Registered with SEC */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                Not Registered with the SEC or Any Other Agency
              </h3>
              <p>
                We are not registered with the U.S. Securities and Exchange Commission as a national
                securities exchange or in any other capacity.
              </p>
            </div>

            {/* Non-Custodial */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                Non-Custodial Nature and Fiduciary Disclaimer
              </h3>
              <p>
                The Interface is purely non-custodial; you hold sole responsibility for the custody
                of your cryptographic private keys and digital asset wallets. This Agreement does
                not create, nor do we assume, any fiduciary duties toward you. To the maximum extent
                permitted by law, you acknowledge that Selsila owes no fiduciary duties or
                liabilities to you or any third party. Any such duties or liabilities existing at
                law or in equity are hereby irrevocably disclaimed, waived, and eliminated.
                Furthermore, you agree that our only obligations are those expressly set forth in
                this Agreement.
              </p>
            </div>

            {/* Professional & Authoritative */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">
                Professional & Authoritative
              </h3>
              <p>
                The Interface may not be legally accessible or suitable in all jurisdictions. By
                using Selsila, you acknowledge that you are exclusively responsible for adhering to
                all local laws and regulations. You further recognize that interactions with the
                Interface or Protocol may trigger tax obligations, including income, capital gains,
                VAT, or sales tax. It is your sole responsibility to identify, report, and remit the
                appropriate taxes to your respective tax authorities for all transactions initiated
                or received through the platform.
              </p>
            </div>

            {/* Assumption of Risk */}
            <div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Assumption of Risk</h3>
              <p className="mb-3">
                By accessing and using the Interface, you represent that you possess the financial
                and technical sophistication required to understand the inherent risks of
                cryptographic and blockchain-based systems. You acknowledge a working knowledge of
                digital asset mechanics, including the usage and intricacies of Ethereum Virtual
                Machine (EVM) compatible networks such as Ethereum (ETH), Binance Smart Chain (BSC),
                and Base as well as the Solana network.
              </p>
              <p className="mb-3">
                You confirm your understanding of digital tokens (including ERC-20 and SPL
                standards), stablecoins, and the specific operational requirements of transacting
                across these diverse blockchain ecosystems.
              </p>
              <p className="mb-3">
                In particular, you understand that digital asset markets are nascent and highly
                volatile, driven by factors including adoption rates, speculation, technological
                limitations, security vulnerabilities, and regulatory changes. You accept the risk
                that anyone can create tokens, including fraudulent versions of existing projects,
                and acknowledge that you may mistakenly trade these assets. You further understand
                that stablecoins may lack adequate collateralization, leading to instability,
                panics, or runs.
              </p>
              <p className="mb-3">
                Furthermore, you acknowledge that smart contract transactions are automated,
                irreversible upon confirmation, and settle immediately. You accept that transaction
                costs and speeds on networks like BSC, Base, Ethereum and Solana are variable and
                can increase dramatically without notice. Additionally, you assume the risks
                associated with &quot;Expert Modes,&quot; which may expose you to significant price
                slippage and elevated costs.
              </p>
              <p>
                In summary, you acknowledge that Selsila does not own or control the underlying
                Protocols and is not responsible for these variables or risks. We shall not be held
                liable for any losses incurred while accessing or using the Interface. Therefore,
                you agree to assume full responsibility for all risks associated with accessing the
                Interface to interact with the Protocol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
