var campoEmail = document.getElementById("estudante-usuario");
var campoSenha = document.getElementById("estudante-senha");
var formularioEstudante = campoEmail.closest("form");
var campoUsuarioAdmin = document.getElementById("admin-usuario");
var campoSenhaAdmin = document.getElementById("admin-senha");
var formularioAdmin = campoUsuarioAdmin.closest("form");

function criarAdminPadrao() {
  var admins = JSON.parse(localStorage.getItem("admins")) || [];

  if (admins.length === 0) {
    admins.push({
      nome: "Carlos",
      usuario: "admin",
      senha: "admin123",
      admin: true
    });

    localStorage.setItem("admins", JSON.stringify(admins));
  }
}

criarAdminPadrao();

formularioAdmin.addEventListener("submit", function (evento) {
  evento.preventDefault();

  var usuario = campoUsuarioAdmin.value;
  var senha = campoSenhaAdmin.value;
  var admins = JSON.parse(localStorage.getItem("admins")) || [];

  var adminEncontrado = admins.find(function (admin) {
    return admin.usuario === usuario && admin.senha === senha && admin.admin === true;
  });

  if (adminEncontrado) {
    localStorage.setItem("adminLogado", JSON.stringify(adminEncontrado));
    window.location.href = "home_ADM.html";
  } else {
    alert("Usuario ou senha de administrador incorretos");
  }
});

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
