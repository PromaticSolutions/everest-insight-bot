import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Send, AlertCircle, Loader2 } from "lucide-react";

const TestPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { toast } = useToast();
  const { currentEmployee, questions, addSubmission, loading } = useData();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentEmployee) {
      navigate("/");
    }
  }, [currentEmployee, navigate]);

  if (!currentEmployee) return null;

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando questões...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = Object.keys(answers).length === questions.length;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: parseInt(value) });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let score = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });

      await addSubmission({
        employeeId: currentEmployee.id,
        employee: currentEmployee,
        answers,
        submittedAt: new Date().toISOString(),
        score,
      });
      
      toast({
        title: "Prova enviada!",
        description: `Você acertou ${score} de ${questions.length} questões.`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a prova.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Questão {currentIndex + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl border-0 glass">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                {currentQuestion?.category}
              </span>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion?.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion?.id]?.toString() || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${answers[currentQuestion.id] === index 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  onClick={() => handleAnswer(index.toString())}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              {currentIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Enviando..." : "Enviar Prova"}
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Próxima
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {!allAnswered && currentIndex === questions.length - 1 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-accent/10 rounded-lg text-sm text-accent-foreground">
                <AlertCircle className="w-4 h-4 text-accent" />
                Responda todas as questões para enviar a prova.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all
                ${currentIndex === index 
                  ? "bg-primary text-primary-foreground" 
                  : answers[questions[index].id] !== undefined
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
