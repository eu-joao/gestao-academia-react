package br.edu.ifpb.academia.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TreinoRequest(
		UUID id,
		@NotBlank(message = "O nome do treino é obrigatório")
		@Size(min = 3, message = "O nome do treino deve ter no mínimo 3 caracteres")
		String nome,
		String categoria,
		@NotBlank(message = "O dia da semana é obrigatório")
		String diaSemana,
		@NotNull(message = "A duração estimada é obrigatória")
		@Min(value = 1, message = "A duração mínima é de 1 minuto")
		@Max(value = 300, message = "A duração máxima é de 300 minutos")
		Integer duracaoMin,
		Long alunoId) {
}
