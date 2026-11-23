package br.edu.ifpb.academia.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.ifpb.academia.entity.Treino;

public interface TreinoRepository extends JpaRepository<Treino, UUID> {

	List<Treino> findByAtivoTrueOrderByCriadoEmDesc();

	List<Treino> findByAlunoIdAndAtivoTrueOrderByCriadoEmDesc(Long alunoId);

	Optional<Treino> findByIdAndAtivoTrue(UUID id);
}
