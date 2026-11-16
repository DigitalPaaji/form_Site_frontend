
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
  FiUploadCloud,
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

  // Resolve uploaded image paths
  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${img_url}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // Fetch form
  const fetchData = async () => {
    setLoading(true);
    setFormNotFound(false);

    try {
      const response = await axios.get(`${base_url}/user/get/${slug}`);
      const data = response.data;

      if (data.success && data.formData) {
        setFormData(data.formData);

        const initialValues = {};

        data.formData.fields?.forEach((field) => {
          initialValues[field.label] =
            field.defaultValue ??
            (field.type === "checkbox" ? [] : "");
        });

        setValues(initialValues);
      } else {
        setFormNotFound(true);
      }
    } catch (error) {
      setFormNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  const settings = formData?.settings || {};

  const fields = useMemo(() => {
    return [...(formData?.fields || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  }, [formData]);

  const activeFields = fields.filter(
    (field) => !field.disabled && !["hidden", "divider", "heading", "paragraph"].includes(field.type)
  );

  // Progress
  const progress = useMemo(() => {
    if (!activeFields.length) return 100;

    const completed = activeFields.filter((field) => {
      const value = values[field.label];

      return (
        value !== "" &&
        value !== undefined &&
        value !== null &&
        (!Array.isArray(value) || value.length > 0)
      );
    }).length;

    return Math.round((completed / activeFields.length) * 100);
  }, [activeFields, values]);

  // Handle input changes
  const handleChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field.label]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [field.label]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [field.label]: "",
    }));
  };

  // Validation
  const validateField = (field, value) => {
    const validation = field.validation || {};

    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (field.disabled) return "";

    if (field.required && empty) {
      return `${field.label} is required`;
    }

    if (empty) return "";

    if (
      validation.minLength != null &&
      String(value).length < validation.minLength
    ) {
      return `Minimum ${validation.minLength} characters required`;
    }

    if (
      validation.maxLength != null &&
      String(value).length > validation.maxLength
    ) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }

    if (
      field.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      return "Please enter a valid email address";
    }

    if (
      ["number", "range"].includes(field.type) &&
      validation.min != null &&
      Number(value) < validation.min
    ) {
      return `Minimum value is ${validation.min}`;
    }

    if (
      ["number", "range"].includes(field.type) &&
      validation.max != null &&
      Number(value) > validation.max
    ) {
      return `Maximum value is ${validation.max}`;
    }

    if (
      field.type === "url" &&
      !/^https?:\/\/.+\..+/.test(value)
    ) {
      return "Please enter a valid URL";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};

    fields.forEach((field) => {
      allTouched[field.label] = true;

      const error = validateField(field, values[field.label]);

      if (error) newErrors[field.label] = error;
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

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await axios.post(`${base_url}/user/submit`, {
        formId: formData._id,
        submissionData: values,
      });

      if (response.data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(
          response.data.message || "Unable to submit your response."
        );
      }
    } catch (error) {
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
      tel: FiPhone,
      textarea: FiMessageSquare,
      number: FiHash,
      date: FiCalendar,
      time: FiClock,
    };

    return icons[type] || FiFileText;
  };

  // Input renderer
  const renderField = (field) => {
    const style = field.style || {};
    const validation = field.validation || {};
    const size = field.size || {};

    const error = touched[field.label] && errors[field.label];

    const inputClass = `lux-input w-full px-4 py-3.5 text-sm outline-none transition-all duration-200 ${
      error ? "lux-input-error" : ""
    }`;

    const commonProps = {
      name: field.label,
      id: field.label,
      value: values[field.label] ?? "",
      placeholder: field.placeholder || "Enter here...",
      required: field.required || false,
      disabled: field.disabled || false,
      readOnly: field.readOnly || false,
      onChange: (e) => handleChange(field, e.target.value),
      className: inputClass,
      style: {
        backgroundColor: style.backgroundColor || "#ffffff",
        color: style.textColor || "#252525",
        borderColor: error
          ? "#dc6262"
          : style.borderColor || "#e5e7eb",
        borderRadius: `${style.borderRadius ?? 10}px`,
        fontSize: `${style.fontSize || 14}px`,
        fontWeight: style.fontWeight || "normal",
        textAlign: style.alignment || "left",
        minHeight:
          field.type === "textarea"
            ? `${size.height || 110}px`
            : `${size.height || 48}px`,
      },
    };

    switch (field.type) {
      case "heading":
        return (
          <h3 className="text-lg font-semibold text-[#252525]">
            {field.label}
          </h3>
        );

      case "paragraph":
        return (
          <p className="text-sm leading-7 text-gray-500">
            {field.helpText || field.defaultValue || field.label}
          </p>
        );

      case "divider":
        return <div className="h-px w-full bg-gray-200 my-2" />;

      case "hidden":
        return null;

      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={size.rows || 4}
            style={{ ...commonProps.style, resize: "vertical" }}
          />
        );

      case "select":
        return (
          <div className="relative">
            <select
              {...commonProps}
              className={`${inputClass} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">
                {field.placeholder || "Select an option"}
              </option>

              {field.options?.map((option, index) => (
                <option
                  key={option._id || index}
                  value={option.value ?? option.label}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        );

      case "radio":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field.options?.map((option, index) => {
              const optionValue = option.value ?? option.label;
              const active = values[field.label] === optionValue;

              return (
                <label
                  key={option._id || index}
                  className={`lux-choice ${
                    active ? "lux-choice-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={field.label}
                    value={optionValue}
                    checked={active}
                    disabled={field.disabled}
                    onChange={() => handleChange(field, optionValue)}
                    className="accent-[#37345f] w-4 h-4"
                  />

                  <span className="text-sm text-gray-700">
                    {option.label}
                  </span>

                  {active && (
                    <FiCheck className="ml-auto text-[#37345f]" />
                  )}
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        if (!field.options?.length) {
          return (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(values[field.label])}
                disabled={field.disabled}
                onChange={(e) =>
                  handleChange(field, e.target.checked)
                }
                className="w-4 h-4 accent-[#37345f]"
              />

              <span className="text-sm text-gray-700">
                {field.placeholder || field.label}
              </span>
            </label>
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field.options.map((option, index) => {
              const optionValue = option.value ?? option.label;
              const current = values[field.label] || [];
              const checked = current.includes(optionValue);

              return (
                <label
                  key={option._id || index}
                  className={`lux-choice ${
                    checked ? "lux-choice-active" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={field.disabled}
                    onChange={(e) => {
                      handleChange(
                        field,
                        e.target.checked
                          ? [...current, optionValue]
                          : current.filter((v) => v !== optionValue)
                      );
                    }}
                    className="w-4 h-4 accent-[#37345f]"
                  />

                  <span className="text-sm text-gray-700">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case "toggle":
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(values[field.label])}
              disabled={field.disabled}
              onChange={(e) =>
                handleChange(field, e.target.checked)
              }
              className="sr-only peer"
            />

            <span className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#37345f] transition-colors">
              <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </span>

            <span className="text-sm text-gray-600">
              {field.placeholder || "Enable"}
            </span>
          </label>
        );

      case "file":
        return (
          <label className="block border border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition cursor-pointer">
            <FiUploadCloud size={25} className="mx-auto text-gray-500 mb-3" />

            <p className="text-sm font-semibold text-gray-700">
              Click to upload your file
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {validation.accept || "Choose your file"}
            </p>

            <input
              type="file"
              hidden
              disabled={field.disabled}
              multiple={validation.multiple || false}
              accept={validation.accept || undefined}
              onChange={(e) =>
                handleChange(
                  field,
                  validation.multiple
                    ? Array.from(e.target.files || [])
                    : e.target.files?.[0] || null
                )
              }
            />

            {values[field.label] && (
              <p className="text-xs text-[#37345f] mt-3 font-medium">
                {Array.isArray(values[field.label])
                  ? `${values[field.label].length} files selected`
                  : values[field.label].name}
              </p>
            )}
          </label>
        );

      case "number":
        return (
          <input
            {...commonProps}
            type="number"
            min={validation.min ?? undefined}
            max={validation.max ?? undefined}
            step="any"
          />
        );

      case "range":
        return (
          <div className="py-2">
            <input
              type="range"
              min={validation.min ?? 0}
              max={validation.max ?? 100}
              value={values[field.label] ?? validation.min ?? 0}
              disabled={field.disabled}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full accent-[#37345f]"
            />

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{validation.min ?? 0}</span>
              <span className="font-semibold text-gray-700">
                {values[field.label] ?? validation.min ?? 0}
              </span>
              <span>{validation.max ?? 100}</span>
            </div>
          </div>
        );

      case "color":
        return (
          <input
            type="color"
            value={values[field.label] || "#37345f"}
            disabled={field.disabled}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full h-12 border border-gray-200 rounded-xl p-1 cursor-pointer"
          />
        );

      case "datetime":
        return <input {...commonProps} type="datetime-local" />;

      case "month":
        return <input {...commonProps} type="month" />;

      case "week":
        return <input {...commonProps} type="week" />;

      case "email":
      case "phone":
      case "tel":
      case "text":
      case "password":
      case "date":
      case "time":
      case "url":
        return (
          <input
            {...commonProps}
            type={field.type === "phone" ? "tel" : field.type}
            minLength={validation.minLength ?? undefined}
            maxLength={validation.maxLength ?? undefined}
          />
        );

      default:
        return <input {...commonProps} type="text" />;
    }
  };

  if (loading) return <Loder />;

  if (formNotFound || !formData) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] flex items-center justify-center p-5">
        <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-9 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
            <FiAlertCircle size={27} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Form not found
          </h1>

          <p className="text-sm text-gray-500 mt-3 leading-6">
            This form may have been removed, unpublished or the link is incorrect.
          </p>

          <button
            onClick={fetchData}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#292744] text-white text-sm font-semibold hover:bg-[#403d68] transition"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] flex items-center justify-center p-5">
        <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-9 sm:p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={38} />
          </div>

          <p className="text-xs uppercase tracking-[.2em] font-bold text-green-600">
            Successfully Submitted
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Thank You!
          </h1>

          <p className="text-gray-500 mt-4 leading-7">
            {settings.successMessage ||
              "Your response has been submitted successfully."}
          </p>

          <div className="mt-8 rounded-xl bg-green-50 border border-green-100 p-4 flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
            <FiCheckCircle />
            Your response has been received
          </div>
        </div>
      </main>
    );
  }

  const columns = Math.min(
    12,
    Math.max(1, Number(settings.columns) || 12)
  );

  const formWidth = Math.max(
    320,
    Math.min(1200, Number(settings.formWidth) || 760)
  );

  const alignmentClass = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  }[settings.formAlignment] || "mx-auto";

  const bannerUrl = getImageUrl(formData.bannerImage);

  return (
    <main
      className="min-h-screen  bg-[#f7f7f8] px-4 py-8 sm:px-6 sm:py-12"
      style={{
        backgroundColor: settings.backgroundColor || "#f7f7f8",
      }}
    >
      <style>{`
        .lux-input {
          border: 1px solid #e5e7eb;
          background: #fff;
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
          background: #f5f5f5 !important;
          cursor: not-allowed;
        }

        .lux-input-error {
          border-color: #dc6262 !important;
          background: #fffafa !important;
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

        .lux-submit {
          transition: transform .2s ease, opacity .2s ease;
        }

        .lux-submit:hover:not(:disabled) {
          transform: translateY(-1px);
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

      <div className={`w-full ${alignmentClass} `} style={{ maxWidth: `${formWidth}px` }}>
        {/* Brand header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#292744] text-white flex items-center justify-center">
              <FiFileText size={20} />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-[#292744]">
                Contact
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-[.16em] mt-0.5">
                Online Form
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Live Form
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.045)] overflow-hidden">

          {/* Full width banner */}
          {bannerUrl && (
            <div className="w-full relative overflow-hidden bg-gray-100">
              <img
                src={bannerUrl}
                alt={formData.title || "Form banner"}
                className="w-full h-[190px] sm:h-[250px] md:h-[300px] object-cover object-center"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-5 sm:p-8 md:p-10">

            {/* Form heading */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#55516f] bg-[#f4f3f8] rounded-md px-3 py-1.5 mb-4">
                <FiFileText size={13} />
                FORM DETAILS
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#252525] tracking-tight leading-tight">
                {formData.title}
              </h1>

              {formData.description && (
                <p className="text-sm text-gray-500 mt-3 leading-7 whitespace-pre-line">
                  {formData.description}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="mb-9 p-4 rounded-xl bg-[#fafafd] border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Form completion
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Complete the required information
                  </p>
                </div>

                <span className="text-sm font-bold text-[#37345f]">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#37345f] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Form heading */}
            <div className="flex items-center gap-3 mb-7">
              <div className="w-9 h-9 rounded-lg bg-[#f4f3f8] text-[#55516f] flex items-center justify-center">
                <FiFileText size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Your Information
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Please provide the details below
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="lux-field-grid">
                {fields.map((field) => {
                  if (field.type === "hidden") {
                    return (
                      <input
                        key={field.fieldId || field._id || field.label}
                        type="hidden"
                        value={values[field.label] ?? ""}
                        readOnly
                      />
                    );
                  }

                  const width = Math.min(
                    columns,
                    Math.max(1, Number(field.size?.width) || 12)
                  );

                  const span = Math.max(
                    1,
                    Math.round((width / columns) * 12)
                  );

                  const Icon = getIcon(field.type);
                  const error = touched[field.label] && errors[field.label];

                  const isContentField = [
                    "heading",
                    "paragraph",
                    "divider",
                  ].includes(field.type);

                  return (
                    <div
                      key={field.fieldId || field._id || field.label}
                      className={`lux-field ${
                        error ? "lux-field-error" : ""
                      }`}
                      style={{ "--field-span": span }}
                    >
                      {!isContentField && (
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <label
                            htmlFor={field.label}
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

                      {renderField(field)}

                      {field.helpText && field.type !== "paragraph" && (
                        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                          {field.helpText}
                        </p>
                      )}

                      {error && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                          <FiAlertCircle size={13} />
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submission error */}
              {submitError && (
                <div className="mt-7 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-3">
                  <FiAlertCircle className="shrink-0 mt-0.5" />

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
              <div className="mt-9 pt-6 border-t border-gray-100">
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                      <FiShield size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Your information is secure
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Your details are submitted confidentially
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="lux-submit w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: settings.submitButtonColor || "#37345f",
                    }}
                  >
                    {submitting ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {settings.submitButtonText || "Submit"}
                        <FiArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-gray-400">
            <FiGlobe size={13} />
            <span className="text-[11px]">
              Powered by{" "}
              <a href="https://digitalpaaji.com/" target="_blank"  className="font-bold text-[#55516f]">
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
