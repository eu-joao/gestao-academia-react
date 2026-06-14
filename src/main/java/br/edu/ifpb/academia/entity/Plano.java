package br.edu.ifpb.academia.entity;

import java.math.BigDecimal;

import br.edu.ifpb.academia.enums.TipoPlano;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Plano {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, unique = true)
	private TipoPlano tipo;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal valor;

	@Column(nullable = false)
	private Integer duracao;

	@Column(nullable = false, precision = 5, scale = 2)
	private BigDecimal percentualDesconto;

	@Column(nullable = false)
	private String descricao;

	public Long getId() {
		return id;
	}

	public TipoPlano getTipo() {
		return tipo;
	}

	public void setTipo(TipoPlano tipo) {
		this.tipo = tipo;
	}

	public BigDecimal getValor() {
		return valor;
	}

	public void setValor(BigDecimal valor) {
		this.valor = valor;
	}

	public Integer getDuracao() {
		return duracao;
	}

	public void setDuracao(Integer duracao) {
		this.duracao = duracao;
	}

	public BigDecimal getPercentualDesconto() {
		return percentualDesconto;
	}

	public void setPercentualDesconto(BigDecimal percentualDesconto) {
		this.percentualDesconto = percentualDesconto;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}
}
