package br.edu.ifpb.academia.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ifpb.academia.dto.response.Responses.CobrancaResponse;
import br.edu.ifpb.academia.service.AlunoService;
import br.edu.ifpb.academia.service.CobrancaService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cobrancas")
@RequiredArgsConstructor
public class CobrancaController {
	private final CobrancaService service;
	private final AlunoService alunoService;

	@GetMapping
	@PreAuthorize("hasRole('PERSONAL')")
	public List<CobrancaResponse> listar() { return service.listar(); }

	@GetMapping("/me")
	@PreAuthorize("hasRole('ALUNO')")
	public List<CobrancaResponse> minhas(@AuthenticationPrincipal Jwt jwt) {
		return service.listarDoAluno(alunoService.buscarPorGoogleSubject(jwt.getSubject()).getId());
	}

	@GetMapping("/contrato/{contratoId}")
	@PreAuthorize("hasRole('PERSONAL')")
	public List<CobrancaResponse> listarDoContrato(@PathVariable Long contratoId) {
		return service.listarDoContrato(contratoId);
	}

	@PostMapping("/{id}/pagar")
	@PreAuthorize("hasRole('ALUNO')")
	public CobrancaResponse pagar(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
		Long alunoId = alunoService.buscarPorGoogleSubject(jwt.getSubject()).getId();
		return service.pagar(id, alunoId);
	}
}
