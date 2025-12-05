import { Question } from "@/types";

export const initialQuestions: Question[] = [
  {
    id: "q1",
    questionText: "Qual é a primeira etapa ao estruturar uma base de dados no Excel a partir de informações recebidas por e-mail?",
    options: [
      "Aplicar formatação condicional",
      "Identificar e organizar os dados em colunas separadas",
      "Criar gráficos imediatamente",
      "Usar a função PROCV"
    ],
    correctAnswer: 1,
    category: "Estruturação de Base de Dados"
  },
  {
    id: "q2",
    questionText: "Ao criar uma base de dados de vendas, qual informação NÃO é essencial para incluir?",
    options: [
      "Nome do cliente",
      "Código do produto",
      "Cor favorita do cliente",
      "Data da compra"
    ],
    correctAnswer: 2,
    category: "Estruturação de Base de Dados"
  },
  {
    id: "q3",
    questionText: "Qual fórmula você usaria para calcular o valor total de uma venda (quantidade × valor unitário)?",
    options: [
      "=SOMA(A1:B1)",
      "=A1*B1",
      "=MÉDIA(A1:B1)",
      "=CONT.SE(A1:B1)"
    ],
    correctAnswer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q4",
    questionText: "Para validar se um pagamento foi feito à vista ou a prazo, qual função é mais adequada?",
    options: [
      "SOMA",
      "SE",
      "MÉDIA",
      "MÁXIMO"
    ],
    correctAnswer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q5",
    questionText: "Qual função você usaria para buscar o nome de um produto usando seu código em outra planilha?",
    options: [
      "SOMA",
      "PROCV ou PROCX",
      "CONT.SE",
      "CONCATENAR"
    ],
    correctAnswer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q6",
    questionText: "Para extrair apenas o primeiro nome de uma célula que contém o nome completo, qual função você utilizaria?",
    options: [
      "DIREITA",
      "ESQUERDA combinada com LOCALIZAR",
      "SOMA",
      "ARRED"
    ],
    correctAnswer: 1,
    category: "Texto, Datas e Consolidação"
  },
  {
    id: "q7",
    questionText: "Qual função permite converter texto em letras maiúsculas?",
    options: [
      "MINÚSCULA",
      "MAIÚSCULA",
      "PRI.MAIÚSCULA",
      "TEXTO"
    ],
    correctAnswer: 1,
    category: "Texto, Datas e Consolidação"
  },
  {
    id: "q8",
    questionText: "Para extrair o mês de uma data, qual função é apropriada?",
    options: [
      "ANO",
      "DIA",
      "MÊS",
      "HOJE"
    ],
    correctAnswer: 2,
    category: "Texto, Datas e Consolidação"
  },
  {
    id: "q9",
    questionText: "Qual é a principal vantagem de usar Tabelas Dinâmicas?",
    options: [
      "Formatar células com cores",
      "Resumir e analisar grandes volumes de dados rapidamente",
      "Criar macros automatizadas",
      "Proteger a planilha com senha"
    ],
    correctAnswer: 1,
    category: "Análise com Tabelas Dinâmicas"
  },
  {
    id: "q10",
    questionText: "Em uma Tabela Dinâmica, onde você colocaria o campo 'Cliente' para ver as vendas por cliente?",
    options: [
      "Na área de Valores",
      "Na área de Linhas ou Colunas",
      "Na área de Filtros apenas",
      "Não é possível usar campos de texto"
    ],
    correctAnswer: 1,
    category: "Análise com Tabelas Dinâmicas"
  },
  {
    id: "q11",
    questionText: "Qual tipo de gráfico é mais adequado para mostrar a proporção de vendas por produto?",
    options: [
      "Gráfico de linhas",
      "Gráfico de pizza ou rosca",
      "Gráfico de dispersão",
      "Gráfico de área"
    ],
    correctAnswer: 1,
    category: "Indicadores e Painel"
  },
  {
    id: "q12",
    questionText: "Ao criar um painel de indicadores (dashboard), qual elemento é essencial?",
    options: [
      "Muitas cores diferentes sem padrão",
      "Indicadores claros que respondam às principais perguntas do negócio",
      "Apenas tabelas sem gráficos",
      "Fórmulas visíveis para o usuário"
    ],
    correctAnswer: 1,
    category: "Indicadores e Painel"
  },
  {
    id: "q13",
    questionText: "Qual gráfico é melhor para mostrar a evolução das vendas ao longo do tempo?",
    options: [
      "Gráfico de pizza",
      "Gráfico de colunas empilhadas",
      "Gráfico de linhas",
      "Gráfico de radar"
    ],
    correctAnswer: 2,
    category: "Indicadores e Painel"
  },
  {
    id: "q14",
    questionText: "Para calcular o total de vendas apenas dos produtos com valor acima de R$ 100, qual função é mais adequada?",
    options: [
      "SOMA",
      "SOMASE ou SOMASES",
      "CONT.SE",
      "MÉDIA"
    ],
    correctAnswer: 1,
    category: "Fórmulas e Validações"
  },
  {
    id: "q15",
    questionText: "Qual é a diferença principal entre PROCV e PROCX?",
    options: [
      "PROCV é mais rápido",
      "PROCX é mais flexível e pode buscar em qualquer direção",
      "PROCV funciona apenas com números",
      "Não há diferença, são iguais"
    ],
    correctAnswer: 1,
    category: "Fórmulas e Validações"
  }
];
