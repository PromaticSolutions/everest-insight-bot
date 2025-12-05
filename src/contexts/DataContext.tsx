import React, { createContext, useContext, ReactNode } from "react";
import { Employee, Question, TestSubmission, Test } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { initialQuestions } from "@/data/initialQuestions";

interface DataContextType {
  employees: Employee[];
  questions: Question[];
  submissions: TestSubmission[];
  tests: Test[];
  currentEmployee: Employee | null;
  setCurrentEmployee: (employee: Employee | null) => void;
  addEmployee: (employee: Employee) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (id: string) => void;
  addSubmission: (submission: TestSubmission) => void;
  updateSubmission: (submission: TestSubmission) => void;
  getSubmissionByEmployee: (employeeId: string) => TestSubmission | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useLocalStorage<Employee[]>("everest_employees", []);
  const [questions, setQuestions] = useLocalStorage<Question[]>("everest_questions", initialQuestions);
  const [submissions, setSubmissions] = useLocalStorage<TestSubmission[]>("everest_submissions", []);
  const [currentEmployee, setCurrentEmployee] = useLocalStorage<Employee | null>("everest_current_employee", null);
  
  const [tests] = useLocalStorage<Test[]>("everest_tests", [
    {
      id: "test1",
      title: "Avaliação Excel Nível Intermediário",
      description: "Teste de conhecimentos em Excel abordando estruturação de dados, fórmulas, funções de texto, tabelas dinâmicas e dashboards.",
      questions: initialQuestions,
      isActive: true
    }
  ]);

  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
  };

  const addQuestion = (question: Question) => {
    setQuestions((prev) => [...prev, question]);
  };

  const updateQuestion = (question: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === question.id ? question : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addSubmission = (submission: TestSubmission) => {
    setSubmissions((prev) => [...prev, submission]);
  };

  const updateSubmission = (submission: TestSubmission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === submission.id ? submission : s)));
  };

  const getSubmissionByEmployee = (employeeId: string) => {
    return submissions.find((s) => s.employeeId === employeeId);
  };

  return (
    <DataContext.Provider
      value={{
        employees,
        questions,
        submissions,
        tests,
        currentEmployee,
        setCurrentEmployee,
        addEmployee,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addSubmission,
        updateSubmission,
        getSubmissionByEmployee,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
