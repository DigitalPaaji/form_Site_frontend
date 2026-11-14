"use client";

import { addFormPage } from "@/components/store/clientsSlice";
import { base_url } from "@/components/utils";
import axios from "axios";
import React, { useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiSettings,
  FiEye,
  FiSave,
  FiX,
  FiMove,
  FiImage,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const fieldTypes = [
  "text", "textarea", "email", "number", "phone",
  "password", "url", "date", "time", "datetime",
  "month", "week", "color", "range",
  "select", "radio", "checkbox", "toggle",
  "hidden", "heading", "paragraph", "divider",
];

const createField = (type = "text") => ({
  fieldId: crypto.randomUUID(),
  label: "New Field",
  name: `field_${Date.now()}`,
  type,
  placeholder: "Enter here...",
  defaultValue: "",
  helpText: "",
  required: false,
  disabled: false,
  readOnly: false,
  options: ["select", "radio", "checkbox"].includes(type)
    ? [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ]
    : [],
  validation: {
    min: "",
    max: "",
    minLength: "",
    maxLength: "",
    accept: "",
    multiple: false,
  },
  size: {
    width: 12,
    height: 44,
    unit: "px",
    rows: 4,
  },
  style: {
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderColor: "#d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "normal",
    alignment: "left",
  },
  order: 0,
});

const initialSettings = {
  columns: 12,
  backgroundColor: "#ffffff",
  formWidth: 700,
  formAlignment: "center",
  submitButtonText: "Submit",
  submitButtonColor: "#2563eb",
  successMessage: "Form submitted successfully!",
};

export default function Page() {
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");

  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  const [fields, setFields] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [selectedField, setSelectedField] = useState(null);
  const [activeTab, setActiveTab] = useState("fields");
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  // Handle banner upload
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // Remove banner
  const removeBanner = () => {
    setBanner(null);
    setBannerPreview("");
  };

  // Update field
  const updateField = (index, key, value) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, [key]: value } : field
      )
    );
  };

  // Update nested field
  const updateNestedField = (index, section, key, value) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index
          ? {
              ...field,
              [section]: {
                ...field[section],
                [key]: value,
              },
            }
          : field
      )
    );
  };

  // Add field
  const addField = (type = "text") => {
    const field = createField(type);

    field.order = fields.length;

    setFields((prev) => [...prev, field]);
    setSelectedField(fields.length);
    setActiveTab("fields");
  };

  // Delete field
  const deleteField = (index) => {
    setFields((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((field, i) => ({ ...field, order: i }))
    );

    setSelectedField(null);
  };

  // Update option
  const updateOption = (index, optionIndex, key, value) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index
          ? {
              ...field,
              options: field.options.map((option, j) =>
                j === optionIndex
                  ? { ...option, [key]: value }
                  : option
              ),
            }
          : field
      )
    );
  };

  // Add option
  const addOption = (index) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index
          ? {
              ...field,
              options: [
                ...field.options,
                {
                  label: `Option ${field.options.length + 1}`,
                  value: `option_${field.options.length + 1}`,
                },
              ],
            }
          : field
      )
    );
  };

  // Delete option
  const removeOption = (index, optionIndex) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index
          ? {
              ...field,
              options: field.options.filter(
                (_, j) => j !== optionIndex
              ),
            }
          : field
      )
    );
  };

  // Save form
  const saveForm = async () => {
    if (!title.trim()) {
      toast.error("Please enter form title");
      return;
    }

    if (!banner) {
      toast.error("Please upload a form banner");
      return;
    }

    if (fields.some((field) => !field.name.trim())) {
      toast.error("Every field must have a name");
      return;
    }

    const names = fields
      .filter(
        (field) =>
          !["heading", "paragraph", "divider"].includes(field.type)
      )
      .map((field) => field.name.trim());

    if (new Set(names).size !== names.length) {
      toast.error("Field names must be unique");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("fields", JSON.stringify(fields));
      formData.append("settings", JSON.stringify(settings));
      formData.append("status", status);
      formData.append("banner", banner);

      const response = await axios.post(
        `${base_url}/auth/create`,
        formData,
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data.success) {
        dispatch(addFormPage(data.formCreateData));
        toast.success("Form saved successfully!");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to save form"
      );
    } finally {
      setSaving(false);
    }
  };

  const selected =
    selectedField !== null ? fields[selectedField] : null;

  // Render field
  const renderField = (field) => {
    const commonStyle = {
      width: "100%",
      height:
        field.type === "textarea"
          ? "auto"
          : `${field.size.height}${field.size.unit}`,
      minHeight:
        field.type === "textarea"
          ? `${field.size.height}${field.size.unit}`
          : undefined,
      backgroundColor: field.style.backgroundColor,
      color: field.style.textColor,
      borderColor: field.style.borderColor,
      borderRadius: `${field.style.borderRadius}px`,
      fontSize: `${field.style.fontSize}px`,
      textAlign: field.style.alignment,
    };

    if (field.type === "divider") {
      return <hr className="my-3 border-gray-300" />;
    }

    if (field.type === "heading") {
      return <h3 className="text-xl font-bold">{field.label}</h3>;
    }

    if (field.type === "paragraph") {
      return (
        <p className="text-sm text-gray-500">{field.helpText}</p>
      );
    }

    if (field.type === "hidden") return null;

    return (
      <div className="w-full space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>

        {[
          "text", "email", "number", "phone", "password",
          "url", "date", "time", "datetime", "month",
          "week", "color", "range",
        ].includes(field.type) && (
          <input
            type={
              field.type === "phone"
                ? "tel"
                : field.type === "datetime"
                ? "datetime-local"
                : field.type
            }
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            disabled={field.disabled}
            readOnly={field.readOnly}
            required={field.required}
            min={field.validation.min || undefined}
            max={field.validation.max || undefined}
            minLength={field.validation.minLength || undefined}
            maxLength={field.validation.maxLength || undefined}
            style={commonStyle}
            className="border px-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {field.type === "textarea" && (
          <textarea
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            rows={field.size.rows}
            disabled={field.disabled}
            readOnly={field.readOnly}
            required={field.required}
            style={commonStyle}
            className="w-full border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {field.type === "select" && (
          <select
            required={field.required}
            disabled={field.disabled}
            defaultValue=""
            style={commonStyle}
            className="border px-3 outline-none"
          >
            <option value="">Select an option</option>
            {field.options.map((option, i) => (
              <option key={i} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {(field.type === "radio" ||
          field.type === "checkbox") && (
          <div className="space-y-2">
            {field.options.map((option, i) => (
              <label
                key={i}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type={field.type}
                  name={
                    field.type === "radio"
                      ? field.name
                      : `${field.name}[]`
                  }
                  value={option.value}
                  required={field.required && i === 0}
                  disabled={field.disabled}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}

        {field.type === "toggle" && (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              disabled={field.disabled}
              defaultChecked={field.defaultValue === "true"}
              className="h-5 w-5 accent-blue-600"
            />
            <span className="text-sm text-gray-600">
              {field.helpText}
            </span>
          </label>
        )}

        {field.helpText &&
          !["paragraph", "toggle"].includes(field.type) && (
            <p className="text-xs text-gray-500">{field.helpText}</p>
          )}
      </div>
    );
  };

  return (
    <div className="h-screen overflow-auto bg-gray-100 text-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 shadow-sm md:px-7">
        <div>
          <h1 className="text-lg font-bold">Form Builder</h1>
          <p className="text-xs text-gray-500">
            Create your custom form
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <FiEye /> Preview
          </button>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <button
            onClick={saveForm}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave />
            {saving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 p-4 lg:grid-cols-[250px_minmax(0,1fr)_320px] lg:p-6">

        {/* Left Sidebar */}
        <aside className="h-fit rounded-xl border bg-white p-4">
          <h2 className="mb-4 font-bold">Add Fields</h2>

          <div className="grid grid-cols-2 gap-2">
            {fieldTypes.map((type) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="flex items-center justify-between rounded-lg border p-2.5 text-left text-xs font-medium capitalize transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
              >
                {type}
                <FiPlus />
              </button>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="mb-3 text-sm font-bold">Configuration</h3>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex w-full items-center gap-2 rounded-lg p-3 text-sm ${
                activeTab === "settings"
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <FiSettings /> Layout & Appearance
            </button>

            <button
              onClick={() => setActiveTab("fields")}
              className={`mt-2 flex w-full items-center gap-2 rounded-lg p-3 text-sm ${
                activeTab === "fields"
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <FiMove /> Field Properties
            </button>
          </div>
        </aside>

        {/* Main Form Builder */}
        <main className="min-w-0">
          <div
            className="mx-auto space-y-5 rounded-xl border bg-white p-5 shadow-sm md:p-8"
            style={{
              maxWidth: settings.formWidth,
              backgroundColor: settings.backgroundColor,
            }}
          >
            {/* Form Title */}
            <div className="border-b pb-5">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold outline-none md:text-3xl"
                placeholder="Untitled Form"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="mt-3 w-full resize-none bg-transparent text-sm text-gray-500 outline-none"
                rows={2}
              />
            </div>

            {/* Banner Upload */}
            <div className="space-y-3 border-b pb-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Form Banner <span className="text-red-500">*</span>
                </label>

                {banner && (
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 /> Remove
                  </button>
                )}
              </div>

              {bannerPreview ? (
                <div className="relative overflow-hidden rounded-xl border">
                  <img
                    src={bannerPreview}
                    alt="Form banner preview"
                    className="h-48 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeBanner}
                    className="absolute right-3 top-3 rounded-lg bg-white p-2 text-red-500 shadow-md hover:bg-red-50"
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-10 transition hover:border-blue-400 hover:bg-blue-50/50">
                  <FiImage className="mb-3 text-3xl text-gray-400" />

                  <span className="text-sm font-semibold text-gray-700">
                    Click to upload banner
                  </span>

                  <span className="mt-1 text-xs text-gray-400">
                    PNG, JPG, WEBP or other image formats
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </label>
              )}

              {banner && (
                <p className="text-xs text-green-600">
                  Selected: {banner.name}
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div
              className="grid grid-cols-12 gap-4"
              style={{
                gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))`,
              }}
            >
              {fields.map((field, index) => (
                <div
                  key={field.fieldId}
                  onClick={() => {
                    setSelectedField(index);
                    setActiveTab("fields");
                  }}
                  style={{
                    gridColumn: `span ${Math.min(
                      field.size.width,
                      settings.columns
                    )}`,
                  }}
                  className={`group relative min-w-0 cursor-pointer rounded-xl border-2 p-4 transition ${
                    selectedField === index
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteField(index);
                      }}
                      className="rounded-md bg-white p-2 text-red-500 shadow hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  {renderField(field)}
                </div>
              ))}
            </div>

            {fields.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">
                <FiPlus className="mx-auto mb-3 text-3xl text-gray-400" />

                <h3 className="font-semibold">
                  Start building your form
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Select any field from the left sidebar.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="border-t pt-5">
              <button
                style={{
                  backgroundColor: settings.submitButtonColor,
                }}
                className="rounded-lg px-7 py-3 text-sm font-semibold text-white"
              >
                {settings.submitButtonText}
              </button>
            </div>
          </div>
        </main>

        {/* Right Properties Sidebar */}
        <aside className="h-fit rounded-xl border bg-white p-4">
          {activeTab === "settings" ? (
            <div className="space-y-4">
              <h2 className="font-bold">Form Appearance</h2>

              <div>
                <label className="text-xs font-semibold">
                  Form Width (px)
                </label>

                <input
                  type="number"
                  min="300"
                  max="1400"
                  value={settings.formWidth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      formWidth: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Grid Columns
                </label>

                <select
                  value={settings.columns}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      columns: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border p-2"
                >
                  {[1, 2, 3, 4, 6, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} Columns
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Background Color
                </label>

                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      backgroundColor: e.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border p-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Form Alignment
                </label>

                <select
                  value={settings.formAlignment}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      formAlignment: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border p-2"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Button Text
                </label>

                <input
                  value={settings.submitButtonText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      submitButtonText: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Button Color
                </label>

                <input
                  type="color"
                  value={settings.submitButtonColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      submitButtonColor: e.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border p-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Success Message
                </label>

                <textarea
                  value={settings.successMessage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      successMessage: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border p-2"
                />
              </div>
            </div>
          ) : selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Field Properties</h2>

                <button
                  onClick={() => setSelectedField(null)}
                  className="rounded-md p-1 hover:bg-gray-100"
                >
                  <FiX />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Field Type
                </label>

                <select
                  value={selected.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const newField = createField(newType);

                    setFields((prev) =>
                      prev.map((field, i) =>
                        i === selectedField
                          ? {
                              ...field,
                              type: newType,
                              options: newField.options,
                            }
                          : field
                      )
                    );
                  }}
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                >
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">Label</label>

                <input
                  value={selected.label}
                  onChange={(e) =>
                    updateField(selectedField, "label", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Field Name</label>

                <input
                  value={selected.name}
                  onChange={(e) =>
                    updateField(selectedField, "name", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Placeholder</label>

                <input
                  value={selected.placeholder}
                  onChange={(e) =>
                    updateField(selectedField, "placeholder", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Default Value
                </label>

                <input
                  value={selected.defaultValue}
                  onChange={(e) =>
                    updateField(selectedField, "defaultValue", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Help Text</label>

                <input
                  value={selected.helpText}
                  onChange={(e) =>
                    updateField(selectedField, "helpText", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">
                    Width (1-12)
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={selected.size.width}
                    onChange={(e) =>
                      updateNestedField(
                        selectedField,
                        "size",
                        "width",
                        Math.min(12, Math.max(1, Number(e.target.value)))
                      )
                    }
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold">Height</label>

                  <input
                    type="number"
                    min="1"
                    value={selected.size.height}
                    onChange={(e) =>
                      updateNestedField(
                        selectedField,
                        "size",
                        "height",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Height Unit</label>

                <select
                  value={selected.size.unit}
                  onChange={(e) =>
                    updateNestedField(
                      selectedField,
                      "size",
                      "unit",
                      e.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border p-2"
                >
                  <option value="px">Pixels (px)</option>
                  <option value="rem">REM</option>
                  <option value="%">Percentage (%)</option>
                </select>
              </div>

              {selected.type === "textarea" && (
                <div>
                  <label className="text-xs font-semibold">
                    Textarea Rows
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={selected.size.rows}
                    onChange={(e) =>
                      updateNestedField(
                        selectedField,
                        "size",
                        "rows",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </div>
              )}

              {["select", "radio", "checkbox"].includes(selected.type) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold">Options</label>

                    <button
                      onClick={() => addOption(selectedField)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600"
                    >
                      <FiPlus /> Add Option
                    </button>
                  </div>

                  {selected.options.map((option, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={option.label}
                        onChange={(e) =>
                          updateOption(
                            selectedField,
                            i,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="Label"
                        className="min-w-0 flex-1 rounded-lg border p-2 text-xs"
                      />

                      <button
                        onClick={() => removeOption(selectedField, i)}
                        className="rounded-lg border p-2 text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {["number", "range"].includes(selected.type) && (
                <div className="grid grid-cols-2 gap-2">
                  {["min", "max"].map((key) => (
                    <div key={key}>
                      <label className="text-xs font-semibold capitalize">
                        {key}
                      </label>

                      <input
                        type="number"
                        value={selected.validation[key]}
                        onChange={(e) =>
                          updateNestedField(
                            selectedField,
                            "validation",
                            key,
                            e.target.value
                          )
                        }
                        className="mt-1 w-full rounded-lg border p-2"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                {[
                  ["required", "Required"],
                  ["disabled", "Disabled"],
                  ["readOnly", "Read Only"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    {label}

                    <input
                      type="checkbox"
                      checked={selected[key]}
                      onChange={(e) =>
                        updateField(selectedField, key, e.target.checked)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                  </label>
                ))}
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 text-sm font-bold">Field Styling</h3>

                {[
                  ["backgroundColor", "Background"],
                  ["textColor", "Text Color"],
                  ["borderColor", "Border Color"],
                ].map(([key, label]) => (
                  <div key={key} className="mb-3">
                    <label className="text-xs font-semibold">{label}</label>

                    <input
                      type="color"
                      value={selected.style[key]}
                      onChange={(e) =>
                        updateNestedField(
                          selectedField,
                          "style",
                          key,
                          e.target.value
                        )
                      }
                      className="mt-1 h-9 w-full cursor-pointer rounded-lg border p-1"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold">
                    Border Radius
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={selected.style.borderRadius}
                    onChange={(e) =>
                      updateNestedField(
                        selectedField,
                        "style",
                        "borderRadius",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold">Font Size</label>

                  <input
                    type="number"
                    min="8"
                    value={selected.style.fontSize}
                    onChange={(e) =>
                      updateNestedField(
                        selectedField,
                        "style",
                        "fontSize",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </div>
              </div>

              <button
                onClick={() => deleteField(selectedField)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <FiTrash2 /> Delete Field
              </button>
            </div>
          ) : (
            <div className="py-10 text-center">
              <FiSettings className="mx-auto mb-3 text-3xl text-gray-300" />

              <h3 className="font-semibold">No Field Selected</h3>

              <p className="mt-1 text-xs text-gray-500">
                Select a field to customize its properties.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-10 max-w-3xl rounded-2xl bg-white p-5 shadow-xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Form Preview</h2>

              <button
                onClick={() => setShowPreview(false)}
                className="rounded-lg border p-2 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div
              className="mx-auto space-y-5"
              style={{
                maxWidth: settings.formWidth,
                backgroundColor: settings.backgroundColor,
              }}
            >
              {/* Preview Banner */}
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Form banner"
                  className="h-48 w-full rounded-xl object-cover"
                />
              )}

              <div>
                <h1 className="text-2xl font-bold">{title}</h1>

                <p className="mt-2 text-sm text-gray-500">
                  {description}
                </p>
              </div>

              <div
                className="grid grid-cols-12 gap-4"
                style={{
                  gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))`,
                }}
              >
                {fields.map((field) => (
                  <div
                    key={field.fieldId}
                    style={{
                      gridColumn: `span ${Math.min(
                        field.size.width,
                        settings.columns
                      )}`,
                    }}
                  >
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <button
                style={{
                  backgroundColor: settings.submitButtonColor,
                }}
                className="rounded-lg px-7 py-3 font-semibold text-white"
              >
                {settings.submitButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}