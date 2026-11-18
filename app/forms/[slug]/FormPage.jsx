
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

  // Unique key for each field
  const getFieldKey = (field) => field._id || field.label;

  // Image URL
  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${img_url}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // Initial value according to field type
  const getInitialValue = (field) => {
    if (field.type === "checkbox") {
      return field.options?.length ? [] : false;
    }

    if (field.type === "color") {
      return "#37345f";
    }

    return "";
  };

  // Fetch form
  const fetchData = async () => {
    try {
      setLoading(true);
      setFormNotFound(false);

      const response = await axios.get(
        `${base_url}/user/get/${slug}`
      );

      const data = response.data;

      if (data.success && data.formData) {
        setFormData(data.formData);

        const initialValues = {};

        data.formData.fields?.forEach((field) => {
          const key = getFieldKey(field);
          initialValues[key] =
            field.defaultValue ?? getInitialValue(field);
        });

        setValues(initialValues);
      } else {
        setFormNotFound(true);
      }
    } catch (error) {
      console.error("Fetch form error:", error);
      setFormNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  // Sort fields
  const fields = useMemo(() => {
    return [...(formData?.fields || [])];
  }, [formData]);

  // Visible fields
  const activeFields = fields.filter(
    (field) =>
      !field.disabled &&
      !["divider", "paragraph"].includes(field.type)
  );

  // Progress
  const progress = useMemo(() => {
    if (!activeFields.length) return 100;

    const completed = activeFields.filter((field) => {
      const value = values[getFieldKey(field)];

      if (Array.isArray(value)) return value.length > 0;

      return (
        value !== "" &&
        value !== undefined &&
        value !== null &&
        value !== false
      );
    }).length;

    return Math.round((completed / activeFields.length) * 100);
  }, [activeFields, values]);

  // Change value
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

  // Checkbox options
  const handleCheckboxOption = (field, option, checked) => {
    const key = getFieldKey(field);
    const current = values[key] || [];

    const updated = checked
      ? [...current, option]
      : current.filter((item) => item !== option);

    handleChange(field, updated);
  };

  // Validation
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

    if (field.type === "number") {
      if (Number.isNaN(Number(value))) {
        return "Please enter a valid number";
      }
    }

    return "";
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};

    fields.forEach((field) => {
      const key = getFieldKey(field);

      if (field.disabled || ["divider", "paragraph"].includes(field.type)) {
        return;
      }

      allTouched[key] = true;

      const error = validateField(field, values[key]);

      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched(allTouched);

    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => {
        document.querySelector(".lux-field-error")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      // Keep backend submission keys as field labels
      const submissionData = {};

      fields.forEach((field) => {
        if (["divider", "paragraph"].includes(field.type)) return;

        submissionData[field.label] = values[getFieldKey(field)];
      });

      const response = await axios.post(`${base_url}/user/submit`, {
        formId: formData._id,
        submissionData,
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

  // Common input styles
  const getInputClass = (field) => {
    const key = getFieldKey(field);
    const error = touched[key] && errors[key];

    return `lux-input w-full px-4 py-3.5 text-sm outline-none transition-all duration-200 ${
      error ? "lux-input-error" : ""
    }`;
  };

  // Common input props
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

  // Render fields
  const renderField = (field) => {
    const key = getFieldKey(field);
    const value = values[key];
    const options = Array.isArray(field.options) ? field.options : [];

    const commonProps = getCommonProps(field);

    switch (field.type) {
      // Text
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

      // Number
      case "number":
        return (
          <input
            {...commonProps}
            type="number"
          />
        );

      // Textarea
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${getInputClass(field)} resize-y`}
          />
        );

      // Date
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

      // Color
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

      // Select
      case "select":
        return (
          <div className="relative">
            <select
              {...commonProps}
              value={value || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className={`${getInputClass(field)} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">
                {field.placeholder || "Select an option"}
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

      // Radio - Only one option can be selected
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
                  } ${field.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
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

      // Checkbox - Multiple options or single boolean
      case "checkbox":
        // Checkbox with options
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
                    } ${field.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
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

        // Single checkbox
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

      // Paragraph
      case "paragraph":
        return (
          <p className="whitespace-pre-line text-sm leading-7 text-gray-500">
            {field.helpText || field.label}
          </p>
        );

      // Divider
      case "divider":
        return <div className="my-2 h-px w-full bg-gray-200" />;

      default:
        return (
          <input
            {...commonProps}
            type="text"
          />
        );
    }
  };

  // Loading
  if (loading) return <Loder />;

  // Not found
  if (formNotFound || !formData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-5">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-9 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiAlertCircle size={27} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Form not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            This form may have been removed, unpublished or the link is incorrect.
          </p>

          <button
            onClick={fetchData}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#292744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#403d68]"
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

  const bannerUrl = getImageUrl(formData.bannerImage);

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 sm:px-6 sm:py-12">

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
          box-shadow: 0 0 0 3px rgba(55, 52, 95, .08);
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
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 25px 20px;
        }

        .lux-field {
          min-width: 0;
          grid-column: span var(--field-span);
        }

        @media(max-width: 640px) {
          .lux-field-grid {
            gap: 22px 12px;
          }

          .lux-field {
            grid-column: span 12 !important;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[760px]">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292744] text-white">
              <FiFileText size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#292744]">
                Contact
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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_45px_rgba(0,0,0,0.045)]">

          {/* Banner */}
          {bannerUrl && (
            <div className="relative w-full overflow-hidden bg-gray-100">
              <img
                src={bannerUrl}
                alt={formData.title}
                className="h-[190px] w-full object-cover object-center sm:h-[250px] md:h-[300px]"
              />
            </div>
          )}

          <div className="p-5 sm:p-8 md:p-10">

            {/* Form Title */}
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#f4f3f8] px-3 py-1.5 text-[11px] font-semibold text-[#55516f]">
                <FiFileText size={13} />
                FORM DETAILS
              </div>

              <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#252525] sm:text-3xl">
                {formData.title}
              </h1>

              {formData.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-500">
                  {formData.description}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="mb-9 rounded-xl border border-gray-100 bg-[#fafafd] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Form completion
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Complete the required information
                  </p>
                </div>

                <span className="text-sm font-bold text-[#37345f]">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#37345f] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Section Heading */}
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f3f8] text-[#55516f]">
                <FiFileText size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Your Information
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Please provide the details below
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="lux-field-grid">

                {fields.map((field, index) => {
                  const key = getFieldKey(field);
                  const Icon = getIcon(field.type);
                  const error = touched[key] && errors[key];

                  const isContentField = [
                    "paragraph",
                    "divider",
                  ].includes(field.type);

                  const span = 12;

                  return (
                    <div
                      key={key || index}
                      className={`lux-field ${
                        error ? "lux-field-error" : ""
                      }`}
                      style={{ "--field-span": span }}
                    >
                      {/* Label */}
                      {!isContentField && (
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <label
                            htmlFor={key}
                            className="flex items-center gap-2 text-[13px] font-semibold text-gray-700"
                          >
                            <Icon size={14} className="text-gray-400" />

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

                      {/* Field */}
                      {renderField(field)}

                      {/* Help text */}
                      {field.helpText && field.type !== "paragraph" && (
                        <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                          {field.helpText}
                        </p>
                      )}

                      {/* Error */}
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
              <div className="mt-9 border-t border-gray-100 pt-6">
                <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500">
                      <FiShield size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Your information is secure
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        Your details are submitted confidentially
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full min-w-[180px] items-center justify-center gap-3 rounded-xl bg-[#37345f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#292744] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                className="font-bold text-[#55516f]"
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
