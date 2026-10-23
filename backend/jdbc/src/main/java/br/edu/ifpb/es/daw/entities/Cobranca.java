package br.edu.ifpb.es.daw.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * Cobrança gerada automaticamente ao criar um contrato.
 *
 * - status String: "pendente", "pago" ou "atrasado" — boolean não
 *   consegue representar três estados.
 * - dataPagamento é nullable: só é preenchida quando o aluno efetua
 *   o pagamento; antes disso, o campo fica em branco.
 * - valor usa BigDecimal: evita erros de arredondamento com dinheiro.
 */
@Entity
@Table(name = "cobranca")
public class Cobranca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private LocalDate dataVencimento;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    /**
     * Preenchida apenas após o pagamento. Pode ser null.
     */
    @Column
    private LocalDate dataPagamento;

    @Column(length = 30)
    private String formaPagamento;

    /**
     * PENDENTE, PAGO ou ATRASADO.
     * Atualizado automaticamente conforme as datas de vencimento.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StatusCobranca status;

    // --- Getters e Setters ---

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public LocalDate getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(LocalDate dataVencimento) { this.dataVencimento = dataVencimento; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDate getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(LocalDate dataPagamento) { this.dataPagamento = dataPagamento; }

    public String getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }

    public StatusCobranca getStatus() { return status; }
    public void setStatus(StatusCobranca status) { this.status = status; }

    // --- equals, hashCode e toString ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cobranca cobranca = (Cobranca) o;
        return id == cobranca.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Cobranca{" +
                "id=" + id +
                ", dataVencimento=" + dataVencimento +
                ", valor=" + valor +
                ", dataPagamento=" + dataPagamento +
                ", formaPagamento='" + formaPagamento + '\'' +
                ", status=" + status +
                '}';
    }
}
