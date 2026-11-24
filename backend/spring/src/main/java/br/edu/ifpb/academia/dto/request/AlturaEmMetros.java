package br.edu.ifpb.academia.dto.request;

import java.math.BigDecimal;

final class AlturaEmMetros {
	private static final BigDecimal TRINTA_CENTIMETROS = new BigDecimal("30");
	private static final BigDecimal TREZENTOS_CENTIMETROS = new BigDecimal("300");

	private AlturaEmMetros() {}

	static BigDecimal normalizar(BigDecimal altura) {
		if (altura != null
				&& altura.compareTo(TRINTA_CENTIMETROS) >= 0
				&& altura.compareTo(TREZENTOS_CENTIMETROS) <= 0) {
			return altura.movePointLeft(2);
		}
		return altura;
	}
}
