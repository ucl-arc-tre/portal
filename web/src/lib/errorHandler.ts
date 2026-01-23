import { ValidationError } from "@/openapi";

type ApiResponse = {
  response: {
    status: number;
    ok: boolean;
  };
  error?: ValidationError | unknown;
  data?: unknown;
};

export function extractErrorMessage(response: ApiResponse): string {
  if (response.error) {
    const errorData = response.error as { error_message?: string };
    if (errorData?.error_message) {
      return errorData.error_message;
    }
  }

  // If there is no error_message in the body, fall back to status-code-specific generic messages.
  // Most error status codes (403, 404, 406, 429, 500, 520) don't return a body from the backend (400 being the exception).
  const status = response.response.status;
  switch (status) {
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 406:
      return "Invalid request. Please check your input and try again.";
    case 429:
      return "Too many requests. Please wait a moment before trying again.";
    case 500:
      return "A server error occurred. Please try again later.";
    case 520:
      return "An unexpected error occurred. Please try again.";
    default:
      return `Request failed with status ${status}. Please try again.`;
  }
}
