package br.edu.ifpb.academia.enums;

import java.math.BigDecimal;

public enum TipoPlano {
	// Valores mensais equivalentes aos totais legados: R$120, R$330/3 e R$600/6.
	MENSAL(1, "120.00"),
	TRIMESTRAL(3, "110.00"),
	SEMESTRAL(6, "100.00");

	private final int duracaoMeses;
	private final BigDecimal valorMensal;

	TipoPlano(int duracaoMeses, String valorMensal) {
		this.duracaoMeses = duracaoMeses;
		this.valorMensal = new BigDecimal(valorMensal);
	}

	public int getDuracaoMeses() {
		return duracaoMeses;
	}

	public BigDecimal getValorMensal() {
		return valorMensal;
	}
}
