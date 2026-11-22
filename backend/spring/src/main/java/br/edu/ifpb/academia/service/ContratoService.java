package br.edu.ifpb.academia.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.dto.Mapper;
import br.edu.ifpb.academia.dto.request.ContratoRequest;
import br.edu.ifpb.academia.dto.response.Responses.ContratoResponse;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.Contrato;
import br.edu.ifpb.academia.enums.StatusContrato;
import br.edu.ifpb.academia.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.academia.exception.RegraDeNegocioException;
import br.edu.ifpb.academia.repository.AlunoRepository;
import br.edu.ifpb.academia.repository.ContratoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContratoService {
	private final ContratoRepository repository;
	private final AlunoRepository alunoRepository;
	private final CobrancaService cobrancaService;

	@Transactional(readOnly = true)
	public List<ContratoResponse> listar() {
		return repository.findAll().stream().map(Mapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<ContratoResponse> listarDoAluno(Long alunoId) {
		return repository.findByAlunoIdOrderByDataInicioDesc(alunoId).stream().map(Mapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public ContratoResponse buscar(Long id) {
		return Mapper.toResponse(buscarEntidade(id));
	}

	@Transactional
	public ContratoResponse criar(ContratoRequest request) {
		encerrarVencidos();
		if (!request.dataInicio().plusMonths(request.plano().getDuracaoMeses()).isAfter(LocalDate.now())) {
			throw new RegraDeNegocioException("A vigência do contrato já teria terminado na data informada.");
		}
		Aluno aluno = alunoRepository.findByIdForUpdate(request.alunoId()).orElseThrow(
				() -> new RecursoNaoEncontradoException("Aluno não encontrado: " + request.alunoId()));
		if (repository.existsByAlunoIdAndStatusAndDataTerminoAfter(aluno.getId(), StatusContrato.ATIVO, LocalDate.now())) {
			throw new RegraDeNegocioException("Aluno já possui um contrato ativo.");
		}
		Contrato contrato = new Contrato();
		contrato.setAluno(aluno);
		contrato.setPlano(request.plano());
		contrato.setDataInicio(request.dataInicio());
		contrato.setStatus(StatusContrato.ATIVO);
		contrato = repository.save(contrato);
		cobrancaService.gerarParaContrato(contrato);
		aluno.setStatus(br.edu.ifpb.academia.enums.StatusAluno.ATIVO);
		alunoRepository.save(aluno);
		return Mapper.toResponse(contrato);
	}

	@Transactional
	public ContratoResponse cancelar(Long id) {
		Contrato contrato = buscarEntidade(id);
		alunoRepository.findByIdForUpdate(contrato.getAluno().getId())
				.orElseThrow(() -> new RecursoNaoEncontradoException("Aluno do contrato não encontrado."));
		if (!contrato.isAtivo()) {
			throw new RegraDeNegocioException("Somente contratos ativos podem ser cancelados.");
		}
		contrato.setStatus(StatusContrato.CANCELADO);
		cobrancaService.cancelarFuturas(contrato);
		boolean outroVigente = repository.existsByAlunoIdAndStatusAndDataTerminoAfter(
				contrato.getAluno().getId(), StatusContrato.ATIVO, LocalDate.now());
		if (!outroVigente) {
			contrato.getAluno().setStatus(br.edu.ifpb.academia.enums.StatusAluno.INATIVO);
		}
		return Mapper.toResponse(repository.save(contrato));
	}

	@Transactional
	@Scheduled(cron = "0 1 0 * * *")
	public void encerrarVencidos() {
		List<Contrato> vencidos = repository.findByStatusAndDataTerminoLessThanEqual(StatusContrato.ATIVO, LocalDate.now());
		for (Contrato contrato : vencidos) {
			contrato.setStatus(StatusContrato.ENCERRADO);
			boolean outroVigente = repository.existsByAlunoIdAndStatusAndDataTerminoAfter(
					contrato.getAluno().getId(), StatusContrato.ATIVO, LocalDate.now());
			if (!outroVigente) {
				contrato.getAluno().setStatus(br.edu.ifpb.academia.enums.StatusAluno.INATIVO);
			}
		}
	}

	@Transactional(readOnly = true)
	public Contrato buscarEntidade(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Contrato não encontrado com ID: " + id));
	}
}
