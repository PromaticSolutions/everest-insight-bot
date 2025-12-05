import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft } from "lucide-react";

const ADMIN_PASSWORD = "everest2024";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("everest_admin_auth", "true");
      toast({
        title: "Acesso autorizado",
        description: "Bem-vindo ao painel administrativo.",
      });
      navigate("/admin");
    } else {
      toast({
        title: "Senha incorreta",
        description: "Por favor, verifique a senha e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 glass">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Digite a senha para acessar o painel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha de administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 mt-6 font-semibold">
              Entrar
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
