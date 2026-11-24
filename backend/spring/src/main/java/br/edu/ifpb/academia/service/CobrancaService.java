package br.edu.ifpb.academia.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.response.Responses.CobrancaResponse;
import br.edu.ifpb.academia.entity.Cobranca;
import br.edu.ifpb.academia.entity.Contrato;
import br.edu.ifpb.academia.enums.StatusCobranca;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.repository.CobrancaRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CobrancaService {
	private final CobrancaRepository repository;

	@Transactional(readOnly = true)
	public List<CobrancaResponse> listar() {
		return repository.findAll().stream().map(Mapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<CobrancaResponse> listarDoAluno(Long alunoId) {
		return repository.findByContratoAlunoIdOrderByNumeroParcela(alunoId).stream().map(Mapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<CobrancaResponse> listarDoContrato(Long contratoId) {
		return repository.findByContratoIdOrderByNumeroParcela(contratoId).stream().map(Mapper::toResponse).toList();
	}

	@Transactional
	public CobrancaResponse pagar(Long cobrancaId, Long alunoId) {
		Cobranca cobranca = repository.findByIdAndContratoAlunoId(cobrancaId, alunoId)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Cobrança não encontrada para este aluno."));
		if (cobranca.getStatus() == StatusCobranca.PAGO) {
			throw new RegraDeNegocioException("Esta cobrança já foi paga.");
		}
		if (cobranca.getStatus() == StatusCobranca.CANCELADO) {
			throw new RegraDeNegocioException("Cobranças canceladas não podem ser pagas.");
		}
		cobranca.setStatus(StatusCobranca.PAGO);
		cobranca.setDataPagamento(LocalDate.now());
		return Mapper.toResponse(repository.save(cobranca));
	}

	@Transactional
	public void gerarParaContrato(Contrato contrato) {
		for (int parcela = 1; parcela <= contrato.getPlano().getDuracaoMeses(); parcela++) {
			Cobranca cobranca = new Cobranca();
			cobranca.setContrato(contrato);
			cobranca.setNumeroParcela(parcela);
			cobranca.setDataVencimento(contrato.getDataInicio().plusMonths(parcela - 1L));
			cobranca.setValor(contrato.getPlano().getValorMensal());
			cobranca.setStatus(StatusCobranca.PENDENTE);
			repository.save(cobranca);
		}
	}

	@Transactional
	public void cancelarFuturas(Contrato contrato) {
		List<Cobranca> cobrancas = repository.findByContratoIdOrderByNumeroParcela(contrato.getId());
		for (Cobranca cobranca : cobrancas) {
			if (cobranca.getStatus() != StatusCobranca.PAGO
					&& cobranca.getDataVencimento().isAfter(LocalDate.now())) {
				cobranca.setStatus(StatusCobranca.CANCELADO);
			}
		}
	}

	@Transactional
	public CobrancaResponse confirmarPagamentoComoPersonal(Long cobrancaId) {
		Cobranca cobranca = repository.findById(cobrancaId)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Cobrança não encontrada: " + cobrancaId));
		if (cobranca.getStatus() == StatusCobranca.PAGO) {
			throw new RegraDeNegocioException("Esta cobrança já foi paga.");
		}
		if (cobranca.getStatus() == StatusCobranca.CANCELADO) {
			throw new RegraDeNegocioException("Cobranças canceladas não podem ser pagas.");
		}
		cobranca.setStatus(StatusCobranca.PAGO);
		cobranca.setDataPagamento(LocalDate.now());
		return Mapper.toResponse(repository.save(cobranca));
	}
}
