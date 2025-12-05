import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employeeName, position, sector, answers, questions, score, totalQuestions } = await req.json();
    
    const AI_GATEWAY_API_KEY = Deno.env.get('AI_GATEWAY_API_KEY');
    if (!AI_GATEWAY_API_KEY) {
      throw new Error('AI_GATEWAY_API_KEY is not configured');
    }

    // Build detailed analysis of answers
    const answerAnalysis = questions.map((q: any, index: number) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      return `Questão ${index + 1} (${q.category}): ${q.question}
      Resposta do colaborador: ${q.options[userAnswer] || 'Não respondeu'}
      Resposta correta: ${q.options[q.correct_answer]}
      Resultado: ${isCorrect ? 'CORRETA' : 'INCORRETA'}`;
    }).join('\n\n');

    const prompt = `Você é um especialista em Excel e análise de desempenho profissional. Analise os resultados do teste de Excel Nível Intermediário do colaborador abaixo e forneça um feedback personalizado, detalhado e construtivo.

INFORMAÇÕES DO COLABORADOR:
- Nome: ${employeeName}
- Cargo: ${position}
- Setor: ${sector}

RESULTADO GERAL:
- Acertos: ${score} de ${totalQuestions} questões
- Porcentagem: ${Math.round((score / totalQuestions) * 100)}%

ANÁLISE DETALHADA DAS RESPOSTAS:
${answerAnalysis}

Por favor, forneça:
1. Uma análise geral do desempenho
2. Pontos fortes identificados
3. Áreas que precisam de melhoria
4. Recomendações específicas de estudo para cada área com dificuldade
5. Sugestões de recursos ou práticas para desenvolver as habilidades necessárias

O feedback deve ser profissional, motivador e direcionado para o desenvolvimento do colaborador.`;

    console.log('Sending request to AI Gateway...');

    const response = await fetch('https://api.verceldeploy.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_GATEWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em treinamento corporativo e Excel. Forneça feedbacks detalhados e construtivos em português brasileiro.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente mais tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos à sua conta.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    console.log('AI feedback generated successfully');

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-test function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
