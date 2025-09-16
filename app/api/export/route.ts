import { setTimeout } from 'timers/promises';

import { v4 as uuidv4 } from 'uuid';

import { getAllTodos } from '@/lib/dynamodb';
import { fetchFeatureFlags } from '@/lib/featureFlags';
import { uploadCSVAndGetSignedUrl } from '@/lib/s3';
import { sendExportMessage } from '@/lib/sqs';
import { ExportResponse, QueuedExportResponse } from '@/lib/types';
import { generateCSV } from '@/utils/csvGenerator';
import { createErrorResponse, createSuccessResponse } from '@/utils/errorHandler';

// POST /api/export - Export todos to CSV and get download URL
export async function POST() {
  try {
    // Check feature flags to determine export method
    const featureFlags = await fetchFeatureFlags();
    const useQueueForExports = featureFlags.useQueueForExports || false;

    // Get all todos from DynamoDB to check if there's data to export
    const todos = await getAllTodos();
    
    if (todos.length === 0) {
      return createErrorResponse({
        message: 'No todos to export',
        code: 'NO_DATA',
        details: {
          hint: 'Add some todos before exporting',
        },
      }, 400);
    }

    if (useQueueForExports) {
      // Asynchronous export via SQS queue
      const exportId = uuidv4();
      const queuedAt = new Date().toISOString();

      const queueMessage = {
        exportId,
        requestedAt: queuedAt,
        exportType: 'csv' as const,
        filters: {}, // For future extensibility
      };

      // Send message to SQS queue
      await sendExportMessage(queueMessage);

      const response: QueuedExportResponse = {
        message: 'CSV Export in progress ... you will be notified when it is complete',
        exportId,
        queuedAt,
      };

      return createSuccessResponse(response);
    } else {
      // Synchronous export (existing behavior)
      // Add configurable delay to simulate slow processing
      const delaySeconds = parseInt(process.env.EXPORT_DELAY_SECONDS || '0', 10);
      if (delaySeconds > 0) {
        await setTimeout(delaySeconds * 1000);
      }

      // Generate CSV content
      const csvContent = generateCSV(todos);

      // Upload to S3 and get signed URL
      const { downloadUrl, fileName, expiresAt } = await uploadCSVAndGetSignedUrl(csvContent);

      const response: ExportResponse = {
        downloadUrl,
        fileName,
        expiresAt,
      };

      return createSuccessResponse(response);
    }
  } catch (error) {
    console.error('POST /api/export error:', error);
    return createErrorResponse(error);
  }
}
