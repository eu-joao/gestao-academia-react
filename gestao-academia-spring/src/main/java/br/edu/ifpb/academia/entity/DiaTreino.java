package br.edu.ifpb.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class DiaTreino {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private ProgramaTreino programaTreino;

	@Column(nullable = false)
	private String nomeDia;

	@Column(nullable = false)
	private Integer ordem;

	public Long getId() {
		return id;
	}

	public ProgramaTreino getProgramaTreino() {
		return programaTreino;
	}

	public void setProgramaTreino(ProgramaTreino programaTreino) {
		this.programaTreino = programaTreino;
	}

	public String getNomeDia() {
		return nomeDia;
	}

	public void setNomeDia(String nomeDia) {
		this.nomeDia = nomeDia;
	}

	public Integer getOrdem() {
		return ordem;
	}

	public void setOrdem(Integer ordem) {
		this.ordem = ordem;
	}
}
