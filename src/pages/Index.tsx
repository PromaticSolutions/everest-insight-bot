import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { Building2, Lock, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { addEmployee, setCurrentEmployee } = useData();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    sector: "",
    position: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.sector || !formData.position) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const employee = await addEmployee({
        fullName: formData.fullName,
        sector: formData.sector,
        position: formData.position,
      });

      if (employee) {
        setCurrentEmployee(employee);
        
        toast({
          title: "Bem-vindo!",
          description: `Olá ${formData.fullName}, acesse suas provas pendentes.`,
        });
        
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar o cadastro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 glass">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Everest Engenharia
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Sistema de Avaliação - Excel Intermediário
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Digite seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector">Setor</Label>
                <Input
                  id="sector"
                  placeholder="Ex: Financeiro, RH, Engenharia"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  placeholder="Ex: Analista, Coordenador"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full h-11 mt-6 font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Acessar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-4 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground/50 hover:text-muted-foreground text-xs gap-1"
          onClick={() => navigate("/admin-login")}
        >
          <Lock className="w-3 h-3" />
          Admin
        </Button>
      </div>
    </div>
  );
};

export default Index;
