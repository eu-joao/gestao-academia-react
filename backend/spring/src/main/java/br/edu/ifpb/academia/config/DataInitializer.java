package br.edu.ifpb.academia.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.academia.entity.ProgramaTreino;
import br.edu.ifpb.academia.entity.Aluno;
import br.edu.ifpb.academia.enums.NivelExperiencia;
import br.edu.ifpb.academia.enums.TipoEstrutural;
import br.edu.ifpb.academia.repository.ProgramaTreinoRepository;
import br.edu.ifpb.academia.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
	private final ProgramaTreinoRepository repository;
	private final AlunoRepository alunoRepository;

	@Override
	@Transactional
	public void run(String... args) {
		for (NivelExperiencia nivel : NivelExperiencia.values()) {
			criarPrograma(nivel, 3, TipoEstrutural.FULLBODY);
			criarPrograma(nivel, 4, TipoEstrutural.UPPER_LOWER);
			criarPrograma(nivel, 5, TipoEstrutural.PPL_UPPER_LOWER);
			criarPrograma(nivel, 6, TipoEstrutural.PPL_2X);
		}
		for (Aluno aluno : alunoRepository.findAll()) {
			if (aluno.getProgramaAtual() == null) {
				repository.findByNivelExperienciaAndFrequenciaSemanal(aluno.getNivelExperiencia(),
						aluno.getFrequenciaSemanal()).ifPresent(aluno::setProgramaAtual);
			}
		}
	}

	private void criarPrograma(NivelExperiencia nivel, int frequencia, TipoEstrutural tipo) {
		if (repository.existsByNivelExperienciaAndFrequenciaSemanal(nivel, frequencia)) return;
		ProgramaTreino programa = new ProgramaTreino();
		programa.setNivelExperiencia(nivel);
		programa.setFrequenciaSemanal(frequencia);
		programa.setTipoEstrutural(tipo);
		programa.setDescricao("Programa " + tipo.name() + " para " + nivel.name()
				+ " com frequência de " + frequencia + " dias por semana");
		repository.save(programa);
	}
}
