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
export function handleS3Error(error: any): ApiError {
  console.error('S3 Error:', error);
  
  const apiError: ApiError = {
    message: 'File export operation failed',
    code: error.name || 'UNKNOWN_ERROR',
    details: {},
  };

  // Handle specific AWS S3 errors
  if (error.name === 'NoSuchBucket') {
    apiError.message = `S3 bucket '${BUCKET_NAME}' not found. Please ensure the bucket exists and is accessible.`;
    apiError.details = {
      bucketName: BUCKET_NAME,
      region: process.env.AWS_REGION || 'us-east-1',
    };
  } else if (error.name === 'AccessDenied' || error.name === 'Forbidden') {
    apiError.message = 'Access denied to S3 bucket. Please check permissions.';
    apiError.details = {
      bucketName: BUCKET_NAME,
      hint: 'Verify the IAM user has PutObject permission for this bucket',
    };
  } else if (error.name === 'InvalidBucketName') {
    apiError.message = 'Invalid S3 bucket name configuration';
    apiError.details = {
      bucketName: BUCKET_NAME,
    };
  } else if (error.name === 'NetworkingError' || error.code === 'ENOTFOUND') {
    apiError.message = 'Unable to connect to AWS S3. Please check your internet connection.';
    apiError.details = {
      endpoint: error.endpoint || 's3.amazonaws.com',
    };
  } else if (error.name === 'UnrecognizedClientException' || error.name === 'InvalidUserID.NotFound') {
    apiError.message = 'Authentication failed. Please check AWS credentials.';
    apiError.details = {
      hint: 'Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correctly set',
    };
  } else if (error.$metadata) {
    // Generic AWS SDK error
    apiError.message = error.message || 'AWS S3 service error occurred';
    apiError.details = {
      requestId: error.$metadata.requestId,
      httpStatusCode: error.$metadata.httpStatusCode,
    };
  } else {
    // Unknown error
    apiError.message = error.message || 'An unexpected error occurred during export';
    apiError.details = error.toString();
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    apiError.stack = error.stack;
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
