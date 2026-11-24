package br.edu.ifpb.academia.dto.request;

import java.math.BigDecimal;

import br.edu.ifpb.academia.enums.NivelExperiencia;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AlunoRequest(
		@NotNull @Positive BigDecimal peso,
		@NotNull @Positive
		@DecimalMax(
				value = "3.00",
				message = "Informe a altura em metros (até 3,00) ou em centímetros (de 30 a 300)")
		BigDecimal altura,
		@NotNull NivelExperiencia nivelExperiencia,
		@NotNull @Min(3) @Max(6) Integer frequenciaSemanal) {

	public AlunoRequest {
		altura = AlturaEmMetros.normalizar(altura);
	}
}
