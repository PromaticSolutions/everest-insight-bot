import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers, questions, employeeName, position, sector, score, totalQuestions } = req.body;

    if (!answers || !questions)
      return res.status(400).json({ error: 'Missing required fields' });

    // Montar análise
    const questionsAnalysis = questions.map((q: any, index: number) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      return `
Questão ${index + 1} (${q.category}):
${q.questionText}
Resposta do colaborador: ${q.options[userAnswer]}
Resposta correta: ${q.options[q.correctAnswer]}
Status: ${isCorrect ? '✓ Correta' : '✗ Incorreta'}
`;
    }).join('\n');

    const prompt = `Você é um especialista em análise ... (prompt inteiro igual ao seu)`;


    // ⭐ IA GATEWAY DA VERCEL
    const apiKey = process.env.AI_GATEWAY_API_KEY;

    if (!apiKey) throw new Error('AI_GATEWAY_API_KEY não configurada');

    const response = await fetch(
      `https://gateway.ai.cloudflare.com/v1/${process.env.AI_GATEWAY_PROJECT}/${process.env.AI_GATEWAY_NAME}/openai/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1", // 👈 modelo via Gateway
          messages: [
            { role: "user", content: prompt }
          ],
          max_tokens: 2000
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gateway error:", error);
      return res.status(500).json({ error: "Gateway API Error", details: error });
    }

    const json = await response.json();
    const feedback = json.choices?.[0]?.message?.content || "Erro ao gerar feedback";

    return res.status(200).json({ feedback });

  } catch (error: any) {
    console.error("Error generating feedback:", error);
    return res.status(500).json({
      error: "Failed to generate feedback",
      message: error.message
    });
  }
}
