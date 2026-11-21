package br.edu.ifpb.academia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.edu.ifpb.academia.entity.Aluno;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {
	Optional<Aluno> findByGoogleSubject(String googleSubject);
	Optional<Aluno> findByEmail(String email);
	boolean existsByEmail(String email);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select a from Aluno a where a.id = :id")
	Optional<Aluno> findByIdForUpdate(@Param("id") Long id);
}
