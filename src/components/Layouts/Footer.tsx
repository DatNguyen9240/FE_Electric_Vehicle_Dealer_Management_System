import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-blue-50 border-t border-blue-200 mt-auto py-8 md:py-12">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-base mb-8 justify-center text-center">
        <div>
          <h4 className="font-bold mb-3 text-lg">Company</h4>
          <ul className="space-y-2 text-gray-700 text-base">
            <li>About</li>
            <li>Features</li>
            <li>Works</li>
            <li>Career</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-lg">Help</h4>
          <ul className="space-y-2 text-gray-700 text-base">
            <li>Customer Support</li>
            <li>Delivery Details</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-lg">Resources</h4>
          <ul className="space-y-2 text-gray-700 text-base">
            <li>Free eBooks</li>
            <li>Development Tutorial</li>
            <li>How-to Blog</li>
            <li>Youtube Playlist</li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
