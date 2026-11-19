
"use client";

import React from "react";
import { FaWhatsapp, FaCheckCircle, FaMobileAlt } from "react-icons/fa";
import { FiArrowRight, FiCreditCard, FiShield, FiUpload } from "react-icons/fi";

const Page = () => {
  const whatsappNumber = "918765432109";

  const message = encodeURIComponent(
    "Hello, I have completed the payment. Please find my payment screenshot. My registered mobile number is: "
  );

  const steps = [
    {
      number: "01",
      title: "Scan & Pay",
      description:
        "Scan the QR code using any UPI app and pay the required amount.",
      icon: <FiCreditCard />,
    },
    {
      number: "02",
      title: "Take Screenshot",
      description:
        "After successful payment, take a screenshot of the payment confirmation.",
      icon: <FiUpload />,
    },
    {
      number: "03",
      title: "Send on WhatsApp",
      description:
        "Send your payment screenshot along with your registered mobile number.",
      icon: <FaWhatsapp />,
    },
  ];

  return (
    <div className="h-screen overflow-auto bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            <FiShield /> Secure Payment Process
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Complete Your Payment
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Follow the simple steps below to complete your payment and
            activate your registration.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid items-center gap-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 md:grid-cols-2">

          {/* QR Code */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">
              Scan QR Code to Pay
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Open any UPI app and scan the QR code.
            </p>

            <div className="mx-auto mt-6 flex max-w-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5">
              <img
                src="/qr/qr-code.svg"
                alt="Payment QR Code"
                className="h-auto w-full max-w-[240px] object-contain"
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-green-700">
              <FaCheckCircle />
              Scan using any UPI app
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Please verify the payment details before paying.
            </p>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              How to Complete Payment
            </h2>

            <div className="mt-6 space-y-6">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                    {step.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600">
                        STEP {step.number}
                      </span>
                    </div>

                    <h3 className="mt-1 font-semibold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-green-600 px-5 py-4 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
            >
              <FaWhatsapp size={23} />
              Send Payment Screenshot
              <FiArrowRight size={20} />
            </a>

            <p className="mt-3 text-center text-xs text-slate-400">
              WhatsApp: +91 87654 32109
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-900">
            Important: Don't Forget!
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            After making the payment, you must send the payment screenshot
            on WhatsApp along with your registered mobile number. This
            will help us verify your payment and process your registration.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
          <FaMobileAlt />
          Need help? Contact us on WhatsApp.
        </div>

      </div>
    </div>
  );
};

export default Page;
