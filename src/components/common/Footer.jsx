import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#60c48998] to-[#1ef7a793] text-gray-800">
      <div className="w-full mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div>
          <div className="flex items-center space-x-2">
                     <a href="/" className="inline-block w-[150px] h-[40px] overflow-hidden relative rounded-3xl bg-white">
                       <Image 
                         src="/images/logo.svg" 
                         alt="Logo" 
                         fill 
                         className="object-contain" 
                         priority 
                       />
                     </a>
          </div>
          <p className="mt-2 text-sm text-gray-800 font-bold italic">
            Just pack your bags, We've got the rest...
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">Home</a></li>
            <li><a href="/about" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">About Us</a></li>
            <li><a href="/tours" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">Tours</a></li>
            <li><a href="/contact" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Help</h3>
          <ul className="space-y-2">
            <li><a href="/faq" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">FAQ</a></li>
            <li><a href="/support" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">Customer Support</a></li>
            <li><a href="/privacy" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" className="px-2 py-1 hover:text-black hover:bg-white/40 transition-colors">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Contact / Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Connect with Us</h3>
          <p className="text-sm text-gray-800 mb-4">Join our newsletter to stay updated on offers and travel tips.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-3 py-2 rounded-l bg-white text-black focus:outline-none"
            />
            <button className="bg-green-500 hover:bg-green-700 hover:text-white px-4 rounded-r text-gray-800">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/30 py-4 text-center text-sm text-gray-800">
        © {new Date().getFullYear()} BagspackGo. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
