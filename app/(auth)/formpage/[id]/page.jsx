
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  UpdateFormPage,
} from "@/components/store/clientsSlice";
import { base_url, img_url } from "@/components/utils";
import { useParams, useRouter } from "next/navigation";

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
  FiUploadCloud,
  FiArrowLeft,
  FiCopy,
  FiShare2,
} from "react-icons/fi";

// --------------------------------------
// FIELD TYPES
// --------------------------------------

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

const INITIAL_SETTINGS = {
  columns: 12,
  backgroundColor: "#ffffff",
  formWidth: 700,
  formAlignment: "center",
  submitButtonText: "Submit",
  submitButtonColor: "#2563eb",
  successMessage: "Form submitted successfully!",
};

const capitalize = (text = "") =>
  text.charAt(0).toUpperCase() + text.slice(1);

const createId = () => crypto.randomUUID();

const needsOptions = (type) =>
  ["select", "radio", "checkbox"].includes(type);

const createOptionValue = (label) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

// --------------------------------------
// NORMALIZE EXISTING FIELD
// --------------------------------------

const normalizeField = (field, index) => {
  const fieldId =
    field.fieldId || field._id || field.id || createId();

  return {
    ...field,

    id: fieldId,
    fieldId,

    name: field.name || `field_${index + 1}`,
    label: field.label || "Untitled field",
    type: field.type || "text",

    placeholder: field.placeholder || "",
    defaultValue: field.defaultValue || "",
    helpText: field.helpText || "",

    required: Boolean(field.required),
    disabled: Boolean(field.disabled),
    readOnly: Boolean(field.readOnly),

    options: (field.options || []).map((option) => ({
      ...option,
      id: option.id || createId(),
      label: option.label || "",
      value: option.value || createOptionValue(option.label || ""),
    })),

    validation: {
      min: "",
      max: "",
      minLength: "",
      maxLength: "",
      accept: "",
      multiple: false,
      ...field.validation,
    },

    size: {
      width: 12,
      height: 44,
      unit: "px",
      rows: 4,
      ...field.size,
    },

    style: {
      backgroundColor: "#ffffff",
      textColor: "#111827",
      borderColor: "#d1d5db",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: "normal",
      alignment: "left",
      ...field.style,
    },

    order: field.order ?? index,
  };
};

// --------------------------------------
// CREATE NEW FIELD
// --------------------------------------

const createField = (type, index) => {
  const id = createId();

  return normalizeField(
    {
      id,
      fieldId: id,
      name: `field_${Date.now()}`,
      type,
      label: `${capitalize(type)} field`,
      placeholder: needsOptions(type)
        ? "Select an option"
        : `Enter ${type}...`,
      defaultValue: "",
      helpText: "",
      required: false,
      disabled: false,
      readOnly: false,

      options: needsOptions(type)
        ? [
            {
              id: createId(),
              label: "Option 1",
              value: "option_1",
            },
            {
              id: createId(),
              label: "Option 2",
              value: "option_2",
            },
          ]
        : [],

      order: index,
    },
    index
  );
};

// --------------------------------------
// FIELD PREVIEW
// --------------------------------------

