import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { User, Briefcase, Building2, ArrowLeft, Copy, Sparkles, Loader2 } from "lucide-react";
import { TestSubmission } from "@/types";

const AnalysisModule = () => {
  const { submissions, questions, updateSubmission } = useData();
  const { toast } = useToast();
  
  const [selectedSubmission, setSelectedSubmission] = useState<TestSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("everest_openai_key") || "");

  const generateFeedback = async (submission: TestSubmission) => {
    if (!apiKey) {
      toast({
        title: "Chave API necessária",
        description: "Configure sua chave da OpenAI nas configurações.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    const wrongAnswers = questions.filter(
      (q) => submission.answers[q.id] !== q.correctAnswer
    );
    
    const rightAnswers = questions.filter(
      (q) => submission.answers[q.id] === q.correctAnswer
    );

    const prompt = `Você é um instrutor de Excel avaliando o desempenho de um colaborador em uma prova de Excel Nível Intermediário.

Colaborador: ${submission.employee.fullName}
Cargo: ${submission.employee.position}
Setor: ${submission.employee.sector}
Pontuação: ${submission.score}/${questions.length}

Questões que o colaborador ACERTOU:
${rightAnswers.map(q => `- ${q.questionText} (Categoria: ${q.category})`).join('\n')}

Questões que o colaborador ERROU:
${wrongAnswers.map(q => {
  const chosenAnswer = q.options[submission.answers[q.id]] || "Não respondeu";
  const correctAnswer = q.options[q.correctAnswer];
  return `- ${q.questionText}
  Categoria: ${q.category}
  Resposta do colaborador: ${chosenAnswer}
  Resposta correta: ${correctAnswer}`;
}).join('\n\n')}

Por favor, forneça um feedback personalizado e construtivo para este colaborador, incluindo:
1. Reconhecimento dos pontos fortes demonstrados
2. Áreas específicas que precisam de melhoria
3. Sugestões práticas de estudo para cada categoria com baixo desempenho
4. Palavras de encorajamento

O feedback deve ser profissional, empático e motivador.`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na API");
      }

      const data = await response.json();
      const generatedFeedback = data.choices[0].message.content;
      
      setFeedback(generatedFeedback);
      
      const updatedSubmission = { ...submission, feedback: generatedFeedback };
      updateSubmission(updatedSubmission);
      setSelectedSubmission(updatedSubmission);
      
      toast({ title: "Feedback gerado com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro ao gerar feedback",
        description: "Verifique sua chave API e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyFeedback = () => {
    navigator.clipboard.writeText(feedback);
    toast({ title: "Feedback copiado!" });
  };

  const handleSelectSubmission = (submission: TestSubmission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || "");
  };

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedSubmission(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{selectedSubmission.employee.fullName}</h2>
            <p className="text-muted-foreground">
              {selectedSubmission.employee.position} • {selectedSubmission.employee.sector}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-sm border-0 glass">
            <CardHeader className="pb-2">
              <CardDescription>Pontuação</CardDescription>
              <CardTitle className="text-3xl">
                {selectedSubmission.score}/{questions.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-0 glass">
            <CardHeader className="pb-2">
              <CardDescription>Aproveitamento</CardDescription>
              <CardTitle className="text-3xl">
                {Math.round(((selectedSubmission.score || 0) / questions.length) * 100)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-0 glass">
            <CardHeader className="pb-2">
              <CardDescription>Data</CardDescription>
              <CardTitle className="text-lg">
                {new Date(selectedSubmission.submittedAt).toLocaleDateString("pt-BR")}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-lg border-0 glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feedback da IA</CardTitle>
                <CardDescription>Análise personalizada do desempenho</CardDescription>
              </div>
              <div className="flex gap-2">
                {!apiKey && (
                  <input
                    type="password"
                    placeholder="Cole sua chave OpenAI"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      localStorage.setItem("everest_openai_key", e.target.value);
                    }}
                    className="px-3 py-2 text-sm border rounded-lg bg-background w-64"
                  />
                )}
                <Button
                  onClick={() => generateFeedback(selectedSubmission)}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isGenerating ? "Gerando..." : "Gerar Feedback"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {feedback ? (
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-xl whitespace-pre-wrap text-sm leading-relaxed">
                  {feedback}
                </div>
                <Button variant="outline" onClick={copyFeedback} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copiar Feedback
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Clique em "Gerar Feedback" para criar uma análise personalizada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Análise de Resultados</h2>
        <p className="text-muted-foreground">
          {submissions.length} colaborador{submissions.length !== 1 ? "es" : ""} realizaram a prova
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card className="shadow-sm border-0 glass">
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhuma prova realizada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className="shadow-lg border-0 glass hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => handleSelectSubmission(submission)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant={((submission.score || 0) / questions.length) >= 0.7 ? "default" : "secondary"}>
                    {submission.score}/{questions.length}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{submission.employee.fullName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  {submission.employee.position}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  {submission.employee.sector}
                </div>
                <div className="pt-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        ((submission.score || 0) / questions.length) >= 0.7 
                          ? "bg-success" 
                          : "bg-accent"
                      }`}
                      style={{ width: `${((submission.score || 0) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisModule;
