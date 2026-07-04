import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { rulesService } from "../services/rulesService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "../utils/studentUtils";

const emptyForm = {
  title: "",
  category: "General",
  description: "",
  effectiveDate: "",
  attachmentUrl: "",
};

const RulesRegulations = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const isAdmin = userRole === "admin";
  const canManage = userRole === "admin" || userRole === "teacher" || userRole === "employee";
  const isStudent = userRole === "student";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadRules = useCallback(async () => {
    const data = await rulesService.getRules();
    setRules(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await loadRules();
      } catch (err) {
        if (active) setError(err.message || "Failed to load rules");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [loadRules]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim() || "General",
        description: formData.description.trim(),
        effectiveDate: formData.effectiveDate,
        attachmentUrl: formData.attachmentUrl.trim() || null,
      };

      if (editingId) {
        await rulesService.updateRule(editingId, payload);
        setSuccess("Rule updated successfully");
      } else {
        await rulesService.createRule(payload);
        setSuccess("Rule created successfully");
      }

      resetForm();
      await loadRules();
    } catch (err) {
      setError(err.message || "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingId(rule.id);
    setFormData({
      title: rule.title || "",
      category: rule.category || "General",
      description: rule.description || "",
      effectiveDate: rule.effectiveDate
        ? String(rule.effectiveDate).slice(0, 10)
        : "",
      attachmentUrl: rule.attachmentUrl || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (rule) => {
    if (!window.confirm(`Delete rule "${rule.title}"?`)) return;
    try {
      setError("");
      await rulesService.deleteRule(rule.id);
      setSuccess("Rule deleted successfully");
      await loadRules();
    } catch (err) {
      setError(err.message || "Failed to delete rule");
    }
  };

  const handleToggleStatus = async (rule) => {
    const nextStatus = rule.status === "published" ? "draft" : "published";
    try {
      setError("");
      await rulesService.setRuleStatus(rule.id, nextStatus);
      setSuccess(
        nextStatus === "published" ? "Rule published" : "Rule unpublished"
      );
      await loadRules();
    } catch (err) {
      setError(err.message || "Failed to update rule status");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner message="Loading rules..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rules & Regulations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isStudent
              ? "View published school rules and regulations."
              : "Create and manage school rules and regulations."}
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Rule
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      ) : null}

      {showForm && canManage ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingId ? "Edit Rule" : "Create Rule"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Effective Date</label>
              <input
                type="date"
                required
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Attachment URL (optional)
              </label>
              <input
                type="url"
                value={formData.attachmentUrl}
                onChange={(e) =>
                  setFormData({ ...formData, attachmentUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Rule" : "Create Rule"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rules.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center text-gray-500">
            No rules found.
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {rule.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {rule.category}
                    </span>
                    {!isStudent ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          rule.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {rule.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Effective: {formatDate(rule.effectiveDate)}
                    {rule.createdByName ? ` · By ${rule.createdByName}` : ""}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rule)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(rule)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title={rule.status === "published" ? "Unpublish" : "Publish"}
                      >
                        {rule.status === "published" ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-wrap">
                {rule.description}
              </p>
              {rule.attachmentUrl ? (
                <a
                  href={rule.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                >
                  View Attachment
                </a>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RulesRegulations;
