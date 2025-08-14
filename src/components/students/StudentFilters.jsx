import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Badge from "../common/Badge";

const StudentFilters = ({
  searchTerm,
  setSearchTerm,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  selectedYear,
  setSelectedYear,
  availableClasses,
  availableSections,
  availableYears,
  clearAllFilters,
  clearIndividualFilter,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Classes</option>
            {availableClasses.map((className) => (
              <option key={className} value={className}>
                Class {className}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sections</option>
            {availableSections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Academic Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
          >
            <XMarkIcon className="w-5 h-5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-600">Active Filters:</span>
          {selectedClass && (
            <Badge variant="filter" className="bg-blue-100 text-blue-800">
              Class: {selectedClass}
              <button
                onClick={() => clearIndividualFilter("class")}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {selectedSection && (
            <Badge variant="filter" className="bg-green-100 text-green-800">
              Section: {selectedSection}
              <button
                onClick={() => clearIndividualFilter("section")}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {selectedYear && (
            <Badge variant="filter" className="bg-purple-100 text-purple-800">
              Year: {selectedYear}
              <button
                onClick={() => clearIndividualFilter("year")}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name, roll number, enrollment number, class, section, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  );
};

export default StudentFilters;
