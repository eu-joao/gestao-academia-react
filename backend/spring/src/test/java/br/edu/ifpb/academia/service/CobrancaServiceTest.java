package br.edu.ifpb.academia.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.Cobranca;
import br.edu.ifpb.academia.entity.Contrato;
import br.edu.ifpb.academia.enums.StatusCobranca;
import br.edu.ifpb.academia.enums.TipoPlano;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.repository.CobrancaRepository;

@ExtendWith(MockitoExtension.class)
class CobrancaServiceTest {
	@Mock private CobrancaRepository repository;
	@InjectMocks private CobrancaService service;

	@Test
	void geraUmaParcelaPorMesComVencimentoEValorDoPlano() {
		Contrato contrato = new Contrato();
		contrato.setId(4L);
		contrato.setPlano(TipoPlano.TRIMESTRAL);
		contrato.setDataInicio(LocalDate.of(2026, 1, 31));

		service.gerarParaContrato(contrato);

		ArgumentCaptor<Cobranca> captor = ArgumentCaptor.forClass(Cobranca.class);
		verify(repository, org.mockito.Mockito.times(3)).save(captor.capture());
		assertThat(captor.getAllValues()).extracting(Cobranca::getNumeroParcela).containsExactly(1, 2, 3);
		assertThat(captor.getAllValues()).extracting(Cobranca::getDataVencimento)
				.containsExactly(LocalDate.of(2026, 1, 31), LocalDate.of(2026, 2, 28), LocalDate.of(2026, 3, 31));
		assertThat(captor.getAllValues()).allSatisfy(cobranca ->
				assertThat(cobranca.getValor()).isEqualByComparingTo(TipoPlano.TRIMESTRAL.getValorMensal()));
	}

	@Test
	void pagamentoSoEncontraCobrancaDoAlunoAutenticado() {
		when(repository.findByIdAndContratoAlunoId(9L, 2L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.pagar(9L, 2L))
				.isInstanceOf(RecursoNaoEncontradoException.class);
	}

	@Test
	void pagamentoSimuladoRegistraDataEStatus() {
		Aluno aluno = new Aluno();
		aluno.setId(2L);
		Contrato contrato = new Contrato();
		contrato.setId(3L);
		contrato.setAluno(aluno);
		Cobranca cobranca = new Cobranca();
		cobranca.setId(9L);
		cobranca.setContrato(contrato);
		cobranca.setNumeroParcela(1);
		cobranca.setDataVencimento(LocalDate.now().plusDays(1));
		cobranca.setValor(TipoPlano.MENSAL.getValorMensal());
		cobranca.setStatus(StatusCobranca.PENDENTE);
		when(repository.findByIdAndContratoAlunoId(9L, 2L)).thenReturn(Optional.of(cobranca));
		when(repository.save(any(Cobranca.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var resposta = service.pagar(9L, 2L);

		assertThat(resposta.status()).isEqualTo(StatusCobranca.PAGO);
		assertThat(resposta.dataPagamento()).isEqualTo(LocalDate.now());
	}
}
