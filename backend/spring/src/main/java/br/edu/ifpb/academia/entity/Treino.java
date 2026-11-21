package br.edu.ifpb.academia.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "treino")
public class Treino {

	@Id
	private UUID id;

	@Column(nullable = false)
	private String nome;

	@Column
	private String categoria;

	@Column(nullable = false)
	private String diaSemana;

	@Column(nullable = false)
	private Integer duracaoMin;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "aluno_id")
	private Aluno aluno;

	@Column(nullable = false, updatable = false)
	private LocalDateTime criadoEm;

	@Column(nullable = false)
	private LocalDateTime atualizadoEm;

	@Column(nullable = false)
	private Boolean ativo = true;

	@PrePersist
	public void prePersist() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		LocalDateTime agora = LocalDateTime.now();
		if (criadoEm == null) {
			criadoEm = agora;
		}
		if (atualizadoEm == null) {
			atualizadoEm = agora;
		}
		if (ativo == null) {
			ativo = true;
		}
	}

	@PreUpdate
	public void preUpdate() {
		atualizadoEm = LocalDateTime.now();
	}
}
