import { NextResponse } from 'next/server';

import { ApiError, ApiResponse } from '@/lib/types';

export function createErrorResponse(error: ApiError | Error | unknown, statusCode: number = 500): NextResponse {
  let apiError: ApiError;

  if (isApiError(error)) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = {
      message: error.message,
      code: 'INTERNAL_ERROR',
      details: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  } else {
    apiError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: String(error),
    };
  }

  const response: ApiResponse = {
    success: false,
    error: apiError,
  };

  return NextResponse.json(response, { status: statusCode });
}

export function createSuccessResponse<T>(data: T, statusCode: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(response, { status: statusCode });
}

function isApiError(error: unknown): error is ApiError {
  return !!(error && typeof error === 'object' && 'message' in error && 'code' in error);
}

// Client-side error formatting
export function formatErrorForDisplay(error: ApiError): string {
  // Display the raw AWS error message exactly as AWS produced it
  let message = error.message;

  // If we have raw AWS error details, display them as JSON for students to see the complete structure
  if (error.details && typeof error.details === 'object') {
    message += `\n\nRaw AWS Error Details:\n${JSON.stringify(error.details, null, 2)}`;
  }

  return message;
}
