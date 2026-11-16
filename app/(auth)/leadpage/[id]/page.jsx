
"use client";

import { base_url } from "@/components/utils";
import axios from "axios";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiUsers,
  FiRefreshCw,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiGlobe,
  FiMonitor,
  FiInbox,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiArchive,
  FiEye,
  FiHash,
} from "react-icons/fi";

const STATUS_OPTIONS = [
  { label: "All Leads", value: "", icon: FiUsers },
  { label: "New", value: "new", icon: FiClock },
  { label: "Read", value: "read", icon: FiEye },
  { label: "Archived", value: "archived", icon: FiArchive },
];

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getStatusStyle = (status) => {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "read":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "archived":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

const getValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const getPrimaryField = (lead) => {
  const entries = Object.entries(lead.submissionData || {});

  const nameEntry = entries.find(([key]) =>
    key.toLowerCase().includes("name")
  );

  return nameEntry ? getValue(nameEntry[1]) : "Unknown Lead";
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusStyle(
      status
    )}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {status}
  </span>
);

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}
        >
          {icon}
        </div>
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
        {Number(value).toLocaleString("en-IN")}
      </h3>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="h-screen overflow-auto flex items-center justify-center bg-slate-50">
          <FiRefreshCw className="text-3xl text-blue-500 animate-spin" />
        </div>
      }
    >
      <LeadSection />
    </Suspense>
  );
};

