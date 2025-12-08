export interface GenerateFeedbackParams {
  employeeName: string;
  position: string;
  sector: string;
  answers: Array<{ questionId: string; answer: number }>;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    category: string;
  }>;
  score?: number;
  totalQuestions: number;
}

export async function generateTestFeedback(params: GenerateFeedbackParams): Promise<{ feedback: string }> {
  try {
    const response = await fetch('/api/generate-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return { feedback: data.feedback };
    
  } catch (error) {
    console.error('Error in generateTestFeedback:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Erro ao gerar feedback. Verifique sua conexão e tente novamente.'
    );
  }
}