const FieldPreview = ({ field }) => {
  const commonStyle = {
    backgroundColor: field.style?.backgroundColor,
    color: field.style?.textColor,
    borderColor: field.style?.borderColor,
    borderRadius: `${field.style?.borderRadius || 8}px`,
    fontSize: `${field.style?.fontSize || 14}px`,
    textAlign: field.style?.alignment || "left",
    height:
      field.type === "textarea"
        ? "auto"
        : `${field.size?.height || 44}${field.size?.unit || "px"}`,
  };

  if (field.type === "textarea") {
    return (
      <textarea
        disabled
        placeholder={field.placeholder}
        rows={field.size?.rows || 4}
        style={commonStyle}
        className={`${INPUT_STYLE} min-h-24`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        disabled
        className={INPUT_STYLE}
        style={commonStyle}
        defaultValue=""
      >
        <option value="">
          {field.placeholder || "Select an option"}
        </option>

        {(field.options || []).map((option) => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio" || field.type === "checkbox") {
    return (
      <div className="space-y-3">
        {(field.options || []).map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-3 text-sm text-gray-600"
          >
            <input
              disabled
              type={field.type}
              name={`preview-${field.fieldId}`}
              className="h-4 w-4 accent-gray-900"
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  return (
    <input
      disabled
      type={field.type === "phone" ? "tel" : field.type}
      placeholder={field.placeholder}
      style={commonStyle}
      className={INPUT_STYLE}
    />
  );
};

// --------------------------------------
// OPTION EDITOR
// --------------------------------------

const OptionEditor = ({ field, onChange }) => {
  const addOption = () => {
    const number = field.options.length + 1;
    const label = `Option ${number}`;

    onChange([
      ...field.options,
      {
        id: createId(),
        label,
        value: `option_${number}_${createId().slice(0, 5)}`,
      },
    ]);
  };

  const updateOption = (id, label) => {
    onChange(
      field.options.map((option) =>
        option.id === id
          ? {
              ...option,
              label,
              value:
                createOptionValue(label) ||
                option.value,
            }
          : option
      )
    );
  };

  const deleteOption = (id) => {
    if (field.options.length <= 1) {
      toast.error("At least one option is required");
      return;
    }

    onChange(
      field.options.filter((option) => option.id !== id)
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">
            Options
          </h4>
          <p className="mt-0.5 text-xs text-gray-400">
            Manage available choices
          </p>
        </div>

        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500">
          {field.options.length} options
        </span>
      </div>

      <div className="space-y-2">
        {field.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <span className="w-5 text-center text-xs text-gray-400">
              {index + 1}.
            </span>

            <input
              value={option.label}
              onChange={(e) =>
                updateOption(option.id, e.target.value)
              }
              placeholder={`Option ${index + 1}`}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />

            <button
              type="button"
              onClick={() => deleteOption(option.id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
      >
        <FiPlus size={14} />
        Add option
      </button>
    </div>
  );
};

// --------------------------------------
// INLINE FIELD EDITOR
// --------------------------------------

const FieldEditor = ({ field, onChange, onDone }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
     


        {!["radio", "checkbox"].includes(field.type) && (
          <div>
            <input
            value={field.label}
            onChange={(e) =>
              onChange({ label: e.target.value })
            }
            placeholder="Enter field label"
            className="mb-1.5 block text-xs font-semibold text-gray-600"
          />

            <input
              value={field.placeholder}
              onChange={(e) =>
                onChange({ placeholder: e.target.value })
              }
              placeholder="Enter placeholder"
              className={INPUT_STYLE}
            />
          </div>
        )}

        {/* <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Help Text
          </label>

          <input
            value={field.helpText}
            onChange={(e) =>
              onChange({ helpText: e.target.value })
            }
            placeholder="Optional help text"
            className={INPUT_STYLE}
          />
        </div> */}
      </div>

      {needsOptions(field.type) && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3">
          <OptionEditor
            field={field}
            onChange={(options) => onChange({ options })}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                onChange({ required: e.target.checked })
              }
              className="h-4 w-4 accent-gray-900"
            />
            Required
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={field.disabled}
              onChange={(e) =>
                onChange({ disabled: e.target.checked })
              }
              className="h-4 w-4 accent-gray-900"
            />
            Disabled
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={field.readOnly}
              onChange={(e) =>
                onChange({ readOnly: e.target.checked })
              }
              className="h-4 w-4 accent-gray-900"
            />
            Read only
          </label>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700"
        >
          <FiCheck size={14} />
          Done
        </button>
      </div>
    </div>
  );
};

// --------------------------------------
// MAIN PAGE
// --------------------------------------

export default function Page() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");

  const [fields, setFields] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [status, setStatus] = useState("draft");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageNot, setPageNot] = useState(false);

  // Banner
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [existingBanner, setExistingBanner] = useState("");
  const [removeExistingBanner, setRemoveExistingBanner] =
    useState(false);

  // --------------------------------------
  // BANNER URL
  // --------------------------------------

  const getBannerUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    return `${img_url.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  };

  // --------------------------------------
  // FETCH EXISTING FORM
  // --------------------------------------

  const fetchData = async () => {
    try {
      setLoading(true);
      setPageNot(false);

      const response = await axios.get(
        `${base_url}/auth/get/${id}`,
        { withCredentials: true }
      );

      const data = response.data;

      if (!data.success || !data.formPage) {
        setPageNot(true);
        return;
      }

      const form = data.formPage;

      setTitle(form.title || "Untitled Form");
      setDescription(form.description || "");
      setSlug(form.slug || "");

      setFields(
        (form.fields || []).map((field, index) =>
          normalizeField(field, index)
        )
      );

      setSettings({
        ...INITIAL_SETTINGS,
        ...(form.settings || {}),
      });

      setStatus(form.status || "draft");

      setExistingBanner(form.bannerImage || "");
      setBanner(null);
      setBannerPreview("");
      setRemoveExistingBanner(false);

      setSelectedId(null);
    } catch (error) {
      console.error(error);
      setPageNot(true);
      toast.error(
        error?.response?.data?.message || "Unable to load form"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // --------------------------------------
  // BANNER HANDLERS
  // --------------------------------------

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner size must be less than 5MB");
      e.target.value = "";
      return;
    }

    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
    setRemoveExistingBanner(false);

    e.target.value = "";
  };

  const removeBanner = () => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBanner(null);
    setBannerPreview("");
    setRemoveExistingBanner(true);
  };

  const undoBannerChange = () => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBanner(null);
    setBannerPreview("");
    setRemoveExistingBanner(false);
  };

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  const displayedBanner = bannerPreview
    ? bannerPreview
    : !removeExistingBanner && existingBanner
      ? getBannerUrl(existingBanner)
      : "";

  // --------------------------------------
  // FIELD HANDLERS
  // --------------------------------------

  const addField = (type) => {
    const newField = createField(type, fields.length);

    setFields((prev) => [...prev, newField]);
    setSelectedId(newField.fieldId);
  };

  const updateField = (fieldId, changes) => {
    setFields((prev) =>
      prev.map((field) =>
        field.fieldId === fieldId
          ? { ...field, ...changes }
          : field
      )
    );
  };

  const deleteField = (fieldId) => {
    setFields((prev) =>
      prev
        .filter((field) => field.fieldId !== fieldId)
        .map((field, index) => ({
          ...field,
          order: index,
        }))
    );

    if (selectedId === fieldId) {
      setSelectedId(null);
    }
  };

  const changeFieldType = (fieldId, type) => {
    const newField = createField(type, fields.length);

    setFields((prev) =>
      prev.map((field) =>
        field.fieldId === fieldId
          ? {
              ...field,
              type,
              options: newField.options,
              placeholder: newField.placeholder,
            }
          : field
      )
    );
  };

  // --------------------------------------
  // SAVE / UPDATE FORM
  // --------------------------------------

  const saveForm = async () => {
    if (!title.trim()) {
      toast.error("Please enter form title");
      return;
    }

    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }

    const invalidField = fields.find(
      (field) =>
        !field.label?.trim() ||
        !field.name?.trim() ||
        (
          needsOptions(field.type) &&
          (
            field.options.length === 0 ||
            field.options.some(
              (option) => !option.label?.trim()
            )
          )
        )
    );

    if (invalidField) {
      toast.error("Please complete all field labels, names and options");
      setSelectedId(invalidField.fieldId);
      return;
    }

    const names = fields.map((field) => field.name.trim());

    if (new Set(names).size !== names.length) {
      toast.error("Field names must be unique");
      return;
    }

    // Existing banner is allowed if user hasn't removed it.
    if (!banner && !existingBanner && !removeExistingBanner) {
      toast.error("Please upload a form banner");
      return;
    }

    const preparedFields = fields.map((field, index) => ({
      ...field,
      id: field.fieldId,
      fieldId: field.fieldId,
      name: field.name.trim(),
      label: field.label.trim(),
      order: index,

      options: needsOptions(field.type)
        ? field.options.map((option) => ({
            ...option,
            label: option.label.trim(),
            value: option.value.trim(),
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

      if (banner) {
        formData.append("banner", banner);
      }

      formData.append(
        "removeBanner",
        String(removeExistingBanner)
      );

      // IMPORTANT: Update existing form, don't create a new one.
      const response = await axios.put(
        `${base_url}/auth/updated/${id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      if (!data.success) {
        toast.error(data.message || "Unable to update form");
        return;
      }

      toast.success("Form updated successfully!");

      if (data.formCreateData) {
        dispatch(UpdateFormPage(data.formCreateData));
      }

      // Refresh saved banner state
      if (data.formCreateData?.bannerImage !== undefined) {
        setExistingBanner(data.formCreateData.bannerImage || "");
      } else if (banner || removeExistingBanner) {
        await fetchData();
      }

      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }

      setBanner(null);
      setBannerPreview("");
      setRemoveExistingBanner(false);

    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        "Unable to update form"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------
  // COPY / SHARE FORM LINK
  // --------------------------------------

  const formUrl =
    typeof window !== "undefined" && slug
      ? `${window.location.origin}/forms/${slug}`
      : "";

  const copyFormLink = async () => {
    if (!formUrl) {
      toast.error("Form link is not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(formUrl);
      toast.success("Form link copied!");
    } catch {
      toast.error("Unable to copy form link");
    }
  };

  const shareForm = async () => {
    if (!formUrl) {
      toast.error("Form link is not available");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description || "Please fill out this form.",
          url: formUrl,
        });
      } else {
        await copyFormLink();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Unable to share form");
      }
    }
  };

  // --------------------------------------
  // LOADING / NOT FOUND
  // --------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">
            Loading form...
          </p>
        </div>
      </div>
    );
  }

  if (pageNot) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">
          Form not found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          This form may have been deleted or you don't have access.
        </p>

        <button
          onClick={() => router.back()}
          className="mt-5 rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --------------------------------------
  // MAIN UI
  // --------------------------------------

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4 md:p-7">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-100"
            >
              <FiArrowLeft />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Form
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update your form and manage its fields
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              type="button"
              onClick={copyFormLink}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiCopy />
              Copy Link
            </button>

            <button
              type="button"
              onClick={shareForm}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiShare2 />
              Share
            </button>

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
              {saving ? "Updating..." : "Update Form"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">

          {/* LEFT SIDEBAR */}

          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 lg:sticky lg:top-4">

            <h2 className="font-semibold text-gray-800">
              Add fields
            </h2>

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

          {/* FORM CANVAS */}

          <main className="min-h-[650px] min-w-0 rounded-xl border border-gray-200 bg-white p-5 md:p-8">

            <div className="mx-auto max-w-2xl">

              {/* TITLE */}

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

              {/* BANNER */}

              <div className="mb-8 border-b border-gray-100 pb-6">

                <div className="mb-3 flex items-center justify-between">

                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Form banner
                    </label>

                    <p className="mt-1 text-xs text-gray-400">
                      JPG, PNG or WEBP · Maximum 5MB
                    </p>
                  </div>

                  {displayedBanner && (
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 size={13} />
                      Remove
                    </button>
                  )}

                </div>

                {displayedBanner ? (
                  <div className="relative overflow-hidden rounded-xl border border-gray-200">

                    <img
                      src={displayedBanner}
                      alt="Form banner"
                      className="h-48 w-full object-cover"
                    />

                    <label className="absolute right-3 top-3 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-md hover:bg-gray-100">
                      <FiUploadCloud />
                      Replace

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />
                    </label>

                    {bannerPreview && (
                      <span className="absolute bottom-3 left-3 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                        New image selected
                      </span>
                    )}

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

                {(banner || removeExistingBanner) && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">

                    <p className="text-xs text-blue-700">
                      {banner
                        ? "New banner will be uploaded when you save."
                        : "Banner will be removed when you save."}
                    </p>

                    <button
                      type="button"
                      onClick={undoBannerChange}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Undo
                    </button>

                  </div>
                )}

              </div>

              {/* FIELDS */}

              <div className="space-y-4">

                {fields.length === 0 && (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-center">

                    <FiPlus className="mb-3 text-3xl text-gray-300" />

                    <p className="font-medium text-gray-700">
                      No fields yet
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Pick a field type from the sidebar
                    </p>

                  </div>
                )}

                {fields.map((field, index) => {
                  const isSelected =
                    selectedId === field.fieldId;

                  return (
                    <div
                      key={field.fieldId}
                      onClick={() =>
                        setSelectedId(field.fieldId)
                      }
                      className={`rounded-xl border p-4 transition ${
                        isSelected
                          ? "border-gray-800 bg-white shadow-sm"
                          : "cursor-pointer border-gray-200 hover:border-gray-400"
                      }`}
                    >

                      {/* FIELD HEADER */}

                      <div className="mb-4 flex items-center justify-between">

                        <div className="flex flex-wrap items-center gap-2">

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
                              setSelectedId(
                                isSelected ? null : field.fieldId
                              );
                            }}
                            title="Edit field"
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                          >
                            {isSelected
                              ? <FiX size={16} />
                              : <FiType size={16} />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(field.fieldId);
                            }}
                            title="Delete field"
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <FiTrash2 size={16} />
                          </button>

                        </div>

                      </div>

                      {/* FIELD TYPE SELECT */}

                      {isSelected && (
                        <div
                          className="mb-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                            Field Type
                          </label>

                          <select
                            value={field.type}
                            onChange={(e) =>
                              changeFieldType(
                                field.fieldId,
                                e.target.value
                              )
                            }
                            className={INPUT_STYLE}
                          >
                            {FIELD_TYPES.map((item) => (
                              <option
                                key={item.type}
                                value={item.type}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* EDITOR / PREVIEW */}

                      {isSelected ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <FieldEditor
                            field={field}
                            onChange={(changes) =>
                              updateField(field.fieldId, changes)
                            }
                            onDone={() => setSelectedId(null)}
                          />
                        </div>
                      ) : (
                        <div>

                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            {field.label || "Untitled field"}

                            {field.required && (
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            )}
                          </label>

                          <FieldPreview field={field} />

                          {field.helpText && (
                            <p className="mt-2 text-xs text-gray-400">
                              {field.helpText}
                            </p>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>

              {/* ADD ANOTHER FIELD */}

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

              {/* FOOTER */}

              <div className="mt-8 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  disabled
                  style={{
                    backgroundColor: settings.submitButtonColor,
                  }}
                  className="rounded-lg px-7 py-3 text-sm font-semibold text-white opacity-80"
                >
                  {settings.submitButtonText}
                </button>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
