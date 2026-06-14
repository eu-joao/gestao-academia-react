package br.edu.ifpb.academia.entity;

import java.time.LocalDate;

import br.edu.ifpb.academia.enums.StatusContrato;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Contrato {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Aluno aluno;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Unidade unidade;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Plano plano;

	@Column(nullable = false)
	private LocalDate dataInicio;

	@Column(nullable = false)
	private LocalDate dataTermino;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private StatusContrato status = StatusContrato.ATIVO;

	public Long getId() {
		return id;
	}

	public Aluno getAluno() {
		return aluno;
	}

	public void setAluno(Aluno aluno) {
		this.aluno = aluno;
	}

	public Unidade getUnidade() {
		return unidade;
	}

	public void setUnidade(Unidade unidade) {
		this.unidade = unidade;
	}

	public Plano getPlano() {
		return plano;
	}

	public void setPlano(Plano plano) {
		this.plano = plano;
		recalcularDataTermino();
	}

	public LocalDate getDataInicio() {
		return dataInicio;
	}

	public void setDataInicio(LocalDate dataInicio) {
		this.dataInicio = dataInicio;
		recalcularDataTermino();
	}

	public LocalDate getDataTermino() {
		return dataTermino;
	}

	public StatusContrato getStatus() {
		return status;
	}

	public void setStatus(StatusContrato status) {
		this.status = status;
	}

	private void recalcularDataTermino() {
		if (dataInicio != null && plano != null && plano.getDuracao() != null) {
			dataTermino = dataInicio.plusDays(plano.getDuracao());
		}
	}
}
