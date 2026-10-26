package br.edu.ifpb.academia.controller;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import br.edu.ifpb.academia.dto.response.Responses.AlunoResponse;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.StatusAluno;
import br.edu.ifpb.academia.exception.GlobalExceptionHandler;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.service.AlunoService;

@WebMvcTest(AlunoController.class)
@Import(GlobalExceptionHandler.class)
class AlunoControllerTest {

    private static final long ALUNO_ID = 17L;
    private static final String JSON_VALIDO = """
            {
              "nome": "Ana Silva",
              "cpf": "12345678901",
              "telefone": "83999990000",
              "email": "ana@example.com",
              "dataNascimento": "1995-04-12",
              "peso": 62.50,
              "altura": 1.65,
              "nivelExperiencia": "INICIANTE",
              "frequenciaSemanal": 3,
              "status": "ATIVO"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AlunoService alunoService;

    @Test
    void deveCriarAlunoEResponderCreated() throws Exception {
        when(alunoService.criar(any())).thenReturn(alunoResponse());

        mockMvc.perform(post("/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(ALUNO_ID))
                .andExpect(jsonPath("$.cpf").value("12345678901"));
    }

    @Test
    void deveResponderBadRequestComListaDeErrosQuandoCamposObrigatoriosFaltam() throws Exception {
        mockMvc.perform(post("/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros").isArray())
                .andExpect(content().string(containsString("nome:")))
                .andExpect(content().string(containsString("cpf:")))
                .andExpect(content().string(containsString("email:")));
    }

    @Test
    void deveRejeitarCpfQueNaoTenhaOnzeDigitos() throws Exception {
        mockMvc.perform(post("/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO.replace("12345678901", "123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros").isArray())
                .andExpect(content().string(containsString("CPF deve conter exatamente 11 números")));
    }

    @Test
    void deveRejeitarEmailInvalido() throws Exception {
        mockMvc.perform(post("/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO.replace("ana@example.com", "email-invalido")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros").isArray())
                .andExpect(content().string(containsString("email:")));
    }

    @Test
    void deveRejeitarDataDeNascimentoQueNaoEstejaNoPassado() throws Exception {
        mockMvc.perform(post("/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO.replace("1995-04-12", "2999-04-12")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros").isArray())
                .andExpect(content().string(containsString("dataNascimento:")));
    }

    @Test
    void deveRejeitarPesoOuAlturaNaoPositivos() throws Exception {
        String dadosInvalidos = JSON_VALIDO
                .replace("62.50", "0")
                .replace("1.65", "-1");

        mockMvc.perform(post("/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dadosInvalidos))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros").isArray())
                .andExpect(content().string(containsString("peso:")))
                .andExpect(content().string(containsString("altura:")));
    }

    @Test
    void deveResponderUnprocessableEntityComErroDeRegraDeNegocio() throws Exception {
        when(alunoService.criar(any()))
                .thenThrow(new RegraDeNegocioException("Ja existe aluno com este CPF."));

        mockMvc.perform(post("/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.erro").value("Ja existe aluno com este CPF."));
    }

    @Test
    void deveListarAlunosComStatusOk() throws Exception {
        when(alunoService.listar()).thenReturn(List.of(alunoResponse()));

        mockMvc.perform(get("/alunos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(ALUNO_ID))
                .andExpect(jsonPath("$[0].nome").value("Ana Silva"));
    }

    @Test
    void deveConsultarAlunoExistenteComStatusOk() throws Exception {
        when(alunoService.buscar(ALUNO_ID)).thenReturn(alunoResponse());

        mockMvc.perform(get("/alunos/{id}", ALUNO_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ALUNO_ID))
                .andExpect(jsonPath("$.email").value("ana@example.com"));
    }

    @Test
    void deveResponderNotFoundEErroQuandoAlunoNaoExiste() throws Exception {
        when(alunoService.buscar(ALUNO_ID))
                .thenThrow(new RecursoNaoEncontradoException("Aluno não encontrado com ID: " + ALUNO_ID));

        mockMvc.perform(get("/alunos/{id}", ALUNO_ID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Aluno não encontrado com ID: " + ALUNO_ID));
    }

    @Test
    void deveAtualizarAlunoEResponderOk() throws Exception {
        when(alunoService.atualizar(eq(ALUNO_ID), any())).thenReturn(alunoResponse());

        mockMvc.perform(put("/alunos/{id}", ALUNO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ALUNO_ID));
    }

    @Test
    void deveResponderNotFoundAoAtualizarAlunoInexistente() throws Exception {
        when(alunoService.atualizar(eq(ALUNO_ID), any()))
                .thenThrow(new RecursoNaoEncontradoException("Aluno não encontrado com ID: " + ALUNO_ID));

        mockMvc.perform(put("/alunos/{id}", ALUNO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Aluno não encontrado com ID: " + ALUNO_ID));
    }

    @Test
    void deveExcluirAlunoEResponderNoContent() throws Exception {
        mockMvc.perform(delete("/alunos/{id}", ALUNO_ID))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
    }

    @Test
    void deveResponderUnprocessableEntityQuandoExclusaoForBloqueada() throws Exception {
        doThrow(new RegraDeNegocioException("Aluno possui contratos e nao pode ser excluido."))
                .when(alunoService).excluir(ALUNO_ID);

        mockMvc.perform(delete("/alunos/{id}", ALUNO_ID))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.erro").value("Aluno possui contratos e nao pode ser excluido."));
    }

    private static AlunoResponse alunoResponse() {
        return new AlunoResponse(
                ALUNO_ID,
                "Ana Silva",
                "12345678901",
                "83999990000",
                "ana@example.com",
                LocalDate.of(1995, 4, 12),
                new BigDecimal("62.50"),
                new BigDecimal("1.65"),
                NivelExperiencia.INICIANTE,
                3,
                StatusAluno.ATIVO);
    }
}
