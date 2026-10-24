package br.edu.ifpb.es.daw.dao.impl;

import br.edu.ifpb.es.daw.dao.PlanoDAO;
import br.edu.ifpb.es.daw.entities.Plano;
import jakarta.persistence.EntityManagerFactory;

public class PlanoDAOImpl extends AbstractDAOImpl<Plano, Integer> implements PlanoDAO {

    public PlanoDAOImpl(EntityManagerFactory emf) {
        super(Plano.class, emf);
    }
}
