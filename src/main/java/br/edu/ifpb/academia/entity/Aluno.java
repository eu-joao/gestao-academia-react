package br.edu.ifpb.academia.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.StatusAluno;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Aluno {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false, unique = true)
	private String cpf;

	@Column(nullable = false)
	private String telefone;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private LocalDate dataNascimento;

	@Column(nullable = false, precision = 6, scale = 2)
	private BigDecimal peso;

	@Column(nullable = false, precision = 4, scale = 2)
	private BigDecimal altura;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private NivelExperiencia nivelExperiencia;

	@Column(nullable = false)
	private Integer frequenciaSemanal;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private StatusAluno status = StatusAluno.ATIVO;

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public LocalDate getDataNascimento() {
		return dataNascimento;
	}

	public void setDataNascimento(LocalDate dataNascimento) {
		this.dataNascimento = dataNascimento;
	}

	public BigDecimal getPeso() {
		return peso;
	}

	public void setPeso(BigDecimal peso) {
		this.peso = peso;
	}

	public BigDecimal getAltura() {
		return altura;
	}

	public void setAltura(BigDecimal altura) {
		this.altura = altura;
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

	public StatusAluno getStatus() {
		return status;
	}

	public void setStatus(StatusAluno status) {
		this.status = status;
	}
	public boolean isAtivo() {
		return status == StatusAluno.ATIVO;
	}
}
