package br.edu.ifpb.academia.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.edu.ifpb.academia.entity.Treino;

public interface TreinoRepository extends JpaRepository<Treino, UUID> {

	List<Treino> findByAtivoTrueOrderByCriadoEmDesc();

	List<Treino> findByAlunoIdAndAtivoTrueOrderByCriadoEmDesc(Long alunoId);

	Optional<Treino> findByIdAndAtivoTrue(UUID id);

	@Query("SELECT t FROM Treino t WHERE t.ativo = true "
			+ "AND (:alunoId IS NULL OR t.aluno.id = :alunoId) "
			+ "AND (:diaSemana IS NULL OR LOWER(t.diaSemana) = LOWER(:diaSemana)) "
			+ "AND (:busca IS NULL OR LOWER(t.nome) LIKE LOWER(CONCAT('%', :busca, '%'))) "
			+ "ORDER BY t.criadoEm DESC")
	List<Treino> buscarFiltrados(@Param("alunoId") Long alunoId,
			@Param("diaSemana") String diaSemana,
			@Param("busca") String busca);
}
