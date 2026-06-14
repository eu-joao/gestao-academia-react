package br.edu.ifpb.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Exercicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String nome;

	@Column(nullable = false)
	private String musculaturaAlvo;

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getMusculaturaAlvo() {
		return musculaturaAlvo;
	}

	public void setMusculaturaAlvo(String musculaturaAlvo) {
		this.musculaturaAlvo = musculaturaAlvo;
	}
}
