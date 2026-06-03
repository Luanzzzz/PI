var formulario = document.querySelector(".registration-form");
var campoCurso = document.getElementById("curso");

var cursosPadrao = [
  { nome: "Reparação em Instalações Elétricas", vagas: 16 },
  { nome: "Técnicas de Decoração em Bolos", vagas: 16 },
  { nome: "Costura Sob Medida", vagas: 16 },
  { nome: "Costureiro de Máquina Reta e Overloque", vagas: 32 },
  { nome: "Modelagem Industrial de Camiseta e Agasalho", vagas: 16 },
  { nome: "Assistente de Modelagem Industrial de Roupas", vagas: 16 },
  { nome: "Assistente de Recursos Humanos - Online", vagas: 25 },
  { nome: "Inspetor de Qualidade", vagas: 20 },
  { nome: "Técnicas para Elevação de Alvenaria", vagas: 16 },
  { nome: "Petit Four Salgados", vagas: 16 }
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

function buscarCurso(nomeCurso) {
  var cursos = pegarCursos();

  return cursos.find(function (curso) {
    return normalizarTexto(curso.nome) === normalizarTexto(nomeCurso);
  });
}

function vagasDisponiveis(nomeCurso) {
  var curso = buscarCurso(nomeCurso);

  if (!curso) {
    return 0;
  }

  return (Number(curso.vagas) || 0) - contarMatriculas(curso.nome);
}

function carregarCursosNoSelect() {
  var cursos = pegarCursos();
  var parametros = new URLSearchParams(window.location.search);
  var cursoEscolhido = parametros.get("curso");

  campoCurso.innerHTML = '<option value="">Selecione um curso</option>';

  cursos.forEach(function (curso) {
    var opcao = document.createElement("option");
    var vagas = vagasDisponiveis(curso.nome);

    if (vagas < 0) {
      vagas = 0;
    }

    opcao.value = curso.nome;
    opcao.textContent = curso.nome + " - " + vagas + " vagas";
    campoCurso.appendChild(opcao);
  });

  if (cursoEscolhido) {
    campoCurso.value = cursoEscolhido;
  }
}

carregarCursosNoSelect();

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  var nome = document.getElementById("nome").value;
  var email = document.getElementById("email").value;
  var cpf = document.getElementById("cpf").value;
  var senha = document.getElementById("senha").value;
  var curso = campoCurso.value;

  var alunos = JSON.parse(localStorage.getItem("alunos")) || [];

  var emailJaCadastrado = alunos.some(function (aluno) {
    return aluno.email === email;
  });

  if (emailJaCadastrado) {
    alert("Este e-mail ja esta cadastrado");
    return;
  }

  if (vagasDisponiveis(curso) <= 0) {
    alert("Este curso nao possui vagas disponiveis");
    return;
  }

  var aluno = {
    nome: nome,
    email: email,
    cpf: cpf,
    senha: senha,
    curso: curso,
    documentos: "Pendentes",
    status: "Ativa"
  };

  alunos.push(aluno);
  localStorage.setItem("alunos", JSON.stringify(alunos));

  alert("Cadastro realizado com sucesso");
  formulario.reset();
  carregarCursosNoSelect();
});
