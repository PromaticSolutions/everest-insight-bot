import React, { createContext, useContext, useState, useEffect } from "react";
import { Question, Employee, TestSubmission } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  questions: Question[];
  employees: Employee[];
  submissions: TestSubmission[];
  addQuestion: (question: Omit<Question, "id">) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addSubmission: (submission: Omit<TestSubmission, "id" | "submittedAt">) => Promise<void>;
  updateSubmission: (submission: TestSubmission) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  hasEmployeeSubmitted: (employeeId: string) => boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Load employees
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("*")
        .order("full_name", { ascending: true });

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

      // Load submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("test_submissions")
        .select(`
          *,
          employee:employee_id (
            id,
            full_name,
            position,
            sector,
            has_submitted
          )
        `)
        .order("submitted_at", { ascending: false });

      if (submissionsError) throw submissionsError;
      
      // Transform data to match our interface
      const transformedSubmissions = submissionsData?.map((sub: any) => ({
        id: sub.id,
        employee: {
          id: sub.employee.id,
          fullName: sub.employee.full_name,
          position: sub.employee.position,
          sector: sub.employee.sector,
          hasSubmitted: sub.employee.has_submitted
        },
        answers: sub.answers,
        score: sub.score,
        feedback: sub.feedback,
        submittedAt: sub.submitted_at
      })) || [];

      setSubmissions(transformedSubmissions);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente recarregar a página.",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  // Questions CRUD
  const addQuestion = async (question: Omit<Question, "id">) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert([{
          question_text: question.questionText,
          options: question.options,
          correct_answer: question.correctAnswer,
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
          question_text: question.questionText,
          options: question.options,
          correct_answer: question.correctAnswer,
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
  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([{
          full_name: employee.fullName,
          position: employee.position,
          sector: employee.sector,
          has_submitted: false
        }])
        .select()
        .single();

      if (error) throw error;
      await loadData();
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
          full_name: employee.fullName,
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
      // First check if employee has submissions
      const { data: submissionsData } = await supabase
        .from("test_submissions")
        .select("id")
        .eq("employee_id", id);

      if (submissionsData && submissionsData.length > 0) {
        throw new Error("Não é possível excluir um colaborador que já realizou testes. Exclua os testes primeiro.");
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
  const addSubmission = async (submission: Omit<TestSubmission, "id" | "submittedAt">) => {
    try {
      const { data, error } = await supabase
        .from("test_submissions")
        .insert([{
          employee_id: submission.employee.id,
          answers: submission.answers,
          score: submission.score,
          feedback: submission.feedback || null
        }])
        .select()
        .single();

      if (error) throw error;

      // Update employee has_submitted flag
      const { error: updateError } = await supabase
        .from("employees")
        .update({ has_submitted: true })
        .eq("id", submission.employee.id);

      if (updateError) throw updateError;

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
          feedback: submission.feedback
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
      // Get the submission to find the employee_id
      const { data: submissionData, error: fetchError } = await supabase
        .from("test_submissions")
        .select("employee_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the submission
      const { error: deleteError } = await supabase
        .from("test_submissions")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Reset employee's has_submitted flag to allow them to retake the test
      const { error: updateError } = await supabase
        .from("employees")
        .update({ has_submitted: false })
        .eq("id", submissionData.employee_id);

      if (updateError) throw updateError;

      await loadData();
    } catch (error) {
      console.error("Error deleting submission:", error);
      throw error;
    }
  };

  const hasEmployeeSubmitted = (employeeId: string): boolean => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.hasSubmitted || false;
  };

  return (
    <DataContext.Provider
      value={{
        questions,
        employees,
        submissions,
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