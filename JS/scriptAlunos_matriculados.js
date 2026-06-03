var adminLogado = JSON.parse(localStorage.getItem("adminLogado"));
var tabelaAlunos = document.getElementById("lista-alunos");
var botoesSair = document.querySelectorAll(".sair-admin");

if (!adminLogado || adminLogado.admin !== true) {
  window.location.href = "home.html#login-admin";
}

botoesSair.forEach(function (botao) {
  botao.addEventListener("click", function () {
    localStorage.removeItem("adminLogado");
  });
});

function classeDocumentos(documentos) {
  if (documentos === "Completos") {
    return "complete";
  }

  return "pending";
}

function classeStatus(status) {
  if (status === "Cancelada") {
    return "canceled";
  }

  return "active";
}

function mostrarAlunos() {
  var alunos = JSON.parse(localStorage.getItem("alunos")) || [];

  tabelaAlunos.innerHTML = "";

  if (alunos.length === 0) {
    tabelaAlunos.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum aluno cadastrado.</td></tr>';
    return;
  }

  alunos.forEach(function (aluno, indice) {
    var linha = document.createElement("tr");
    var documentos = aluno.documentos || "Pendentes";
    var status = aluno.status || "Ativa";

    linha.innerHTML =
      "<td>" + aluno.nome + "</td>" +
      "<td>" + aluno.email + "</td>" +
      "<td>" + aluno.cpf + "</td>" +
      "<td>" + aluno.curso + "</td>" +
      '<td><span class="status-badge ' + classeDocumentos(documentos) + '">' + documentos + "</span></td>" +
      '<td><span class="status-badge ' + classeStatus(status) + '">' + status + "</span></td>" +
      '<td class="action-buttons text-center">' +
      '<button class="btn-table btn-info" data-acao="documentos" data-indice="' + indice + '">Confirmar entrega de documentos</button>' +
      '<button class="btn-table btn-danger" data-acao="cancelar" data-indice="' + indice + '">Cancelar matrícula</button>' +
      "</td>";

    tabelaAlunos.appendChild(linha);
  });
}

tabelaAlunos.addEventListener("click", function (evento) {
  var botao = evento.target;

  if (botao.tagName !== "BUTTON") {
    return;
  }

  var alunos = JSON.parse(localStorage.getItem("alunos")) || [];
  var indice = Number(botao.dataset.indice);

  if (botao.dataset.acao === "documentos") {
    alunos[indice].documentos = "Completos";
  }

  if (botao.dataset.acao === "cancelar") {
    alunos[indice].status = "Cancelada";
  }

  localStorage.setItem("alunos", JSON.stringify(alunos));
  mostrarAlunos();
});

mostrarAlunos();
