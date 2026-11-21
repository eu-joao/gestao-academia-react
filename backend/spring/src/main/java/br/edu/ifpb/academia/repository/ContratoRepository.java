package br.edu.ifpb.academia.repository;

import java.util.Optional;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.ifpb.academia.entity.Contrato;
import br.edu.ifpb.academia.enums.StatusContrato;

public interface ContratoRepository extends JpaRepository<Contrato, Long> {
	boolean existsByAlunoIdAndStatus(Long alunoId, StatusContrato status);
	Optional<Contrato> findFirstByAlunoIdAndStatusOrderByDataInicioDesc(Long alunoId, StatusContrato status);
	boolean existsByAlunoIdAndStatusAndDataTerminoAfter(Long alunoId, StatusContrato status, LocalDate data);
	List<Contrato> findByStatusAndDataTerminoLessThanEqual(StatusContrato status, LocalDate data);
	List<Contrato> findByAlunoIdOrderByDataInicioDesc(Long alunoId);
}
