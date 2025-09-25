import React from "react";
import { useForm } from "react-hook-form";
import { 
  Twitter,
  Facebook,
  Instagram,
  Github,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

const ContactUs: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // Xử lý gửi dữ liệu ở đây (gọi API, v.v.)
    alert(JSON.stringify(data, null, 2));
    reset();
  };

  return (
    <div className="min-h-screen bg-white py-10 px-2">
      <h1 className="text-4xl font-bold text-center mb-2">Contact Us</h1>
      <p className="text-center text-gray-500 mb-10">
        Need help with booking, payments, or charging issues? Our support team
        is here for you anytime.
      </p>
      <div className="w-4/5 h-[70vh] mx-auto flex flex-col md:flex-row gap-8 md:mt-15">
        {/* Left: Contact Info */}
        <div className="bg-[#E5F4FF] rounded-xl p-12 flex-1 max-w-md mx-auto md:mx-0 flex flex-col justify-between">
          {/* Top Content */}
          <div>
            <h2 className="text-2xl font-bold text-[#2465EA] mb-2">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-6">
              Our technical team is always ready to assist you with any issues
              during charging.
            </p>
            
            <div className="flex flex-col gap-6 mt-20">
              {/* Phone */}
            <div className="flex items-center gap-3 mb-3 text-[#737373]">
              <Phone className="w-5 h-5" />
              <span>+123456789</span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-3 mb-3 text-[#737373]">
              <Mail className="w-5 h-5" />
              <span>evcsupport@gmail.com</span>
            </div>
            
            {/* Address */}
            <div className="flex items-start gap-3 mb-6 text-[#737373]">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>
                FPT University, ĐL. Long Thạnh Mỹ,
                <br />
                Thủ Đức, Ho Chi Minh.
              </span>
            </div>
            </div>
          </div>
          
          {/* Social Media Icons - Bottom Right */}
          <div className="flex gap-4 text-gray-500 justify-end">
            <a 
              href="#" 
              className="hover:text-blue-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="hover:text-blue-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="hover:text-pink-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="hover:text-gray-800 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
        {/* Right: Contact Form */}
        <form
          className="flex-1 bg-white rounded-xl p-8 shadow-none max-w-2xl mx-auto md:mx-0"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-2"
                placeholder="John"
              />
              {errors.firstName && (
                <span className="text-red-500 text-xs">
                  {errors.firstName.message}
                </span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                {...register("lastName", { required: "Last name is required" })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-2"
                placeholder="Doe"
              />
              {errors.lastName && (
                <span className="text-red-500 text-xs">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-2"
                placeholder="your@email.com"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                {...register("phone")}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-2"
                placeholder="+0123456789"
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              {...register("message", { required: "Message is required" })}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-2 resize-none"
              rows={6}
              placeholder="Write your message.."
            />
            {errors.message && (
              <span className="text-red-500 text-xs">
                {errors.message.message}
              </span>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#2465EA] text-white px-8 py-3 rounded-[5px] font-medium shadow hover:bg-blue-700 transition mt-15 me-5"
            >
              Send Message
            </button>
          </div>
          {isSubmitSuccessful && (
            <p className="text-green-600 mt-4">Your message has been sent!</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
