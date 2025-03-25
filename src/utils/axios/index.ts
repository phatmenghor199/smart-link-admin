import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  RawAxiosRequestHeaders,
} from "axios";
import { getCookie } from "cookies-next";

// Custom types to replace any
type RequestData = Record<string, unknown> | undefined;
type ResponseData = Record<string, unknown> | undefined;
type RequestHeaders = RawAxiosRequestHeaders | undefined;

// Custom error logging interface
interface ExtendedErrorLog {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  errorMessage: string;
  requestData?: RequestData;
  responseData?: ResponseData;
  headers?: RequestHeaders;
}

// Error logging and monitoring utility
class ErrorMonitor {
  // Log errors to console and potentially to a monitoring service
  static logError(error: ExtendedErrorLog): void {
    // Console logging with styled output
    console.error(
      `%c🚨 API Error Detected %c${new Date().toISOString()}`,
      "background: red; color: white; padding: 2px 4px; border-radius: 3px;",
      "color: red; font-weight: bold;"
    );

    console.group("Error Details");
    console.error("Method:", error.method);
    console.error("URL:", error.url);
    console.error("Status:", error.status || "N/A");
    console.error("Error Message:", error.errorMessage);

    if (error.requestData) {
      console.group("Request Data");
      console.error(JSON.stringify(error.requestData, null, 2));
      console.groupEnd();
    }

    if (error.responseData) {
      console.group("Response Data");
      console.error(JSON.stringify(error.responseData, null, 2));
      console.groupEnd();
    }
    console.groupEnd();

    // TODO: Implement additional error tracking (e.g., Sentry, LogRocket)
    // this.sendToErrorTrackingService(error);
  }

  // Method to potentially send errors to a monitoring service
  // static sendToErrorTrackingService(error: ExtendedErrorLog) {
  //   // Placeholder for error tracking integration
  //   // Example: Sentry.captureException(error);
  // }
}

// Performance tracking utility
class PerformanceTracker {
  private static requestTimestamps: Map<string, number> = new Map();

  static start(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const requestId = this.generateRequestId(config);
    this.requestTimestamps.set(requestId, Date.now());
    return config;
  }

  static end(response: AxiosResponse): void {
    const requestId = this.generateRequestId(response.config);
    const startTime = this.requestTimestamps.get(requestId);

    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(
        `%c⏱️ Request Performance %c${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        "background: green; color: white; padding: 2px 4px; border-radius: 3px;",
        "color: green; font-weight: bold;"
      );
      console.log(`Duration: ${duration}ms`);

      // Log warning for slow requests
      if (duration > 2000) {
        console.warn(
          `🐌 Slow Request: ${duration}ms for ${response.config.url}`
        );
      }

      this.requestTimestamps.delete(requestId);
    }
  }

  private static generateRequestId(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}`;
  }
}

// Create axios instances with advanced error handling
const createAxiosInstance = (requiresAuth: boolean = false) => {
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      "Content-Type": "application/json",
      "X-App-Version": "1.0.0",
    },
  });

  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      // Performance tracking
      PerformanceTracker.start(config);

      // Authentication for protected routes
      if (requiresAuth) {
        const token = getCookie("authToken", {
          req: config.headers.req,
          res: config.headers.res,
        });

        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          // Log authentication failure
          console.warn(
            "%c🔒 Authentication Warning",
            "background: orange; color: white; padding: 2px 4px; border-radius: 3px;",
            "No authentication token found for protected route"
          );
        }
      }

      return config;
    },
    (error: Error & { config?: AxiosRequestConfig }) => {
      // Capture and log request setup errors
      ErrorMonitor.logError({
        timestamp: new Date().toISOString(),
        method: error.config?.method || "UNKNOWN",
        url: error.config?.url || "UNKNOWN",
        errorMessage: error.message,
        requestData: error.config?.data,
      });
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      // Performance tracking
      PerformanceTracker.end(response);

      // Conditional logging for development
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.log(
          `%c✅ API Success: ${response.config.method?.toUpperCase()} ${
            response.config.url
          }`,
          "background: green; color: white; padding: 2px 4px; border-radius: 3px;",
          `Status: ${response.status}`
        );
      }

      return response;
    },
    (error: AxiosError) => {
      // Comprehensive error logging
      const errorLog: ExtendedErrorLog = {
        timestamp: new Date().toISOString(),
        method: error.config?.method || "UNKNOWN",
        url: error.config?.url || "UNKNOWN",
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorMessage: error.message,
        requestData: error.config?.data as RequestData,
        responseData: error.response?.data as ResponseData,
        headers: error.config?.headers as RequestHeaders,
      };

      // Log the error
      ErrorMonitor.logError(errorLog);

      // Handle specific error scenarios
      if (error.response) {
        // The request was made and the server responded with a status code
        switch (error.response.status) {
          case 400:
            console.warn(
              "Bad Request: The server could not understand the request"
            );
            break;
          case 401:
            console.warn(
              "Unauthorized: Authentication is required and has failed"
            );
            // Potentially trigger logout or token refresh
            break;
          case 403:
            console.warn(
              "Forbidden: Server understood the request but refuses to authorize it"
            );
            break;
          case 404:
            console.warn(
              "Not Found: The requested resource could not be found"
            );
            break;
          case 500:
            console.warn(
              "Internal Server Error: Something went wrong on the server"
            );
            break;
          default:
            console.warn(`Unhandled Error Status: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.warn(
          "No response received from server. Network error or server is down."
        );
      } else {
        // Something happened in setting up the request
        console.warn("Error setting up the request", error.message);
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Export two instances: one with auth, one without
export const axiosServerWithAuth = createAxiosInstance(true);
export const axiosServer = createAxiosInstance(false);

// Optional: Export utilities for manual error logging if needed
export const errorMonitor = ErrorMonitor;
export const performanceTracker = PerformanceTracker;
