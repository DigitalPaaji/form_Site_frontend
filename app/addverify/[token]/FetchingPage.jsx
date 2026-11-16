
"use client";

import { base_url } from "@/components/utils";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiLoader, FiAlertCircle } from "react-icons/fi";

export const FetchingPage = () => {
  const { token } = useParams();
  const router = useRouter();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your access...");
  const requestStarted = useRef(false);

  useEffect(() => {
    if (requestStarted.current || !token) return;

    requestStarted.current = true;

    const verifyToken = async () => {
      try {
        const response = await axios.put(
          `${base_url}/auth/getbytoken`,
          { token },
          { withCredentials: true }
        );

        const data = response.data;

        if (data.success) {
          setStatus("success");
          setMessage("Verification successful! Redirecting...");

          setTimeout(() => {
            router.replace("/");
          }, 1000);
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired link.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
          "Unable to verify your link. Please try again."
        );
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {status === "loading" && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <FiLoader className="h-9 w-9 animate-spin text-indigo-600" />
            </div>
          )}

          {status === "success" && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <FiCheckCircle className="h-10 w-10 text-green-600" />
            </div>
          )}

          {status === "error" && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <FiAlertCircle className="h-10 w-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-slate-900">
          {status === "loading" && "Please Wait"}
          {status === "success" && "Verified Successfully"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {message}
        </p>

        {/* Loading indicator */}
        {status === "loading" && (
          <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-600" />
          </div>
        )}

        {/* Retry button */}
        {status === "error" && (
          <button
            onClick={() => router.replace("/")}
            className="mt-7 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Go to Login
          </button>
        )}

        <p className="mt-8 text-xs text-slate-400">
          Secure authentication · Protected connection
        </p>
      </div>
    </div>
  );
};

export default FetchingPage;