const LeadSection = () => {
  const { id } = useParams();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(
    1,
    Number(searchParams.get("page")) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit")) || 20)
  );

  const status = searchParams.get("status") || "";

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update URL query
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const query = params.toString();

      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, searchParams]
  );

  // Fetch Leads
  const fetchLeads = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.set("page", String(currentPage));
        params.set("limit", String(limit));

        if (status) {
          params.set("status", status);
        }

        const response = await axios.get(
          `${base_url}/auth/leads/${id}?${params.toString()}`,
          { signal }
        );

        if (response.data.success) {
          setLeads(response.data.data || []);
          setPagination(response.data.pagination);
        } else {
          setLeads([]);
          setPagination(null);
          setError(response.data.message || "Unable to fetch leads");
        }
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        setError(
          error.response?.data?.message ||
            "Something went wrong while fetching leads"
        );

        setLeads([]);
        setPagination(null);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [id, currentPage, limit, status]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchLeads(controller.signal);

    return () => controller.abort();
  }, [fetchLeads]);

  // Dynamic submission fields
  const columns = useMemo(() => {
    const keys = new Set();

    leads.forEach((lead) => {
      Object.keys(lead.submissionData || {}).forEach((key) => {
        keys.add(key);
      });
    });

    return Array.from(keys);
  }, [leads]);

  // Current page counts
  const newCount = leads.filter((lead) => lead.status === "new").length;
  const readCount = leads.filter((lead) => lead.status === "read").length;
  const archivedCount = leads.filter(
    (lead) => lead.status === "archived"
  ).length;

  const handleStatusChange = (value) => {
    updateQuery({
      status: value,
      page: "",
    });
  };

  const handlePageChange = (page) => {
    updateQuery({
      page: String(page),
    });
  };

  const handleLimitChange = (value) => {
    updateQuery({
      limit: value,
      page: "",
    });
  };

  return (
    <div className="h-screen overflow-auto   bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <span>Dashboard</span>
              <span>/</span>
              <span>Forms</span>
              <span>/</span>
              <span className="text-gray-700 font-medium">Leads</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Form Submissions
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage and track all your form submissions.
            </p>
          </div>

          <button
            onClick={() => fetchLeads()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Leads"
            value={pagination?.total ?? 0}
            icon={<FiUsers />}
            color="blue"
          />

          <StatCard
            title="New"
            value={newCount}
            icon={<FiClock />}
            color="orange"
          />

          <StatCard
            title="Read"
            value={readCount}
            icon={<FiCheckCircle />}
            color="green"
          />

          <StatCard
            title="Archived"
            value={archivedCount}
            icon={<FiArchive />}
            color="gray"
          />
        </div>

        {/* Leads Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Filter Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  All Submissions
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {pagination?.total ?? 0} total submissions
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full sm:w-44 appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={String(limit)}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
              {STATUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = status === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      active
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={15} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center">
              <FiRefreshCw className="text-3xl text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500 mt-4">
                Loading submissions...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-20 flex flex-col items-center justify-center px-4">
              <FiAlertCircle className="text-4xl text-red-400" />

              <h3 className="font-bold text-gray-800 mt-3">
                Unable to load leads
              </h3>

              <p className="text-sm text-gray-500 mt-1 text-center">
                {error}
              </p>

              <button
                onClick={() => fetchLeads()}
                className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && leads.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <FiInbox className="text-3xl text-gray-400" />
              </div>

              <h3 className="text-lg font-bold text-gray-800 mt-4">
                No submissions found
              </h3>

              <p className="text-sm text-gray-500 mt-1 text-center px-4">
                {status
                  ? `There are no ${status} submissions right now.`
                  : "Your form submissions will appear here."}
              </p>

              {status && (
                <button
                  onClick={() => handleStatusChange("")}
                  className="mt-4 text-sm text-blue-600 font-semibold hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
          )}

          {/* Data */}
          {!loading && !error && leads.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Lead
                      </th>

                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ))}

                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Submitted At
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead, index) => {
                      const name = getPrimaryField(lead);

                      return (
                        <tr
                          key={lead._id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                                {getInitials(name) || <FiUsers />}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {name}
                                </p>

                                <p className="text-xs text-gray-400 mt-0.5">
                                  #{String(index + 1).padStart(3, "0")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {columns.map((column) => (
                            <td
                              key={column}
                              className="px-5 py-4 text-sm text-gray-600 max-w-[220px]"
                            >
                              <span
                                className="block truncate"
                                title={getValue(
                                  lead.submissionData?.[column]
                                )}
                              >
                                {getValue(lead.submissionData?.[column])}
                              </span>
                            </td>
                          ))}

                          <td className="px-5 py-4 whitespace-nowrap">
                            <StatusBadge status={lead.status} />
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiCalendar className="text-gray-400" />
                              {formatDate(lead.createdAt)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {leads.map((lead) => {
                  const name = getPrimaryField(lead);

                  return (
                    <div key={lead._id} className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                            {getInitials(name) || <FiUsers />}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {name}
                            </h3>

                            <p className="text-xs text-gray-400 mt-1">
                              ID: {lead._id.slice(-8)}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={lead.status} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {columns.map((column) => (
                          <div
                            key={column}
                            className="bg-gray-50 rounded-lg p-3 min-w-0"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                              {column}
                            </p>

                            <p className="text-sm font-medium text-gray-700 break-words">
                              {getValue(lead.submissionData?.[column])}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiCalendar />
                          {formatDate(lead.createdAt)}
                        </div>

                        {lead.ipAddress && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FiGlobe />
                            IP: {lead.ipAddress}
                          </div>
                        )}

                        {lead.userAgent && (
                          <div
                            className="flex items-center gap-2 text-xs text-gray-400 min-w-0"
                            title={lead.userAgent}
                          >
                            <FiMonitor className="shrink-0" />
                            <span className="truncate">
                              {lead.userAgent}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && !error && pagination && leads.length > 0 && (
            <div className="px-4 sm:px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {(currentPage - 1) * limit + 1}
                </span>
                {" - "}
                <span className="font-semibold text-gray-800">
                  {Math.min(currentPage * limit, pagination.total)}
                </span>
                {" of "}
                <span className="font-semibold text-gray-800">
                  {pagination.total}
                </span>
                {" submissions"}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronLeft />
                </button>

                <span className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold">
                  {currentPage} / {pagination.totalPages}
                </span>

                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <FiHash />
          Form ID: {id}
        </div>
      </div>
    </div>
  );
};

export default Page;
