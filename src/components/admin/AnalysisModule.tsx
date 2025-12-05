import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { User, Briefcase, Building2, ArrowLeft, Copy, Sparkles, Loader2, Trash2 } from "lucide-react";
import { TestSubmission } from "@/types";
import { generateTestFeedback } from "@/services/aiService";

const AnalysisModule = () => {
  const { submissions, questions, updateSubmission, deleteSubmission } = useData();
  const { toast } = useToast();
  
  const [selectedSubmission, setSelectedSubmission] = useState<TestSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<TestSubmission | null>(null);

  const generateFeedback = async (submission: TestSubmission) => {
    setIsGenerating(true);
    
    try {
      const result = await generateTestFeedback({
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
      });

      const generatedFeedback = result.feedback;
      setFeedback(generatedFeedback);
      
      const updatedSubmission = { ...submission, feedback: generatedFeedback };
      await updateSubmission(updatedSubmission);
      setSelectedSubmission(updatedSubmission);
      
      toast({ title: "Feedback gerado com sucesso!" });
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Erro ao gerar feedback",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
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

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      await deleteSubmission(submissionToDelete.id);
      toast({ 
        title: "Teste excluído com sucesso!",
        description: "O colaborador poderá fazer o teste novamente."
      });
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
      
      // Se estava visualizando esse submission, voltar para a lista
      if (selectedSubmission?.id === submissionToDelete.id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Erro ao excluir teste",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (submission: TestSubmission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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
          <Button
            variant="destructive"
            onClick={() => confirmDelete(selectedSubmission)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Teste
          </Button>
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
                {isGenerating ? "Gerando..." : feedback ? "Regenerar Feedback" : "Gerar Feedback"}
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

        {/* Detalhes das Respostas */}
        <Card className="shadow-sm border-0 glass">
          <CardHeader>
            <CardTitle>Respostas Detalhadas</CardTitle>
            <CardDescription>Análise questão por questão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = selectedSubmission.answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className={`p-4 rounded-lg border-2 ${
                  isCorrect 
                    ? 'border-green-500/20 bg-green-50/50 dark:bg-green-950/20' 
                    : 'border-red-500/20 bg-red-50/50 dark:bg-red-950/20'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">Questão {index + 1}</h4>
                    <Badge variant={isCorrect ? "default" : "destructive"}>
                      {isCorrect ? "Correta" : "Incorreta"}
                    </Badge>
                  </div>
                  <p className="text-sm mb-3">{question.questionText}</p>
                  <div className="space-y-2">
                    <div className={`p-2 rounded text-sm ${
                      userAnswer === question.correctAnswer 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <strong>Resposta do colaborador:</strong> {question.options[userAnswer]}
                    </div>
                    {!isCorrect && (
                      <div className="p-2 rounded text-sm bg-green-100 dark:bg-green-900/30">
                        <strong>Resposta correta:</strong> {question.options[question.correctAnswer]}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Categoria: {question.category}</p>
                </div>
              );
            })}
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
              className="shadow-lg border-0 glass hover:shadow-xl transition-all group relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(submission);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div 
                className="cursor-pointer"
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
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o teste de <strong>{submissionToDelete?.employee.fullName}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita. O colaborador poderá fazer o teste novamente após a exclusão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnalysisModule;