package br.edu.ifpb.academia.entity;

import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.TipoEstrutural;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ProgramaTreino {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private NivelExperiencia nivelExperiencia;

	@Column(nullable = false)
	private Integer frequenciaSemanal;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TipoEstrutural tipoEstrutural;

	@Column(nullable = false)
	private String descricao;

	public Long getId() {
		return id;
	}

	public NivelExperiencia getNivelExperiencia() {
		return nivelExperiencia;
	}

	public void setNivelExperiencia(NivelExperiencia nivelExperiencia) {
		this.nivelExperiencia = nivelExperiencia;
	}

	public Integer getFrequenciaSemanal() {
		return frequenciaSemanal;
	}

	public void setFrequenciaSemanal(Integer frequenciaSemanal) {
		this.frequenciaSemanal = frequenciaSemanal;
	}

	public TipoEstrutural getTipoEstrutural() {
		return tipoEstrutural;
	}

	public void setTipoEstrutural(TipoEstrutural tipoEstrutural) {
		this.tipoEstrutural = tipoEstrutural;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}
}
