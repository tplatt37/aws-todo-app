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

// Type guard for error details
function hasProperty<T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && prop in obj;
}

// Client-side error formatting
export function formatErrorForDisplay(error: ApiError): string {
  let message = error.message;

  if (error.details && typeof error.details === 'object') {
    if (hasProperty(error.details, 'hint') && typeof error.details.hint === 'string') {
      message += `\n\nHint: ${error.details.hint}`;
    }
    if (hasProperty(error.details, 'tableName') && typeof error.details.tableName === 'string') {
      message += `\n\nTable: ${error.details.tableName}`;
    }
    if (hasProperty(error.details, 'bucketName') && typeof error.details.bucketName === 'string') {
      message += `\n\nBucket: ${error.details.bucketName}`;
    }
    if (hasProperty(error.details, 'region') && typeof error.details.region === 'string') {
      message += `\n\nRegion: ${error.details.region}`;
    }
  }

  if (process.env.NODE_ENV === 'development' && error.stack) {
    message += `\n\nStack Trace:\n${error.stack}`;
  }

  return message;
}
