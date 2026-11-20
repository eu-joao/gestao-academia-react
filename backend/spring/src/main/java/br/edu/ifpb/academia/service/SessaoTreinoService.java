package br.edu.ifpb.academia.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.request.SessaoTreinoRequest;
import br.edu.ifpb.academia.dto.response.Responses.DiaTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.SessaoTreinoResponse;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.DiaTreino;
import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.entity.SessaoTreino;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.DiaTreinoRepository;
import br.edu.ifpb.academia.repository.SessaoTreinoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessaoTreinoService {
	private final AlunoRepository alunoRepository;
	private final DiaTreinoRepository diaRepository;
	private final SessaoTreinoRepository sessaoRepository;

	@Transactional(readOnly = true)
	public List<SessaoTreinoResponse> listarDoAluno(Long alunoId) {
		Aluno aluno = alunoRepository.findById(alunoId)
				.orElseThrow(() -> new RegraDeNegocioException("Aluno não encontrado."));
		if (aluno.getProgramaAtual() == null) return List.of();
		return sessaoRepository.findByAlunoIdAndProgramaTreinoIdOrderByDataHoraConclusao(
				alunoId, aluno.getProgramaAtual().getId()).stream().map(Mapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public DiaTreinoResponse proximoDia(Long alunoId) {
		Aluno aluno = alunoRepository.findById(alunoId)
				.orElseThrow(() -> new RegraDeNegocioException("Aluno não encontrado."));
		ProgramaTreino programa = exigirPrograma(aluno);
		List<DiaTreino> dias = diaRepository.findByProgramaTreinoIdOrderByOrdem(programa.getId());
		if (dias.isEmpty()) throw new RegraDeNegocioException("O programa atual ainda não possui dias cadastrados.");
		List<SessaoTreino> sessoes = sessaoRepository
				.findByAlunoIdAndProgramaTreinoIdOrderByDataHoraConclusao(alunoId, programa.getId());
		if (sessoes.isEmpty()) return respostaDia(dias.get(0));
		Long ultimoDiaId = sessoes.get(sessoes.size() - 1).getDiaTreino().getId();
		int indiceAtual = 0;
		for (int i = 0; i < dias.size(); i++) {
			if (dias.get(i).getId().equals(ultimoDiaId)) indiceAtual = i;
		}
		return respostaDia(dias.get((indiceAtual + 1) % dias.size()));
	}

	@Transactional
	public SessaoTreinoResponse concluir(Long alunoId, SessaoTreinoRequest request) {
		Aluno aluno = alunoRepository.findByIdForUpdate(alunoId)
				.orElseThrow(() -> new RegraDeNegocioException("Aluno não encontrado."));
		ProgramaTreino programa = exigirPrograma(aluno);
		DiaTreino escolhido = diaRepository.findById(request.diaTreinoId())
				.orElseThrow(() -> new RegraDeNegocioException("Dia de treino não encontrado."));
		if (!escolhido.getProgramaTreino().getId().equals(programa.getId())) {
			throw new RegraDeNegocioException("A sessão deve pertencer ao programa atual do aluno.");
		}
		DiaTreinoResponse previsto = proximoDia(alunoId);
		if (!previsto.id().equals(escolhido.getId())) {
			throw new RegraDeNegocioException("A sessão deve ser do próximo dia previsto: " + previsto.nome());
		}
		SessaoTreino sessao = new SessaoTreino();
		sessao.setAluno(aluno);
		sessao.setProgramaTreino(programa);
		sessao.setDiaTreino(escolhido);
		sessao.setDataHoraConclusao(LocalDateTime.now());
		return Mapper.toResponse(sessaoRepository.save(sessao));
	}

	private ProgramaTreino exigirPrograma(Aluno aluno) {
		if (aluno.getProgramaAtual() == null) throw new RegraDeNegocioException("Aluno não possui programa atual.");
		return aluno.getProgramaAtual();
	}

	private DiaTreinoResponse respostaDia(DiaTreino dia) {
		return new DiaTreinoResponse(dia.getId(), dia.getProgramaTreino().getId(), dia.getNome(), dia.getOrdem(), List.of());
	}
}
