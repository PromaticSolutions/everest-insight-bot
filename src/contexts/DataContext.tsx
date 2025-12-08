import React, { createContext, useContext, useState, useEffect } from "react";
import { Question, Employee, TestSubmission } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  questions: Question[];
  employees: Employee[];
  submissions: TestSubmission[];
  currentEmployee: Employee | null;
  setCurrentEmployee: (employee: Employee | null) => void;
  loading: boolean;
  addQuestion: (question: Omit<Question, "id">) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, "id" | "created_at">) => Promise<Employee | null>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addSubmission: (submission: Omit<TestSubmission, "id" | "created_at">) => Promise<void>;
  updateSubmission: (submission: TestSubmission) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  hasEmployeeSubmitted: (employeeId: string) => boolean;
  getSubmissionByEmployee: (employeeId: string) => TestSubmission | undefined;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: true });

      if (questionsError) throw questionsError;
      
      const mappedQuestions: Question[] = (questionsData || []).map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options as string[] : [],
        correct_answer: q.correct_answer,
        category: q.category,
        created_at: q.created_at,
        updated_at: q.updated_at
      }));
      setQuestions(mappedQuestions);

      // Load employees
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("*")
        .order("name", { ascending: true });

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

      // Load submissions with employee data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("test_submissions")
        .select(`
          *,
          employees (
            id,
            name,
            position,
            sector,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;
      
      const mappedSubmissions: TestSubmission[] = (submissionsData || []).map((sub: any) => ({
        id: sub.id,
        employee_id: sub.employee_id,
        employee: sub.employees ? {
          id: sub.employees.id,
          name: sub.employees.name,
          position: sub.employees.position,
          sector: sub.employees.sector,
          created_at: sub.employees.created_at
        } : undefined,
        answers: sub.answers as Record<string, number>,
        score: sub.score,
        total_questions: sub.total_questions,
        ai_feedback: sub.ai_feedback,
        created_at: sub.created_at,
        completed_at: sub.completed_at
      }));

      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  // Questions CRUD
  const addQuestion = async (question: Omit<Question, "id">) => {
    try {
      const { error } = await supabase
        .from("questions")
        .insert([{
          question: question.question,
          options: question.options,
          correct_answer: question.correct_answer,
          category: question.category
        }])
        .select()
        .single();

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error adding question:", error);
      throw error;
    }
  };

  const updateQuestion = async (question: Question) => {
    try {
      const { error } = await supabase
        .from("questions")
        .update({
          question: question.question,
          options: question.options,
          correct_answer: question.correct_answer,
          category: question.category
        })
        .eq("id", question.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  };

  // Employees CRUD
  const addEmployee = async (employee: Omit<Employee, "id" | "created_at">): Promise<Employee | null> => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([{
          name: employee.name,
          position: employee.position,
          sector: employee.sector
        }])
        .select()
        .single();

      if (error) throw error;
      await loadData();
      return data as Employee;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    }
  };

  const updateEmployee = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({
          name: employee.name,
          position: employee.position,
          sector: employee.sector
        })
        .eq("id", employee.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { data: submissionsData } = await supabase
        .from("test_submissions")
        .select("id")
        .eq("employee_id", id);

      if (submissionsData && submissionsData.length > 0) {
        throw new Error("Não é possível excluir um colaborador que já realizou testes.");
      }

      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  // Submissions CRUD
  const addSubmission = async (submission: Omit<TestSubmission, "id" | "created_at">) => {
    try {
      const { error } = await supabase
        .from("test_submissions")
        .insert([{
          employee_id: submission.employee_id,
          answers: submission.answers,
          score: submission.score,
          total_questions: submission.total_questions,
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error adding submission:", error);
      throw error;
    }
  };

  const updateSubmission = async (submission: TestSubmission) => {
    try {
      const { error } = await supabase
        .from("test_submissions")
        .update({
          answers: submission.answers,
          score: submission.score,
          ai_feedback: submission.ai_feedback
        })
        .eq("id", submission.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error updating submission:", error);
      throw error;
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase
        .from("test_submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error deleting submission:", error);
      throw error;
    }
  };

  const hasEmployeeSubmitted = (employeeId: string): boolean => {
    return submissions.some(s => s.employee_id === employeeId);
  };

  const getSubmissionByEmployee = (employeeId: string): TestSubmission | undefined => {
    return submissions.find(s => s.employee_id === employeeId);
  };

  return (
    <DataContext.Provider
      value={{
        questions,
        employees,
        submissions,
        currentEmployee,
        setCurrentEmployee,
        loading,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addSubmission,
        updateSubmission,
        deleteSubmission,
        hasEmployeeSubmitted,
        getSubmissionByEmployee,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
