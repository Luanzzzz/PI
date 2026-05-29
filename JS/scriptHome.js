var campoEmail = document.getElementById("estudante-usuario");
var campoSenha = document.getElementById("estudante-senha");
var formularioEstudante = campoEmail.closest("form");

formularioEstudante.addEventListener("submit", function (evento) {
  evento.preventDefault();

  var email = campoEmail.value;
  var senha = campoSenha.value;
  var alunos = JSON.parse(localStorage.getItem("alunos")) || [];

  var alunoEncontrado = alunos.find(function (aluno) {
    return aluno.email === email && aluno.senha === senha;
  });

  if (alunoEncontrado) {
    localStorage.setItem("alunoLogado", JSON.stringify(alunoEncontrado));
    window.location.href = "usuario.html";
  } else {
    alert("E-mail ou senha incorretos");
  }
});
