package br.edu.ifpb.academia.entity;

import java.math.BigDecimal;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.StatusAluno;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Aluno {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(unique = true)
	private String googleSubject;

	@Column(nullable = false, precision = 6, scale = 2)
	private BigDecimal peso;

	@Column(nullable = false, precision = 5, scale = 2)
	private BigDecimal altura;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private NivelExperiencia nivelExperiencia;

	@Column(nullable = false)
	private Integer frequenciaSemanal;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "programa_atual_id")
	private ProgramaTreino programaAtual;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private StatusAluno status = StatusAluno.ATIVO;

	public boolean isAtivo() {
		return status == StatusAluno.ATIVO;
	}
}
