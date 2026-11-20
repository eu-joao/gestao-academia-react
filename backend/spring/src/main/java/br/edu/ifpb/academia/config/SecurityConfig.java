package br.edu.ifpb.academia.config;

import java.util.List;
import java.util.Arrays;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
	private static final String GOOGLE_ISSUER = "https://accounts.google.com";
	private static final String GOOGLE_KEYS = "https://www.googleapis.com/oauth2/v3/certs";

	@Bean
	JwtDecoder jwtDecoder(@Value("${academia.auth.google-audiences:}") String configuredAudiences) {
		NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(GOOGLE_KEYS).build();
		Set<String> audiences = Arrays.stream(configuredAudiences.split(","))
				.map(String::trim).filter(value -> !value.isEmpty()).collect(java.util.stream.Collectors.toSet());
		OAuth2TokenValidator<Jwt> issuerValidator = jwt -> {
			String issuer = jwt.getIssuer() == null ? "" : jwt.getIssuer().toString();
			return issuer.equals(GOOGLE_ISSUER) || issuer.equals("accounts.google.com")
					? OAuth2TokenValidatorResult.success()
					: OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Emissor Google inválido", null));
		};
		OAuth2TokenValidator<Jwt> audienceValidator = jwt -> !audiences.isEmpty()
				&& jwt.getAudience().stream().anyMatch(audiences::contains)
				? OAuth2TokenValidatorResult.success()
				: OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Audience Google inválida", null));
		OAuth2TokenValidator<Jwt> identityValidator = jwt -> jwt.getClaimAsString("email") != null
				&& Boolean.TRUE.equals(jwt.getClaim("email_verified"))
			? OAuth2TokenValidatorResult.success()
			: OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "E-mail Google não verificado", null));
		decoder.setJwtValidator(jwt -> {
			OAuth2TokenValidatorResult time = new JwtTimestampValidator().validate(jwt);
			if (time.hasErrors()) return time;
			OAuth2TokenValidatorResult issuer = issuerValidator.validate(jwt);
			if (issuer.hasErrors()) return issuer;
			OAuth2TokenValidatorResult audience = audienceValidator.validate(jwt);
			if (audience.hasErrors()) return audience;
			return identityValidator.validate(jwt);
		});
		return decoder;
	}

	@Bean
	Converter<Jwt, ? extends AbstractAuthenticationToken> googleAuthenticationConverter(
			@Value("${academia.auth.personal-email:}") String personalEmail) {
		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(jwt -> {
			String email = jwt.getClaimAsString("email");
			if (email == null || !Boolean.TRUE.equals(jwt.getClaim("email_verified"))) return List.of();
			String role = !personalEmail.isBlank() && email.equalsIgnoreCase(personalEmail)
					? "ROLE_PERSONAL" : "ROLE_ALUNO";
			return List.of(new SimpleGrantedAuthority(role));
		});
		return converter;
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http,
			Converter<Jwt, ? extends AbstractAuthenticationToken> googleAuthenticationConverter) throws Exception {
		http.csrf(csrf -> csrf.disable())
			.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
			.oauth2ResourceServer(resourceServer -> resourceServer
					.jwt(jwt -> jwt.jwtAuthenticationConverter(googleAuthenticationConverter)));
		return http.build();
	}
}
