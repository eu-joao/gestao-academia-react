package br.edu.ifpb.academia.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.request.TreinoRequest;
import br.edu.ifpb.academia.dto.request.TreinoSyncItemRequest;
import br.edu.ifpb.academia.dto.response.Responses.TreinoResponse;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.Treino;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.TreinoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TreinoService {

	private final TreinoRepository repository;
	private final AlunoRepository alunoRepository;

	@Transactional(readOnly = true)
	public List<TreinoResponse> listar(Long alunoId, String busca, String diaSemana) {
		String buscaTratada = (busca != null && !busca.isBlank()) ? busca.trim().toLowerCase() : null;
		String diaTratado = (diaSemana != null && !diaSemana.isBlank() && !diaSemana.equalsIgnoreCase("Todos"))
				? diaSemana.trim() : null;

		List<Treino> treinos = (alunoId != null)
				? repository.findByAlunoIdAndAtivoTrueOrderByCriadoEmDesc(alunoId)
				: repository.findByAtivoTrueOrderByCriadoEmDesc();

		if (diaTratado != null) {
			treinos = treinos.stream()
					.filter(t -> t.getDiaSemana() != null && t.getDiaSemana().equalsIgnoreCase(diaTratado))
					.toList();
		}

		if (buscaTratada != null) {
			treinos = treinos.stream()
					.filter(t -> t.getNome() != null && t.getNome().toLowerCase().contains(buscaTratada))
					.toList();
		}

		return treinos.stream()
				.map(Mapper::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public TreinoResponse buscar(UUID id) {
		return Mapper.toResponse(buscarEntidade(id));
	}

	@Transactional
	public TreinoResponse criar(TreinoRequest request, Long alunoId) {
		Treino treino = new Treino();
		if (request.id() != null) {
			treino.setId(request.id());
		}
		aplicarDados(treino, request);
		vincularAluno(treino, alunoId != null ? alunoId : request.alunoId());

		return Mapper.toResponse(repository.save(treino));
	}

	@Transactional
	public TreinoResponse atualizar(UUID id, TreinoRequest request) {
		Treino treino = buscarEntidade(id);
		aplicarDados(treino, request);
		if (request.alunoId() != null) {
			vincularAluno(treino, request.alunoId());
		}
		return Mapper.toResponse(repository.save(treino));
	}

	@Transactional
	public void excluir(UUID id) {
		Treino treino = buscarEntidade(id);
		treino.setAtivo(false);
		repository.save(treino);
	}

	@Transactional
	public List<TreinoResponse> sincronizarLote(List<TreinoSyncItemRequest> itens, Long alunoId) {
		for (TreinoSyncItemRequest item : itens) {
			if (item == null || item.acao() == null) continue;

			switch (item.acao().toUpperCase()) {
				case "CREATE":
				case "CRIAR":
					if (repository.existsById(item.id())) {
						if (item.dados() != null) {
							atualizar(item.id(), item.dados());
						}
					} else if (item.dados() != null) {
						criar(item.dados(), alunoId);
					}
					break;

				case "UPDATE":
				case "ATUALIZAR":
					if (item.dados() != null && repository.existsById(item.id())) {
						atualizar(item.id(), item.dados());
					} else if (item.dados() != null) {
						criar(item.dados(), alunoId);
					}
					break;

				case "DELETE":
				case "EXCLUIR":
					repository.findById(item.id()).ifPresent(t -> {
						t.setAtivo(false);
						repository.save(t);
					});
					break;

				default:
					break;
			}
		}
		return listar(alunoId, null, null);
	}

	@Transactional(readOnly = true)
	public Treino buscarEntidade(UUID id) {
		return repository.findByIdAndAtivoTrue(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Treino não encontrado: " + id));
	}

	private void aplicarDados(Treino treino, TreinoRequest request) {
		treino.setNome(request.nome().trim());
		treino.setCategoria(request.categoria() != null ? request.categoria().trim() : null);
		treino.setDiaSemana(request.diaSemana().trim());
		treino.setDuracaoMin(request.duracaoMin());
	}

	private void vincularAluno(Treino treino, Long alunoId) {
		if (alunoId != null) {
			Aluno aluno = alunoRepository.findById(alunoId).orElse(null);
			treino.setAluno(aluno);
		}
	}
}
