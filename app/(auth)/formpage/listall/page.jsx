
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { base_url, img_url } from "@/components/utils";
import { FiEye, FiRefreshCw, FiFileText, FiEdit3 } from "react-icons/fi";
import { FaLink } from "react-icons/fa";
import { toast } from "react-toastify";

const Page = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${base_url}/auth/getallform`);

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

  const getBannerUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;

    return `${img_url}${image}`;
  };

  const copyFormLink = async (slug) => {
  const link = `${window.location.origin}/forms/${slug}`;

  try {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied successfully!");
  } catch (error) {
    toast.error("Unable to copy link");
  }
};
  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

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
                    <th className="px-6 py-4 font-semibold">Banner</th>
                    <th className="px-6 py-4 font-semibold">Form Details</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Form Link</th>
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
                        {form.bannerImage ? (
                          <img
                            src={getBannerUrl(form.bannerImage)}
                            alt={form.title}
                            className="h-14 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                          />
                        ) : (
                          <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">
                            No Banner
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

                      <td className="px-6 py-4">
                       
                       <button  onClick={() => copyFormLink(form.slug)}  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm  cursor-pointer  font-medium text-white transition hover:bg-blue-700 "> <FaLink   />  link </button>
                      </td>

                      <td className="px-6 py-4 text-right space-x-1">
                        
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
    </div>
  );
};

export default Page;
