
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { base_url } from "@/components/utils";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Doughnut, Bar } from "react-chartjs-2";

import {
  FiFileText,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArchive,
  FiPlus,
  FiArrowUpRight,
  FiCalendar,
  FiRefreshCw,
  FiExternalLink,
  FiInbox,
  FiActivity,
  FiEye,
} from "react-icons/fi";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getDashboardData = async () => {
    try {
      setError("");

      const response = await axios.get(
        `${base_url}/auth/dashboard`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message ||
        "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="h-screen overflow-auto bg-slate-50 flex items-center justify-center p-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
            <FiAlertCircle size={30} />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Something went wrong
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={getDashboardData}
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const charts = dashboard?.charts || {};

  const statCards = [
    {
      title: "Total Forms",
      value: stats.totalForms || 0,
      subtitle: `${stats.publishedForms || 0} published`,
      icon: FiFileText,
      color: "indigo",
      gradient: "from-indigo-500 to-violet-600",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      title: "Total Submissions",
      value: stats.totalLeads || 0,
      subtitle: `${stats.todayLeads || 0} received today`,
      icon: FiUsers,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "New Leads",
      value: stats.newLeads || 0,
      subtitle: "Awaiting attention",
      icon: FiTrendingUp,
      color: "orange",
      gradient: "from-orange-400 to-amber-500",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      title: "Read Leads",
      value: stats.readLeads || 0,
      subtitle: "Already reviewed",
      icon: FiCheckCircle,
      color: "emerald",
      gradient: "from-emerald-400 to-green-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
  ];

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#172033",
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        border: { display: false, dash: [4, 4] },
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#94a3b8",
          precision: 0,
          stepSize: 1,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#172033",
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#94a3b8",
          precision: 0,
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#172033",
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  const statusItems = [
    {
      label: "New",
      value: stats.newLeads || 0,
      color: "bg-indigo-500",
    },
    {
      label: "Read",
      value: stats.readLeads || 0,
      color: "bg-emerald-500",
    },
    {
      label: "Archived",
      value: stats.archivedLeads || 0,
      color: "bg-amber-500",
    },
  ];

  const totalStatus =
    statusItems.reduce((sum, item) => sum + item.value, 0);



  return (
    <div className="h-screen overflow-auto bg-[#f7f8fc] p-4 sm:p-6 lg:p-8">

      <div className="max-w-[1600px] mx-auto space-y-7">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
              <FiActivity />
              OVERVIEW
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-slate-400">Dashboard</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Welcome back!
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Here's what's happening with your forms and submissions.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={getDashboardData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <Link
             href={"/formpage/create"}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 transition"
            >
              <FiPlus size={17} />
              Create Form
            </Link>

          </div>
        </div>

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {statCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden"
              >
                <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-[0.06] bg-gradient-to-br ${item.gradient}`} />

                <div className="flex justify-between items-start relative">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.title}
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-3 tracking-tight">
                      {item.value.toLocaleString("en-IN")}
                    </h2>

                    <p className="text-xs text-slate-400 mt-2">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.text} flex items-center justify-center`}>
                    <Icon size={23} />
                  </div>
                </div>

                <div className={`h-1 w-full rounded-full mt-5 bg-gradient-to-r ${item.gradient} opacity-80`} />
              </div>
            );
          })}

        </div>

        {/* SECONDARY STATISTICS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FiClock size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Today's Submissions</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {stats.todayLeads || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <FiArchive size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Archived Leads</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {stats.archivedLeads || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <FiFileText size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Draft Forms</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {stats.draftForms || 0}
              </h3>
            </div>
          </div>

        </div>

        {/* MAIN CHARTS */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* WEEKLY CHART */}

          <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Submission Overview
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your last 7 days activity
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Weekly
              </div>
            </div>

            <div className="h-[280px]">
              {charts.weeklyLeads && (
                <Line
                  data={charts.weeklyLeads}
                  options={lineOptions}
                />
              )}
            </div>
          </div>

          {/* LEAD STATUS */}

          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">

            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-800">
                Lead Status
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Distribution of your submissions
              </p>
            </div>

            <div className="h-[210px] relative">
              {charts.leadStatus && (
                <Doughnut
                  data={charts.leadStatus}
                  options={doughnutOptions}
                />
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <h3 className="text-3xl font-bold text-slate-800">
                  {totalStatus}
                </h3>
                <span className="text-xs text-slate-400">
                  Total Leads
                </span>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              {statusItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-slate-500">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-slate-800">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* MONTHLY + FORM STATUS */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* MONTHLY CHART */}

          <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">

            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-800">
                Monthly Performance
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Submission trends over the last 6 months
              </p>
            </div>

            <div className="h-[280px]">
              {charts.monthlyLeads && (
                <Bar
                  data={charts.monthlyLeads}
                  options={barOptions}
                />
              )}
            </div>
          </div>

          {/* FORM STATUS */}

          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">

            <h3 className="text-base font-bold text-slate-800">
              Form Statistics
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-7">
              Your form publishing status
            </p>

            <div className="space-y-6">

              {[
                {
                  label: "Published",
                  value: stats.publishedForms || 0,
                  color: "bg-emerald-500",
                },
                {
                  label: "Draft",
                  value: stats.draftForms || 0,
                  color: "bg-amber-500",
                },
                {
                  label: "Inactive",
                  value: stats.inactiveForms || 0,
                  color: "bg-slate-400",
                },
              ].map((item) => {
                const percentage = stats.totalForms
                  ? (item.value / stats.totalForms) * 100
                  : 0;

                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-500">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {item.value}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

            </div>

            <div className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs text-indigo-500 font-medium">
                Total Created Forms
              </p>
              <h2 className="text-3xl font-bold text-indigo-700 mt-1">
                {stats.totalForms || 0}
              </h2>
            </div>

          </div>
        </div>

       

        {/* FOOTER */}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 py-2">
          <p className="text-xs text-slate-400">
            Form Builder Dashboard
          </p>

          <p className="text-xs text-slate-400">
            All your form analytics in one place.
          </p>
        </div>

      </div>
    </div>
  );
};


// LOADING SKELETON

const DashboardSkeleton = () => {
  return (
    <div className="h-screen overflow-auto bg-[#f7f8fc] p-5 sm:p-8 animate-pulse">
      <div className="max-w-[1600px] mx-auto space-y-7">

        <div className="h-20 bg-white rounded-2xl" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 bg-white rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 h-[370px] bg-white rounded-2xl" />
          <div className="h-[370px] bg-white rounded-2xl" />
        </div>

        <div className="h-[370px] bg-white rounded-2xl" />
        <div className="h-[350px] bg-white rounded-2xl" />

      </div>
    </div>
  );
};

export default Dashboard;
