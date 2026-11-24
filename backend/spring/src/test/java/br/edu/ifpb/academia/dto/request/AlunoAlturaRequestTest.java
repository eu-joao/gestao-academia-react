package br.edu.ifpb.academia.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import br.edu.ifpb.academia.enums.NivelExperiencia;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;

class AlunoAlturaRequestTest {

	@Test
	void converteAlturaEmCentimetrosParaMetrosNosDoisRequests() {
		AlunoAdminRequest adminRequest = criarAdminRequest("180");
		AlunoRequest alunoRequest = criarAlunoRequest("180");

		assertThat(adminRequest.altura()).isEqualByComparingTo("1.80");
		assertThat(alunoRequest.altura()).isEqualByComparingTo("1.80");
		assertThat(caminhosComErro(adminRequest)).doesNotContain("altura");
		assertThat(caminhosComErro(alunoRequest)).doesNotContain("altura");
	}

	@Test
	void aceitaOsLimitesInformadosEmCentimetros() {
		AlunoAdminRequest alturaMinima = criarAdminRequest("30");
		AlunoRequest alturaMaxima = criarAlunoRequest("300");

		assertThat(alturaMinima.altura()).isEqualByComparingTo("0.30");
		assertThat(alturaMaxima.altura()).isEqualByComparingTo("3.00");
		assertThat(caminhosComErro(alturaMinima)).doesNotContain("altura");
		assertThat(caminhosComErro(alturaMaxima)).doesNotContain("altura");
	}

	@Test
	void rejeitaAlturasForaDasUnidadesAceitas() {
		AlunoAdminRequest adminRequest = criarAdminRequest("301");
		AlunoRequest alunoRequest = criarAlunoRequest("301");

		assertThat(caminhosComErro(adminRequest)).contains("altura");
		assertThat(caminhosComErro(alunoRequest)).contains("altura");
	}

	private static Set<String> caminhosComErro(Object request) {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			return factory.getValidator().validate(request).stream()
					.map(violacao -> violacao.getPropertyPath().toString())
					.collect(Collectors.toSet());
		}
	}

	private static AlunoAdminRequest criarAdminRequest(String altura) {
		return new AlunoAdminRequest(
				"Aluno Teste",
				"aluno@teste.com",
				new BigDecimal("70"),
				new BigDecimal(altura),
				NivelExperiencia.INICIANTE,
				3);
	}

	private static AlunoRequest criarAlunoRequest(String altura) {
		return new AlunoRequest(
				new BigDecimal("70"),
				new BigDecimal(altura),
				NivelExperiencia.INICIANTE,
				3);
	}
}
