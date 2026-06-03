"""Teste ponta a ponta do Portal de Cursos Atibaia.

Requisitos:
  pip install playwright
  python -m playwright install chromium

Como executar:
  python tests/verificar_site.py
  python tests/verificar_site.py --headed
"""

from __future__ import annotations

import argparse
import contextlib
import functools
import socket
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Callable
from urllib.parse import quote

try:
    from playwright.sync_api import (
        TimeoutError as PlaywrightTimeoutError,
        expect,
        sync_playwright,
    )
except ModuleNotFoundError:
    print("ERRO: o pacote 'playwright' nao esta instalado.")
    print("Instale com:")
    print("  pip install playwright")
    print("  python -m playwright install chromium")
    sys.exit(1)


ROOT = Path(__file__).resolve().parents[1]
TIMEOUT_MS = 15000


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


class Resultado:
    def __init__(self) -> None:
        self.passou = 0
        self.falhou = 0
        self.falhas: list[str] = []

    def ok(self, nome: str) -> None:
        self.passou += 1
        print(f"[OK] {nome}")

    def erro(self, nome: str, exc: BaseException) -> None:
        self.falhou += 1
        mensagem = f"{nome}: {type(exc).__name__}: {exc}"
        self.falhas.append(mensagem)
        print(f"[FALHOU] {mensagem}")


def porta_livre() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


@contextlib.contextmanager
def servidor_local() -> str:
    porta = porta_livre()
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = ThreadingHTTPServer(("127.0.0.1", porta), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    try:
        yield f"http://127.0.0.1:{porta}"
    finally:
        httpd.shutdown()
        thread.join(timeout=2)


def abrir(page, base_url: str, caminho: str) -> None:
    page.goto(f"{base_url}/{caminho}", wait_until="domcontentloaded")


def esperar_caminho(page, caminho: str) -> None:
    page.wait_for_function(
        "(caminho) => window.location.pathname.endsWith(caminho)",
        arg=caminho,
        timeout=TIMEOUT_MS,
    )


def limpar_local_storage(page, base_url: str) -> None:
    abrir(page, base_url, "home.html")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="domcontentloaded")


def definir_admin_logado(page, base_url: str) -> None:
    abrir(page, base_url, "home.html")
    page.evaluate(
        """localStorage.setItem('adminLogado', JSON.stringify({
            nome: 'Carlos',
            usuario: 'admin',
            senha: 'admin123',
            admin: true
        }))"""
    )


def pegar_storage(page, chave: str):
    return page.evaluate(
        """(chave) => {
            const valor = localStorage.getItem(chave);
            return valor ? JSON.parse(valor) : null;
        }""",
        chave,
    )


def setar_storage(page, chave: str, valor) -> None:
    page.evaluate(
        """([chave, valor]) => localStorage.setItem(chave, JSON.stringify(valor))""",
        [chave, valor],
    )


def alertas_da_acao(page, acao: Callable[[], None]) -> list[str]:
    mensagens: list[str] = []

    def capturar(dialog) -> None:
        mensagens.append(dialog.message)
        dialog.accept()

    page.once("dialog", capturar)
    acao()
    page.wait_for_timeout(200)
    return mensagens


def ultimo_alerta(page, acao: Callable[[], None]) -> str:
    mensagens = alertas_da_acao(page, acao)
    assert mensagens, "Nenhum alerta foi exibido."
    return mensagens[-1]


def encontrar_aluno(page, email: str):
    alunos = pegar_storage(page, "alunos") or []
    for aluno in alunos:
        if aluno.get("email") == email:
            return aluno
    return None


def testar_paginas_publicas(page, base_url: str) -> None:
    paginas = {
        "home.html": ".hero-section",
        "cursos.html": ".courses-grid",
        "cadastro_alunos.html": ".registration-form",
    }

    for caminho, seletor in paginas.items():
        abrir(page, base_url, caminho)
        expect(page.locator(seletor)).to_be_visible(timeout=TIMEOUT_MS)


def testar_bloqueios_de_acesso(page, base_url: str) -> None:
    limpar_local_storage(page, base_url)

    bloqueios = {
        "home_ADM.html": "home.html#login-admin",
        "cadastro_cursos.html": "home.html#login-admin",
        "alunos_matriculados.html": "home.html#login-admin",
        "usuario.html": "home.html#login-estudante",
    }

    for caminho, destino in bloqueios.items():
        abrir(page, base_url, caminho)
        page.wait_for_url(f"**/{destino}", wait_until="commit", timeout=TIMEOUT_MS)


def testar_login_admin(page, base_url: str) -> None:
    limpar_local_storage(page, base_url)
    abrir(page, base_url, "home.html#login-admin")

    alerta = ultimo_alerta(
        page,
        lambda: (
            page.locator("#admin-usuario").fill("admin"),
            page.locator("#admin-senha").fill("senha-errada"),
            page.locator("#login-admin form").evaluate("form => form.requestSubmit()"),
        ),
    )
    assert "incorretos" in alerta.lower()

    page.locator("#admin-senha").fill("admin123")
    page.locator("#login-admin form").evaluate("form => form.requestSubmit()")
    esperar_caminho(page, "home_ADM.html")

    admin = pegar_storage(page, "adminLogado")
    assert admin and admin.get("admin") is True
    expect(page.locator("#nome-admin")).to_contain_text("Carlos", timeout=TIMEOUT_MS)


