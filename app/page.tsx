'use client';

import { useState, useEffect } from 'react';
import { TodoItem, ApiResponse, ApiError } from '@/lib/types';
import TodoTable from '@/components/TodoTable';
import ExportButton from '@/components/ExportButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function HomePage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchTodos = async () => {
    try {
      setError(null);
      const response = await fetch('/api/todos');
      const data: ApiResponse<TodoItem[]> = await response.json();
      
      if (!data.success) {
        throw data.error || new Error('Failed to fetch todos');
      }
      
      setTodos(data.data || []);
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw data.error || new Error('Failed to delete todo');
      }
      
      // Remove the deleted todo from the list
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err: any) {
      console.error('Error deleting todo:', err);
      setError(err);
    }
  };

  const handleExportError = (errorMessage: string) => {
    setError({
      message: errorMessage,
      code: 'EXPORT_ERROR',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading todos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Todo List
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your tasks and stay organized
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex items-center space-x-3">
            <a
              href="/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Todo
            </a>
            <ExportButton onError={handleExportError} />
          </div>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      <div className="bg-white rounded-lg shadow">
        <TodoTable todos={todos} onDelete={handleDelete} />
      </div>

      {todos.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {todos.length} todo{todos.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
