import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { User, Briefcase, Building2, ArrowLeft, Copy, Sparkles, Loader2 } from "lucide-react";
import { TestSubmission } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const AnalysisModule = () => {
  const { submissions, questions, updateSubmission } = useData();
  const { toast } = useToast();
  
  const [selectedSubmission, setSelectedSubmission] = useState<TestSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFeedback = async (submission: TestSubmission) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-test', {
        body: {
          employeeName: submission.employee.fullName,
          position: submission.employee.position,
          sector: submission.employee.sector,
          answers: submission.answers,
          questions: questions.map(q => ({
            id: q.id,
            question: q.questionText,
            options: q.options,
            correct_answer: q.correctAnswer,
            category: q.category
          })),
          score: submission.score,
          totalQuestions: questions.length
        }
      });

      if (error) throw error;

      const generatedFeedback = data.feedback;
      setFeedback(generatedFeedback);
      
      const updatedSubmission = { ...submission, feedback: generatedFeedback };
      await updateSubmission(updatedSubmission);
      setSelectedSubmission(updatedSubmission);
      
      toast({ title: "Feedback gerado com sucesso!" });
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Erro ao gerar feedback",
        description: "Tente novamente mais tarde.",
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