def testar_cadastro_de_curso(page, base_url: str, nome_curso: str) -> None:
    definir_admin_logado(page, base_url)
    abrir(page, base_url, "cadastro_cursos.html")

    alerta = ultimo_alerta(
        page,
        lambda: page.locator(".admin-form").evaluate("form => form.requestSubmit()"),
    )
    assert "preencha" in alerta.lower()

    page.locator("#nomeCurso").fill(nome_curso)
    page.locator("#instituicao").fill("Teste Automatizado")
    page.locator("#cargaHoraria").fill("12 horas")
    page.locator("#categoria").fill("Tecnologia")
    page.locator("#vagas").fill("3")
    page.locator("#endereco").fill("Unidade de Testes")
    page.locator("#horario").fill("Segundas, 19h")
    page.locator("#descricao").fill("Curso criado pelo teste automatizado.")

    alerta = ultimo_alerta(
        page,
        lambda: page.locator(".admin-form").evaluate("form => form.requestSubmit()"),
    )
    assert "sucesso" in alerta.lower()

    cursos = pegar_storage(page, "cursos") or []
    assert any(curso.get("nome") == nome_curso and curso.get("vagas") == 3 for curso in cursos)

    abrir(page, base_url, "cursos.html")
    card = page.locator(".course-card").filter(has_text=nome_curso)
    expect(card).to_be_visible(timeout=TIMEOUT_MS)
    expect(card.locator(".course-vacancies")).to_contain_text("3 vagas", timeout=TIMEOUT_MS)


def testar_cadastro_de_aluno(page, base_url: str, nome_curso: str, email: str) -> None:
    abrir(page, base_url, f"cadastro_alunos.html?curso={quote(nome_curso)}")
    expect(page.locator("#curso")).to_have_value(nome_curso, timeout=TIMEOUT_MS)

    page.locator("#nome").fill("Aluno Teste Automatizado")
    page.locator("#email").fill(email)
    page.locator("#cpf").fill("000.000.000-01")
    page.locator("#senha").fill("teste123")

    alerta = ultimo_alerta(
        page,
        lambda: page.locator(".registration-form").evaluate("form => form.requestSubmit()"),
    )
    assert "sucesso" in alerta.lower()

    aluno = encontrar_aluno(page, email)
    assert aluno is not None
    assert aluno["curso"] == nome_curso
    assert aluno["documentos"] == "Pendentes"
    assert aluno["status"] == "Ativa"

    page.locator("#nome").fill("Aluno Duplicado")
    page.locator("#email").fill(email)
    page.locator("#cpf").fill("000.000.000-02")
    page.locator("#senha").fill("teste123")
    page.locator("#curso").select_option(nome_curso)
    alerta = ultimo_alerta(
        page,
        lambda: page.locator(".registration-form").evaluate("form => form.requestSubmit()"),
    )
    assert "e-mail" in alerta.lower()

    abrir(page, base_url, "cursos.html")
    card = page.locator(".course-card").filter(has_text=nome_curso)
    expect(card.locator(".course-vacancies")).to_contain_text("2 vagas", timeout=TIMEOUT_MS)


def testar_login_e_area_do_aluno(page, base_url: str, nome_curso: str, email: str) -> None:
    abrir(page, base_url, "home.html#login-estudante")

    alerta = ultimo_alerta(
        page,
        lambda: (
            page.locator("#estudante-usuario").fill(email),
            page.locator("#estudante-senha").fill("senha-errada"),
            page.locator("#login-estudante form").evaluate("form => form.requestSubmit()"),
        ),
    )
    assert "incorretos" in alerta.lower()

    page.locator("#estudante-senha").fill("teste123")
    page.locator("#login-estudante form").evaluate("form => form.requestSubmit()")
    esperar_caminho(page, "usuario.html")

    aluno = pegar_storage(page, "alunoLogado")
    assert aluno and aluno.get("email") == email
    expect(page.locator("#cursos-aluno")).to_contain_text(nome_curso, timeout=TIMEOUT_MS)
    expect(page.locator("#cursos-aluno")).to_contain_text("ativa", timeout=TIMEOUT_MS)


def testar_acoes_admin_em_alunos(page, base_url: str, nome_curso: str, email: str) -> None:
    definir_admin_logado(page, base_url)
    abrir(page, base_url, "alunos_matriculados.html")

    linha = page.locator("#lista-alunos tr").filter(has_text=email)
    expect(linha).to_be_visible(timeout=TIMEOUT_MS)

    linha.locator('[data-acao="documentos"]').click()
    aluno = encontrar_aluno(page, email)
    assert aluno and aluno["documentos"] == "Completos"
    expect(linha).to_contain_text("Completos", timeout=TIMEOUT_MS)

    linha.locator('[data-acao="cancelar"]').click()
    aluno = encontrar_aluno(page, email)
    assert aluno and aluno["status"] == "Cancelada"
    expect(linha).to_contain_text("Cancelada", timeout=TIMEOUT_MS)

    abrir(page, base_url, "cursos.html")
    card = page.locator(".course-card").filter(has_text=nome_curso)
    expect(card.locator(".course-vacancies")).to_contain_text("3 vagas", timeout=TIMEOUT_MS)

    abrir(page, base_url, "usuario.html")
    expect(page.locator("#cursos-aluno")).to_contain_text("cancelada", timeout=TIMEOUT_MS)


