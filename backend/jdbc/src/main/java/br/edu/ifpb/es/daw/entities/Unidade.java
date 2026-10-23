package br.edu.ifpb.es.daw.entities;

import jakarta.persistence.*;
import java.util.Objects;

/**
 * Unidade física da rede de academias.
 *
 * CNPJ e telefone são String porque:
 *   - CNPJ tem formatação (00.000.000/0001-00) e zeros à esquerda
 *   - Telefone também pode ter zeros à esquerda e formatação
 * Ambos seriam corrompidos se armazenados como int/long.
 */
@Entity
@Table(name = "unidade")
public class Unidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column
    private String endereco;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(unique = true, length = 20)
    private String telefone;

    // --- Getters e Setters ---

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    // --- equals, hashCode e toString ---
    // Usamos o id como base porque é a chave primária — dois objetos
    // com o mesmo id representam a mesma unidade no banco.

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Unidade unidade = (Unidade) o;
        return id == unidade.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Unidade{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", endereco='" + endereco + '\'' +
                ", cnpj='" + cnpj + '\'' +
                ", telefone='" + telefone + '\'' +
                '}';
    }
}
