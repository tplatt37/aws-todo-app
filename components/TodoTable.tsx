'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TodoItem, SortField, SortDirection } from '@/lib/types';
import { format } from 'date-fns';

interface TodoTableProps {
  todos: TodoItem[];
  onDelete: (id: string) => void;
}

export default function TodoTable({ todos, onDelete }: TodoTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTodos = useMemo(() => {
    const sorted = [...todos].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle priority sorting
      if (sortField === 'priority') {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = priorityOrder[aValue as keyof typeof priorityOrder];
        bValue = priorityOrder[bValue as keyof typeof priorityOrder];
      }

      // Handle status sorting
      if (sortField === 'status') {
        const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Done': 3, 'Canceled': 4 };
        aValue = statusOrder[aValue as keyof typeof statusOrder];
        bValue = statusOrder[bValue as keyof typeof statusOrder];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [todos, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Not Started': return 'status-not-started';
      case 'In Progress': return 'status-in-progress';
      case 'Done': return 'status-done';
      case 'Canceled': return 'status-canceled';
      default: return '';
    }
  };

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('description')}
            >
              <div className="flex items-center space-x-1">
                <span>Description</span>
                <SortIcon field="description" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('dueDate')}
            >
              <div className="flex items-center space-x-1">
                <span>Due Date</span>
                <SortIcon field="dueDate" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('priority')}
            >
              <div className="flex items-center space-x-1">
                <span>Priority</span>
                <SortIcon field="priority" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                <SortIcon field="status" />
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTodos.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No todos found. Click "Add Todo" to create your first todo item.
              </td>
            </tr>
          ) : (
            sortedTodos.map((todo) => (
              <tr key={todo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                  {todo.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(todo.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getPriorityClass(todo.priority)}>
                    {todo.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getStatusClass(todo.status)}>
                    {todo.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => router.push(`/edit/${todo.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this todo?')) {
                        onDelete(todo.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