def testar_curso_sem_vagas(page, base_url: str) -> None:
    limpar_local_storage(page, base_url)
    nome_curso = "Curso Lotado Teste"
    aluno_existente = {
        "nome": "Aluno ja matriculado",
        "email": "lotado.existente@teste.local",
        "cpf": "000.000.000-10",
        "senha": "teste123",
        "curso": nome_curso,
        "documentos": "Pendentes",
        "status": "Ativa",
    }

    setar_storage(
        page,
        "cursos",
        [
            {
                "nome": nome_curso,
                "instituicao": "Teste",
                "cargaHoraria": "8 horas",
                "categoria": "Teste",
                "vagas": 1,
                "endereco": "Unidade de Testes",
                "horario": "Tercas, 20h",
                "descricao": "Curso usado para validar bloqueio de vagas.",
            }
        ],
    )
    setar_storage(page, "alunos", [aluno_existente])

    abrir(page, base_url, "cursos.html")
    card = page.locator(".course-card").filter(has_text=nome_curso)
    expect(card.locator(".course-vacancies")).to_contain_text("0 vagas", timeout=TIMEOUT_MS)
    expect(card.locator("a")).to_contain_text("Sem vagas", timeout=TIMEOUT_MS)

    abrir(page, base_url, f"cadastro_alunos.html?curso={quote(nome_curso)}")
    page.locator("#nome").fill("Aluno Sem Vaga")
    page.locator("#email").fill("sem.vaga@teste.local")
    page.locator("#cpf").fill("000.000.000-11")
    page.locator("#senha").fill("teste123")

    alerta = ultimo_alerta(
        page,
        lambda: page.locator(".registration-form").evaluate("form => form.requestSubmit()"),
    )
    assert "nao possui vagas" in alerta.lower()


def main() -> int:
    parser = argparse.ArgumentParser(description="Verifica os fluxos principais do site.")
    parser.add_argument("--headed", action="store_true", help="Mostra o navegador durante os testes.")
    parser.add_argument("--base-url", help="Usa um servidor ja aberto, ex: http://127.0.0.1:5500")
    args = parser.parse_args()

    resultado = Resultado()
    testes: list[tuple[str, Callable]] = []

    with contextlib.ExitStack() as stack:
        base_url = args.base_url or stack.enter_context(servidor_local())
        print(f"Testando site em: {base_url}")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=not args.headed)
            context = browser.new_context()
            page = context.new_page()
            page.set_default_timeout(TIMEOUT_MS)

            erros_javascript: list[str] = []
            page.on("pageerror", lambda exc: erros_javascript.append(str(exc)))
            page.on(
                "console",
                lambda msg: erros_javascript.append(msg.text) if msg.type == "error" else None,
            )

            nome_curso = "Curso Teste Automatizado"
            email_aluno = "aluno.teste@teste.local"

            testes = [
                ("Paginas publicas carregam", lambda: testar_paginas_publicas(page, base_url)),
                ("Areas protegidas bloqueiam acesso sem login", lambda: testar_bloqueios_de_acesso(page, base_url)),
                ("Login do administrador funciona", lambda: testar_login_admin(page, base_url)),
                ("Cadastro de curso funciona", lambda: testar_cadastro_de_curso(page, base_url, nome_curso)),
                ("Cadastro de aluno e desconto de vagas funcionam", lambda: testar_cadastro_de_aluno(page, base_url, nome_curso, email_aluno)),
                ("Login e area do aluno funcionam", lambda: testar_login_e_area_do_aluno(page, base_url, nome_curso, email_aluno)),
                ("Acoes do admin em matriculas funcionam", lambda: testar_acoes_admin_em_alunos(page, base_url, nome_curso, email_aluno)),
                ("Curso sem vagas bloqueia novas inscricoes", lambda: testar_curso_sem_vagas(page, base_url)),
            ]

            for nome, teste in testes:
                try:
                    teste()
                    resultado.ok(nome)
                except (AssertionError, PlaywrightTimeoutError) as exc:
                    resultado.erro(nome, exc)

            if erros_javascript:
                resultado.erro(
                    "Erros JavaScript no navegador",
                    AssertionError("\n".join(erros_javascript[:10])),
                )

            context.close()
            browser.close()

    print("\nResumo:")
    print(f"  Passaram: {resultado.passou}")
    print(f"  Falharam: {resultado.falhou}")

    if resultado.falhas:
        print("\nFalhas encontradas:")
        for falha in resultado.falhas:
            print(f"  - {falha}")
        return 1

    print("\nTudo certo nos fluxos automatizados testados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
