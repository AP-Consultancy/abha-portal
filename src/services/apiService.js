import { API_BASE_URL } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication headers
  getAuthHeaders(endpoint = "") {
    const headers = {
      "Content-Type": "application/json",
    };

    const isLoginRequest = String(endpoint).includes("/auth/login");
    const token = localStorage.getItem("token");
    if (token && !isLoginRequest) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const isLoginRequest = String(endpoint).includes("/auth/login");
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(endpoint),
        ...options.headers,
      },
    };
    if (options.cache) {
      config.cache = options.cache;
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.error ||
          errorData.message ||
          (isLoginRequest
            ? "Invalid username or password"
            : "Authentication expired. Please login again.");

        if (!isLoginRequest) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }

        throw new Error(message);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let message =
          errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const preview = errorData.errors
            .slice(0, 5)
            .map((e) => `Row ${e.row}: ${(e.errors || []).join("; ")}`)
            .join(" | ");
          const more =
            errorData.errors.length > 5 ? ` (+${errorData.errors.length - 5} more)` : "";
          message = `${message} — ${preview}${more}`;
        }
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: "GET", ...options });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
