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

import br.edu.ifpb.academia.dto.request.AlunoRequest;
import br.edu.ifpb.academia.dto.request.PesoAlunoRequest;
import br.edu.ifpb.academia.dto.response.Responses.AlunoResponse;
import br.edu.ifpb.academia.service.AlunoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/alunos")
@RequiredArgsConstructor
public class AlunoController {
	private final AlunoService service;

	@GetMapping("/me")
	@PreAuthorize("hasRole('ALUNO')")
	public AlunoResponse meuCadastro(@AuthenticationPrincipal Jwt jwt) {
		return service.buscarMeuCadastro(jwt.getSubject());
	}

	@PostMapping("/me")
	@PreAuthorize("hasRole('ALUNO')")
	public AlunoResponse cadastrar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AlunoRequest request) {
		return service.registrar(jwt.getSubject(), jwt.getClaimAsString("email"),
				jwt.getClaimAsString("name"), request);
	}

	@PutMapping("/me/peso")
	@PreAuthorize("hasRole('ALUNO')")
	public AlunoResponse atualizarMeuPeso(@AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody PesoAlunoRequest request) {
		return service.atualizarPeso(jwt.getSubject(), request);
	}

	@GetMapping
	@PreAuthorize("hasRole('PERSONAL')")
	public List<AlunoResponse> listar() { return service.listar(); }

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('PERSONAL')")
	public AlunoResponse buscar(@PathVariable Long id) { return service.buscar(id); }

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('PERSONAL')")
	public AlunoResponse atualizar(@PathVariable Long id, @Valid @RequestBody AlunoRequest request) {
		return service.atualizarComoPersonal(id, request);
	}

	@PutMapping("/{alunoId}/programa/{programaId}")
	@PreAuthorize("hasRole('PERSONAL')")
	public AlunoResponse atribuirPrograma(@PathVariable Long alunoId, @PathVariable Long programaId) {
		return service.atribuirPrograma(alunoId, programaId);
	}
}
