import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ApiError } from './types';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'todo-exports-dev';

// Error handler for S3 operations
export function handleS3Error(error: unknown): ApiError {
  console.error('S3 Error:', error);
  
  const apiError: ApiError = {
    message: 'File export operation failed',
    code: 'UNKNOWN_ERROR',
    details: {},
  };

  // Type guard for AWS SDK errors
  const isAwsError = (err: unknown): err is { name: string; message?: string; code?: string; $metadata?: { requestId?: string; httpStatusCode?: number }; endpoint?: string; stack?: string } => {
    return typeof err === 'object' && err !== null && 'name' in err;
  };

  if (isAwsError(error)) {
    // Pass through the raw AWS error exactly as AWS produced it
    apiError.code = error.name;
    apiError.message = error.message || 'AWS service error occurred';
    
    // Store the complete raw error object for students to see
    apiError.details = error;

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      apiError.stack = error.stack;
    }
  } else if (error instanceof Error) {
    apiError.message = error.message;
    apiError.details = error.toString();
    if (process.env.NODE_ENV === 'development') {
      apiError.stack = error.stack;
    }
  } else {
    // Unknown error type
    apiError.message = 'An unexpected error occurred during export';
    apiError.details = String(error);
  }

  return apiError;
}

// Upload CSV to S3 and get signed URL
export async function uploadCSVAndGetSignedUrl(csvContent: string): Promise<{ downloadUrl: string; fileName: string; expiresAt: string }> {
  try {
    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `todo-export-${timestamp}.csv`;

    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: csvContent,
      ContentType: 'text/csv',
      ContentDisposition: `attachment; filename="${fileName}"`,
    });

    await s3Client.send(putCommand);

    // Generate pre-signed URL (expires in 10 minutes)
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const downloadUrl = await getSignedUrl(s3Client, getCommand, { 
      expiresIn: 600 // 10 minutes in seconds
    });

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + 600000).toISOString(); // 10 minutes from now

    return {
      downloadUrl,
      fileName,
      expiresAt,
    };
  } catch (error) {
    throw handleS3Error(error);
  }
}
