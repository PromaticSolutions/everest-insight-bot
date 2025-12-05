/**
 * Serviço para chamar a API de IA diretamente
 * Sem necessidade de Edge Functions
 */

interface AnalyzeTestRequest {
  employeeName: string;
  position: string;
  sector: string;
  answers: Record<string, number>;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    category: string;
  }>;
  score: number;
  totalQuestions: number;
}

interface AnalyzeTestResponse {
  feedback: string;
}

/**
 * Gera feedback personalizado usando a API de IA
 */
export async function generateTestFeedback(
  request: AnalyzeTestRequest
): Promise<AnalyzeTestResponse> {
  const apiKey = import.meta.env.VITE_AI_GATEWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Chave de API não configurada. Adicione VITE_AI_GATEWAY_API_KEY ao arquivo .env'
    );
  }

  // Build detailed analysis of answers
  const answerAnalysis = request.questions
    .map((q, index) => {
      const userAnswer = request.answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      return `Questão ${index + 1} (${q.category}): ${q.question}
Resposta do colaborador: ${q.options[userAnswer] || 'Não respondeu'}
Resposta correta: ${q.options[q.correct_answer]}
Resultado: ${isCorrect ? 'CORRETA' : 'INCORRETA'}`;
    })
    .join('\n\n');

  const prompt = `Você é um especialista em Excel e análise de desempenho profissional. Analise os resultados do teste de Excel Nível Intermediário do colaborador abaixo e forneça um feedback personalizado, detalhado e construtivo.

INFORMAÇÕES DO COLABORADOR:
- Nome: ${request.employeeName}
- Cargo: ${request.position}
- Setor: ${request.sector}

RESULTADO GERAL:
- Acertos: ${request.score} de ${request.totalQuestions} questões
- Porcentagem: ${Math.round((request.score / request.totalQuestions) * 100)}%

ANÁLISE DETALHADA DAS RESPOSTAS:
${answerAnalysis}

Por favor, forneça:
1. Uma análise geral do desempenho
2. Pontos fortes identificados
3. Áreas que precisam de melhoria
4. Recomendações específicas de estudo para cada área com dificuldade
5. Sugestões de recursos ou práticas para desenvolver as habilidades necessárias

O feedback deve ser profissional, motivador e direcionado para o desenvolvimento do colaborador.`;

  try {
    const response = await fetch('https://api.verceldeploy.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em treinamento corporativo e Excel. Forneça feedbacks detalhados e construtivos em português brasileiro.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes. Adicione créditos à sua conta.');
      }
      if (response.status === 401) {
        throw new Error('Chave de API inválida ou expirada.');
      }

      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    return { feedback };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao gerar feedback. Tente novamente.');
  }
}
