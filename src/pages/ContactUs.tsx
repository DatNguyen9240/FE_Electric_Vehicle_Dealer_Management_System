import React from "react";
import { useForm } from "react-hook-form";

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
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left: Contact Info */}
        <div className="bg-blue-100 rounded-xl p-8 flex-1 max-w-md mx-auto md:mx-0">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            Contact Information
          </h2>
          <p className="text-gray-600 mb-6">
            Our technical team is always ready to assist you with any issues
            during charging.
          </p>
          <div className="flex items-center gap-3 mb-3 text-gray-700">
            <span className="text-xl">📞</span>
            <span>+123456789</span>
          </div>
          <div className="flex items-center gap-3 mb-3 text-gray-700">
            <span className="text-xl">✉️</span>
            <span>evcsupport@gmail.com</span>
          </div>
          <div className="flex items-center gap-3 mb-6 text-gray-700">
            <span className="text-xl">📍</span>
            <span>
              FPT University, ĐL. Long Thạnh Mỹ,
              <br />
              Thủ Đức, Ho Chi Minh.
            </span>
          </div>
          <div className="flex gap-4 mt-8 text-gray-500 text-xl">
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="GitHub">
              <i className="fab fa-github"></i>
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
              rows={3}
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
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition"
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
