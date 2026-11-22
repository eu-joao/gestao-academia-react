package br.edu.ifpb.academia.dto.request;

import jakarta.validation.constraints.NotNull;

public record SessaoTreinoRequest(@NotNull Long diaTreinoId) { }
