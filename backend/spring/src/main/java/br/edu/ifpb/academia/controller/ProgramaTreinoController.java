package br.edu.ifpb.academia.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ifpb.academia.dto.response.Responses.ProgramaTreinoResponse;
import br.edu.ifpb.academia.service.AlunoService;
import br.edu.ifpb.academia.service.ProgramaTreinoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/programas-treino")
@RequiredArgsConstructor
public class ProgramaTreinoController {
	private final ProgramaTreinoService service;
	private final AlunoService alunoService;

	@GetMapping
	@PreAuthorize("hasAnyRole('PERSONAL', 'ALUNO')")
	public List<ProgramaTreinoResponse> listar() { return service.listar(); }

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('PERSONAL')")
	public ProgramaTreinoResponse buscar(@PathVariable Long id) { return service.buscar(id); }

	@GetMapping("/me")
	@PreAuthorize("hasRole('ALUNO')")
	public ProgramaTreinoResponse meuPrograma(@AuthenticationPrincipal Jwt jwt) {
		return service.resposta(alunoService.buscarPorGoogleSubject(jwt.getSubject()).getProgramaAtual());
	}
}
