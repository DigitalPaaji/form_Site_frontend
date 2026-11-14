
"use client";

import { base_url } from "@/components/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiLock,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const OTP_LENGTH = 6;

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

const Page = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const otpRefs = useRef([]);

  // OTP countdown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));

    setError("");
  };

  // Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim().toLowerCase();
    const phone = formData.phone.trim();
  
    const password = formData.password;

    if (!name || !phone  || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${base_url}/auth/account-requests`,
        {
          name,
          phone,
          password,
      
        }
      );

      setFormData((prev) => ({
        ...prev,
        name,
        phone,
      
      }));

      setOtp("");
      setStep(2);
      setCountdown(60);

      setSuccess(
        response.data?.message || "Verification code sent successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // OTP handling
  const updateOtp = (value) => {
    setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH));
    setError("");
  };

  const handleOtpChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);

    if (!digit) return;

    const chars = otp.padEnd(OTP_LENGTH, " ").split("");
    chars[index] = digit;

    updateOtp(chars.join("").replace(/ /g, ""));

    if (index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      if (otp[index]) {
        const chars = otp.padEnd(OTP_LENGTH, " ").split("");
        chars[index] = " ";
        updateOtp(chars.join("").trimEnd());
      } else if (index > 0) {
        const chars = otp.padEnd(OTP_LENGTH, " ").split("");
        chars[index - 1] = " ";
        updateOtp(chars.join("").trimEnd());
        otpRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    updateOtp(pasted);

    otpRefs.current[
      Math.min(pasted.length, OTP_LENGTH - 1)
    ]?.focus();
  };

  // Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${base_url}/auth/verify-otp`,
        {
          name: formData.name.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
         
          otp,
        }
      );

      setSuccess(
        response.data?.message || "Account created successfully!"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please try again."
      );
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (countdown > 0 || resending) return;

    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await axios.post(
        `${base_url}/auth/account-requests`,
        {
          name: formData.name.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
         
        }
      );

      setOtp("");
      setCountdown(60);
      otpRefs.current[0]?.focus();

      setSuccess(
        response.data?.message || "A new verification code has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend verification code."
      );
    } finally {
      setResending(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <main className="min-h-screen bg-[#f0ebf8] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[650px]">

        {/* Brand */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-white shadow-sm">
              <FiShield size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                Digital Paaji
              </h2>
              <p className="text-xs text-gray-500">
                Business management platform
              </p>
            </div>
          </div>

          <span className="rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-700">
            Registration
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4 rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              {step === 1 ? "Account information" : "Phone verification"}
            </span>

            <span className="text-xs font-medium text-purple-700">
              Step {step} of 2
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Form Header */}
        <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="h-2 bg-purple-700" />

          <div className="p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <FiFileText size={24} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              {step === 1
                ? "Create your account"
                : "Verify your mobile number"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {step === 1
                ? "Welcome to Digital Paaji! Fill out the registration form below to create your account and get started."
                : "One last step! Enter the 6-digit verification code sent to your registered mobile number."}
            </p>

            <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
              <FiLock size={14} className="text-purple-600" />
              Your information is securely protected.
              <span className="ml-auto text-red-500">* Required</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Registration Form */}
        {step === 1 ? (
          <form onSubmit={sendOtp} className="space-y-4">

            {/* Personal Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Personal information
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your basic contact information.
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-800">
                  Full name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* <div className="mb-6">
                <label htmlFor="pageName" className="mb-2 block text-sm font-medium text-gray-800">
                  Page name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                  <input
                    id="pageName"
                    name="pageName"
                    type="text"
                    value={formData.pageName}
                    onChange={handleChange}
                    placeholder="Enter your page name"
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  This will be the name of your page on Digital Paaji.
                </p>
              </div> */}

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-800">
                  Mobile number <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                  <span className="absolute left-11 top-1/2 -translate-y-1/2 border-r border-gray-200 pr-3 text-sm font-medium text-gray-600">
                    +91
                  </span>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                    maxLength={10}
                    required
                    className={`${inputClass} !pl-[5.5rem]`}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  A verification code will be sent to this number.
                </p>
              </div>
            </div>

            {/* Account Security */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Account security
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Create a secure password for your account.
                </p>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-800">
                  Create password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter at least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className={`${inputClass} !pr-12 pl-11`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Use at least 8 characters to keep your account secure.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Sending verification code...
                  </>
                ) : (
                  <>
                    Submit registration
                    <FiArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                By submitting this form, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        ) : (
          /* OTP Verification */
          <form onSubmit={verifyOtp} className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <FiPhone size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Mobile verification
                  </h3>
                  <p className="text-xs text-gray-500">
                    Verification code sent to +91 {formData.phone}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  We have sent a one-time password (OTP) to your mobile number.
                  Please enter it below to complete your registration.
                </p>
              </div>

              <div className="mt-7">
                <label className="mb-4 block text-sm font-semibold text-gray-800">
                  Enter 6-digit verification code
                </label>

                <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(index, e)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onFocus={(e) => e.target.select()}
                      aria-label={`OTP digit ${index + 1}`}
                      className="h-14 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white text-center text-xl font-bold text-gray-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100 sm:h-16 sm:text-2xl"
                    />
                  ))}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Enter the code received on your registered mobile number.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== OTP_LENGTH}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify and create account
                    <FiCheck size={18} />
                  </>
                )}
              </button>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-purple-700"
                >
                  <FiArrowLeft size={16} />
                  Edit details
                </button>

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={countdown > 0 || resending || loading}
                  className="flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-900 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {resending ? (
                    <FiLoader className="animate-spin" size={16} />
                  ) : (
                    <FiRefreshCw size={16} />
                  )}

                  {resending
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend code"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                <FiShield size={17} />
                Secure verification
              </div>
              <p className="mt-1 text-xs leading-5 text-green-700">
                Your account will be created after successful OTP verification.
              </p>
            </div>
          </form>
        )}

        {/* Footer */}
        <footer className="mt-8 pb-4 text-center">
          {step === 1 && (
            <p className="mb-4 text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-purple-700 hover:underline"
              >
                Log in
              </a>
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <FiShield size={13} />
            <span>Powered by Digital Paaji</span>
          </div>

          {/* <p className="mt-2 text-xs text-gray-400">
            © {new Date().getFullYear()} Digital Paaji. All rights reserved.
          </p> */}
        </footer>
      </div>
    </main>
  );
};

export default Page;
