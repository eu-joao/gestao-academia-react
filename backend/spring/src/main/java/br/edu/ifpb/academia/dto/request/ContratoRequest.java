package br.edu.ifpb.academia.dto.request;

import java.time.LocalDate;

import br.edu.ifpb.academia.enums.TipoPlano;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

public record ContratoRequest(@NotNull Long alunoId, @NotNull TipoPlano plano,
		@NotNull @PastOrPresent LocalDate dataInicio) { }
