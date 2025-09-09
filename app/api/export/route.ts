import { getAllTodos } from '@/lib/dynamodb';
import { uploadCSVAndGetSignedUrl } from '@/lib/s3';
import { ExportResponse } from '@/lib/types';
import { generateCSV } from '@/utils/csvGenerator';
import { createErrorResponse, createSuccessResponse } from '@/utils/errorHandler';

// POST /api/export - Export todos to CSV and get download URL
export async function POST() {
  try {
    // Get all todos from DynamoDB
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
  } catch (error) {
    console.error('POST /api/export error:', error);
    return createErrorResponse(error);
  }
}
