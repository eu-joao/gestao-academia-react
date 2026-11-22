package br.edu.ifpb.academia.dto;

import java.util.List;

import br.edu.ifpb.academia.dto.response.Responses.AlunoResponse;
import br.edu.ifpb.academia.dto.response.Responses.CobrancaResponse;
import br.edu.ifpb.academia.dto.response.Responses.ContratoResponse;
import br.edu.ifpb.academia.dto.response.Responses.DiaTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.ItemTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.PlanoResponse;
import br.edu.ifpb.academia.dto.response.Responses.ProgramaTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.SessaoTreinoResponse;
import br.edu.ifpb.academia.dto.response.Responses.TreinoResponse;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.entity.Cobranca;
import br.edu.ifpb.academia.entity.Contrato;
import br.edu.ifpb.academia.entity.DiaTreino;
import br.edu.ifpb.academia.entity.ItemTreino;
import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.entity.SessaoTreino;
import br.edu.ifpb.academia.entity.Treino;
import br.edu.ifpb.academia.enums.TipoPlano;

public final class Mapper {
	private Mapper() { }

	public static AlunoResponse toResponse(Aluno aluno) {
		return new AlunoResponse(aluno.getId(), aluno.getNome(), aluno.getEmail(), aluno.getPeso(), aluno.getAltura(),
				aluno.getNivelExperiencia(), aluno.getFrequenciaSemanal(), aluno.getStatus(),
				aluno.getProgramaAtual() == null ? null : aluno.getProgramaAtual().getId());
	}

	public static PlanoResponse toResponse(TipoPlano plano) {
		return new PlanoResponse(plano, plano.getDuracaoMeses(), plano.getValorMensal());
	}

	public static ProgramaTreinoResponse toResponse(ProgramaTreino programa, List<DiaTreinoResponse> dias) {
		return new ProgramaTreinoResponse(programa.getId(), programa.getNivelExperiencia(),
				programa.getFrequenciaSemanal(), programa.getTipoEstrutural(), programa.getDescricao(), dias);
	}

	public static DiaTreinoResponse toResponse(DiaTreino dia, List<ItemTreinoResponse> itens) {
		return new DiaTreinoResponse(dia.getId(), dia.getProgramaTreino().getId(), dia.getNome(), dia.getOrdem(), itens);
	}

	public static ItemTreinoResponse toResponse(ItemTreino item) {
		return new ItemTreinoResponse(item.getId(), item.getDiaTreino().getId(), item.getNomeExercicio(),
				item.getMusculaturaAlvo(), item.getSeries(), item.getRepeticoes(), item.getOrdem());
	}

	public static ContratoResponse toResponse(Contrato contrato) {
		return new ContratoResponse(contrato.getId(), contrato.getAluno().getId(), contrato.getPlano(),
				contrato.getDataInicio(), contrato.getDataTermino(), contrato.getStatus());
	}

	public static CobrancaResponse toResponse(Cobranca cobranca) {
		return new CobrancaResponse(cobranca.getId(), cobranca.getContrato().getId(), cobranca.getNumeroParcela(),
				cobranca.getDataVencimento(), cobranca.getValor(), cobranca.statusEfetivo(), cobranca.getDataPagamento());
	}

	public static SessaoTreinoResponse toResponse(SessaoTreino sessao) {
		return new SessaoTreinoResponse(sessao.getId(), sessao.getAluno().getId(), sessao.getProgramaTreino().getId(),
				sessao.getDiaTreino().getId(), sessao.getDataHoraConclusao());
	}

	public static TreinoResponse toResponse(Treino treino) {
		return new TreinoResponse(treino.getId(), treino.getNome(), treino.getCategoria(), treino.getDiaSemana(),
				treino.getDuracaoMin(), treino.getAluno() == null ? null : treino.getAluno().getId(),
				treino.getCriadoEm(), treino.getAtualizadoEm());
	}
}
