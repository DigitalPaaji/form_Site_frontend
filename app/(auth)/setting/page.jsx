
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { base_url } from "@/components/utils";
import { toast } from "react-toastify";

import {
  FiUser,
  FiPhone,
  FiShield,
  FiWallet,
  FiFileText,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiCheckCircle,
  FiPlusCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { FaWallet } from "react-icons/fa";



const Page = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sendLead: "",
  });

  // GET ADMIN DATA
  const getData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${base_url}/auth/getfull-data`
      );

      if (response.data.success) {
        const data = response.data.admin;

        setAdmin(data);

        setFormData({
          name: data.name || "",
          sendLead:
            data.sendLead && data.sendLead !== "null"
              ? data.sendLead
              : "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch admin details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // INPUT CHANGE
  const inputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SAVE DATA
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);

      // Change this API endpoint according to your backend update route.
      const response = await axios.put(
        `${base_url}/auth/update-profile`,
        {
          name: formData.name,
          sendLead: formData.sendLead || "null",
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully");
        setEditMode(false);
        getData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // CANCEL EDIT
  const handleCancel = () => {
    if (admin) {
      setFormData({
        name: admin.name || "",
        sendLead:
          admin.sendLead && admin.sendLead !== "null"
            ? admin.sendLead
            : "",
      });
    }

    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FiRefreshCw className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Admin data not found.</p>
          <button
            onClick={getData}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const InfoCard = ({
    icon,
    title,
    value,
  }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <div className="font-semibold text-gray-800 break-words">
        {value}
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* WALLET SECTION */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-blue-100">
                <FaWallet size={22} />
                <span className="text-sm font-medium">
                  Available Wallet Balance
                </span>
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                ₹{Number(admin.wallet_amount || 0).toLocaleString("en-IN")}
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                Your current account wallet balance
              </p>
            </div>

            <Link
              href="/recharge"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow transition hover:bg-blue-50"
            >
              <FiPlusCircle size={19} />
              Recharge Wallet
            </Link>
          </div>
        </div>

        {/* PROFILE HEADER */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <FiUser size={28} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {admin.name}
                </h2>

                <p className="text-sm text-gray-500">
                  Admin Profile
                </p>
              </div>
            </div>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <FiEdit2 />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiX />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  <FiSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* EDITABLE FIELDS */}
          <div className="mt-7 grid grid-cols-1 gap-5 border-t border-gray-100 pt-6 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>

              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={inputChange}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <FiUser className="text-gray-400" />
                  <span className="font-medium text-gray-800">
                    {admin.name}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Send Lead
              </label>

              {editMode ? (
                <select
                  name="sendLead"
                  value={formData.sendLead}
                  onChange={inputChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select Send Lead</option>
                  {["null","email","whatsapp","SMS"].map((item,index)=><option value={item}  key={index} >{item}</option>)}
                  
                </select>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <FiCheckCircle className="text-gray-400" />
                  <span className="font-medium text-gray-800">
                    {admin.sendLead === "null" || !admin.sendLead
                      ? "Not Set"
                      : admin.sendLead === "true"
                        ? "Yes"
                        : admin.sendLead === "false"
                          ? "No"
                          : admin.sendLead}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ACCOUNT DETAILS */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Account Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <InfoCard
              icon={<FiPhone />}
              title="Phone Number"
              value={admin.phone}
            />

            <InfoCard
              icon={<FiShield />}
              title="Account Status"
              value={
                <span className="inline-flex items-center gap-2 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {admin.status}
                </span>
              }
            />

            <InfoCard
              icon={<FiCheckCircle />}
              title="Account Active"
              value={admin.active ? "Active" : "Inactive"}
            />

            <InfoCard
              icon={<FiFileText />}
              title="Form Page Limit"
              value={admin.formpageLimit}
            />

            <InfoCard
              icon={<FiFileText />}
              title="Total Form Pages"
              value={admin.formPage?.length || 0}
            />

            <InfoCard
              icon={<FiCalendar />}
              title="Account Created"
              value={new Date(admin.createdAt).toLocaleDateString("en-IN")}
            />

            <InfoCard
              icon={<FiCalendar />}
              title="Last Updated"
              value={new Date(admin.updatedAt).toLocaleDateString("en-IN")}
            />

            <InfoCard
              icon={<FiShield />}
              title="Admin ID"
              value={admin._id}
            />

          </div>
        </div>

      </div>
    </div>
  );
};

export default Page;
