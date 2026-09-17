export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  course: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  age: string;
  course: string;
}

export interface FormValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  age?: string;
  course?: string;
  general?: string;
}

export interface TestCaseResult {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  inputDescription: string;
  expectedResult: string;
  actualStatus?: number;
  actualResponse?: any;
  status: 'idle' | 'running' | 'passed' | 'failed';
  errorDetails?: string;
  durationMs?: number;
}
