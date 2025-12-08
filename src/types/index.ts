export interface Employee {
  id: string;
  name: string;
  sector: string;
  position: string;
  created_at: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface TestSubmission {
  id: string;
  employee_id: string;
  employee?: Employee;
  answers: Record<string, number>;
  created_at: string;
  completed_at?: string;
  score?: number;
  total_questions?: number;
  ai_feedback?: string;
}
