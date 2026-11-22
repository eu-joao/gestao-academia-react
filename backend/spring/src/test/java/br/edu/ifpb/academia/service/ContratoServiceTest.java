package br.edu.ifpb.academia.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ifpb.academia.dto.request.ContratoRequest;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.Contrato;
import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.StatusContrato;
import br.edu.ifpb.academia.enums.TipoPlano;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.ContratoRepository;

@ExtendWith(MockitoExtension.class)
class ContratoServiceTest {
	@Mock private ContratoRepository contratoRepository;
	@Mock private AlunoRepository alunoRepository;
	@Mock private CobrancaService cobrancaService;
	@InjectMocks private ContratoService service;

	@Test
	void criaContratoVigenteGeraParcelasEAtivaAluno() {
		Aluno aluno = aluno();
		when(contratoRepository.findByStatusAndDataTerminoLessThanEqual(StatusContrato.ATIVO, LocalDate.now()))
				.thenReturn(java.util.List.of());
		when(alunoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(aluno));
		when(contratoRepository.save(any(Contrato.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var resposta = service.criar(new ContratoRequest(1L, TipoPlano.TRIMESTRAL, LocalDate.now()));

		assertThat(resposta.dataTermino()).isEqualTo(LocalDate.now().plusMonths(3));
		assertThat(aluno.getStatus()).isEqualTo(br.edu.ifpb.academia.enums.StatusAluno.ATIVO);
		verify(cobrancaService).gerarParaContrato(any(Contrato.class));
	}

	@Test
	void rejeitaSegundoContratoAindaVigente() {
		when(contratoRepository.findByStatusAndDataTerminoLessThanEqual(StatusContrato.ATIVO, LocalDate.now()))
				.thenReturn(java.util.List.of());
		when(alunoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(aluno()));
		when(contratoRepository.existsByAlunoIdAndStatusAndDataTerminoAfter(1L, StatusContrato.ATIVO, LocalDate.now()))
				.thenReturn(true);

		assertThatThrownBy(() -> service.criar(new ContratoRequest(1L, TipoPlano.MENSAL, LocalDate.now())))
				.isInstanceOf(RegraDeNegocioException.class)
				.hasMessage("Aluno já possui um contrato ativo.");
	}

	private static Aluno aluno() {
		Aluno aluno = new Aluno();
		aluno.setId(1L);
		aluno.setNome("Aluno");
		aluno.setEmail("aluno@example.com");
		aluno.setGoogleSubject("google-subject");
		aluno.setPeso(new BigDecimal("70.00"));
		aluno.setAltura(new BigDecimal("1.70"));
		aluno.setNivelExperiencia(NivelExperiencia.INICIANTE);
		aluno.setFrequenciaSemanal(3);
		aluno.setProgramaAtual(new ProgramaTreino());
		return aluno;
	}
}
