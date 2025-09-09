import { NextRequest } from 'next/server';
import { getTodoById, updateTodo, deleteTodo } from '@/lib/dynamodb';
import { UpdateTodoInput } from '@/lib/types';
import { createErrorResponse, createSuccessResponse } from '@/utils/errorHandler';

// GET /api/todos/[id] - Get a single todo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const todo = await getTodoById(id);
    
    if (!todo) {
      return createErrorResponse({
        message: 'Todo not found',
        code: 'NOT_FOUND',
        details: { id },
      }, 404);
    }

    return createSuccessResponse(todo);
  } catch (error) {
    console.error(`GET /api/todos/${id} error:`, error);
    return createErrorResponse(error);
  }
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate priority if provided
    if (body.priority && !['High', 'Medium', 'Low'].includes(body.priority)) {
      return createErrorResponse({
        message: 'Invalid priority value',
        code: 'VALIDATION_ERROR',
        details: {
          valid: ['High', 'Medium', 'Low'],
          received: body.priority,
        },
      }, 400);
    }

    // Validate status if provided
    if (body.status && !['Not Started', 'In Progress', 'Done', 'Canceled'].includes(body.status)) {
      return createErrorResponse({
        message: 'Invalid status value',
        code: 'VALIDATION_ERROR',
        details: {
          valid: ['Not Started', 'In Progress', 'Done', 'Canceled'],
          received: body.status,
        },
      }, 400);
    }

    // Validate date format if provided
    if (body.dueDate) {
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
      body.dueDate = dueDate.toISOString();
    }

    const input: UpdateTodoInput = {
      description: body.description,
      dueDate: body.dueDate,
      priority: body.priority,
      status: body.status,
    };

    // Remove undefined values
    Object.keys(input).forEach(key => {
      if (input[key as keyof UpdateTodoInput] === undefined) {
        delete input[key as keyof UpdateTodoInput];
      }
    });

    const updatedTodo = await updateTodo(id, input);
    
    if (!updatedTodo) {
      return createErrorResponse({
        message: 'Todo not found',
        code: 'NOT_FOUND',
        details: { id },
      }, 404);
    }

    return createSuccessResponse(updatedTodo);
  } catch (error) {
    console.error(`PUT /api/todos/${id} error:`, error);
    return createErrorResponse(error);
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deleted = await deleteTodo(id);
    
    if (!deleted) {
      return createErrorResponse({
        message: 'Todo not found',
        code: 'NOT_FOUND',
        details: { id },
      }, 404);
    }

    return createSuccessResponse({ message: 'Todo deleted successfully', id });
  } catch (error) {
    console.error(`DELETE /api/todos/${id} error:`, error);
    return createErrorResponse(error);
  }
}
