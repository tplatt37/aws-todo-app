import { TodoItem } from '@/lib/types';
import { format } from 'date-fns';

export function generateCSV(todos: TodoItem[]): string {
  // Define CSV headers
  const headers = ['ID', 'Description', 'Due Date', 'Priority', 'Status', 'Created At', 'Updated At'];
  
  // Create CSV rows
  const rows = todos.map(todo => {
    return [
      todo.id,
      escapeCSVField(todo.description),
      formatDate(todo.dueDate),
      todo.priority,
      todo.status,
      formatDate(todo.createdAt),
      formatDate(todo.updatedAt),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

// Escape special characters in CSV fields
function escapeCSVField(field: string): string {
  // If field contains comma, newline, or double quote, wrap in quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Escape double quotes by doubling them
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return field;
}

// Format date for better readability in CSV
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return dateString; // Return original if parsing fails
  }
}
