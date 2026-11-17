"use client";

import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addFormPage } from "@/components/store/clientsSlice";
import { base_url } from "@/components/utils";
import {
  FiType,
  FiMail,
  FiAlignLeft,
  FiHash,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiCircle,
  FiCheckSquare,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiImage,
  FiSave,
} from "react-icons/fi";

// -----------------------------------------
// CONSTANTS & HELPERS
// -----------------------------------------

const FIELD_TYPES = [
  { type: "text", label: "Text", icon: FiType },
  { type: "email", label: "Email", icon: FiMail },
  { type: "textarea", label: "Textarea", icon: FiAlignLeft },
  { type: "number", label: "Number", icon: FiHash },
  { type: "phone", label: "Phone", icon: FiPhone },
  { type: "date", label: "Date", icon: FiCalendar },
  { type: "select", label: "Select", icon: FiChevronDown },
  { type: "radio", label: "Radio", icon: FiCircle },
  { type: "checkbox", label: "Checkbox", icon: FiCheckSquare },
];

const INPUT_STYLE =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

const initialSettings = {
  columns: 12,
  backgroundColor: "#ffffff",
  formWidth: 700,
  formAlignment: "center",
  submitButtonText: "Submit",
  submitButtonColor: "#2563eb",
  successMessage: "Form submitted successfully!",
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const createId = () => crypto.randomUUID();

const needsOptions = (type) => ["select", "radio", "checkbox"].includes(type);

const createOptionValue = (label) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

// Field shape matches the old (commented) code so the backend keeps working
const createField = (type) => {
  const id = createId();

  return {
    id, // used by this UI
    fieldId: id, // sent to backend
    name: `field_${Date.now()}`,
    type,
    label: `${capitalize(type)} field`,
    placeholder: needsOptions(type) ? "Select an option" : `Enter ${type}...`,
    defaultValue: "",
    helpText: "",
    required: false,
    disabled: false,
    readOnly: false,
    options: needsOptions(type)
      ? [
          { id: createId(), label: "Option 1", value: "option_1" },
          { id: createId(), label: "Option 2", value: "option_2" },
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
    size: { width: 12, height: 44, unit: "px", rows: 4 },
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
  };
};

// -----------------------------------------
// FIELD PREVIEW
// -----------------------------------------

const FieldPreview = ({ field }) => {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          disabled
          placeholder={field.placeholder}
          className={`${INPUT_STYLE} min-h-24`}
        />
      );

    case "select":
      return (
        <select disabled className={INPUT_STYLE} defaultValue="">
          <option value="" disabled>
            {field.placeholder || "Select an option"}
          </option>
          {field.options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "radio":
    case "checkbox":
      return (
        <div className="space-y-3">
          {field.options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 text-sm text-gray-600"
            >
              <input
                disabled
                type={field.type}
                name={`preview-${field.id}`}
                className="h-4 w-4 accent-gray-900"
              />
              {option.label}
            </label>
          ))}
        </div>
      );

    default:
      return (
        <input
          disabled
          type={field.type === "phone" ? "tel" : field.type}
          placeholder={field.placeholder}
          className={INPUT_STYLE}
        />
      );
  }
};

// -----------------------------------------
// OPTION EDITOR
// -----------------------------------------

