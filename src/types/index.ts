export interface Employee {
  id: string;
  fullName: string;
  sector: string;
  position: string;
  createdAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

export interface TestSubmission {
  id: string;
  employeeId: string;
  employee: Employee;
  answers: Record<string, number>;
  submittedAt: string;
  score?: number;
  feedback?: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
}