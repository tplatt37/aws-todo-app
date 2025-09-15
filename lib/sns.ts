import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

import { TodoItem, ApiError } from './types';

// Initialize SNS Client
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

// Error handler for SNS operations
export function handleSNSError(error: unknown): ApiError {
  console.error('SNS Error:', error);
  
  const apiError: ApiError = {
    message: 'SNS notification failed',
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
    apiError.message = error.message || 'AWS SNS service error occurred';
    
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
    apiError.message = 'An unexpected SNS error occurred';
    apiError.details = String(error);
  }

  return apiError;
}

/**
 * Sends a notification to SNS topic with todo item data
 * @param todoItem - The todo item to send as notification
 * @throws ApiError if SNS operation fails
 */
export async function sendTodoNotification(todoItem: TodoItem): Promise<void> {
  const topicArn = process.env.SNS_TOPIC_ARN;
  
  if (!topicArn) {
    throw {
      message: 'SNS_TOPIC_ARN environment variable is not configured',
      code: 'CONFIGURATION_ERROR',
      details: {
        hint: 'Please set the SNS_TOPIC_ARN environment variable to a valid SNS topic ARN',
        environmentVariable: 'SNS_TOPIC_ARN',
      },
    } as ApiError;
  }

  try {
    const message = JSON.stringify(todoItem, null, 2);
    
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: message,
      Subject: `Todo ${todoItem.status === 'Done' ? 'Completed' : 'Updated'}: ${todoItem.description}`,
    });

    const response = await snsClient.send(command);
    
    console.log('SNS notification sent successfully:', {
      messageId: response.MessageId,
      todoId: todoItem.id,
      topicArn,
    });
  } catch (error) {
    throw handleSNSError(error);
  }
}
