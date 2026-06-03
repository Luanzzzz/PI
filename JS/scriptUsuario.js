var alunoLogado = JSON.parse(localStorage.getItem("alunoLogado"));
var listaCursos = document.getElementById("cursos-aluno");
var botoesSair = document.querySelectorAll(".sair-aluno");

var cursosPadrao = [
  {
    nome: "Reparação em Instalações Elétricas",
    endereco: "Núcleo Profissionalizante - Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Técnicas de Decoração em Bolos",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Costura Sob Medida",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Costureiro de Máquina Reta e Overloque",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Modelagem Industrial de Camiseta e Agasalho",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Assistente de Modelagem Industrial de Roupas",
    endereco: "Rua Marcílio Ambrósio de Carvalho, s/nº - Jardim Roseli, Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Assistente de Recursos Humanos - Online",
    endereco: "Online",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Inspetor de Qualidade",
    endereco: "Núcleo Profissionalizante - Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Técnicas para Elevação de Alvenaria",
    endereco: "Núcleo Profissionalizante - Atibaia",
    horario: "Horário informado pela prefeitura"
  },
  {
    nome: "Petit Four Salgados",
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

function pegarAlunoAtual() {
  var alunos = JSON.parse(localStorage.getItem("alunos")) || [];
  var alunoAtual = alunos.find(function (aluno) {
    return aluno.email === alunoLogado.email;
  });

  if (alunoAtual) {
    return alunoAtual;
  }

  return alunoLogado;
}

function pegarCursos() {
  var cursosSalvos = JSON.parse(localStorage.getItem("cursos")) || [];

  return cursosPadrao.concat(cursosSalvos);
}

function acharCurso(nomeCurso) {
  var cursos = pegarCursos();

  return cursos.find(function (curso) {
    return normalizarTexto(curso.nome) === normalizarTexto(nomeCurso);
  });
}

function mostrarCursoAluno() {
  var aluno = pegarAlunoAtual();
  var curso = acharCurso(aluno.curso);
  var endereco = "Endereço será informado pela prefeitura.";
  var horario = "Horário será informado pela prefeitura.";
  var status = aluno.status || "Ativa";
  var statusTexto = "Matrícula " + status.toLowerCase();
  var statusClasse = "";

  listaCursos.innerHTML = "";

  if (curso) {
    endereco = curso.endereco || endereco;
    horario = curso.horario || horario;
  }

  if (status === "Cancelada") {
    statusClasse = " canceled";
  }

  listaCursos.innerHTML =
    '<article class="student-course-card">' +
    "<div>" +
    '<span class="status-badge' + statusClasse + '">' + statusTexto + "</span>" +
    "<h2>" + aluno.curso + "</h2>" +
    "</div>" +
    "<dl>" +
    "<div><dt>Endereço</dt><dd>" + endereco + "</dd></div>" +
    "<div><dt>Horário</dt><dd>" + horario + "</dd></div>" +
    "</dl>" +
    "</article>";
}

if (!alunoLogado) {
  window.location.href = "home.html#login-estudante";
} else {
  botoesSair.forEach(function (botao) {
    botao.addEventListener("click", function () {
      localStorage.removeItem("alunoLogado");
    });
  });

  mostrarCursoAluno();
}
