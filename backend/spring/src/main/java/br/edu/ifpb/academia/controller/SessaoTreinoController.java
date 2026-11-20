package br.edu.ifpb.academia.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ifpb.academia.dto.request.SessaoTreinoRequest;
import br.edu.ifpb.academia.dto.response.Responses.DiaTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.SessaoTreinoResponse;
import br.edu.ifpb.academia.service.AlunoService;
import br.edu.ifpb.academia.service.SessaoTreinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sessoes-treino")
@RequiredArgsConstructor
public class SessaoTreinoController {
	private final SessaoTreinoService service;
	private final AlunoService alunoService;

	@GetMapping("/me")
	@PreAuthorize("hasRole('ALUNO')")
	public List<SessaoTreinoResponse> minhas(@AuthenticationPrincipal Jwt jwt) {
		return service.listarDoAluno(alunoService.buscarPorGoogleSubject(jwt.getSubject()).getId());
	}

	@GetMapping("/me/proximo-dia")
	@PreAuthorize("hasRole('ALUNO')")
	public DiaTreinoResponse proximoDia(@AuthenticationPrincipal Jwt jwt) {
		return service.proximoDia(alunoService.buscarPorGoogleSubject(jwt.getSubject()).getId());
	}

	@PostMapping("/me")
	@PreAuthorize("hasRole('ALUNO')")
	public SessaoTreinoResponse concluir(@AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody SessaoTreinoRequest request) {
		return service.concluir(alunoService.buscarPorGoogleSubject(jwt.getSubject()).getId(), request);
	}
}
