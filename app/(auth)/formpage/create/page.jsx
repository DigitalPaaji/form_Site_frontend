
"use client";

import React, { useEffect, useState } from "react";
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
  FiSave,
  FiImage,
  FiX,
  FiClock,
  FiLink,
  FiLock,
  FiMenu,
  FiCopy,
} from "react-icons/fi";

import { GiVerticalBanner } from "react-icons/gi";
import { IoText } from "react-icons/io5";
import { MdOutlineMessage, MdUpdate, MdViewWeek } from "react-icons/md";
import { BsCalendar2MonthFill } from "react-icons/bs";
import { IoIosColorPalette } from "react-icons/io";
import { RxDividerHorizontal } from "react-icons/rx";

// ------------------------------------
// FIELD TYPES
// ------------------------------------

const FIELD_TYPES = [
  { type: "text", label: "Name", icon: FiType },
  { type: "text", label: "Single Line Text", icon: IoText },
  { type: "paragraph", label: "Paragraph", icon: FiAlignLeft },
  { type: "email", label: "Email", icon: FiMail },
  { type: "textarea", label: "Long Answer", icon: MdOutlineMessage },
  { type: "number", label: "Number", icon: FiHash },
  { type: "phone", label: "Phone", icon: FiPhone },
  { type: "date", label: "Date", icon: FiCalendar },
  { type: "time", label: "Time", icon: FiClock },
  { type: "datetime", label: "Date & Time", icon: MdUpdate },
  { type: "month", label: "Month", icon: BsCalendar2MonthFill },
  { type: "week", label: "Week", icon: MdViewWeek },
  { type: "select", label: "Dropdown", icon: FiChevronDown },
  { type: "radio", label: "Multiple Choice", icon: FiCircle },
  { type: "checkbox", label: "Checkboxes", icon: FiCheckSquare },
  { type: "color", label: "Color", icon: IoIosColorPalette },
  { type: "password", label: "Password", icon: FiLock },
  { type: "url", label: "Website URL", icon: FiLink },
  { type: "divider", label: "Divider", icon: RxDividerHorizontal },
];

const OPTIONS_TYPES = ["select", "radio", "checkbox"];

const INPUT =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50";



const createId = () => crypto.randomUUID();

// ------------------------------------
// CREATE FIELD
// ------------------------------------

const createField = (item) => ({
  _key: createId(), // Temporary frontend ID only

  label: item.label,
  type: item.type,
  placeholder:item.label,
  helpText: "",
  required: false,
  disabled: false,
  readOnly: false,

  options: OPTIONS_TYPES.includes(item.type)
    ? ["Option 1", "Option 2"]
    : [],
});

// ------------------------------------
// MAIN PAGE
// ------------------------------------

