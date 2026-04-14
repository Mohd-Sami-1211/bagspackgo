import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-slate-50 text-slate-800 pt-12 pb-8 mt-auto border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="inline-block w-[150px] h-[40px] overflow-hidden relative rounded-3xl bg-white shadow-sm">
            <Image
              src="/images/logo.svg"
              alt="bagspackgo Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <p className="text-sm font-medium text-gray-900 max-w-xs leading-relaxed">
            Just pack your bag, We've got the rest...
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-600 rounded-full"></span> Quick Links
          </h3>
          <ul className="space-y-2.5">
            <li><Link href="/" className="text-sm text-slate-600 hover:text-emerald-600 hover:translate-x-1 inline-block transition-all font-medium">Home</Link></li>
            <li><Link href="#about" className="text-sm text-slate-600 hover:text-emerald-600 hover:translate-x-1 inline-block transition-all font-medium">About Us</Link></li>
            <li><Link href="/user/events" className="text-sm text-slate-600 hover:text-emerald-600 hover:translate-x-1 inline-block transition-all font-medium">Events</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-600 rounded-full"></span> Support
          </h3>
          <ul className="space-y-2.5">
            <li><Link href="#faq" className="text-sm text-slate-600 hover:text-emerald-600 hover:translate-x-1 inline-block transition-all font-medium">FAQ</Link></li>
            <li><Link href="/user/help" className="text-sm text-slate-600 hover:text-emerald-600 hover:translate-x-1 inline-block transition-all font-medium">Customer Support</Link></li>
            <li><Link href="/privacy" className="text-sm text-slate-600 hover:text-emerald-600 hover:translate-x-1 inline-block transition-all font-medium">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-sm text-slate-600 hover:text-emerald-600 hover:translate-x-1 inline-block transition-all font-medium">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Contact / Newsletter */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-600 rounded-full"></span> Connect
          </h3>
          <p className="text-sm text-slate-600 mb-4 font-medium">Join our newsletter to stay updated on offers and travel tips.</p>
          <form className="flex rounded-md overflow-hidden border border-slate-200 shadow-sm" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-3 py-2 bg-white text-slate-800 outline-none text-sm placeholder:text-slate-400"
              required
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 text-sm transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200">
        <div className="flex justify-center text-center">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} bagspackgo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
