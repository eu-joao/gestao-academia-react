package br.edu.ifpb.academia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import br.edu.ifpb.academia.entity.DiaTreino;

public interface DiaTreinoRepository extends JpaRepository<DiaTreino, Long> {
	List<DiaTreino> findByProgramaTreinoIdOrderByOrdem(Long programaId);
}
