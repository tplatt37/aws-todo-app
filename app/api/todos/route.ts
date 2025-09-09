import { NextRequest } from 'next/server';
import { getAllTodos, createTodo } from '@/lib/dynamodb';
import { CreateTodoInput } from '@/lib/types';
import { createErrorResponse, createSuccessResponse } from '@/utils/errorHandler';

// GET /api/todos - Get all todos
export async function GET() {
  try {
    const todos = await getAllTodos();
    return createSuccessResponse(todos);
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return createErrorResponse(error);
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.description || !body.dueDate || !body.priority || !body.status) {
      return createErrorResponse({
        message: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        details: {
          required: ['description', 'dueDate', 'priority', 'status'],
          received: Object.keys(body),
        },
      }, 400);
    }

    // Validate priority
    if (!['High', 'Medium', 'Low'].includes(body.priority)) {
      return createErrorResponse({
        message: 'Invalid priority value',
        code: 'VALIDATION_ERROR',
        details: {
          valid: ['High', 'Medium', 'Low'],
          received: body.priority,
        },
      }, 400);
    }

    // Validate status
    if (!['Not Started', 'In Progress', 'Done', 'Canceled'].includes(body.status)) {
      return createErrorResponse({
        message: 'Invalid status value',
        code: 'VALIDATION_ERROR',
        details: {
          valid: ['Not Started', 'In Progress', 'Done', 'Canceled'],
          received: body.status,
        },
      }, 400);
    }

    // Validate date format
    const dueDate = new Date(body.dueDate);
    if (isNaN(dueDate.getTime())) {
      return createErrorResponse({
        message: 'Invalid due date format',
        code: 'VALIDATION_ERROR',
        details: {
          hint: 'Please provide a valid ISO 8601 date string',
          received: body.dueDate,
        },
      }, 400);
    }

    const input: CreateTodoInput = {
      description: body.description,
      dueDate: dueDate.toISOString(),
      priority: body.priority,
      status: body.status,
    };

    const newTodo = await createTodo(input);
    return createSuccessResponse(newTodo, 201);
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return createErrorResponse(error);
  }
}
