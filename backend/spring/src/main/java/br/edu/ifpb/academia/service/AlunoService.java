package br.edu.ifpb.academia.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.request.AlunoRequest;
import br.edu.ifpb.academia.dto.request.PesoAlunoRequest;
import br.edu.ifpb.academia.dto.response.Responses.AlunoResponse;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.enums.StatusAluno;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.ContratoRepository;
import br.edu.ifpb.academia.repository.ProgramaTreinoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlunoService {
	private final AlunoRepository repository;
	private final ContratoRepository contratoRepository;
	private final ProgramaTreinoRepository programaRepository;

	@Transactional(readOnly = true)
	public List<AlunoResponse> listar() {
		return repository.findAll().stream().map(Mapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public AlunoResponse buscar(Long id) {
		return Mapper.toResponse(buscarEntidade(id));
	}

	@Transactional
	public AlunoResponse registrar(String googleSubject, String email, String nome, AlunoRequest request) {
		if (repository.findByGoogleSubject(googleSubject).isPresent()) {
			throw new RegraDeNegocioException("Esta conta Google já possui cadastro.");
		}
		Aluno existente = repository.findByEmail(email).orElse(null);
		if (existente != null) {
			if (existente.getGoogleSubject() != null) {
				throw new RegraDeNegocioException("Este e-mail já está associado a outra identidade Google.");
			}
			existente.setGoogleSubject(googleSubject);
			existente.setNome(nome);
			aplicar(existente, request);
			if (existente.getProgramaAtual() == null) existente.setProgramaAtual(programa(request));
			return Mapper.toResponse(repository.save(existente));
		}
		Aluno aluno = new Aluno();
		aluno.setGoogleSubject(googleSubject);
		aluno.setEmail(email);
		aluno.setNome(nome);
		aluno.setStatus(StatusAluno.INATIVO);
		aplicar(aluno, request);
		aluno.setProgramaAtual(programa(request));
		return Mapper.toResponse(repository.save(aluno));
	}

	@Transactional
	public AlunoResponse atualizarPeso(String googleSubject, PesoAlunoRequest request) {
		Aluno aluno = buscarPorGoogleSubject(googleSubject);
		aluno.setPeso(request.peso());
		return Mapper.toResponse(repository.save(aluno));
	}

	@Transactional
	public AlunoResponse atualizarComoPersonal(Long id, AlunoRequest request) {
		Aluno aluno = buscarEntidade(id);
		aplicar(aluno, request);
		aluno.setProgramaAtual(programa(request));
		return Mapper.toResponse(repository.save(aluno));
	}

	@Transactional
	public AlunoResponse atribuirPrograma(Long alunoId, Long programaId) {
		Aluno aluno = buscarEntidade(alunoId);
		aluno.setProgramaAtual(programaRepository.findById(programaId)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Programa de treino não encontrado: " + programaId)));
		return Mapper.toResponse(repository.save(aluno));
	}

	@Transactional(readOnly = true)
	public Aluno buscarPorGoogleSubject(String subject) {
		return repository.findByGoogleSubject(subject)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Aluno autenticado não possui cadastro."));
	}

	@Transactional(readOnly = true)
	public AlunoResponse buscarMeuCadastro(String subject) {
		return Mapper.toResponse(buscarPorGoogleSubject(subject));
	}

	@Transactional(readOnly = true)
	public Aluno buscarEntidade(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado com ID: " + id));
	}

	public void ativar(Aluno aluno) {
		aluno.setStatus(StatusAluno.ATIVO);
		repository.save(aluno);
	}

	public void inativar(Aluno aluno) {
		aluno.setStatus(StatusAluno.INATIVO);
		repository.save(aluno);
	}

	private br.edu.ifpb.academia.entity.ProgramaTreino programa(AlunoRequest request) {
		return programaRepository.findByNivelExperienciaAndFrequenciaSemanal(request.nivelExperiencia(),
				request.frequenciaSemanal()).orElseThrow(() -> new RegraDeNegocioException(
						"Não há programa para o nível e a frequência informados."));
	}

	private void aplicar(Aluno aluno, AlunoRequest request) {
		aluno.setPeso(request.peso());
		aluno.setAltura(request.altura());
		aluno.setNivelExperiencia(request.nivelExperiencia());
		aluno.setFrequenciaSemanal(request.frequenciaSemanal());
	}
}
