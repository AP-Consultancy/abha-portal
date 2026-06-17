import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import LoadingSpinner from "../common/LoadingSpinner";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MyTimetable = () => {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const userId = user?.userData?.id || user?.userData?._id;
        if (!userId) {
          setError("User not found. Please log in again.");
          return;
        }

        const path =
          userRole === "student"
            ? `${API_BASE_URL}/api/timetable/student/${userId}`
            : `${API_BASE_URL}/api/timetable/teacher/${userId}`;

        const res = await fetch(path, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to load timetable");
        }
        setSchedule(data.timetable?.schedule || {});
      } catch (err) {
        setError(err.message || "Failed to load timetable");
      } finally {
        setLoading(false);
      }
    };

    if (userRole === "student" || userRole === "teacher" || userRole === "employee") {
      load();
    } else {
      setLoading(false);
    }
  }, [userRole, user]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner message="Loading timetable..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const hasSlots = days.some((day) => (schedule[day] || []).length > 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
        <p className="text-gray-600">
          {userRole === "student"
            ? "Your class schedule for the week"
            : "Your teaching schedule for the week"}
        </p>
      </div>

      {!hasSlots ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          No timetable entries yet. Ask admin to publish the schedule.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">{day}</h3>
              <ul className="space-y-2">
                {(schedule[day] || []).map((slot, index) => (
                  <li key={`${day}-${index}`} className="text-sm bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{slot.time}</p>
                    {slot.subject?.name && (
                      <p className="text-gray-600">{slot.subject.name}</p>
                    )}
                    {slot.subject && typeof slot.subject === "string" && (
                      <p className="text-gray-600">{slot.subject}</p>
                    )}
                    {slot.className && (
                      <p className="text-gray-500">
                        {slot.className}
                        {slot.section ? ` — ${slot.section}` : ""}
                      </p>
                    )}
                    {slot.teacher?.name && (
                      <p className="text-gray-500">{slot.teacher.name}</p>
                    )}
                    {slot.room && <p className="text-gray-400">Room: {slot.room}</p>}
                  </li>
                ))}
                {(schedule[day] || []).length === 0 && (
                  <li className="text-sm text-gray-400">No periods</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTimetable;
