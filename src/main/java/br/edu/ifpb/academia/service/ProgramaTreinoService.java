package br.edu.ifpb.academia.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.request.ProgramaTreinoRequest;
import br.edu.ifpb.academia.dto.response.Responses.ProgramaTreinoResponse;
import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.exception.BusinessException;
import br.edu.ifpb.academia.exception.ResourceNotFoundException;
import br.edu.ifpb.academia.repository.ProgramaTreinoRepository;

@Service
public class ProgramaTreinoService {

	private final ProgramaTreinoRepository repository;

	public ProgramaTreinoService(ProgramaTreinoRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<ProgramaTreinoResponse> listar() {
		return repository.findAll().stream().map(Mapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public ProgramaTreinoResponse buscar(Long id) {
		return Mapper.toResponse(buscarEntidade(id));
	}

	@Transactional
	public ProgramaTreinoResponse criar(ProgramaTreinoRequest request) {
		if (repository.existsByNivelExperienciaAndFrequenciaSemanal(request.nivelExperiencia(),
				request.frequenciaSemanal())) {
			throw new BusinessException("Ja existe programa para este nivel e frequencia.");
		}
		ProgramaTreino programa = new ProgramaTreino();
		aplicar(programa, request);
		return Mapper.toResponse(repository.save(programa));
	}

	@Transactional
	public ProgramaTreinoResponse atualizar(Long id, ProgramaTreinoRequest request) {
		ProgramaTreino programa = buscarEntidade(id);
		aplicar(programa, request);
		return Mapper.toResponse(repository.save(programa));
	}

	@Transactional
	public void excluir(Long id) {
		repository.delete(buscarEntidade(id));
	}

	public ProgramaTreino buscarEntidade(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Programa de treino nao encontrado."));
	}

	public ProgramaTreino buscarPorPerfil(NivelExperiencia nivel, Integer frequencia) {
		return repository.findByNivelExperienciaAndFrequenciaSemanal(nivel, frequencia)
				.orElseThrow(() -> new BusinessException("Nao existe programa para o perfil do aluno."));
	}

	private void aplicar(ProgramaTreino programa, ProgramaTreinoRequest request) {
		programa.setNivelExperiencia(request.nivelExperiencia());
		programa.setFrequenciaSemanal(request.frequenciaSemanal());
		programa.setTipoEstrutural(request.tipoEstrutural());
		programa.setDescricao(request.descricao());
	}
}
