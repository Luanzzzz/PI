var formulario = document.querySelector(".registration-form");

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  var nome = document.getElementById("nome").value;
  var email = document.getElementById("email").value;
  var cpf = document.getElementById("cpf").value;
  var senha = document.getElementById("senha").value;
  var curso = document.getElementById("curso").value;

  var alunos = JSON.parse(localStorage.getItem("alunos")) || [];

  var emailJaCadastrado = alunos.some(function (aluno) {
    return aluno.email === email;
  });

  if (emailJaCadastrado) {
    alert("Este e-mail ja esta cadastrado");
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
});
