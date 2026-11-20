package br.edu.ifpb.academia.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.StatusAluno;
import br.edu.ifpb.academia.enums.StatusCobranca;
import br.edu.ifpb.academia.enums.StatusContrato;
import br.edu.ifpb.academia.enums.TipoEstrutural;
import br.edu.ifpb.academia.enums.TipoPlano;

public final class Responses {
	private Responses() { }

	public record AlunoResponse(Long id, String nome, String email, BigDecimal peso, BigDecimal altura,
			NivelExperiencia nivelExperiencia, Integer frequenciaSemanal, StatusAluno status,
			Long programaAtualId) { }

	public record PlanoResponse(TipoPlano tipo, Integer duracaoMeses, BigDecimal valorMensal) { }

	public record ProgramaTreinoResponse(Long id, NivelExperiencia nivelExperiencia, Integer frequenciaSemanal,
			TipoEstrutural tipoEstrutural, String descricao, List<DiaTreinoResponse> dias) { }

	public record DiaTreinoResponse(Long id, Long programaTreinoId, String nome, Integer ordem,
			List<ItemTreinoResponse> itens) { }

	public record ItemTreinoResponse(Long id, Long diaTreinoId, String nomeExercicio, String musculaturaAlvo,
			Integer series, String repeticoes, Integer ordem) { }

	public record ContratoResponse(Long id, Long alunoId, TipoPlano plano, LocalDate dataInicio,
			LocalDate dataTermino, StatusContrato status) { }

	public record CobrancaResponse(Long id, Long contratoId, Integer numeroParcela, LocalDate dataVencimento,
			BigDecimal valor, StatusCobranca status, LocalDate dataPagamento) { }

	public record SessaoTreinoResponse(Long id, Long alunoId, Long programaTreinoId, Long diaTreinoId,
			LocalDateTime dataHoraConclusao) { }
}
