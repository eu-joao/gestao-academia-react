package br.edu.ifpb.academia.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.ifpb.academia.entity.SessaoTreino;

public interface SessaoTreinoRepository extends JpaRepository<SessaoTreino, Long> {
	List<SessaoTreino> findByAlunoIdAndProgramaTreinoIdOrderByDataHoraConclusao(Long alunoId, Long programaId);
	List<SessaoTreino> findByAlunoIdAndDataHoraConclusaoBetween(Long alunoId, LocalDateTime inicio, LocalDateTime fim);
}
