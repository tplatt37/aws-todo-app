import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

// Initialize SQS Client
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export interface ExportQueueMessage {
  exportId: string;
  requestedAt: string;
  exportType: 'csv';
  filters?: Record<string, unknown>;
}

/**
 * Sends an export request message to the SQS queue
 * @param message - The export request message
 * @returns Promise<string> - The message ID from SQS
 */
export async function sendExportMessage(message: ExportQueueMessage): Promise<string> {
  const queueUrl = process.env.SQS_QUEUE_URL;
  
  if (!queueUrl) {
    throw new Error('SQS_QUEUE_URL environment variable is not configured. Please set this to your SQS queue URL.');
  }

  // Validate that the queue URL has the correct format
  if (!queueUrl.startsWith('https://sqs.') || !queueUrl.includes('.amazonaws.com/')) {
    throw new Error('SQS_QUEUE_URL must be a valid SQS queue URL (e.g., https://sqs.us-east-1.amazonaws.com/123456789012/queue-name)');
  }

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
    MessageAttributes: {
      exportType: {
        DataType: 'String',
        StringValue: message.exportType,
      },
      requestedAt: {
        DataType: 'String',
        StringValue: message.requestedAt,
      },
    },
  });

  try {
    const response = await sqsClient.send(command);
    
    if (!response.MessageId) {
      throw new Error('Failed to send message to SQS queue - no MessageId returned');
    }

    console.log(`Export message sent to SQS queue: ${response.MessageId}`);
    return response.MessageId;
  } catch (error) {
    console.error('Failed to send message to SQS queue:', error);
    throw new Error(`Failed to queue export request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
