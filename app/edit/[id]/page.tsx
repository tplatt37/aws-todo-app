'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TodoItem, ApiResponse } from '@/lib/types';
import TodoForm from '@/components/TodoForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function EditTodoPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await fetch(`/api/todos/${id}`);
        const data: ApiResponse<TodoItem> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch todo');
        }
        
        setTodo(data.data || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load todo');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTodo();
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to update todo');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading todo..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage error={error} />
        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Todo List
          </a>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage error="Todo not found" />
        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Todo List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Todo</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update the details of your todo item
        </p>
      </div>
      
      <TodoForm 
        initialData={todo}
        onSubmit={handleSubmit}
        submitLabel="Update Todo"
      />
    </div>
  );
}
