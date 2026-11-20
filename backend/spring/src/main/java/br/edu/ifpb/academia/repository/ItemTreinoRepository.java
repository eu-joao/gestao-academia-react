package br.edu.ifpb.academia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.ifpb.academia.entity.ItemTreino;

public interface ItemTreinoRepository extends JpaRepository<ItemTreino, Long> {
	List<ItemTreino> findByDiaTreinoIdOrderByOrdem(Long diaTreinoId);
}
