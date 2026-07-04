import React from "react";

const statusStyles = {
  Excellent: "bg-green-100 text-green-800 border-green-200",
  Good: "bg-blue-100 text-blue-800 border-blue-200",
  Average: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Needs Improvement": "bg-red-100 text-red-800 border-red-200",
};

const MetricCard = ({ label, value, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}%</p>
    {subtitle ? (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    ) : null}
  </div>
);

const BehaviorScorePanel = ({ data, compact = false }) => {
  if (!data) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Performance data is not available.
      </div>
    );
  }

  const statusClass =
    statusStyles[data.behaviorStatus] || "bg-gray-100 text-gray-800 border-gray-200";

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusClass}`}>
          {data.behaviorStatus} · {data.behaviorScore}%
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Attendance {data.attendancePercentage}% · Homework {data.homeworkPercentage}% · Marks{" "}
          {data.averageMarksPercentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Student Performance & Behavior
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automatically calculated from attendance (40%), homework (30%), and marks (30%).
          </p>
        </div>
        <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${statusClass}`}>
          {data.behaviorStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Attendance"
          value={data.attendancePercentage}
          subtitle={`${data.attendancePresentDays}/${data.attendanceTotalDays} days`}
        />
        <MetricCard
          label="Homework Completion"
          value={data.homeworkPercentage}
          subtitle={`${data.homeworkCompletedCount}/${data.homeworkTotalAssigned} assignments`}
        />
        <MetricCard
          label="Average Marks"
          value={data.averageMarksPercentage}
          subtitle={`${data.examCount} exam(s)`}
        />
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg p-4 text-white shadow-sm">
          <p className="text-sm text-indigo-100">Behavior Score</p>
          <p className="text-3xl font-bold mt-1">{data.behaviorScore}%</p>
          <p className="text-xs text-indigo-100 mt-1">Updates automatically</p>
        </div>
      </div>
    </div>
  );
};

export default BehaviorScorePanel;
