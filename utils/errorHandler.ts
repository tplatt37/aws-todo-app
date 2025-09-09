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

function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'message' in error && 'code' in error;
}

// Client-side error formatting
export function formatErrorForDisplay(error: ApiError): string {
  let message = error.message;

  if (error.details && typeof error.details === 'object') {
    if (error.details.hint) {
      message += `\n\nHint: ${error.details.hint}`;
    }
    if (error.details.tableName) {
      message += `\n\nTable: ${error.details.tableName}`;
    }
    if (error.details.bucketName) {
      message += `\n\nBucket: ${error.details.bucketName}`;
    }
    if (error.details.region) {
      message += `\n\nRegion: ${error.details.region}`;
    }
  }

  if (process.env.NODE_ENV === 'development' && error.stack) {
    message += `\n\nStack Trace:\n${error.stack}`;
  }

  return message;
}
