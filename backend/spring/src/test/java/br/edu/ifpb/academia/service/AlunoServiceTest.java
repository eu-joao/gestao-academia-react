package br.edu.ifpb.academia.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ifpb.academia.dto.request.AlunoRequest;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.StatusAluno;
import br.edu.ifpb.academia.enums.StatusTreinoAtivo;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.ContratoRepository;
import br.edu.ifpb.academia.repository.TreinoAtivoRepository;

@ExtendWith(MockitoExtension.class)
class AlunoServiceTest {

    private static final Long ALUNO_ID = 17L;
    private static final String CPF = "12345678901";
    private static final String EMAIL = "ana@example.com";

    @Mock
    private AlunoRepository alunoRepository;

    @Mock
    private TreinoAtivoService treinoAtivoService;

    @Mock
    private ContratoRepository contratoRepository;

    @Mock
    private TreinoAtivoRepository treinoAtivoRepository;

    @InjectMocks
    private AlunoService alunoService;

    @Test
    void deveCriarAlunoValidoEIniciarComoAtivoQuandoStatusNaoFoiInformado() {
        when(alunoRepository.existsByCpf(CPF)).thenReturn(false);
        when(alunoRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(invocacao -> {
            Aluno salvo = invocacao.getArgument(0);
            salvo.setId(ALUNO_ID);
            return salvo;
        });

        var resposta = alunoService.criar(requisicao(null));

        assertThat(resposta.id()).isEqualTo(ALUNO_ID);
        assertThat(resposta.nome()).isEqualTo("Ana Silva");
        assertThat(resposta.cpf()).isEqualTo(CPF);
        assertThat(resposta.status()).isEqualTo(StatusAluno.ATIVO);
        verify(treinoAtivoService).sincronizar(any(Aluno.class));
    }

    @Test
    void deveRejeitarCadastroComCpfDuplicado() {
        when(alunoRepository.existsByCpf(CPF)).thenReturn(true);

        assertThatThrownBy(() -> alunoService.criar(requisicao(StatusAluno.ATIVO)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessage("Ja existe aluno com este CPF.");

        verify(alunoRepository, never()).save(any(Aluno.class));
        verify(treinoAtivoService, never()).sincronizar(any(Aluno.class));
    }

    @Test
    void deveRejeitarCadastroComEmailDuplicado() {
        when(alunoRepository.existsByCpf(CPF)).thenReturn(false);
        when(alunoRepository.existsByEmail(EMAIL)).thenReturn(true);

        assertThatThrownBy(() -> alunoService.criar(requisicao(StatusAluno.ATIVO)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessage("Ja existe aluno com este e-mail.");

        verify(alunoRepository, never()).save(any(Aluno.class));
        verify(treinoAtivoService, never()).sincronizar(any(Aluno.class));
    }

    @Test
    void deveListarAlunosMapeadosParaResposta() {
        Aluno aluno = alunoExistente();
        when(alunoRepository.findAll()).thenReturn(List.of(aluno));

        var respostas = alunoService.listar();

        assertThat(respostas).hasSize(1);
        assertThat(respostas.get(0).id()).isEqualTo(ALUNO_ID);
        assertThat(respostas.get(0).nome()).isEqualTo("Ana Silva");
    }

    @Test
    void deveBuscarAlunoExistente() {
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.of(alunoExistente()));

        var resposta = alunoService.buscar(ALUNO_ID);

        assertThat(resposta.id()).isEqualTo(ALUNO_ID);
        assertThat(resposta.email()).isEqualTo(EMAIL);
    }

    @Test
    void deveLancarExcecaoAoBuscarAlunoInexistente() {
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alunoService.buscar(ALUNO_ID))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessage("Aluno não encontrado com ID: " + ALUNO_ID);
    }

    @Test
    void deveAtualizarAlunoEAtualizarTreinoQuandoPerfilMudar() {
        Aluno existente = alunoExistente();
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.of(existente));
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        var resposta = alunoService.atualizar(ALUNO_ID, requisicao(StatusAluno.INATIVO));

        assertThat(resposta.nome()).isEqualTo("Ana Silva");
        assertThat(resposta.status()).isEqualTo(StatusAluno.INATIVO);
        verify(alunoRepository, never()).existsByCpf(anyString());
        verify(alunoRepository, never()).existsByEmail(anyString());
        verify(treinoAtivoService).sincronizar(existente);
    }

    @Test
    void deveRejeitarAtualizacaoComCpfDeOutroAluno() {
        Aluno existente = alunoExistente();
        existente.setCpf("99999999999");
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.of(existente));
        when(alunoRepository.existsByCpf(CPF)).thenReturn(true);

        assertThatThrownBy(() -> alunoService.atualizar(ALUNO_ID, requisicao(StatusAluno.ATIVO)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessage("Ja existe aluno com este CPF.");

        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void deveRejeitarAtualizacaoComEmailDeOutroAluno() {
        Aluno existente = alunoExistente();
        existente.setEmail("outra@example.com");
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.of(existente));
        when(alunoRepository.existsByEmail(EMAIL)).thenReturn(true);

        assertThatThrownBy(() -> alunoService.atualizar(ALUNO_ID, requisicao(StatusAluno.ATIVO)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessage("Ja existe aluno com este e-mail.");

        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void deveLancarExcecaoAoAtualizarAlunoInexistente() {
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alunoService.atualizar(ALUNO_ID, requisicao(StatusAluno.ATIVO)))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessage("Aluno não encontrado com ID: " + ALUNO_ID);
    }

    @Test
    void deveExcluirAlunoSemContratoOuHistorico() {
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.of(alunoExistente()));
        when(contratoRepository.existsByAlunoId(ALUNO_ID)).thenReturn(false);
        when(treinoAtivoRepository.existsByAlunoIdAndStatusNot(ALUNO_ID, StatusTreinoAtivo.ATIVO))
                .thenReturn(false);

        alunoService.excluir(ALUNO_ID);

        verify(treinoAtivoRepository).deleteByAlunoIdAndStatus(ALUNO_ID, StatusTreinoAtivo.ATIVO);
        verify(alunoRepository).delete(any(Aluno.class));
    }

    @Test
    void deveBloquearExclusaoQuandoAlunoPossuiContrato() {
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.of(alunoExistente()));
        when(contratoRepository.existsByAlunoId(ALUNO_ID)).thenReturn(true);

        assertThatThrownBy(() -> alunoService.excluir(ALUNO_ID))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessage("Aluno possui contratos e nao pode ser excluido.");

        verify(treinoAtivoRepository, never()).deleteByAlunoIdAndStatus(ALUNO_ID, StatusTreinoAtivo.ATIVO);
        verify(alunoRepository, never()).delete(any(Aluno.class));
    }

    @Test
    void deveBloquearExclusaoQuandoAlunoPossuiHistoricoDeTreino() {
        when(alunoRepository.findById(ALUNO_ID)).thenReturn(Optional.of(alunoExistente()));
        when(contratoRepository.existsByAlunoId(ALUNO_ID)).thenReturn(false);
        when(treinoAtivoRepository.existsByAlunoIdAndStatusNot(ALUNO_ID, StatusTreinoAtivo.ATIVO))
                .thenReturn(true);

        assertThatThrownBy(() -> alunoService.excluir(ALUNO_ID))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessage("Aluno possui historico de treinos encerrados e nao pode ser excluido.");

        verify(treinoAtivoRepository, never()).deleteByAlunoIdAndStatus(ALUNO_ID, StatusTreinoAtivo.ATIVO);
        verify(alunoRepository, never()).delete(any(Aluno.class));
    }

    private static AlunoRequest requisicao(StatusAluno status) {
        return new AlunoRequest(
                "Ana Silva",
                CPF,
                "83999990000",
                EMAIL,
                LocalDate.of(1995, 4, 12),
                new BigDecimal("62.50"),
                new BigDecimal("1.65"),
                NivelExperiencia.AVANCADO,
                5,
                status);
    }

    private static Aluno alunoExistente() {
        Aluno aluno = new Aluno();
        aluno.setId(ALUNO_ID);
        aluno.setNome("Ana Silva");
        aluno.setCpf(CPF);
        aluno.setTelefone("83999990000");
        aluno.setEmail(EMAIL);
        aluno.setDataNascimento(LocalDate.of(1995, 4, 12));
        aluno.setPeso(new BigDecimal("62.50"));
        aluno.setAltura(new BigDecimal("1.65"));
        aluno.setNivelExperiencia(NivelExperiencia.INICIANTE);
        aluno.setFrequenciaSemanal(3);
        aluno.setStatus(StatusAluno.ATIVO);
        return aluno;
    }
}
