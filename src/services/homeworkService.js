import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

const HOMEWORK_API_BASE = API_ENDPOINTS.HOMEWORK;

const request = async (promise, fallbackMessage) => {
  try {
    return await promise;
  } catch (error) {
    throw new Error(error.message || fallbackMessage);
  }
};

export const homeworkService = {
  createHomework: (homeworkData) =>
    request(
      apiService.post(HOMEWORK_API_BASE, homeworkData),
      "Failed to create homework"
    ),

  getHomework: () =>
    request(apiService.get(HOMEWORK_API_BASE), "Failed to fetch homework"),

  getHomeworkMasters: () =>
    request(
      apiService.get(`${HOMEWORK_API_BASE}/masters`),
      "Failed to fetch homework masters"
    ),

  updateHomework: (homeworkId, homeworkData) =>
    request(
      apiService.put(`${HOMEWORK_API_BASE}/${homeworkId}`, homeworkData),
      "Failed to update homework"
    ),

  deleteHomework: (homeworkId) =>
    request(
      apiService.delete(`${HOMEWORK_API_BASE}/${homeworkId}`),
      "Failed to delete homework"
    ),
};

export default homeworkService;