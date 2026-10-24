package br.edu.ifpb.es.daw.dao.impl;

import br.edu.ifpb.es.daw.dao.AlunoDAO;
import br.edu.ifpb.es.daw.entities.Aluno;
import jakarta.persistence.EntityManagerFactory;

public class AlunoDAOImpl extends AbstractDAOImpl<Aluno, Integer> implements AlunoDAO {

    public AlunoDAOImpl(EntityManagerFactory emf) {
        super(Aluno.class, emf);
    }
}
