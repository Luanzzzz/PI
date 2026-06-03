var adminLogado = JSON.parse(localStorage.getItem("adminLogado"));
var tituloAdmin = document.getElementById("nome-admin");
var botoesSair = document.querySelectorAll(".sair-admin");

if (!adminLogado || adminLogado.admin !== true) {
  window.location.href = "home.html#login-admin";
}

if (tituloAdmin && adminLogado) {
  tituloAdmin.textContent = "Bem-vindo, " + adminLogado.nome;
}

botoesSair.forEach(function (botao) {
  botao.addEventListener("click", function () {
    localStorage.removeItem("adminLogado");
  });
});
