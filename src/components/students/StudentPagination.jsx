import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const StudentPagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  loading = false,
}) => {
  if (totalPages <= 1 && total <= limit) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg shadow-lg p-4">
      <p className="text-sm text-gray-600">
        Showing {start}–{end} of {total} students
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>
        <span className="text-sm text-gray-700 px-2">
          Page {page} of {totalPages || 1}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default StudentPagination;
