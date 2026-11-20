package br.edu.ifpb.academia.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.response.Responses.PlanoResponse;
import br.edu.ifpb.academia.enums.TipoPlano;

@RestController
@RequestMapping("/planos")
public class PlanoController {
	@GetMapping
	@PreAuthorize("hasAnyRole('PERSONAL', 'ALUNO')")
	public List<PlanoResponse> listar() {
		return Arrays.stream(TipoPlano.values()).map(Mapper::toResponse).toList();
	}
}
