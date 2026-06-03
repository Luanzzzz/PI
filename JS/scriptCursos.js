var gradeCursos = document.querySelector(".courses-grid");

var cursosPadrao = [
  {
    nome: "Reparação em Instalações Elétricas",
    vagas: 16,
    descricao: "Curso voltado para noções práticas de reparos, segurança e manutenção em instalações elétricas.",
    endereco: "Núcleo Profissionalizante - Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Técnicas de Decoração em Bolos",
    vagas: 16,
    descricao: "Formação prática para aprender técnicas de decoração com bicos de confeitar e espatulagem.",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Costura Sob Medida",
    vagas: 16,
    descricao: "Curso de costura para criação, ajuste e acabamento de peças sob medida.",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Costureiro de Máquina Reta e Overloque",
    vagas: 32,
    descricao: "Capacitação para operação de máquina reta e overloque em atividades de costura.",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Modelagem Industrial de Camiseta e Agasalho",
    vagas: 16,
    descricao: "Curso introdutório para criação de moldes industriais de camisetas e agasalhos.",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Assistente de Modelagem Industrial de Roupas",
    vagas: 16,
    descricao: "Formação para apoiar processos de modelagem e preparação de roupas na indústria.",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Assistente de Recursos Humanos - Online",
    vagas: 25,
    descricao: "Curso online com fundamentos de rotinas administrativas e apoio ao setor de recursos humanos.",
    endereco: "Online",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Inspetor de Qualidade",
    vagas: 20,
    descricao: "Capacitação para noções de controle, inspeção e organização de processos de qualidade.",
    endereco: "Núcleo Profissionalizante - Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Técnicas para Elevação de Alvenaria",
    vagas: 16,
    descricao: "Curso com fundamentos de alvenaria estrutural e práticas iniciais da construção civil.",
    endereco: "Núcleo Profissionalizante - Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Petit Four Salgados",
    vagas: 16,
    descricao: "Formação prática para preparo de petit four salgado e organização básica de produção.",
    endereco: "Núcleo Profissionalizante - Atibaia",
    horario: "Horário informado pela prefeitura"
  }
];

function normalizarTexto(texto) {
  if (!texto) {
    return "";
  }

  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function pegarCursos() {
  var cursosSalvos = JSON.parse(localStorage.getItem("cursos")) || [];

  return cursosPadrao.concat(cursosSalvos);
}

function contarMatriculas(nomeCurso) {
  var alunos = JSON.parse(localStorage.getItem("alunos")) || [];
  var total = 0;

  alunos.forEach(function (aluno) {
    if (normalizarTexto(aluno.curso) === normalizarTexto(nomeCurso) && aluno.status !== "Cancelada") {
      total++;
    }
  });

  return total;
}

function calcularVagas(curso) {
  var vagas = Number(curso.vagas) || 0;
  var matriculas = contarMatriculas(curso.nome);

  return vagas - matriculas;
}

function mostrarCursos() {
  var cursos = pegarCursos();

  gradeCursos.innerHTML = "";

  cursos.forEach(function (curso) {
    var card = document.createElement("article");
    var titulo = document.createElement("h2");
    var descricao = document.createElement("p");
    var vagas = document.createElement("span");
    var botao = document.createElement("a");
    var vagasDisponiveis = calcularVagas(curso);

    if (vagasDisponiveis < 0) {
      vagasDisponiveis = 0;
    }

    card.className = "course-card";
    titulo.textContent = curso.nome;
    descricao.textContent = curso.descricao;
    vagas.className = "course-vacancies";
    vagas.textContent = vagasDisponiveis + " vagas disponíveis";
    botao.href = "cadastro_alunos.html?curso=" + encodeURIComponent(curso.nome);
    botao.className = "btn btn-primary";
    botao.textContent = "Inscrever-se";

    if (vagasDisponiveis === 0) {
      botao.className = "btn btn-primary disabled";
      botao.href = "#";
      botao.textContent = "Sem vagas";
    }

    card.appendChild(titulo);
    card.appendChild(descricao);
    card.appendChild(vagas);
    card.appendChild(botao);
    gradeCursos.appendChild(card);
  });
}

mostrarCursos();
