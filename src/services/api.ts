import { Student, StudentFormData } from '../types';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMessage =
      (isJson && data.error) ||
      (isJson && data.message) ||
      (typeof data === 'string' ? data : `Request failed with status ${res.status}`);
    throw new ApiError(errorMessage, res.status, data);
  }

  return data as T;
}

export const studentApi = {
  // Read All: GET /api/students/
  async getAll(search?: string, course?: string): Promise<Student[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (course && course !== 'ALL') params.append('course', course);

    const url = `/api/students/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Student[]>(res);
  },

  // Read One: GET /api/students/:id/
  async getById(id: number): Promise<Student> {
    const res = await fetch(`/api/students/${id}/`);
    return handleResponse<Student>(res);
  },

  // Create: POST /api/students/
  async create(data: StudentFormData): Promise<Student> {
    const res = await fetch('/api/students/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        age: Number(data.age),
        course: data.course.trim(),
      }),
    });
    return handleResponse<Student>(res);
  },

  // Update: PUT /api/students/:id/
  async update(id: number, data: StudentFormData): Promise<Student> {
    const res = await fetch(`/api/students/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        age: Number(data.age),
        course: data.course.trim(),
      }),
    });
    return handleResponse<Student>(res);
  },

  // Delete: DELETE /api/students/:id/
  async delete(id: number): Promise<{ message: string; id: number }> {
    const res = await fetch(`/api/students/${id}/`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: number }>(res);
  },

  // Reset database with default seeds
  async resetDemo(): Promise<{ message: string; students: Student[] }> {
    const res = await fetch('/api/students/reset', {
      method: 'POST',
    });
    return handleResponse<{ message: string; students: Student[] }>(res);
  },

  // Health check
  async checkHealth(): Promise<{ status: string; database: string; uptime: number }> {
    const res = await fetch('/api/health');
    return handleResponse<{ status: string; database: string; uptime: number }>(res);
  },
};
