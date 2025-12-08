import { Question } from "@/types";

export const initialQuestions: Question[] = [
  {
    id: "q1",
    question: "Qual é a primeira etapa ao estruturar uma base de dados no Excel a partir de informações recebidas por e-mail?",
    options: [
      "Aplicar formatação condicional",
      "Identificar e organizar os dados em colunas separadas",
      "Criar gráficos imediatamente",
      "Usar a função PROCV"
    ],
    correct_answer: 1,
    category: "Estruturação de Base de Dados"
  },
  {
    id: "q2",
    question: "Ao criar uma base de dados de vendas, qual informação NÃO é essencial para incluir?",
    options: [
      "Nome do cliente",
      "Código do produto",
      "Cor favorita do cliente",
      "Data da compra"
    ],
    correct_answer: 2,
    category: "Estruturação de Base de Dados"
  },
  {
    id: "q3",
    question: "Qual fórmula você usaria para calcular o valor total de uma venda (quantidade × valor unitário)?",
    options: [
      "=SOMA(A1:B1)",
      "=A1*B1",
      "=MÉDIA(A1:B1)",
      "=CONT.SE(A1:B1)"
    ],
    correct_answer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q4",
    question: "Para validar se um pagamento foi feito à vista ou a prazo, qual função é mais adequada?",
    options: [
      "SOMA",
      "SE",
      "MÉDIA",
      "MÁXIMO"
    ],
    correct_answer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q5",
    question: "Qual função você usaria para buscar o nome de um produto usando seu código em outra planilha?",
    options: [
      "SOMA",
      "PROCV ou PROCX",
      "CONT.SE",
      "CONCATENAR"
    ],
    correct_answer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q6",
    question: "Para extrair apenas o primeiro nome de uma célula que contém o nome completo, qual função você utilizaria?",
    options: [
      "DIREITA",
      "ESQUERDA combinada com LOCALIZAR",
      "SOMA",
      "ARRED"
    ],
    correct_answer: 1,
    category: "Texto, Datas e Consolidação"
  },
  {
    id: "q7",
    question: "Qual função permite converter texto em letras maiúsculas?",
    options: [
      "MINÚSCULA",
      "MAIÚSCULA",
      "PRI.MAIÚSCULA",
      "TEXTO"
    ],
    correct_answer: 1,
    category: "Texto, Datas e Consolidação"
  },
  {
    id: "q8",
    question: "Para extrair o mês de uma data, qual função é apropriada?",
    options: [
      "ANO",
      "DIA",
      "MÊS",
      "HOJE"
    ],
    correct_answer: 2,
    category: "Texto, Datas e Consolidação"
  },
  {
    id: "q9",
    question: "Qual é a principal vantagem de usar Tabelas Dinâmicas?",
    options: [
      "Formatar células com cores",
      "Resumir e analisar grandes volumes de dados rapidamente",
      "Criar macros automatizadas",
      "Proteger a planilha com senha"
    ],
    correct_answer: 1,
    category: "Análise com Tabelas Dinâmicas"
  },
  {
    id: "q10",
    question: "Em uma Tabela Dinâmica, onde você colocaria o campo 'Cliente' para ver as vendas por cliente?",
    options: [
      "Na área de Valores",
      "Na área de Linhas ou Colunas",
      "Na área de Filtros apenas",
      "Não é possível usar campos de texto"
    ],
    correct_answer: 1,
    category: "Análise com Tabelas Dinâmicas"
  },
  {
    id: "q11",
    question: "Qual tipo de gráfico é mais adequado para mostrar a proporção de vendas por produto?",
    options: [
      "Gráfico de linhas",
      "Gráfico de pizza ou rosca",
      "Gráfico de dispersão",
      "Gráfico de área"
    ],
    correct_answer: 1,
    category: "Indicadores e Painel"
  },
  {
    id: "q12",
    question: "Ao criar um painel de indicadores (dashboard), qual elemento é essencial?",
    options: [
      "Muitas cores diferentes sem padrão",
      "Indicadores claros que respondam às principais perguntas do negócio",
      "Apenas tabelas sem gráficos",
      "Fórmulas visíveis para o usuário"
    ],
    correct_answer: 1,
    category: "Indicadores e Painel"
  },
  {
    id: "q13",
    question: "Qual gráfico é melhor para mostrar a evolução das vendas ao longo do tempo?",
    options: [
      "Gráfico de pizza",
      "Gráfico de colunas empilhadas",
      "Gráfico de linhas",
      "Gráfico de radar"
    ],
    correct_answer: 2,
    category: "Indicadores e Painel"
  },
  {
    id: "q14",
    question: "Para calcular o total de vendas apenas dos produtos com valor acima de R$ 100, qual função é mais adequada?",
    options: [
      "SOMA",
      "SOMASE ou SOMASES",
      "CONT.SE",
      "MÉDIA"
    ],
    correct_answer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q15",
    question: "Qual é a diferença principal entre PROCV e PROCX?",
    options: [
      "PROCV é mais rápido",
      "PROCX é mais flexível e pode buscar em qualquer direção",
      "PROCV funciona apenas com números",
      "Não há diferença, são iguais"
    ],
    correct_answer: 1,
    category: "Fórmulas e Validações"
  }
];
