package br.edu.ifpb.academia.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ifpb.academia.dto.request.TreinoRequest;
import br.edu.ifpb.academia.dto.request.TreinoSyncItemRequest;
import br.edu.ifpb.academia.entity.Treino;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.TreinoRepository;

@ExtendWith(MockitoExtension.class)
class TreinoServiceTest {

	@Mock
	private TreinoRepository repository;

	@Mock
	private AlunoRepository alunoRepository;

	@InjectMocks
	private TreinoService service;

	private Treino treinoExemplo;
	private UUID treinoId;

	@BeforeEach
	void setup() {
		treinoId = UUID.randomUUID();
		treinoExemplo = new Treino();
		treinoExemplo.setId(treinoId);
		treinoExemplo.setNome("Peito e Tríceps");
		treinoExemplo.setCategoria("Musculação");
		treinoExemplo.setDiaSemana("Segunda");
		treinoExemplo.setDuracaoMin(60);
		treinoExemplo.setAtivo(true);
	}

	@Test
	void criaTreinoComSucesso() {
		when(repository.save(any(Treino.class))).thenAnswer(i -> i.getArgument(0));

		TreinoRequest request = new TreinoRequest(treinoId, "Peito e Tríceps", "Musculação", "Segunda", 60, null);
		var response = service.criar(request, null);

		assertThat(response.id()).isEqualTo(treinoId);
		assertThat(response.nome()).isEqualTo("Peito e Tríceps");
		assertThat(response.categoria()).isEqualTo("Musculação");
		assertThat(response.diaSemana()).isEqualTo("Segunda");
		assertThat(response.duracaoMin()).isEqualTo(60);
	}

	@Test
	void buscaTreinoPorIdComSucesso() {
		when(repository.findByIdAndAtivoTrue(treinoId)).thenReturn(Optional.of(treinoExemplo));

		var response = service.buscar(treinoId);

		assertThat(response.id()).isEqualTo(treinoId);
		assertThat(response.nome()).isEqualTo("Peito e Tríceps");
	}

	@Test
	void lancaExcecaoAoBuscarTreinoInexistente() {
		when(repository.findByIdAndAtivoTrue(treinoId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.buscar(treinoId))
				.isInstanceOf(RecursoNaoEncontradoException.class)
				.hasMessageContaining(treinoId.toString());
	}

	@Test
	void atualizaTreinoComSucesso() {
		when(repository.findByIdAndAtivoTrue(treinoId)).thenReturn(Optional.of(treinoExemplo));
		when(repository.save(any(Treino.class))).thenAnswer(i -> i.getArgument(0));

		TreinoRequest request = new TreinoRequest(null, "Peito, Tríceps e Ombro", "Musculação", "Terça", 75, null);
		var response = service.atualizar(treinoId, request);

		assertThat(response.nome()).isEqualTo("Peito, Tríceps e Ombro");
		assertThat(response.diaSemana()).isEqualTo("Terça");
		assertThat(response.duracaoMin()).isEqualTo(75);
	}

	@Test
	void excluiTreinoLogicamente() {
		when(repository.findByIdAndAtivoTrue(treinoId)).thenReturn(Optional.of(treinoExemplo));

		service.excluir(treinoId);

		assertThat(treinoExemplo.getAtivo()).isFalse();
		verify(repository).save(treinoExemplo);
	}

	@Test
	void sincronizaLoteDeFilaOffline() {
		UUID novoId = UUID.randomUUID();
		TreinoRequest novoReq = new TreinoRequest(novoId, "Cardio Matinal", "Cardio", "Quarta", 45, null);
		TreinoSyncItemRequest itemCreate = new TreinoSyncItemRequest(novoId, "CREATE", novoReq, System.currentTimeMillis());

		when(repository.existsById(novoId)).thenReturn(false);
		when(repository.save(any(Treino.class))).thenAnswer(i -> i.getArgument(0));

		service.sincronizarLote(List.of(itemCreate), null);

		verify(repository).save(any(Treino.class));
	}
}
