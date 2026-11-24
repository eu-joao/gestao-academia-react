package br.edu.ifpb.academia.dto.request;

import java.math.BigDecimal;

import br.edu.ifpb.academia.enums.NivelExperiencia;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AlunoAdminRequest(
		@NotBlank(message = "O nome é obrigatório")
		@Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
		String nome,

		@NotBlank(message = "O e-mail é obrigatório")
		@Email(message = "Formato de e-mail inválido")
		@Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres")
		String email,

		@NotNull(message = "O peso é obrigatório")
		@Positive(message = "O peso deve ser maior que zero")
		BigDecimal peso,

		@NotNull(message = "A altura é obrigatória")
		@Positive(message = "A altura deve ser maior que zero")
		BigDecimal altura,

		@NotNull(message = "O nível de experiência é obrigatório")
		NivelExperiencia nivelExperiencia,

		@NotNull(message = "A frequência semanal é obrigatória")
		@Min(value = 3, message = "A frequência mínima é 3 dias")
		@Max(value = 6, message = "A frequência máxima é 6 dias")
		Integer frequenciaSemanal) {
}