import React from "react";
import logo from "@assets/logo.png";
import { 
  Twitter,
  Facebook,
  Instagram,
  Github
} from "lucide-react";

const Footer: React.FC = () => (
  <footer className="bg-[#E5F4FF] border-t border-blue-200 mt-auto py-8 md:py-12">
    <div className="container mx-auto px-4 sm:px-8 md:px-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
        <div className="flex items-center justify-center ps-10">
          <img src={logo} alt="Logo" className="h-35 w-35 object-contain" />
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-base mb-8 ps-20 text-start">
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
      </div>
      
      <div className="border-t border-blue-300 mb-8"></div>
      
      <div className="flex -mt-4 pe-10 items-center gap-4" >
        <div className="flex-1"></div>
        
        <div className="text-gray-600 text-sm text-center">
          © 2024 Electric Vehicle Dealer. All rights reserved.
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
          <a 
            href="#" 
            className=" hover:text-blue-600 transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a 
            href="#" 
            className=" hover:text-blue-600 transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a 
            href="#" 
            className=" hover:text-pink-600 transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a 
            href="#" 
            className=" hover:text-gray-800 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
