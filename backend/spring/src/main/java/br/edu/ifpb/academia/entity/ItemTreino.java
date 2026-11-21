package br.edu.ifpb.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "diaTreino_id", "ordem" }))
public class ItemTreino {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private DiaTreino diaTreino;

	@Column(nullable = false)
	private String nomeExercicio;

	@Column(nullable = false)
	private String musculaturaAlvo;

	@Column(nullable = false)
	private Integer series;

	@Column(nullable = false)
	private String repeticoes;

	@Column(nullable = false)
	private Integer ordem;
}
