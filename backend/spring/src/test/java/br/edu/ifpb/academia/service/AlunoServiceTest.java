package br.edu.ifpb.academia.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ifpb.academia.dto.request.AlunoAdminRequest;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.StatusAluno;
import br.edu.ifpb.academia.enums.TipoEstrutural;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.ProgramaTreinoRepository;

@ExtendWith(MockitoExtension.class)
class AlunoServiceTest {

	@Mock
	private AlunoRepository repository;

	@Mock
	private ProgramaTreinoRepository programaRepository;

	@InjectMocks
	private AlunoService service;

	private ProgramaTreino programaExemplo;

	@BeforeEach
	void setup() {
		programaExemplo = new ProgramaTreino();
		programaExemplo.setId(1L);
		programaExemplo.setNivelExperiencia(NivelExperiencia.INICIANTE);
		programaExemplo.setFrequenciaSemanal(3);
		programaExemplo.setTipoEstrutural(TipoEstrutural.FULLBODY);
		programaExemplo.setDescricao("Programa Iniciante 3 dias");
	}

	@Test
	void cadastraAlunoComDadosValidos() {
		when(repository.existsByEmail("novo@email.com")).thenReturn(false);
		when(programaRepository.findByNivelExperienciaAndFrequenciaSemanal(NivelExperiencia.INICIANTE, 3))
				.thenReturn(Optional.of(programaExemplo));
		when(repository.save(any(Aluno.class))).thenAnswer(i -> i.getArgument(0));

		AlunoAdminRequest request = new AlunoAdminRequest(
				"João Silva",
				"novo@email.com",
				new BigDecimal("70.00"),
				new BigDecimal("1.75"),
				NivelExperiencia.INICIANTE,
				3);

		var response = service.cadastrarComoPersonal(request);

		assertThat(response.nome()).isEqualTo("João Silva");
		assertThat(response.email()).isEqualTo("novo@email.com");
		assertThat(response.peso()).isEqualByComparingTo("70.00");
		assertThat(response.altura()).isEqualByComparingTo("1.75");
		assertThat(response.nivelExperiencia()).isEqualTo(NivelExperiencia.INICIANTE);
		assertThat(response.frequenciaSemanal()).isEqualTo(3);
		assertThat(response.programaAtualId()).isEqualTo(1L);
	}

	@Test
	void alunoCriadoComStatusInativo() {
		when(repository.existsByEmail("status@test.com")).thenReturn(false);
		when(programaRepository.findByNivelExperienciaAndFrequenciaSemanal(NivelExperiencia.INTERMEDIARIO, 4))
				.thenReturn(Optional.of(programaExemplo));
		when(repository.save(any(Aluno.class))).thenAnswer(i -> {
			Aluno aluno = i.getArgument(0);
			aluno.setId(10L);
			return aluno;
		});

		AlunoAdminRequest request = new AlunoAdminRequest(
				"Status Teste",
				"status@test.com",
				new BigDecimal("80.00"),
				new BigDecimal("1.80"),
				NivelExperiencia.INTERMEDIARIO,
				4);

		var response = service.cadastrarComoPersonal(request);

		assertThat(response.status()).isEqualTo(StatusAluno.INATIVO);
	}

	@Test
	void atribuiDadosFisicosEProgramaCorretamente() {
		when(repository.existsByEmail("dados@test.com")).thenReturn(false);
		when(programaRepository.findByNivelExperienciaAndFrequenciaSemanal(NivelExperiencia.AVANCADO, 5))
				.thenReturn(Optional.of(programaExemplo));
		when(repository.save(any(Aluno.class))).thenAnswer(i -> {
			Aluno aluno = i.getArgument(0);
			aluno.setId(20L);
			return aluno;
		});

		AlunoAdminRequest request = new AlunoAdminRequest(
				"Dados Físicos",
				"dados@test.com",
				new BigDecimal("90.50"),
				new BigDecimal("1.85"),
				NivelExperiencia.AVANCADO,
				5);

		var response = service.cadastrarComoPersonal(request);

		assertThat(response.peso()).isEqualByComparingTo("90.50");
		assertThat(response.altura()).isEqualByComparingTo("1.85");
		assertThat(response.nivelExperiencia()).isEqualTo(NivelExperiencia.AVANCADO);
		assertThat(response.frequenciaSemanal()).isEqualTo(5);
		assertThat(response.programaAtualId()).isEqualTo(1L);
	}

	@Test
	void lancaExcecaoQuandoEmailJaCadastrado() {
		when(repository.existsByEmail("existente@email.com")).thenReturn(true);

		AlunoAdminRequest request = new AlunoAdminRequest(
				"Email Existente",
				"existente@email.com",
				new BigDecimal("70.00"),
				new BigDecimal("1.75"),
				NivelExperiencia.INICIANTE,
				3);

		assertThatThrownBy(() -> service.cadastrarComoPersonal(request))
				.isInstanceOf(RegraDeNegocioException.class)
				.hasMessage("E-mail já cadastrado.");
	}

	@Test
	void lancaExcecaoQuandoProgramaNaoExiste() {
		when(repository.existsByEmail("sem@programa.com")).thenReturn(false);
		when(programaRepository.findByNivelExperienciaAndFrequenciaSemanal(NivelExperiencia.INICIANTE, 3))
				.thenReturn(Optional.empty());

		AlunoAdminRequest request = new AlunoAdminRequest(
				"Sem Programa",
				"sem@programa.com",
				new BigDecimal("70.00"),
				new BigDecimal("1.75"),
				NivelExperiencia.INICIANTE,
				3);

		assertThatThrownBy(() -> service.cadastrarComoPersonal(request))
				.isInstanceOf(RegraDeNegocioException.class)
				.hasMessage("Não há programa para o nível e a frequência informados.");
	}
}