const Page = () => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("Form Title");
  const [description, setDescription] = useState("");

  const [fields, setFields] = useState([]);

  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [showBanner, setShowBanner] = useState(false);


  const [status, setStatus] = useState("published");
  const [saving, setSaving] = useState(false);

  // DRAG STATE
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // ------------------------------------
  // BANNER CLEANUP
  // ------------------------------------

  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  // ------------------------------------
  // ADD FIELD
  // ------------------------------------

  const addField = (item) => {
    const newField = createField(item);

    setFields((prev) => [...prev, newField]);
  };

  // ------------------------------------
  // UPDATE FIELD
  // ------------------------------------

  const updateField = (id, changes) => {
    setFields((prev) =>
      prev.map((field) =>
        field._key === id
          ? { ...field, ...changes }
          : field
      )
    );
  };

  // ------------------------------------
  // UPDATE OPTION
  // ------------------------------------

  const updateOption = (fieldId, index, value) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field._key !== fieldId) return field;

        const options = [...field.options];
        options[index] = value;

        return { ...field, options };
      })
    );
  };

  // ------------------------------------
  // ADD OPTION
  // ------------------------------------

  const addOption = (fieldId) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field._key !== fieldId) return field;

        return {
          ...field,
          options: [
            ...field.options,
            `Option ${field.options.length + 1}`,
          ],
        };
      })
    );
  };

  // ------------------------------------
  // DELETE OPTION
  // ------------------------------------

  const deleteOption = (fieldId, index) => {
    setFields((prev) =>
      prev.map((field) =>
        field._key === fieldId
          ? {
              ...field,
              options: field.options.filter(
                (_, i) => i !== index
              ),
            }
          : field
      )
    );
  };

  // ------------------------------------
  // DELETE FIELD
  // ------------------------------------

  const deleteField = (id) => {
    setFields((prev) =>
      prev.filter((field) => field._key !== id)
    );
  };

  // ------------------------------------
  // DUPLICATE FIELD
  // ------------------------------------

  const duplicateField = (field) => {
    setFields((prev) => {
      const copy = {
        ...field,
        _key: createId(),
        options: [...field.options],
      };

      const index = prev.findIndex(
        (item) => item._key === field._key
      );

      const updated = [...prev];
      updated.splice(index + 1, 0, copy);

      return updated;
    });
  };

  // ------------------------------------
  // DRAG AND DROP
  // ------------------------------------

  const handleDragStart = (e, id) => {
    setDraggingId(id);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();

    if (draggingId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();

    const sourceId =
      draggingId || e.dataTransfer.getData("text/plain");

    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    setFields((prev) => {
      const updated = [...prev];

      const sourceIndex = updated.findIndex(
        (field) => field._key === sourceId
      );

      const targetIndex = updated.findIndex(
        (field) => field._key === targetId
      );

      if (sourceIndex === -1 || targetIndex === -1) {
        return prev;
      }

      const [movedField] = updated.splice(sourceIndex, 1);

      updated.splice(targetIndex, 0, movedField);

      return updated;
    });

    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  // ------------------------------------
  // BANNER
  // ------------------------------------

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      e.target.value = "";
      return;
    }

    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
    setShowBanner(true);

    e.target.value = "";
  };

  const removeBanner = () => {
    setBanner(null);
    setBannerPreview("");
  };

  // ------------------------------------
  // FIELD PREVIEW
  // ------------------------------------

  const renderFieldInput = (field) => {
    switch (field.type) {
      case "paragraph":
        return (
          <p className="text-sm leading-6 text-gray-600">
            {field.label}
          </p>
        );

      case "divider":
        return <hr className="border-gray-200" />;

      case "textarea":
        return (
          <textarea
            disabled
            rows={4}
            placeholder={field.placeholder || "Enter your answer"}
            className={`${INPUT} resize-none`}
          />
        );

      case "select":
        return (
          <select disabled className={INPUT}>
            <option>
              {field.placeholder || "Select an option"}
            </option>

            {field.options.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );

      case "radio":
      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 text-sm text-gray-600"
              >
                <input
                  disabled
                  type={field.type}
                  name={`preview_${field._key}`}
                  className="h-4 w-4 accent-blue-600"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case "datetime":
        return (
          <input
            type="datetime-local"
            disabled
            className={INPUT}
          />
        );

      default: {
        const inputType =
          field.type === "phone"
            ? "tel"
            : field.type;

        return (
          <input
            type={inputType}
            disabled
            placeholder={field.placeholder || "Enter your answer"}
            className={INPUT}
          />
        );
      }
    }
  };

  // ------------------------------------
  // SAVE FORM
  // ------------------------------------

  const saveForm = async () => {
    if (saving) return;

    if (!title.trim()) {
      toast.error("Please enter form title");
      return;
    }

    if (!fields.length) {
      toast.error("Please add at least one field");
      return;
    }

    const invalidField = fields.find(
      (field) =>
        !field.label.trim() ||
        (
          OPTIONS_TYPES.includes(field.type) &&
          (
            !field.options.length ||
            field.options.some(
              (option) => !option.trim()
            )
          )
        )
    );

    if (invalidField) {
      toast.error("Please complete all questions and options");
      return;
    }

    // Only send fields supported by Mongoose schema

    const preparedFields = fields.map((field) => ({
      label: field.label.trim(),
      type: field.type,
      placeholder: field.placeholder.trim(),
      helpText: field.helpText.trim(),
      required: field.required,
      disabled: field.disabled,
      readOnly: field.readOnly,

      options: OPTIONS_TYPES.includes(field.type)
        ? field.options.map((option) => option.trim())
        : [],
    }));

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("fields", JSON.stringify(preparedFields));
  
      formData.append("status", status);

      if (banner) {
        formData.append("banner", banner);
      }

      const response = await axios.post(
        `${base_url}/auth/create`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        dispatch(addFormPage(response.data.formCreateData));
        toast.success("Form saved successfully!");
      } else {
        toast.error(
          response.data?.message || "Something went wrong"
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Unable to save form"
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------
  // RENDER
  // ------------------------------------

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4 md:p-7">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Form Builder
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create your form with simple drag and drop
            </p>
          </div>

          <div className="flex items-center gap-2">

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <button
              type="button"
              onClick={saveForm}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <FiSave size={16} />
              {saving ? "Saving..." : "Save form"}
            </button>

          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[450px_minmax(0,1fr)]">

      

          <aside className="h-fit rounded-xl border border-gray-400 bg-gray-300 p-4 lg:sticky lg:top-4">

            <h2 className="font-semibold text-gray-800">
              Add a question
            </h2>

            <p className="mb-4 mt-1 text-xs text-gray-700">
              Select a field to add to your form
            </p>

            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() => setShowBanner(true)}
                className="  cursor-pointer col-span-2 flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3 text-left hover:border-blue-600 hover:bg-blue-200"
              >
                <GiVerticalBanner size={19} />

                <span className="text-sm font-medium">
                  Add Banner
                </span>
              </button>

              {FIELD_TYPES.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={`${item.type}-${item.label}-${index}`}
                    type="button"
                    onClick={() => addField(item)}
                    className=" cursor-pointer flex items-center bg-white gap-2 rounded-lg border border-gray-100 p-3 text-left transition hover:border-blue-600 hover:bg-blue-200"
                  >
                    <Icon
                      size={17}
                      className="shrink-0 text-gray-500"
                    />

                    <span className="text-xs font-medium text-gray-700">
                      {item.label}
                    </span>
                  </button>
                );
              })}

            </div>

          </aside>

          {/* FORM AREA */}

          <main className="min-h-[650px] rounded-xl border border-gray-200 bg-white/40 p-5 md:p-8 shadow-2xl ">

            <div className="mx-auto max-w-2xl " >

              {/* FORM TITLE */}

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
                  placeholder="Write a short description..."
                  rows={2}
                  className="mt-3 w-full resize-none border-0 bg-transparent text-sm text-gray-500 outline-none"
                />

              </div>

              {/* BANNER */}

              {showBanner && (

                <div className="mb-7 border-b border-gray-100 pb-6 ">

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-sm font-semibold text-gray-700">
                      Form banner
                    </p>

                    <div className="flex items-center gap-3">

                      {banner && (
                        <button
                          type="button"
                          onClick={removeBanner}
                          className="text-xs text-red-500"
                        >
                          Remove
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowBanner(false)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiX size={18} />
                      </button>

                    </div>
                  </div>

                  {bannerPreview ? (

                    <img
                      src={bannerPreview}
                      alt="Form banner"
                      className="h-48 w-full rounded-xl object-cover"
                    />

                  ) : (

                    <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-200 py-10 hover:bg-gray-50">

                      <FiImage
                        size={28}
                        className="mb-3 text-gray-400"
                      />

                      <span className="text-sm font-medium">
                        Upload banner image
                      </span>

                      <span className="mt-1 text-xs text-gray-400">
                        PNG, JPG or WEBP · Maximum 5MB
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />

                    </label>

                  )}

                </div>

              )}

              {/* QUESTIONS */}

              <div className="space-y-4">

                {fields.length === 0 && (

                  <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-center">

                    <FiPlus
                      size={30}
                      className="mb-3 text-gray-300"
                    />

                    <p className="font-medium text-gray-700">
                      No questions added
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Choose a question type from the sidebar
                    </p>

                  </div>

                )}

                {fields.map((field, index) => (

                  <div
                    key={field._key}
                    onDragOver={(e) =>
                      handleDragOver(e, field._key)
                    }
                    onDrop={(e) =>
                      handleDrop(e, field._key)
                    }
                    className={`rounded-xl border bg-white p-4 transition-all ${
                      draggingId === field._key
                        ? "scale-[0.98] border-blue-400 opacity-40"
                        : dragOverId === field._key
                        ? "border-blue-500 border-dashed bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >

                    {/* QUESTION HEADER */}

                    <div className="mb-3 flex items-start gap-3">

                      {/* DRAG HANDLE */}

                      <div
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, field._key)
                        }
                        onDragEnd={handleDragEnd}
                        className="mt-1 cursor-grab touch-none rounded-md p-1 text-gray-400 hover:bg-gray-100 active:cursor-grabbing"
                        title="Drag to reorder"
                      >
                        <FiMenu size={19} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="mb-1 flex items-center gap-2">

                          <span className="text-xs font-medium text-gray-400">
                            QUESTION {index + 1}
                          </span>

                          <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                            {field.type}
                          </span>

                        </div>

                        {/* LABEL */}
<div className="flex">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            updateField(field._key, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Enter question"
                          className="w-auto min-w-[20px]  field-sizing-content border-0 bg-transparent p-1 text-base font-semibold text-gray-800 outline-none focus:bg-gray-50"
                        />
                        {field.required && <span className="text-red-700">*</span> }
   
   </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex items-center gap-1">

                        <button
                          type="button"
                          onClick={() => duplicateField(field)}
                          title="Duplicate question"
                          className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <FiCopy size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteField(field._key)}
                          title="Delete question"
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <FiTrash2 size={16} />
                        </button>

                      </div>

                    </div>

                    {/* PARAGRAPH / DIVIDER */}

                    {/* {field.type === "paragraph" && (

                      <div className="mb-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-400">
                          Paragraph text
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {field.label}
                        </p>
                      </div>

                    )} */}

                    {field.type === "divider" && (

                      <div className="mb-4 py-3">
                        <hr className="border-gray-300" />
                      </div>

                    )}

                    {/* PLACEHOLDER */}

                    {!OPTIONS_TYPES.includes(field.type) &&
                      !["date", "time", "datetime", "month", "week", "color", "divider"].includes(field.type) && (

                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) =>
                            updateField(field._key, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="Placeholder (optional)"
                          className="mb-3 w-full text-gray-600/80 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                        />

                      )}

                    {/* PREVIEW */}

                    {!["password","url","paragraph", "divider","text","email","textarea","number","phone","select","radio","checkbox"].includes(field.type) && (

                      <div className="mb-4">
                        {renderFieldInput(field)}
                      </div>

                    )}

                    {/* OPTIONS EDITOR */}

                    {OPTIONS_TYPES.includes(field.type) && (

                      <div className="mb-4 rounded-lg bg-gray-50 p-3">

                        <div className="mb-3 flex items-center justify-between">

                          <p className="text-xs font-semibold text-gray-600">
                            {field.type === "select"
                              ? "Dropdown options"
                              : field.type === "radio"
                              ? "Answer choices"
                              : "Checkbox choices"}
                          </p>

                          <span className="text-xs text-gray-400">
                            {field.options.length} choices
                          </span>

                        </div>

                        <div className="space-y-2">

                          {field.options.map((option, optionIndex) => (

                            <div
                              key={optionIndex}
                              className="flex items-center gap-2"
                            >

                              {field.type === "radio" && (
                                <FiCircle
                                  size={15}
                                  className="text-gray-400"
                                />
                              )}

                              {field.type === "checkbox" && (
                                <FiCheckSquare
                                  size={15}
                                  className="text-gray-400"
                                />
                              )}

                              {field.type === "select" && (
                                <span className="w-4 text-xs text-gray-400">
                                  {optionIndex + 1}.
                                </span>
                              )}

                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateOption(
                                    field._key,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${optionIndex + 1}`}
                                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  deleteOption(
                                    field._key,
                                    optionIndex
                                  )
                                }
                                disabled={field.options.length <= 1}
                                title="Delete option"
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                              >
                                <FiTrash2 size={15} />
                              </button>

                            </div>

                          ))}

                        </div>

                        <button
                          type="button"
                          onClick={() => addOption(field._key)}
                          className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <FiPlus size={15} />
                          Add another option
                        </button>

                      </div>

                    )}

                 

                    <div className="flex items-center justify- gap-7 border-t border-gray-100 pt-3">

                      <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-600">

                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateField(field._key, {
                              required: e.target.checked,
                            })
                          }
                          className="h-4 w-4 accent-blue-600"
                        />

                        Required question

                      </label>

 <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-600">

                        <input
                          type="checkbox"
                          checked={field.disabled}
                          onChange={(e) =>
                            updateField(field._key, {
                              disabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 accent-blue-600"
                        />

                        disabled question

                      </label>


                    </div>

                  </div>

                ))}

              </div>

              {/* BOTTOM ADD BUTTON */}

              {fields.length > 0 && (

                <div className="mt-7 border-t border-gray-100 pt-5 flex items-center justify-center w-full ">
  <button
              type="button"
              onClick={saveForm}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <FiSave size={16} />
              {saving ? "Saving..." : "Save form"}
            </button>
                 

                </div>

              )}

              {/* DRAG HELP */}

              {fields.length > 1 && (
                <p className="mt-5 text-center text-xs text-gray-400">
                  <FiMenu className="mr-1 inline" size={13} />
                  Drag the handle beside a question to change its order.
                </p>
              )}

            </div>

          </main>

        </div>

      </div>

    </div>
  );
};

export default Page;
