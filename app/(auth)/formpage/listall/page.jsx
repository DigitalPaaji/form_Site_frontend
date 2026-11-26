
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import QRCode from "qrcode";

import { base_url, img_url } from "@/components/utils";

import {
  FiEye,
  FiRefreshCw,
  FiFileText,
  FiEdit3,
  FiX,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";

import { FaLink } from "react-icons/fa";
import { toast } from "react-toastify";
import { BsQrCode } from "react-icons/bs";

const Page = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // QR popup states
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrTitle, setQrTitle] = useState("");
  const [qrLink, setQrLink] = useState("");

  // Fetch Forms
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${base_url}/auth/getallform`
      );

      if (response.data.success) {
        setForms(response.data.allForms || []);
      } else {
        setError("Unable to fetch forms.");
      }
    } catch (error) {
      console.error("Fetch forms error:", error);
      setError("Something went wrong while fetching forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Banner URL
  const getBannerUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${img_url}${image}`;
  };

  // Copy Form Link
  const copyFormLink = async (slug) => {
    const link = `${window.location.origin}/forms/${slug}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied successfully!");
    } catch (error) {
      toast.error("Unable to copy link");
    }
  };

  // Create branded QR image
  const createBrandedQR = async (link) => {
    const qrDataUrl = await QRCode.toDataURL(link, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    });

    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }

          canvas.width = 440;
          canvas.height = 520;

          // White background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // QR Code
          ctx.drawImage(image, 20, 20, 400, 400);

          // // Separator
          // ctx.beginPath();
          // ctx.moveTo(35, 440);
          // ctx.lineTo(405, 440);
          // ctx.strokeStyle = "#E5E7EB";
          // ctx.lineWidth = 1;
          // ctx.stroke();

          // Developed by
          ctx.textAlign = "center";
          ctx.fillStyle = "#6B7280";
          ctx.font = "bold 13px Arial";
          ctx.fillText("DEVELOPED BY DIGITAL PAAJI", 220, 468);

          // // Brand name
          // ctx.fillStyle = "#4338CA";
          // ctx.font = "bold 15px Arial";
          // ctx.fillText("", 220, 502);

          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error);
        }
      };

      image.onerror = () => {
        reject(new Error("Unable to load QR image"));
      };

      image.src = qrDataUrl;
    });
  };

  // Generate QR and open popup
  const genrateQr = async (slug, title) => {
    try {
      setQrLoading(true);

      const link = `${window.location.origin}/forms/${slug}`;

      setQrTitle(title);
      setQrLink(link);

      const brandedImage = await createBrandedQR(link);

      setQrImage(brandedImage);
      setShowQrModal(true);
    } catch (error) {
      console.error("QR generation error:", error);
      toast.error("Unable to generate QR code");
    } finally {
      setQrLoading(false);
    }
  };

  // Download branded QR
  const downloadQR = () => {
    if (!qrImage) {
      toast.error("QR code not available");
      return;
    }

    const anchor = document.createElement("a");

    anchor.href = qrImage;
    anchor.download = `${qrTitle
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()}-qr.png`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    toast.success("QR downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      <div className="mx-auto  space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Forms
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and view all your created forms.
            </p>
          </div>

          <button
            onClick={fetchForms}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Total Forms */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <FiFileText size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Forms
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {forms.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Forms Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-500">{error}</p>

              <button
                onClick={fetchForms}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : forms.length === 0 ? (
            <div className="py-16 text-center">
              <FiFileText className="mx-auto text-4xl text-gray-300 dark:text-gray-600" />

              <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">
                No forms found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your created forms will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                    <th className="px-6 py-4 font-semibold">#</th>
                    <th className="px-6 py-4 font-semibold">Logo</th>
                    <th className="px-6 py-4 font-semibold">Form Details</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Form Link</th>
                    <th className="px-6 py-4 font-semibold">Generate QR</th>
                    <th className="px-6 py-4 font-semibold">Lead Counts</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {forms.map((form, index) => (
                    <tr
                      key={form._id}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        {form.logo ? (
                          <img
                            src={getBannerUrl(form.logo)}
                            alt={form.title}
                            className="h-14 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                          />
                        ) : (
                          <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">
                            No logo
                          </div>
                        )}
                      </td>

                      <td className="max-w-sm px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {form.title}
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                          {form.description || "No description"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ID: {form._id}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            form.status === "published"
                              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                              : "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                          }`}
                        >
                          {form.status}
                        </span>
                      </td>

                      {/* Form Link */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyFormLink(form.slug)}
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <FaLink />
                          Link
                        </button>
                      </td>

                      {/* QR Button */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => genrateQr(form.slug, form.title)}
                          disabled={qrLoading}
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <BsQrCode size={17} />
                          {qrLoading ? "Generating..." : "QR"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                       {form.submitCount}
                      </td>

                      {/* Actions */}
                      <td className="space-x-1 px-6 py-4 text-right">
                        <Link
                          href={`/leadpage/${form._id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <FiEye size={16} />
                          Leads
                        </Link>

                        <Link
                          href={`/formpage/${form._id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                        >
                          <FiEdit3 size={16} />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-right text-xs text-gray-400">
          Showing {forms.length} forms
        </p>
      </div>

      {/* QR POPUP */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
            >
              <FiX size={21} />
            </button>

            {/* Header */}
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <BsQrCode size={25} />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Form QR Code
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Scan this QR code to open your form.
              </p>
            </div>

            {/* Form Title */}
            <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3 text-center dark:bg-gray-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {qrTitle}
              </p>
            </div>

            {/* QR with Digital Paaji Footer */}
            {qrImage && (
              <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                <img
                  src={qrImage}
                  alt="Branded Form QR Code"
                  className="h-auto w-full"
                />
              </div>
            )}

            {/* Form URL */}
            <a
              href={qrLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 break-all text-xs text-blue-600 hover:underline"
            >
              {qrLink}
              <FiExternalLink className="shrink-0" />
            </a>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={downloadQR}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                <FiDownload size={17} />
                Download QR
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
