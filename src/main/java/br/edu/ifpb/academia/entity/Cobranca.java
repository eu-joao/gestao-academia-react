package br.edu.ifpb.academia.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.edu.ifpb.academia.enums.FormaPagamento;
import br.edu.ifpb.academia.enums.StatusCobranca;
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
public class Cobranca {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Contrato contrato;

	@Column(nullable = false)
	private LocalDate dataVencimento;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal valor;

	private LocalDate dataPagamento;

	@Enumerated(EnumType.STRING)
	private FormaPagamento formaPagamento;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private StatusCobranca status = StatusCobranca.PENDENTE;

	public Long getId() {
		return id;
	}

	public Contrato getContrato() {
		return contrato;
	}

	public void setContrato(Contrato contrato) {
		this.contrato = contrato;
	}

	public LocalDate getDataVencimento() {
		return dataVencimento;
	}

	public void setDataVencimento(LocalDate dataVencimento) {
		this.dataVencimento = dataVencimento;
	}

	public BigDecimal getValor() {
		return valor;
	}

	public void setValor(BigDecimal valor) {
		this.valor = valor;
	}

	public LocalDate getDataPagamento() {
		return dataPagamento;
	}

	public void setDataPagamento(LocalDate dataPagamento) {
		this.dataPagamento = dataPagamento;
	}

	public FormaPagamento getFormaPagamento() {
		return formaPagamento;
	}

	public void setFormaPagamento(FormaPagamento formaPagamento) {
		this.formaPagamento = formaPagamento;
	}

	public StatusCobranca getStatus() {
		return status;
	}

	public void setStatus(StatusCobranca status) {
		this.status = status;
	}
}
