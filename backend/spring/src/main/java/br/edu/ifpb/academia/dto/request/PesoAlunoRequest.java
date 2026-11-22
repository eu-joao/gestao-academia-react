package br.edu.ifpb.academia.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PesoAlunoRequest(@NotNull @Positive BigDecimal peso) { }
