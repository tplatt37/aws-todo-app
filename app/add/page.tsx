'use client';

import { ApiResponse } from '@/lib/types';
import TodoForm from '@/components/TodoForm';

export default function AddTodoPage() {
  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to create todo');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Todo</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create a new todo item to track your tasks
        </p>
      </div>
      
      <TodoForm 
        onSubmit={handleSubmit}
        submitLabel="Create Todo"
      />
    </div>
  );
}
