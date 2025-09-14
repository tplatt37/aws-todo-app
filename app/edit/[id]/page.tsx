'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import TodoForm from '@/components/TodoForm';
import { useFeatureFlags } from '@/lib/FeatureFlagsContext';
import { ApiError, ApiResponse, CreateTodoInput, TodoItem, UpdateTodoInput } from '@/lib/types';

export default function EditTodoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { featureFlags } = useFeatureFlags();
  
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await fetch(`/api/todos/${id}`);
        const data: ApiResponse<TodoItem> = await response.json();
        
        if (!data.success) {
          setError(data.error || { message: 'Failed to fetch todo', code: 'FETCH_ERROR' });
          return;
        }
        
        setTodo(data.data || null);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err) {
          setError(err as ApiError);
        } else {
          setError({ message: 'Failed to load todo', code: 'FETCH_ERROR' });
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTodo();
    }
  }, [id]);

  const handleSubmit = async (data: CreateTodoInput | UpdateTodoInput) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw result.error || { message: 'Failed to update todo', code: 'UPDATE_ERROR' };
    }
  };

  const handleDelete = async () => {
    if (!todo) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${todo.description}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        setError(result.error || { message: 'Failed to delete todo', code: 'DELETE_ERROR' });
        return;
      }

      // Navigate back to home page after successful deletion
      router.push('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err as ApiError);
      } else {
        setError({ message: 'Failed to delete todo', code: 'DELETE_ERROR' });
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading todo..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorMessage error={error} />
        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Todo List
          </Link>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorMessage error="Todo not found" />
        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Todo List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
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

      {featureFlags.showDeleteFromEditPage && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Todo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
