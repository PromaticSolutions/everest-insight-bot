import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { Question } from "@/types";

const QuestionsManager = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useData();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
  });

  const resetForm = () => {
    setFormData({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      category: "",
    });
    setEditingQuestion(null);
  };

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        category: question.category,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.questionText || formData.options.some(o => !o) || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (editingQuestion) {
      await updateQuestion({
        ...editingQuestion,
        ...formData,
      });
      toast({ title: "Questão atualizada!" });
    } else {
      await addQuestion(formData);
      toast({ title: "Questão adicionada!" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteQuestion(id);
    toast({ title: "Questão removida!" });
  };

  const categories = [...new Set(questions.map(q => q.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Questões</h2>
          <p className="text-muted-foreground">{questions.length} questões cadastradas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Questão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Editar Questão" : "Nova Questão"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  placeholder="Ex: Fórmulas e Validações"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Pergunta</Label>
                <Textarea
                  placeholder="Digite a pergunta..."
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Opções de Resposta</Label>
                <RadioGroup
                  value={formData.correctAnswer.toString()}
                  onValueChange={(v) => setFormData({ ...formData, correctAnswer: parseInt(v) })}
                >
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <RadioGroupItem value={index.toString()} id={`opt-${index}`} />
                      <Input
                        placeholder={`Opção ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="flex-1"
                      />
                      {formData.correctAnswer === index && (
                        <Check className="w-4 h-4 text-success" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Selecione o círculo ao lado da resposta correta
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingQuestion ? "Salvar Alterações" : "Adicionar Questão"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-foreground">{category}</h3>
          <div className="grid gap-3">
            {questions.filter(q => q.category === category).map((question, index) => (
              <Card key={question.id} className="shadow-sm border-0 glass">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-medium leading-relaxed">
                      {questions.indexOf(question) + 1}. {question.questionText}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(question)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {question.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg ${
                          i === question.correctAnswer
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-secondary/50 text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}) {opt}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionsManager;
