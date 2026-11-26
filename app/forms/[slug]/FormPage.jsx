
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { base_url, img_url } from "@/components/utils";
import Loder from "@/components/Loder";

import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiHash,
  FiMail,
  FiPhone,
  FiUser,
  FiMessageSquare,
  FiX,
  FiLock,
  FiChevronDown,
  FiShield,
  FiGlobe,
  FiRefreshCw,
} from "react-icons/fi";

const FormPage = () => {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [formNotFound, setFormNotFound] = useState(false);
  const [formData, setFormData] = useState(null);

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const getFieldKey = (field) => field._id || field.label;

  // Dynamic form colors
  const colors = {
    bg_form: formData?.formcolors?.bg_form || "#fff9f0",
    label_form: formData?.formcolors?.label_form || "#0b6056",
    title_form: formData?.formcolors?.title_form || "#630303",
  };

  // Image URL helper
  const getImageUrl = (image) => {
    if (!image || image === "null") return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${img_url}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // Initial value
  const getInitialValue = (field) => {
    if (field.type === "checkbox") {
      return field.options?.length ? [] : false;
    }

    if (field.type === "color") return "#37345f";

    return "";
  };

  // Initialize values including consents
  const initializeValues = (data) => {
    const initialValues = {};

    data.fields?.forEach((field) => {
      initialValues[getFieldKey(field)] =
        field.defaultValue ?? getInitialValue(field);
    });

    data.consents?.forEach((consent, index) => {
      initialValues[`consent_${index}`] = false;
    });

    return initialValues;
  };

  // Fetch form
  const fetchData = async () => {
    try {
      setLoading(true);
      setFormNotFound(false);

      const response = await axios.get(`${base_url}/user/get/${slug}`);
      const data = response.data;

      if (data.success && data.formData) {
        setFormData(data.formData);
        setValues(initializeValues(data.formData));
      } else {
        setFormNotFound(true);
      }
    } catch (error) {
      console.error(error);
      setFormNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  const fields = useMemo(
    () => [...(formData?.fields || [])],
    [formData]
  );

  const activeFields = fields.filter(
    (field) =>
      !field.disabled &&
      !["divider", "paragraph"].includes(field.type)
  );

  const consents = formData?.consents || [];

  // Progress including consent
  const progress = useMemo(() => {
    const total = activeFields.length + consents.length;

    if (!total) return 100;

    const completedFields = activeFields.filter((field) => {
      const value = values[getFieldKey(field)];

      if (Array.isArray(value)) return value.length > 0;

      return (
        value !== "" &&
        value !== undefined &&
        value !== null &&
        value !== false
      );
    }).length;

    const completedConsents = consents.filter(
      (_, index) => values[`consent_${index}`] === true
    ).length;

    return Math.round(
      ((completedFields + completedConsents) / total) * 100
    );
  }, [activeFields, consents, values]);

  // Change field
  const handleChange = (field, value) => {
    const key = getFieldKey(field);

    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [key]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  // Consent change
  const handleConsentChange = (index, checked) => {
    setValues((prev) => ({
      ...prev,
      [`consent_${index}`]: checked,
    }));

    setErrors((prev) => ({
      ...prev,
      [`consent_${index}`]: "",
    }));
  };

  // Checkbox options
  const handleCheckboxOption = (field, option, checked) => {
    const key = getFieldKey(field);
    const current = Array.isArray(values[key]) ? values[key] : [];

    const updated = checked
      ? [...current, option]
      : current.filter((item) => item !== option);

    handleChange(field, updated);
  };

  // Field validation
  const validateField = (field, value) => {
    if (field.disabled) return "";

    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      value === false ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && empty) {
      return `${field.label} is required`;
    }

    if (empty) return "";

    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    if (field.type === "url") {
      try {
        const url = new URL(value);

        if (!["http:", "https:"].includes(url.protocol)) {
          return "Please enter a valid URL";
        }
      } catch {
        return "Please enter a valid URL";
      }
    }

    if (field.type === "number" && Number.isNaN(Number(value))) {
      return "Please enter a valid number";
    }

    return "";
  };

  // Validate complete form
  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};

    fields.forEach((field) => {
      const key = getFieldKey(field);

      if (
        field.disabled ||
        ["divider", "paragraph"].includes(field.type)
      ) {
        return;
      }

      allTouched[key] = true;

      const error = validateField(field, values[key]);

      if (error) newErrors[key] = error;
    });

    // Validate all consent checkboxes
    consents.forEach((consent, index) => {
      const key = `consent_${index}`;

      allTouched[key] = true;

      if (values[key] !== true) {
        newErrors[key] = "Please accept this consent to continue";
      }
    });

    setErrors(newErrors);
    setTouched(allTouched);

    return Object.keys(newErrors).length === 0;
  };

  // Icons
  const getIcon = (type) => {
    const icons = {
      text: FiUser,
      email: FiMail,
      phone: FiPhone,
      textarea: FiMessageSquare,
      number: FiHash,
      date: FiCalendar,
      time: FiClock,
      datetime: FiCalendar,
      month: FiCalendar,
      week: FiCalendar,
      select: FiChevronDown,
      radio: FiCheckCircle,
      checkbox: FiCheck,
      password: FiLock,
      url: FiGlobe,
      color: FiFileText,
    };

    return icons[type] || FiFileText;
  };

  // Input styles
  const getInputClass = (field) => {
    const key = getFieldKey(field);
    const error = touched[key] && errors[key];

    return `lux-input w-full px-4 py-3.5 text-sm outline-none transition-all duration-200 ${
      error ? "lux-input-error" : ""
    }`;
  };

  // Common props
  const getCommonProps = (field) => {
    const key = getFieldKey(field);

    return {
      name: key,
      id: key,
      value: values[key] ?? "",
      placeholder: field.placeholder || "Enter here...",
      required: field.required || false,
      disabled: field.disabled || false,
      readOnly: field.readOnly || false,
      onChange: (e) => handleChange(field, e.target.value),
      className: getInputClass(field),
    };
  };

  // Render dynamic fields
  const renderField = (field) => {
    const key = getFieldKey(field);
    const value = values[key];
    const options = Array.isArray(field.options) ? field.options : [];
    const commonProps = getCommonProps(field);

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "password":
      case "url":
        return (
          <input
            {...commonProps}
            type={field.type === "phone" ? "tel" : field.type}
          />
        );

      case "number":
        return <input {...commonProps} type="number" />;

      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${getInputClass(field)} resize-y`}
          />
        );

      case "date":
      case "time":
      case "datetime":
      case "month":
      case "week":
        return (
          <input
            {...commonProps}
            type={
              field.type === "datetime"
                ? "datetime-local"
                : field.type
            }
          />
        );

      case "color":
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || "#37345f"}
              disabled={field.disabled}
              onChange={(e) => handleChange(field, e.target.value)}
              className="h-12 w-16 cursor-pointer rounded-lg border border-gray-200 p-1"
            />
            <span className="text-sm text-gray-500">
              {value || "#37345f"}
            </span>
          </div>
        );

      case "select":
        return (
          <div className="relative">
            <select
              {...commonProps}
              value={value || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className={`${getInputClass(field)} appearance-none pr-10 cursor-pointer`}
            >
              <option value="" disabled>
                -- select --
              </option>

              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        );

      case "radio":
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((option, index) => {
              const checked = value === option;

              return (
                <label
                  key={index}
                  className={`lux-choice ${
                    checked ? "lux-choice-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={key}
                    value={option}
                    checked={checked}
                    disabled={field.disabled}
                    onChange={() => handleChange(field, option)}
                    className="h-4 w-4 accent-[#37345f]"
                  />

                  <span className="text-sm text-gray-700">
                    {option}
                  </span>

                  {checked && (
                    <FiCheck className="ml-auto text-[#37345f]" />
                  )}
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        if (options.length > 0) {
          const selected = Array.isArray(value) ? value : [];

          return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {options.map((option, index) => {
                const checked = selected.includes(option);

                return (
                  <label
                    key={index}
                    className={`lux-choice ${
                      checked ? "lux-choice-active" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={checked}
                      disabled={field.disabled}
                      onChange={(e) =>
                        handleCheckboxOption(
                          field,
                          option,
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 accent-[#37345f]"
                    />

                    <span className="text-sm text-gray-700">
                      {option}
                    </span>

                    {checked && (
                      <FiCheck className="ml-auto text-[#37345f]" />
                    )}
                  </label>
                );
              })}
            </div>
          );
        }

        return (
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              disabled={field.disabled}
              onChange={(e) =>
                handleChange(field, e.target.checked)
              }
              className="h-4 w-4 accent-[#37345f]"
            />

            <span className="text-sm text-gray-700">
              {field.placeholder || field.label}
            </span>
          </label>
        );

      case "paragraph":
        return (
          <p className="whitespace-pre-line text-sm leading-7 text-gray-500">
            {field.helpText || field.label}
          </p>
        );

      case "divider":
        return <div className="my-2 h-px w-full bg-gray-200" />;

      default:
        return <input {...commonProps} type="text" />;
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => {
        document.querySelector(".lux-field-error")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        document.querySelector(".lux-consent-error")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const submissionData = {};

      fields.forEach((field) => {
        if (["divider", "paragraph"].includes(field.type)) return;

        submissionData[field.label] = values[getFieldKey(field)];
      });

      const acceptedConsents = consents.filter(
        (_, index) => values[`consent_${index}`] === true
      );

      const response = await axios.post(`${base_url}/user/submit`, {
        formId: formData._id,
        submissionData,
        consents: acceptedConsents,
      });

      if (response.data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(
          response.data.message || "Unable to submit your response."
        );
      }
    } catch (error) {
      console.error("Submit error:", error);

      setSubmitError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset after success
  useEffect(() => {
    if (!submitted || !formData) return;

    const timer = setTimeout(() => {
      setValues(initializeValues(formData));
      setErrors({});
      setTouched({});
      setSubmitError("");
      setSubmitted(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [submitted, formData]);

  if (loading) return <Loder />;

  // Not found
  if (formNotFound || !formData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-5">
        <div className="w-full max-w-md rounded-2xl border bg-white p-9 text-center shadow-sm">
          <FiAlertCircle
            size={30}
            className="mx-auto mb-5 text-red-500"
          />

          <h1 className="text-2xl font-bold text-gray-900">
            Form not found
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            This form may have been removed, unpublished or the link is incorrect.
          </p>

          <button
            onClick={fetchData}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#292744] px-5 py-3 text-sm font-semibold text-white"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Success
  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-5">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-9 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
            <FiCheckCircle size={38} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[.2em] text-green-600">
            Successfully Submitted
          </p>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Thank You!
          </h1>

          <p className="mt-4 leading-7 text-gray-500">
            Your response has been submitted successfully.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
            <FiCheckCircle />
            Your response has been received
          </div>
        </div>
      </main>
    );
  }

  // Banner and logo URLs
  const bannerUrl = getImageUrl(formData?.bannerImage);
  const logoUrl = getImageUrl(formData?.logo);

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
      style={{ backgroundColor: colors.bg_form }}
    >
      <style>{`
        .lux-input {
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #252525;
          border-radius: 10px;
          min-height: 48px;
        }

        .lux-input:hover {
          border-color: #c9c9d2;
        }

        .lux-input:focus {
          border-color: #55516f !important;
          box-shadow: 0 0 0 3px rgba(55,52,95,.08);
          outline: none;
        }

        .lux-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .lux-input-error {
          border-color: #dc6262 !important;
          background: #fffafa;
        }

        .lux-choice {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          transition: all .2s ease;
        }

        .lux-choice:hover {
          border-color: #aaa7bd;
          background: #fafafe;
        }

        .lux-choice-active {
          border-color: #55516f;
          background: #f7f6fb;
        }

        .lux-field-grid {
          display: grid;
          grid-template-columns: repeat(12,minmax(0,1fr));
          gap: 25px 20px;
        }

        .lux-field {
          min-width: 0;
          grid-column: span 12;
        }

        @media(max-width:640px) {
          .lux-field-grid {
            gap: 22px 12px;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[760px]">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex min-w-0 items-center gap-3">

            {/* Logo if available, otherwise default icon */}
            {logoUrl ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-1">
                <img
                  src={logoUrl}
                  alt={`${formData.title || "Form"} logo`}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#292744] text-white">
                <FiFileText size={20} />
              </div>
            )}

            <div className="min-w-0">
              <p
                className="truncate text-sm font-bold"
                style={{ color: colors.title_form }}
              >
                {formData.title || "Contact"}
              </p>

              <p className="mt-0.5 text-[10px] uppercase tracking-[.16em] text-gray-400">
                Online Form
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Live Form
          </div>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-[0_12px_45px_rgba(0,0,0,0.045)]">

          {/* Banner */}
          {bannerUrl && (
            <div className="relative w-full overflow-hidden bg-gray-100">
              <img
                src={bannerUrl}
                alt={formData.title || "Form banner"}
                className="h-[190px] w-full object-cover sm:h-[250px] md:h-[300px]"
              />
            </div>
          )}

          <div
            className="p-5 sm:p-8 md:p-10"
            style={{ backgroundColor: colors.bg_form }}
          >

            {/* Title */}
            <div className="mb-8">
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/70 px-3 py-1.5 text-[11px] font-semibold"
                style={{ color: colors.label_form }}
              >
                <FiFileText size={13} />
                FORM DETAILS
              </div>

              <h1
                className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
                style={{ color: colors.title_form }}
              >
                {formData.title}
              </h1>

              {formData.description && (
                <p
                  className="mt-3 whitespace-pre-line text-sm leading-7"
                  style={{ color: colors.label_form }}
                >
                  {formData.description}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="mb-9 rounded-xl border border-gray-100 bg-white/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Form completion
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Complete the required information
                  </p>
                </div>

                <span
                  className="text-sm font-bold"
                  style={{ color: colors.label_form }}
                >
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: colors.label_form,
                  }}
                />
              </div>
            </div>

            {/* Section Heading */}
            <div className="mb-7 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80"
                style={{ color: colors.label_form }}
              >
                <FiFileText size={17} />
              </div>

              <div>
                <h2
                  className="text-sm font-bold"
                  style={{ color: colors.title_form }}
                >
                  Your Information
                </h2>

                <p
                  className="mt-0.5 text-xs"
                  style={{ color: colors.label_form }}
                >
                  Please provide the details below
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Dynamic Fields */}
              <div className="lux-field-grid">
                {fields.map((field, index) => {
                  const key = getFieldKey(field);
                  const Icon = getIcon(field.type);
                  const error = touched[key] && errors[key];

                  const isContentField = [
                    "paragraph",
                    "divider",
                  ].includes(field.type);

                  return (
                    <div
                      key={key || index}
                      className={`lux-field ${
                        error ? "lux-field-error" : ""
                      }`}
                    >
                      {!isContentField && (
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <label
                            htmlFor={key}
                            className="flex items-center gap-2 text-[13px] font-semibold"
                            style={{ color: colors.label_form }}
                          >
                            <Icon size={14} />

                            {field.label}

                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>

                          {field.required && (
                            <span className="text-[10px] text-gray-400">
                              Required
                            </span>
                          )}
                        </div>
                      )}

                      {renderField(field)}

                      {field.helpText && field.type !== "paragraph" && (
                        <p
                          className="mt-2 text-[11px] leading-relaxed"
                          style={{ color: colors.label_form }}
                        >
                          {field.helpText}
                        </p>
                      )}

                      {error && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                          <FiAlertCircle size={13} />
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Consents Section */}
              {consents.length > 0 && (
                <div className="mt-9 border-t border-gray-200 pt-7">

                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80"
                      style={{ color: colors.label_form }}
                    >
                      <FiShield size={19} />
                    </div>

                    <div>
                      <h2
                        className="text-base font-bold"
                        style={{ color: colors.title_form }}
                      >
                        Consent & Agreements
                      </h2>

                      <p
                        className="mt-1 text-xs"
                        style={{ color: colors.label_form }}
                      >
                        Please read and accept the following agreements.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {consents.map((consent, index) => {
                      const key = `consent_${index}`;
                      const checked = values[key] === true;
                      const error = touched[key] && errors[key];

                      return (
                        <div
                          key={index}
                          className={`lux-consent-error rounded-xl border p-4 transition-all ${
                            checked
                              ? "border-green-300 bg-green-50/60"
                              : error
                              ? "border-red-300 bg-red-50/40"
                              : "border-gray-200 bg-white/80 hover:border-gray-300"
                          }`}
                        >
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                handleConsentChange(
                                  index,
                                  e.target.checked
                                )
                              }
                              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-green-600"
                            />

                            <span
                              className="text-sm leading-6 font-medium"
                              style={{ color: colors.label_form }}
                            >
                              {consent}
                            </span>

                            {checked && (
                              <FiCheckCircle className="ml-auto mt-1 shrink-0 text-green-600" />
                            )}
                          </label>

                          {error && (
                            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-red-500">
                              <FiAlertCircle size={13} />
                              {error}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p
                    className="mt-3 text-[11px]"
                    style={{ color: colors.label_form }}
                  >
                    * All agreements must be accepted before submitting.
                  </p>
                </div>
              )}

              {/* Submission Error */}
              {submitError && (
                <div className="mt-7 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">
                  <FiAlertCircle className="mt-0.5 shrink-0" />

                  <p className="text-xs leading-relaxed">
                    {submitError}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSubmitError("")}
                    className="ml-auto"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="mt-9 border-t border-gray-200 pt-6">
                <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-white/80"
                      style={{ color: colors.label_form }}
                    >
                      <FiShield size={17} />
                    </div>

                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: colors.title_form }}
                      >
                        Your information is secure
                      </p>

                      <p
                        className="mt-1 text-[10px]"
                        style={{ color: colors.label_form }}
                      >
                        Your details are submitted confidentially
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full min-w-[180px] items-center justify-center gap-3 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    style={{ backgroundColor: colors.label_form }}
                  >
                    {submitting ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <FiArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 px-1 sm:flex-row">
          <div className="flex items-center gap-2 text-gray-400">
            <FiGlobe size={13} />

            <span className="text-[11px]">
              Powered by{" "}
              <a
                href="https://digitalpaaji.com/"
                target="_blank"
                rel="noreferrer"
                className="font-bold"
                style={{ color: colors.label_form }}
              >
                Digital Paaji
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <FiLock size={12} />

            <span className="text-[10px]">
              Secure Form Experience
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FormPage;
