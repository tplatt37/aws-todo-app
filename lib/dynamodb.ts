import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { TodoItem, CreateTodoInput, UpdateTodoInput, ApiError } from './types';

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

// Create Document Client
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'TodoItems-dev';

// Error handler for DynamoDB operations
export function handleDynamoDBError(error: unknown): ApiError {
  console.error('DynamoDB Error:', error);
  
  const apiError: ApiError = {
    message: 'Database operation failed',
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
    apiError.message = 'An unexpected error occurred';
    apiError.details = String(error);
  }

  return apiError;
}

// Get all todos
export async function getAllTodos(): Promise<TodoItem[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return (response.Items as TodoItem[]) || [];
  } catch (error) {
    throw handleDynamoDBError(error);
  }
}

// Get a single todo by ID
export async function getTodoById(id: string): Promise<TodoItem | null> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const response = await docClient.send(command);
    return response.Item as TodoItem || null;
  } catch (error) {
    throw handleDynamoDBError(error);
  }
}

// Create a new todo
export async function createTodo(input: CreateTodoInput): Promise<TodoItem> {
  try {
    const now = new Date().toISOString();
    const newTodo: TodoItem = {
      id: uuidv4(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newTodo,
      ConditionExpression: 'attribute_not_exists(id)',
    });

    await docClient.send(command);
    return newTodo;
  } catch (error) {
    throw handleDynamoDBError(error);
  }
}

// Update an existing todo
export async function updateTodo(id: string, input: UpdateTodoInput): Promise<TodoItem | null> {
  try {
    // Build update expression dynamically
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, string | number | boolean> = {};

    // Always update the updatedAt timestamp
    updateExpressionParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    // Add other fields if provided
    if (input.description !== undefined) {
      updateExpressionParts.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = input.description;
    }

    if (input.dueDate !== undefined) {
      updateExpressionParts.push('#dueDate = :dueDate');
      expressionAttributeNames['#dueDate'] = 'dueDate';
      expressionAttributeValues[':dueDate'] = input.dueDate;
    }

    if (input.priority !== undefined) {
      updateExpressionParts.push('#priority = :priority');
      expressionAttributeNames['#priority'] = 'priority';
      expressionAttributeValues[':priority'] = input.priority;
    }

    if (input.status !== undefined) {
      updateExpressionParts.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = input.status;
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);
    return response.Attributes as TodoItem || null;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return null; // Item doesn't exist
    }
    throw handleDynamoDBError(error);
  }
}

// Delete a todo
export async function deleteTodo(id: string): Promise<boolean> {
  try {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: 'attribute_exists(id)',
    });

    await docClient.send(command);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return false; // Item doesn't exist
    }
    throw handleDynamoDBError(error);
  }
}
