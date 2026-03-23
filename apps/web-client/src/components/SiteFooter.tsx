import Link from 'next/link';
import { Cpu } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-16 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-6 flex items-center gap-2 text-emerald-500">
              <Cpu className="h-6 w-6" />
              <span className="font-mono text-lg font-bold tracking-wider text-white">CACSMS ACADEMY</span>
            </div>
            <p className="max-w-sm text-sm text-zinc-500">
              Think Like Institutions. Trade With Precision. A forex market intelligence platform built to help traders move from fragmented chart watching to clearer, more disciplined market interpretation.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="transition-colors hover:text-emerald-400">About</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-emerald-400">Contact</Link></li>
              <li><Link href="/careers" className="transition-colors hover:text-emerald-400">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="transition-colors hover:text-emerald-400">Features</Link></li>
              <li><Link href="/technology" className="transition-colors hover:text-emerald-400">Technology</Link></li>
              <li><Link href="/pricing" className="transition-colors hover:text-emerald-400">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help-center" className="transition-colors hover:text-emerald-400">Help Center</Link></li>
              <li><Link href="/account-support" className="transition-colors hover:text-emerald-400">Account Support</Link></li>
              <li><Link href="/faq" className="transition-colors hover:text-emerald-400">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="space-y-8 border-t border-zinc-900 pt-8 text-xs text-zinc-500">
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/terms" className="hover:text-zinc-300">Terms and Conditions</Link>
            <Link href="/legal/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/legal/risk-disclosure" className="hover:text-zinc-300">Risk Disclosure</Link>
            <Link href="/legal/disclaimer" className="hover:text-zinc-300">Disclaimer</Link>
            <Link href="/legal/cookie-policy" className="hover:text-zinc-300">Cookie Policy</Link>
          </div>

          <div className="space-y-4">
            <div>
              <strong className="mb-1 block text-zinc-400">Legal Disclaimer</strong>
              <p>Cacsms Academy provides analytical tools and market intelligence designed to assist traders in evaluating financial markets. The platform does not provide financial advice, investment recommendations, or guarantees of trading performance. All trading decisions remain the sole responsibility of the user. Trading foreign exchange markets involves substantial risk and may not be suitable for all investors.</p>
            </div>
            <div>
              <strong className="mb-1 block text-zinc-400">Nigeria Regulatory Notice</strong>
              <p>Cacsms Academy operates as a financial technology platform providing analytical tools and market intelligence. The platform does not operate as a brokerage, financial advisory service, or investment management company. Users remain responsible for ensuring compliance with applicable Nigerian laws and regulations governing financial trading activities.</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
            <p>© {new Date().getFullYear()} Cacsms Academy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}