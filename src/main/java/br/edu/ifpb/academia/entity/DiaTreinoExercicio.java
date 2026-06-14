package br.edu.ifpb.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class DiaTreinoExercicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private DiaTreino diaTreino;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Exercicio exercicio;

	@Column(nullable = false)
	private Integer series;

	@Column(nullable = false)
	private Integer repeticoes;

	@Column(nullable = false)
	private Integer ordem;

	public Long getId() {
		return id;
	}

	public DiaTreino getDiaTreino() {
		return diaTreino;
	}

	public void setDiaTreino(DiaTreino diaTreino) {
		this.diaTreino = diaTreino;
	}

	public Exercicio getExercicio() {
		return exercicio;
	}

	public void setExercicio(Exercicio exercicio) {
		this.exercicio = exercicio;
	}

	public Integer getSeries() {
		return series;
	}

	public void setSeries(Integer series) {
		this.series = series;
	}

	public Integer getRepeticoes() {
		return repeticoes;
	}

	public void setRepeticoes(Integer repeticoes) {
		this.repeticoes = repeticoes;
	}

	public Integer getOrdem() {
		return ordem;
	}

	public void setOrdem(Integer ordem) {
		this.ordem = ordem;
	}
}
