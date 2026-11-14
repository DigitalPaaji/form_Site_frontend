"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiPhone, FiLock, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import axios from "axios";
import { base_url } from "@/components/utils";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const Page = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/auth/login`,
        formData
      );
      const data = response.data;
      if (data.success) {
        toast.success(data.message);
        router.push("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fieldWrap =
    "flex h-12 items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-600/10";

  return (
    <main className="h-dvh w-full overflow-hidden bg-[#F6F7F5] font-sans">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Left panel */}
        <section className="relative hidden h-full overflow-hidden bg-[#0E2F2C] lg:flex lg:flex-col lg:justify-between lg:p-12">
          {/* soft rings */}
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full border border-teal-300/10" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-[340px] w-[340px] rounded-full border border-teal-300/15" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-[200px] w-[200px] rounded-full bg-teal-400/10" />

          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400 text-[#0E2F2C]">
              <FiLock size={19} />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Client Portal
            </span>
          </div>

          <div className="relative max-w-md">
            <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-white">
              Your account, always within reach.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-teal-50/70">
              Check your records, track progress and stay in touch, all from
              one secure place.
            </p>
          </div>

          <p className="text-xs text-teal-50/50">
            Client Portal. All rights reserved.
          </p>
        </section>

        {/* Form panel */}
        <section className="flex h-full items-center justify-center overflow-y-auto px-6 py-6 sm:px-10">
          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E2F2C] text-teal-300">
                <FiLock size={19} />
              </div>
              <span className="text-lg font-semibold tracking-tight text-stone-900">
                Client Portal
              </span>
            </div>

            <h2 className="text-[30px] font-semibold tracking-tight text-stone-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-stone-500">
              Sign in with your phone number to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-[13px] font-medium text-stone-700"
                >
                  Phone number
                </label>
                <div className={fieldWrap}>
                  <FiPhone size={17} className="text-stone-400" />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-medium text-stone-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[13px] font-medium text-teal-700 hover:text-teal-900"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className={fieldWrap}>
                  <FiLock size={17} className="text-stone-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded text-stone-400 outline-none hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={17} />
                    ) : (
                      <FiEye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[13px] text-stone-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-teal-700"
                />
                Keep me signed in
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E2F2C] text-sm font-semibold text-white transition hover:bg-[#14413d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <FiLoader size={16} className="animate-spin" />
                    Signing in
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-[13px] text-stone-500">
              New here?{" "}
              <Link
                href="/register"
                className="font-semibold text-teal-700 hover:text-teal-900 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;