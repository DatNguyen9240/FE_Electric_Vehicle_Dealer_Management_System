import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slice/Auth/authThunks";
import { toast } from "react-toastify";
import type { RootState, AppDispatch } from "../redux/store/store";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, registerSuccess, registerMsg } = useSelector(
    (state: RootState) => state.auth
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "driver",
  });
  const [agree, setAgree] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast.error("Bạn phải đồng ý với điều khoản sử dụng!");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Password not match");
      return;
    }
    dispatch(registerUser(form));
  };

  useEffect(() => {
    if (registerSuccess && registerMsg) {
      toast.success(registerMsg);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
    if (error) {
      toast.error(error);
    }
  }, [registerSuccess, registerMsg, error, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
          Create Free Account
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm sm:text-base">
          Clarity gives you the blocks and components you need
          <br />
          to create a truly professional website.
        </p>
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create Password"
              className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            <div className="flex items-center mb-4 text-xs sm:text-sm">
              <input
                type="checkbox"
                className="accent-blue-600 mr-2"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                I agree with the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms & Conditions
                </a>{" "}
                of Clarity
              </span>
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {registerSuccess && (
              <div className="text-green-600 text-sm mb-2">
                Sign up successful!
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition mb-4 text-sm sm:text-base"
              disabled={loading || !agree}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition mb-2 text-sm sm:text-base"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <g>
                  <circle cx="24" cy="24" r="24" fill="#fff" />
                  <path
                    d="M24 12v8h8.5c-.5 2.5-2.8 7.5-8.5 7.5-5.1 0-9.2-4.2-9.2-9.5s4.1-9.5 9.2-9.5c2.3 0 4.4.8 6 2.2l4.5-4.5C30.7 4.7 27.6 3.5 24 3.5 13.8 3.5 5.5 11.8 5.5 22c0 10.2 8.3 18.5 18.5 18.5 10.2 0 18.5-8.3 18.5-18.5 0-1.2-.1-2.3-.3-3.5H24z"
                    fill="#4285F4"
                  />
                  <path
                    d="M24 42c5.1 0 9.4-1.7 12.5-4.7l-6.1-5c-1.7 1.2-3.9 2-6.4 2-5.1 0-9.4-3.4-10.9-8.1H7.5v5.1C10.6 37.8 16.7 42 24 42z"
                    fill="#34A853"
                  />
                  <path
                    d="M13.1 28.3c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8v-5.1H7.5C6.5 17.9 6 19.9 6 22c0 2.1.5 4.1 1.5 6.1l5.6-4.8z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M36.5 19.2c.4 1.2.6 2.5.6 3.8s-.2 2.6-.6 3.8v5.1h5.6c1-2 1.5-4 1.5-6.1 0-2.1-.5-4.1-1.5-6.1l-5.6 4.5z"
                    fill="#EA4335"
                  />
                </g>
              </svg>
              Sign up with Google
            </button>
            <div className="text-center text-gray-500 mt-2 text-sm sm:text-base">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
