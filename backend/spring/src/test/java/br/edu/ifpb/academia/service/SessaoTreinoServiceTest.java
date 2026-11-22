package br.edu.ifpb.academia.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ifpb.academia.dto.request.SessaoTreinoRequest;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.DiaTreino;
import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.DiaTreinoRepository;
import br.edu.ifpb.academia.repository.SessaoTreinoRepository;

@ExtendWith(MockitoExtension.class)
class SessaoTreinoServiceTest {
	@Mock private AlunoRepository alunoRepository;
	@Mock private DiaTreinoRepository diaRepository;
	@Mock private SessaoTreinoRepository sessaoRepository;
	@InjectMocks private SessaoTreinoService service;

	private Aluno aluno;
	private DiaTreino primeiro;
	private DiaTreino segundo;

	@BeforeEach
	void prepararPrograma() {
		ProgramaTreino programa = new ProgramaTreino();
		programa.setId(7L);
		programa.setNivelExperiencia(NivelExperiencia.INICIANTE);
		programa.setFrequenciaSemanal(3);
		aluno = new Aluno();
		aluno.setId(2L);
		aluno.setNome("Aluno");
		aluno.setEmail("aluno@example.com");
		aluno.setPeso(new BigDecimal("70.00"));
		aluno.setAltura(new BigDecimal("1.70"));
		aluno.setNivelExperiencia(NivelExperiencia.INICIANTE);
		aluno.setFrequenciaSemanal(3);
		aluno.setProgramaAtual(programa);
		primeiro = dia(programa, 11L, 1);
		segundo = dia(programa, 12L, 2);
		when(alunoRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(aluno));
		when(alunoRepository.findById(2L)).thenReturn(Optional.of(aluno));
		when(diaRepository.findByProgramaTreinoIdOrderByOrdem(7L)).thenReturn(List.of(primeiro, segundo));
		when(sessaoRepository.findByAlunoIdAndProgramaTreinoIdOrderByDataHoraConclusao(2L, 7L))
				.thenReturn(List.of());
	}

	@Test
	void concluiSomenteOPrimeiroDiaQuandoAindaNaoHaSessoes() {
		when(diaRepository.findById(11L)).thenReturn(Optional.of(primeiro));
		when(sessaoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		var resposta = service.concluir(2L, new SessaoTreinoRequest(11L));

		assertThat(resposta.alunoId()).isEqualTo(2L);
		assertThat(resposta.programaTreinoId()).isEqualTo(7L);
		assertThat(resposta.diaTreinoId()).isEqualTo(11L);
		assertThat(resposta.dataHoraConclusao()).isNotNull();
	}

	@Test
	void rejeitaDiaForaDaSequencia() {
		when(diaRepository.findById(12L)).thenReturn(Optional.of(segundo));

		assertThatThrownBy(() -> service.concluir(2L, new SessaoTreinoRequest(12L)))
				.isInstanceOf(RegraDeNegocioException.class)
				.hasMessage("A sessão deve ser do próximo dia previsto: " + primeiro.getNome());
	}

	private static DiaTreino dia(ProgramaTreino programa, Long id, int ordem) {
		DiaTreino dia = new DiaTreino();
		dia.setId(id);
		dia.setProgramaTreino(programa);
		dia.setNome("Dia " + ordem);
		dia.setOrdem(ordem);
		return dia;
	}
}
