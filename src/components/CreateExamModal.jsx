import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { examService } from "../services/examService";
import { toast } from "react-toastify";

const CreateExamModal = ({
  isOpen,
  onClose,
  teacherId,
  subjects,
  classes,
  onExamCreated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    class: "",
    examDate: "",
    startTime: "",
    endTime: "",
    duration: "",
    totalMarks: "",
    room: "",
    examType: "Unit Test",
    instructions: "",
  });
  const [applyToSections, setApplyToSections] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSectionClassIds, setSelectedSectionClassIds] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        teacher: teacherId,
        applyToAllSections: applyToSections && selectedSectionClassIds.length === 0,
        targetSectionClassIds: applyToSections ? selectedSectionClassIds : [],
      };
      const response = await examService.createExam(payload);
      toast.success("Exam created successfully");
      onExamCreated(); // Refresh parent data
      onClose();
    } catch (error) {
      console.error("Exam creation error:", error);
      toast.error("Failed to create exam");
    }
  };

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setAvailableSections([]);
        setSelectedSectionClassIds([]);
        if (!formData.class) return;
        const selected = classes.find((c) => c._id === formData.class);
        if (!selected) return;
        const siblings = classes.filter(
          (c) => c.name === selected.name && c.academicYear === selected.academicYear
        );
        setAvailableSections(siblings);
      } catch (e) {
        console.error("Failed to load sections for class", e);
      }
    };
    fetchSections();
  }, [formData.class, classes]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">
            Create Exam
          </Dialog.Title>

          <div className="space-y-3">
            <input
              name="title"
              onChange={handleChange}
              value={formData.title}
              className="input"
              placeholder="Title"
            />
            <select
              name="subject"
              onChange={handleChange}
              value={formData.subject}
              className="input"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              name="class"
              onChange={handleChange}
              value={formData.class}
              className="input"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.section}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                id="applySections"
                type="checkbox"
                checked={applyToSections}
                onChange={(e) => setApplyToSections(e.target.checked)}
              />
              <label htmlFor="applySections" className="text-sm">
                Apply to sections (optional)
              </label>
            </div>
            {applyToSections && availableSections.length > 0 && (
              <div>
                <label className="text-sm font-medium">Select Sections</label>
                <select
                  multiple
                  value={selectedSectionClassIds}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setSelectedSectionClassIds(options);
                  }}
                  className="input h-32"
                >
                  {availableSections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}-{c.section}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  If none selected, all sections will be targeted.
                </p>
              </div>
            )}
            <input
              name="examDate"
              type="date"
              onChange={handleChange}
              value={formData.examDate}
              className="input"
            />
            <input
              name="startTime"
              type="time"
              onChange={handleChange}
              value={formData.startTime}
              className="input"
            />
            <input
              name="endTime"
              type="time"
              onChange={handleChange}
              value={formData.endTime}
              className="input"
            />
            <input
              name="duration"
              type="number"
              placeholder="Duration in minutes"
              onChange={handleChange}
              value={formData.duration}
              className="input"
            />
            <input
              name="totalMarks"
              type="number"
              placeholder="Total Marks"
              onChange={handleChange}
              value={formData.totalMarks}
              className="input"
            />
            <input
              name="room"
              placeholder="Room"
              onChange={handleChange}
              value={formData.room}
              className="input"
            />
            <select
              name="examType"
              onChange={handleChange}
              value={formData.examType}
              className="input"
            >
              <option>Unit Test</option>
              <option>Mid Term</option>
              <option>Final Term</option>
              <option>Practical</option>
              <option>Assignment</option>
            </select>
            <textarea
              name="instructions"
              onChange={handleChange}
              value={formData.instructions}
              className="input"
              placeholder="Instructions"
            />

            <div className="flex justify-end gap-2 pt-4">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn btn-primary">
                Create
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateExamModal;
