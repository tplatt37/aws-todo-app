'use client';

import TodoForm from '@/components/TodoForm';
import { ApiResponse, CreateTodoInput, UpdateTodoInput } from '@/lib/types';
import { useFeatureFlags } from '@/lib/FeatureFlagsContext';

export default function AddTodoPage() {
  const { featureFlags, loading: flagsLoading } = useFeatureFlags();

  const handleSubmit = async (data: CreateTodoInput | UpdateTodoInput) => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw result.error || { message: 'Failed to create todo', code: 'CREATE_ERROR' };
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
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
