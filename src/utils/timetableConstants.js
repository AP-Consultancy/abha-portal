export const TIMETABLE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const TIMETABLE_TIME_SLOTS = [
  "9:00 AM - 9:45 AM",
  "9:45 AM - 10:30 AM",
  "10:30 AM - 11:15 AM",
  "11:15 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 1:45 PM",
  "1:45 PM - 2:30 PM",
  "2:30 PM - 3:15 PM",
];

export const getPeriodAtSlot = (schedule, day, timeSlot) => {
  const entries = schedule?.[day] || [];
  return entries.find((entry) => entry.time === timeSlot) || null;
};

export const displayName = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value.name || "";
  return String(value);
};
