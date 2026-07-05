import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { timetableService } from "../../services/timetableService";
import { TIMETABLE_DAYS, displayName } from "../../utils/timetableConstants";

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
        const userId = user?.userData?.id || user?.userData?._id;
        if (!userId) {
          setError("User not found. Please log in again.");
          return;
        }

        const data =
          userRole === "student"
            ? await timetableService.getStudentTimetable(userId)
            : await timetableService.getTeacherTimetable(userId);

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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const hasSlots = TIMETABLE_DAYS.some((day) => (schedule[day] || []).length > 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">My Timetable</h1>
        <p className="text-gray-600">
          {userRole === "student"
            ? "Your class schedule for the week"
            : "Your teaching schedule for the week"}
        </p>
      </div>

      {!hasSlots ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
          No timetable entries yet. Ask admin to publish the schedule.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TIMETABLE_DAYS.map((day) => (
            <div key={day} className="rounded-lg bg-white p-4 shadow-md">
              <h3 className="mb-3 border-b pb-2 font-semibold text-gray-900">{day}</h3>
              <ul className="space-y-2">
                {(schedule[day] || []).map((slot, index) => (
                  <li key={`${day}-${index}`} className="rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-gray-900">{slot.time}</p>
                    {displayName(slot.subject) && (
                      <p className="text-gray-600">{displayName(slot.subject)}</p>
                    )}
                    {slot.className && (
                      <p className="text-gray-500">
                        {slot.className}
                        {slot.section ? ` — Section ${slot.section}` : ""}
                      </p>
                    )}
                    {displayName(slot.teacher) && (
                      <p className="text-gray-500">{displayName(slot.teacher)}</p>
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
