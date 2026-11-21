package br.edu.ifpb.academia.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ifpb.academia.dto.request.TreinoRequest;
import br.edu.ifpb.academia.dto.request.TreinoSyncItemRequest;
import br.edu.ifpb.academia.dto.response.Responses.TreinoResponse;
import br.edu.ifpb.academia.service.AlunoService;
import br.edu.ifpb.academia.service.TreinoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/treinos")
@RequiredArgsConstructor
@Tag(name = "Treinos", description = "Endpoints de gerenciamento e sincronização de treinos para o app mobile")
public class TreinoController {

	private final TreinoService service;
	private final AlunoService alunoService;

	@Operation(summary = "Lista todos os treinos ativos com filtros opcionais")
	@GetMapping
	public List<TreinoResponse> listar(
			@RequestParam(required = false) Long alunoId,
			@RequestParam(required = false) String busca,
			@RequestParam(required = false) String dia) {
		return service.listar(alunoId, busca, dia);
	}

	@Operation(summary = "Busca um treino específico por ID (UUID)")
	@GetMapping("/{id}")
	public TreinoResponse buscar(@PathVariable UUID id) {
		return service.buscar(id);
	}

	@Operation(summary = "Cria um novo treino")
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TreinoResponse criar(
			@Valid @RequestBody TreinoRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		Long alunoId = extrairAlunoId(jwt);
		return service.criar(request, alunoId);
	}

	@Operation(summary = "Atualiza um treino existente")
	@PutMapping("/{id}")
	public TreinoResponse atualizar(
			@PathVariable UUID id,
			@Valid @RequestBody TreinoRequest request) {
		return service.atualizar(id, request);
	}

	@Operation(summary = "Remove um treino (exclusão lógica)")
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable UUID id) {
		service.excluir(id);
	}

	@Operation(summary = "Sincroniza um lote de operações pendentes da fila offline-first")
	@PostMapping("/sincronizar")
	public List<TreinoResponse> sincronizarLote(
			@RequestBody List<TreinoSyncItemRequest> itens,
			@AuthenticationPrincipal Jwt jwt) {
		Long alunoId = extrairAlunoId(jwt);
		return service.sincronizarLote(itens, alunoId);
	}

	private Long extrairAlunoId(Jwt jwt) {
		if (jwt == null) return null;
		try {
			return alunoService.buscarPorGoogleSubject(jwt.getSubject()).getId();
		} catch (Exception e) {
			return null;
		}
	}
}
