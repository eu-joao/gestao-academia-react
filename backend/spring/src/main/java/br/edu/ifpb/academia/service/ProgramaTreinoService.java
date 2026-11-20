package br.edu.ifpb.academia.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.response.Responses.DiaTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.ItemTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.ProgramaTreinoResponse;
import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.repository.DiaTreinoRepository;
import br.edu.ifpb.academia.repository.ItemTreinoRepository;
import br.edu.ifpb.academia.repository.ProgramaTreinoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgramaTreinoService {
	private final ProgramaTreinoRepository programaRepository;
	private final DiaTreinoRepository diaRepository;
	private final ItemTreinoRepository itemRepository;

	@Transactional(readOnly = true)
	public List<ProgramaTreinoResponse> listar() {
		return programaRepository.findAll().stream().map(this::resposta).toList();
	}

	@Transactional(readOnly = true)
	public ProgramaTreinoResponse buscar(Long id) {
		return resposta(buscarEntidade(id));
	}

	@Transactional(readOnly = true)
	public ProgramaTreinoResponse resposta(ProgramaTreino programa) {
		List<DiaTreinoResponse> dias = diaRepository.findByProgramaTreinoIdOrderByOrdem(programa.getId()).stream()
				.map(dia -> {
					List<ItemTreinoResponse> itens = itemRepository.findByDiaTreinoIdOrderByOrdem(dia.getId())
							.stream().map(Mapper::toResponse).toList();
					return Mapper.toResponse(dia, itens);
				}).toList();
		return Mapper.toResponse(programa, dias);
	}

	@Transactional(readOnly = true)
	public ProgramaTreino buscarEntidade(Long id) {
		return programaRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Programa de treino não encontrado: " + id));
	}
}