const OptionEditor = ({ field, onChange }) => {
  const addOption = () => {
    const label = `Option ${field.options.length + 1}`;

    onChange([
      ...field.options,
      {
        id: createId(),
        label,
        value: `${createOptionValue(label)}_${createId().slice(0, 5)}`,
      },
    ]);
  };

  const updateOption = (id, label) => {
    onChange(
      field.options.map((option) =>
        option.id === id
          ? { ...option, label, value: createOptionValue(label) || option.value }
          : option
      )
    );
  };

  const deleteOption = (id) => {
    onChange(field.options.filter((option) => option.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">Options</h4>
          <p className="mt-0.5 text-xs text-gray-400">
            Add the choices users can select
          </p>
        </div>

        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500">
          {field.options.length} options
        </span>
      </div>

      <div className="space-y-2">
        {field.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-center text-xs text-gray-400">
              {index + 1}.
            </span>

            <input
              value={option.label}
              onChange={(e) => updateOption(option.id, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
            />

            <button
              type="button"
              onClick={() => deleteOption(option.id)}
              disabled={field.options.length <= 1}
              title="Delete option"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-500 hover:bg-gray-50"
      >
        <FiPlus size={14} />
        Add option
      </button>
    </div>
  );
};

// -----------------------------------------
// FIELD EDITOR
// -----------------------------------------

const FieldEditor = ({ field, onChange, onDone }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        
        

        {!["radio", "checkbox"].includes(field.type) && (
          <div>
            

             <input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Enter field label"
            className="mb-1.5 block text-xs font-semibold text-gray-600"
          />
            <input
              value={field.placeholder}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              placeholder="Enter placeholder"
              className={INPUT_STYLE}
            />
          </div>
        )}

      </div>

      {needsOptions(field.type) && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3">
          <OptionEditor
            field={field}
            onChange={(options) => onChange({ options })}
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="h-4 w-4 accent-gray-900"
          />
          Required field
        </label>

        <button
          type="button"
          onClick={onDone}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-700"
        >
          <FiCheck size={14} />
          Done
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------
// MAIN PAGE
// -----------------------------------------

const Page = () => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("Form Title");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  const [settings] = useState(initialSettings);
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  // ---------- Banner ----------
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

  const removeBanner = () => {
    setBanner(null);
    setBannerPreview("");
  };

  // ---------- Fields ----------
  const addField = (type) => {
    const newField = createField(type);
    newField.order = fields.length;

    setFields((prev) => [...prev, newField]);
    setSelectedId(newField.id);
  };

  const updateField = (id, changes) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...changes } : field))
    );
  };

  const deleteField = (id) => {
    setFields((prev) =>
      prev
        .filter((field) => field.id !== id)
        .map((field, i) => ({ ...field, order: i }))
    );

    if (selectedId === id) setSelectedId(null);
  };

  // ---------- Save ----------
  const saveForm = async () => {
    if (!title.trim()) {
      toast.error("Please enter form title");
      return;
    }

    if (!banner) {
      toast.error("Please upload a form banner");
      return;
    }

    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }

    const invalidField = fields.find(
      (field) =>
        !field.label.trim() ||
        !field.name.trim() ||
        (needsOptions(field.type) &&
          (field.options.length === 0 ||
            field.options.some((option) => !option.label.trim())))
    );

    if (invalidField) {
      toast.error("Please complete all field labels, names and options");
      setSelectedId(invalidField.id);
      return;
    }

    const names = fields.map((field) => field.name.trim());
    if (new Set(names).size !== names.length) {
      toast.error("Field names must be unique");
      return;
    }

    const preparedFields = fields.map((field, index) => ({
      ...field,
      name: field.name.trim(),
      label: field.label.trim(),
      order: index,
      options: needsOptions(field.type)
        ? field.options.map((option) => ({
            ...option,
            label: option.label.trim(),
          }))
        : [],
    }));

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("fields", JSON.stringify(preparedFields));
      formData.append("settings", JSON.stringify(settings));
      formData.append("status", status);
      formData.append("banner", banner);

      const response = await axios.post(`${base_url}/auth/create`, formData, {
        withCredentials: true,
      });

      const data = response.data;

      if (data.success) {
        dispatch(addFormPage(data.formCreateData));
        toast.success("Form saved successfully!");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4 md:p-7">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Form Builder</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and customize your form
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <button
              type="button"
              onClick={saveForm}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
            >
              <FiSave size={15} />
              {saving ? "Saving..." : "Save form"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="sticky top-3 h-fit rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-800">Add fields</h2>
            <p className="mb-4 mt-1 text-xs text-gray-400">
              Select a field type
            </p>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => addField(type)}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Form Canvas */}
          <main className="min-h-[650px] rounded-xl border border-gray-200 bg-white p-5 md:p-8">
            <div className="mx-auto max-w-2xl">
              {/* Title + description */}
              <div className="mb-6 border-b border-gray-100 pb-6">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Form title"
                  className="w-full border-0 bg-transparent text-2xl font-bold text-gray-800 outline-none"
                />

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setSelectedId(null)}
                  placeholder="Write a short description..."
                  rows={2}
                  className="mt-3 w-full resize-none border-0 bg-transparent text-sm text-gray-500 outline-none"
                />
              </div>

              {/* Banner */}
              <div className="mb-8 border-b border-gray-100 pb-6">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Form banner <span className="text-red-500">*</span>
                  </label>

                  {banner && (
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 size={13} /> Remove
                    </button>
                  )}
                </div>

                {bannerPreview ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={bannerPreview}
                      alt="Form banner preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-10 transition hover:border-gray-400 hover:bg-gray-50">
                    <FiImage className="mb-3 text-3xl text-gray-300" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload banner
                    </span>
                    <span className="mt-1 text-xs text-gray-400">
                      PNG, JPG or WEBP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                )}

                {banner && (
                  <p className="mt-2 text-xs text-green-600">
                    Selected: {banner.name}
                  </p>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {fields.length === 0 && (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-center">
                    <FiPlus className="mb-3 text-3xl text-gray-300" />
                    <p className="font-medium text-gray-700">No fields yet</p>
                    <p className="mt-1 text-sm text-gray-400">
                      Pick a field type from the sidebar
                    </p>
                  </div>
                )}

                {fields.map((field, index) => {
                  const isSelected = selectedId === field.id;

                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedId(field.id)}
                      className={`rounded-xl border p-4 transition ${
                        isSelected
                          ? "border-gray-800 bg-white shadow-sm"
                          : "cursor-pointer border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {/* Field header */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
                            {index + 1}
                          </span>

                          <span className="text-xs font-medium text-gray-400">
                            {capitalize(field.type)}
                          </span>

                          {field.required && (
                            <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-medium text-red-500">
                              Required
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(isSelected ? null : field.id);
                            }}
                            title="Edit field"
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                          >
                            {isSelected ? <FiX size={16} /> : <FiType size={16} />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(field.id);
                            }}
                            title="Delete field"
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Editor / Preview */}
                      {isSelected ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <FieldEditor
                            field={field}
                            onChange={(changes) => updateField(field.id, changes)}
                            onDone={() => setSelectedId(null)}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            {field.label || "Untitled field"}
                            {field.required && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </label>

                          <FieldPreview field={field} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom add field */}
              {fields.length > 0 && (
                <button
                  type="button"
                  onClick={() => addField("text")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition hover:border-gray-500 hover:bg-gray-50 hover:text-gray-800"
                >
                  <FiPlus size={16} />
                  Add another field
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;