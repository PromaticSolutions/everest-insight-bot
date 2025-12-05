import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { LogOut, FileQuestion, BarChart3 } from "lucide-react";
import QuestionsManager from "@/components/admin/QuestionsManager";
import AnalysisModule from "@/components/admin/AnalysisModule";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { submissions } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("everest_admin_auth");
    if (auth !== "true") {
      navigate("/admin-login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("everest_admin_auth");
    navigate("/");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Everest Engenharia</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analysis" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Análises ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <FileQuestion className="w-4 h-4" />
              Questões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <AnalysisModule />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
