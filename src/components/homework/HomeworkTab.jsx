import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { homeworkService } from "../../services/homeworkService";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const initialForm = {
  className: "",
  section: "",
  assignedDate: "",
  completionDate: "",
  homeworkText: "",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const HomeworkTab = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const canManageHomework = userRole === "admin" || userRole === "teacher";

  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [homeworkList, setHomeworkList] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [classSectionCombinations, setClassSectionCombinations] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingHomeworkId, setEditingHomeworkId] = useState(null);

  const loadHomework = useCallback(async () => {
    const response = await homeworkService.getHomework();
    setHomeworkList(Array.isArray(response?.data) ? response.data : []);
  }, []);

  const loadMasters = useCallback(async () => {
    const response = await homeworkService.getHomeworkMasters();
    const data = response?.data || {};
    setClassOptions(Array.isArray(data.classes) ? data.classes : []);
    setClassSectionCombinations(
      Array.isArray(data.combinations) ? data.combinations : []
    );
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        setError("");
        const requests = [loadHomework()];
        if (canManageHomework) requests.push(loadMasters());
        await Promise.all(requests);
      } catch (err) {
        if (active) setError(err.message || "Unable to load homework data.");
      } finally {
        if (active) setInitialLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, [canManageHomework, loadHomework, loadMasters]);

  const refreshList = async () => {
    try {
      setListLoading(true);
      await loadHomework();
    } catch (err) {
      setError(err.message || "Unable to refresh homework list.");
    } finally {
      setListLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "className") {
      setFormData((prev) => ({ ...prev, className: value, section: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingHomeworkId(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    if (new Date(formData.completionDate) < new Date(formData.assignedDate)) {
      setError("Completion date cannot be before homework given date.");
      return;
    }

    try {
      setSaving(true);
      if (editingHomeworkId) {
        await homeworkService.updateHomework(editingHomeworkId, formData);
        setSuccess("Homework updated successfully.");
      } else {
        await homeworkService.createHomework(formData);
        setSuccess("Homework added successfully.");
      }
      resetForm();
      await refreshList();
    } catch (err) {
      setError(err.message || "Unable to save homework.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setError("");
    setSuccess("");
    setEditingHomeworkId(item.id);
    setFormData({
      className: item.className || "",
      section: item.section || "",
      assignedDate: toInputDate(item.assignedDate),
      completionDate: toInputDate(item.completionDate),
      homeworkText: item.homeworkText || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this homework?")) return;

    try {
      setError("");
      setSuccess("");
      await homeworkService.deleteHomework(id);
      setSuccess("Homework deleted successfully.");
      if (editingHomeworkId === id) resetForm();
      await refreshList();
    } catch (err) {
      setError(err.message || "Unable to delete homework.");
    }
  };

  const sectionOptions = useMemo(() => {
    if (!formData.className) return [];
    const sections = classSectionCombinations
      .filter((item) => item.className === formData.className)
      .map((item) => item.section);
    return [...new Set(sections)];
  }, [classSectionCombinations, formData.className]);

  const sortedHomework = useMemo(
    () =>
      [...homeworkList].sort(
        (a, b) => new Date(b.assignedDate) - new Date(a.assignedDate)
      ),
    [homeworkList]
  );

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Homework Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {canManageHomework
            ? "Assign homework by class and section."
            : "View homework for your class and section."}
        </p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError("")} />}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {canManageHomework && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingHomeworkId ? "Edit Homework" : "Add Homework"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class
                </label>
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Class</option>
                  {classOptions.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.className}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-60"
                >
                  <option value="">Select Section</option>
                  {sectionOptions.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Homework Given Date
                </label>
                <input
                  type="date"
                  name="assignedDate"
                  value={formData.assignedDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Homework Completion Date
                </label>
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Homework
              </label>
              <textarea
                name="homeworkText"
                value={formData.homeworkText}
                onChange={handleInputChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Write homework details here..."
              />
            </div>

            <div className="flex justify-end gap-2">
              {editingHomeworkId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingHomeworkId
                  ? "Update Homework"
                  : "Add Homework"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Homework List ({sortedHomework.length})
          </h2>
          {listLoading && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Refreshing...
            </span>
          )}
        </div>

        {sortedHomework.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No homework found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Given Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Completion Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Homework
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Created By
                  </th>
                  {canManageHomework && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedHomework.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(item.assignedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(item.completionDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.homeworkText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.createdByName || item.createdByRole || "-"}
                    </td>
                    {canManageHomework && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkTab;
