import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { ClipboardList, CheckCircle2, Clock, LogOut, User } from "lucide-react";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { currentEmployee, setCurrentEmployee, tests, getSubmissionByEmployee } = useData();

  useEffect(() => {
    if (!currentEmployee) {
      navigate("/");
    }
  }, [currentEmployee, navigate]);

  if (!currentEmployee) return null;

  const submission = getSubmissionByEmployee(currentEmployee.id);
  const testCompleted = !!submission;

  const handleLogout = () => {
    setCurrentEmployee(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{currentEmployee.fullName}</h1>
              <p className="text-sm text-muted-foreground">{currentEmployee.position} • {currentEmployee.sector}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Provas Pendentes</h2>
          <p className="text-muted-foreground mt-1">Complete as avaliações disponíveis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.filter(t => t.isActive).map((test) => (
            <Card key={test.id} className="shadow-lg border-0 glass hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-primary" />
                  </div>
                  {testCompleted ? (
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Pendente
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-4">{test.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{test.questions.length} questões</span>
                  <span>~15 min</span>
                </div>
                <Button
                  className="w-full"
                  disabled={testCompleted}
                  onClick={() => navigate(`/test/${test.id}`)}
                >
                  {testCompleted ? "Prova Concluída" : "Iniciar Prova"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {testCompleted && submission && (
          <Card className="mt-8 shadow-lg border-0 glass">
            <CardHeader>
              <CardTitle className="text-lg">Resultado da sua avaliação</CardTitle>
              <CardDescription>
                Você acertou {submission.score} de {tests[0]?.questions.length || 15} questões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${((submission.score || 0) / (tests[0]?.questions.length || 15)) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Aguarde o feedback detalhado do administrador.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
