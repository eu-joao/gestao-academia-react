package br.edu.ifpb.academia.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TreinoSyncItemRequest(
		@NotNull UUID id,
		@NotBlank String acao,
		TreinoRequest dados,
		Long timestamp) {
}
