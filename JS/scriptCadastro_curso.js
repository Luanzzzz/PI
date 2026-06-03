var adminLogado = JSON.parse(localStorage.getItem("adminLogado"));
var formularioCurso = document.querySelector(".admin-form");
var botoesSair = document.querySelectorAll(".sair-admin");

if (!adminLogado || adminLogado.admin !== true) {
  window.location.href = "home.html#login-admin";
}

botoesSair.forEach(function (botao) {
  botao.addEventListener("click", function () {
    localStorage.removeItem("adminLogado");
  });
});

formularioCurso.addEventListener("submit", function (evento) {
  evento.preventDefault();

  var nome = document.getElementById("nomeCurso").value;
  var instituicao = document.getElementById("instituicao").value;
  var cargaHoraria = document.getElementById("cargaHoraria").value;
  var categoria = document.getElementById("categoria").value;
  var vagas = document.getElementById("vagas").value;
  var endereco = document.getElementById("endereco").value;
  var horario = document.getElementById("horario").value;
  var descricao = document.getElementById("descricao").value;
  var cursos = JSON.parse(localStorage.getItem("cursos")) || [];

  if (nome === "" || descricao === "" || vagas === "") {
    alert("Preencha o nome, a quantidade de vagas e a descricao do curso");
    return;
  }

  var curso = {
    nome: nome,
    instituicao: instituicao,
    cargaHoraria: cargaHoraria,
    categoria: categoria,
    vagas: Number(vagas),
    endereco: endereco,
    horario: horario,
    descricao: descricao
  };

  cursos.push(curso);
  localStorage.setItem("cursos", JSON.stringify(cursos));

  alert("Curso cadastrado com sucesso");
  formularioCurso.reset();
});
