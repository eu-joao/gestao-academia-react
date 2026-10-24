package br.edu.ifpb.es.daw.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * Plano de matrícula disponível na rede.
 *
 * Tipos fixos: diario, mensal, trimestral, semestral, anual.
 * Planos não podem ser criados por unidade nem customizados por contrato.
 *
 * - valor usa BigDecimal: float/double têm erros de arredondamento
 *   que causam bugs em sistemas financeiros (ex: 19.90 vira 19.899999...)
 * - percentualDesconto usa BigDecimal pelo mesmo motivo (ex: 12.5%)
 * - duracao: quantidade de dias do plano
 */
@Entity
@Table(name = "plano")
public class Plano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Valores: DIARIO, MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoPlano tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private Integer duracao;

    @Column(precision = 5, scale = 2)
    private BigDecimal percentualDesconto;

    @Column(nullable = false)
    private String descricao;

    // --- Getters e Setters ---

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TipoPlano getTipo() { return tipo; }
    public void setTipo(TipoPlano tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public Integer getDuracao() { return duracao; }
    public void setDuracao(Integer duracao) { this.duracao = duracao; }

    public BigDecimal getPercentualDesconto() { return percentualDesconto; }
    public void setPercentualDesconto(BigDecimal percentualDesconto) { this.percentualDesconto = percentualDesconto; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    // --- equals, hashCode e toString ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Plano plano = (Plano) o;
        return id == plano.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Plano{" +
                "id=" + id +
                ", tipo=" + tipo +
                ", valor=" + valor +
                ", duracao=" + duracao +
                ", percentualDesconto=" + percentualDesconto +
                ", descricao='" + descricao + '\'' +
                '}';
    }
}
