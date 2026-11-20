package br.edu.ifpb.academia.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class SessaoTreino {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Aluno aluno;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private ProgramaTreino programaTreino;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private DiaTreino diaTreino;

	@Column(nullable = false)
	private LocalDateTime dataHoraConclusao;
}
