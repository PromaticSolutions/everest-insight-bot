import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Employee, Question, TestSubmission, Test } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { initialQuestions } from "@/data/initialQuestions";

interface DataContextType {
  employees: Employee[];
  questions: Question[];
  submissions: TestSubmission[];
  tests: Test[];
  currentEmployee: Employee | null;
  setCurrentEmployee: (employee: Employee | null) => void;
  addEmployee: (employee: Omit<Employee, "id" | "createdAt">) => Promise<Employee | null>;
  addQuestion: (question: Omit<Question, "id">) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addSubmission: (submission: Omit<TestSubmission, "id">) => Promise<void>;
  updateSubmission: (submission: TestSubmission) => Promise<void>;
  getSubmissionByEmployee: (employeeId: string) => TestSubmission | undefined;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const tests: Test[] = [
    {
      id: "test1",
      title: "Avaliação Excel Nível Intermediário",
      description: "Teste de conhecimentos em Excel abordando estruturação de dados, fórmulas, funções de texto, tabelas dinâmicas e dashboards.",
      questions: questions,
      isActive: true
    }
  ];

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching employees:", error);
      return;
    }
    setEmployees(data.map(e => ({
      id: e.id,
      fullName: e.name,
      sector: e.sector,
      position: e.position,
      createdAt: e.created_at
    })));
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase.from("questions").select("*").order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }
    if (data.length === 0) {
      // Seed initial questions
      await seedInitialQuestions();
    } else {
      setQuestions(data.map(q => ({
        id: q.id,
        questionText: q.question,
        options: q.options as string[],
        correctAnswer: q.correct_answer,
        category: q.category
      })));
    }
  };

  const seedInitialQuestions = async () => {
    const questionsToInsert = initialQuestions.map(q => ({
      question: q.questionText,
      options: q.options,
      correct_answer: q.correctAnswer,
      category: q.category
    }));

    const { data, error } = await supabase.from("questions").insert(questionsToInsert).select();
    if (error) {
      console.error("Error seeding questions:", error);
      return;
    }
    if (data) {
      setQuestions(data.map(q => ({
        id: q.id,
        questionText: q.question,
        options: q.options as string[],
        correctAnswer: q.correct_answer,
        category: q.category
      })));
    }
  };

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from("test_submissions")
      .select(`*, employees(*)`)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching submissions:", error);
      return;
    }
    
    setSubmissions(data.map(s => ({
      id: s.id,
      employeeId: s.employee_id,
      employee: {
        id: s.employees.id,
        fullName: s.employees.name,
        sector: s.employees.sector,
        position: s.employees.position,
        createdAt: s.employees.created_at
      },
      answers: s.answers as Record<string, number>,
      submittedAt: s.completed_at || s.created_at,
      score: s.score || 0,
      feedback: s.ai_feedback || undefined
    })));
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchEmployees(), fetchQuestions(), fetchSubmissions()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEmployee = async (employee: Omit<Employee, "id" | "createdAt">): Promise<Employee | null> => {
    const { data, error } = await supabase
      .from("employees")
      .insert({
        name: employee.fullName,
        sector: employee.sector,
        position: employee.position
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding employee:", error);
      return null;
    }

    const newEmployee: Employee = {
      id: data.id,
      fullName: data.name,
      sector: data.sector,
      position: data.position,
      createdAt: data.created_at
    };

    setEmployees(prev => [newEmployee, ...prev]);
    return newEmployee;
  };

  const addQuestion = async (question: Omit<Question, "id">) => {
    const { data, error } = await supabase
      .from("questions")
      .insert({
        question: question.questionText,
        options: question.options,
        correct_answer: question.correctAnswer,
        category: question.category
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding question:", error);
      return;
    }

    const newQuestion: Question = {
      id: data.id,
      questionText: data.question,
      options: data.options as string[],
      correctAnswer: data.correct_answer,
      category: data.category
    };

    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = async (question: Question) => {
    const { error } = await supabase
      .from("questions")
      .update({
        question: question.questionText,
        options: question.options,
        correct_answer: question.correctAnswer,
        category: question.category
      })
      .eq("id", question.id);

    if (error) {
      console.error("Error updating question:", error);
      return;
    }

    setQuestions(prev => prev.map(q => q.id === question.id ? question : q));
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting question:", error);
      return;
    }

    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addSubmission = async (submission: Omit<TestSubmission, "id">) => {
    const { data, error } = await supabase
      .from("test_submissions")
      .insert({
        employee_id: submission.employeeId,
        answers: submission.answers,
        score: submission.score,
        total_questions: questions.length,
        completed_at: submission.submittedAt
      })
      .select(`*, employees(*)`)
      .single();

    if (error) {
      console.error("Error adding submission:", error);
      return;
    }

    const newSubmission: TestSubmission = {
      id: data.id,
      employeeId: data.employee_id,
      employee: {
        id: data.employees.id,
        fullName: data.employees.name,
        sector: data.employees.sector,
        position: data.employees.position,
        createdAt: data.employees.created_at
      },
      answers: data.answers as Record<string, number>,
      submittedAt: data.completed_at || data.created_at,
      score: data.score || 0,
      feedback: data.ai_feedback || undefined
    };

    setSubmissions(prev => [newSubmission, ...prev]);
  };

  const updateSubmission = async (submission: TestSubmission) => {
    const { error } = await supabase
      .from("test_submissions")
      .update({
        answers: submission.answers,
        score: submission.score,
        ai_feedback: submission.feedback
      })
      .eq("id", submission.id);

    if (error) {
      console.error("Error updating submission:", error);
      return;
    }

    setSubmissions(prev => prev.map(s => s.id === submission.id ? submission : s));
  };

  const getSubmissionByEmployee = (employeeId: string) => {
    return submissions.find(s => s.employeeId === employeeId);
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
        loading,
        refreshData
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
