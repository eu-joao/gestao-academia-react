package br.edu.ifpb.academia.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ifpb.academia.dto.request.ContratoRequest;
import br.edu.ifpb.academia.dto.response.Responses.ContratoResponse;
import br.edu.ifpb.academia.service.AlunoService;
import br.edu.ifpb.academia.service.ContratoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/contratos")
@RequiredArgsConstructor
public class ContratoController {
	private final ContratoService service;
	private final AlunoService alunoService;

	@GetMapping
	@PreAuthorize("hasRole('PERSONAL')")
	public List<ContratoResponse> listar() { return service.listar(); }

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('PERSONAL')")
	public ContratoResponse buscar(@PathVariable Long id) { return service.buscar(id); }

	@PostMapping
	@PreAuthorize("hasRole('PERSONAL')")
	public ContratoResponse criar(@Valid @RequestBody ContratoRequest request) { return service.criar(request); }

	@PutMapping("/{id}/cancelar")
	@PreAuthorize("hasRole('PERSONAL')")
	public ContratoResponse cancelar(@PathVariable Long id) { return service.cancelar(id); }

	@GetMapping("/me")
	@PreAuthorize("hasRole('ALUNO')")
	public List<ContratoResponse> meusContratos(@AuthenticationPrincipal Jwt jwt) {
		return service.listarDoAluno(alunoService.buscarPorGoogleSubject(jwt.getSubject()).getId());
	}

	@GetMapping("/aluno/{alunoId}")
	@PreAuthorize("hasRole('PERSONAL')")
	public List<ContratoResponse> contratosDoAluno(@PathVariable Long alunoId) {
		return service.listarDoAluno(alunoId);
	}
}
