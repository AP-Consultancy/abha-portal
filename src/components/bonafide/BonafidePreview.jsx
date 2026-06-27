import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  downloadBonafideDocx,
  printBonafidePreview,
  renderBonafidePreview,
} from "../../utils/bonafidePrint";

const BonafidePreview = ({ student, purpose, onClose }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!containerRef.current || !student) return;
      setLoading(true);
      setError("");
      try {
        await renderBonafidePreview(containerRef.current, student, purpose);
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to generate bonafide certificate.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [student, purpose]);

  const handleDownload = async () => {
    try {
      await downloadBonafideDocx(student, purpose);
    } catch (err) {
      setError(err.message || "Download failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 no-print">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 no-print">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bonafide certificate preview
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printBonafidePreview("bonafide-print-area")}
              disabled={loading || Boolean(error)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <PrinterIcon className="w-4 h-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || Boolean(error)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download .docx
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          {loading && (
            <p className="text-center text-gray-500 py-12">Generating certificate…</p>
          )}
          {error && (
            <div className="max-w-xl mx-auto rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
              {error}
            </div>
          )}
          <div
            id="bonafide-print-area"
            ref={containerRef}
            className="bg-white shadow-sm rounded-lg min-h-[400px] p-4"
          />
        </div>
      </div>
    </div>
  );
};

export default BonafidePreview;
