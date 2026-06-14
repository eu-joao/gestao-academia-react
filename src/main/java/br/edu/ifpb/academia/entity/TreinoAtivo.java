package br.edu.ifpb.academia.entity;

import java.time.LocalDate;

import br.edu.ifpb.academia.enums.StatusTreinoAtivo;
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
public class TreinoAtivo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Aluno aluno;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private ProgramaTreino programaTreino;

	@Column(nullable = false)
	private LocalDate dataInicio;

	private LocalDate dataFim;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private StatusTreinoAtivo status = StatusTreinoAtivo.ATIVO;

	public Long getId() {
		return id;
	}

	public Aluno getAluno() {
		return aluno;
	}

	public void setAluno(Aluno aluno) {
		this.aluno = aluno;
	}

	public ProgramaTreino getProgramaTreino() {
		return programaTreino;
	}

	public void setProgramaTreino(ProgramaTreino programaTreino) {
		this.programaTreino = programaTreino;
	}

	public LocalDate getDataInicio() {
		return dataInicio;
	}

	public void setDataInicio(LocalDate dataInicio) {
		this.dataInicio = dataInicio;
	}

	public LocalDate getDataFim() {
		return dataFim;
	}

	public void setDataFim(LocalDate dataFim) {
		this.dataFim = dataFim;
	}

	public StatusTreinoAtivo getStatus() {
		return status;
	}

	public void setStatus(StatusTreinoAtivo status) {
		this.status = status;
	}
}
