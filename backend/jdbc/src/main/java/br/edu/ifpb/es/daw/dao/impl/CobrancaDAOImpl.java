package br.edu.ifpb.es.daw.dao.impl;

import br.edu.ifpb.es.daw.dao.CobrancaDAO;
import br.edu.ifpb.es.daw.entities.Cobranca;
import jakarta.persistence.EntityManagerFactory;

public class CobrancaDAOImpl extends AbstractDAOImpl<Cobranca, Integer> implements CobrancaDAO {

    public CobrancaDAOImpl(EntityManagerFactory emf) {
        super(Cobranca.class, emf);
    }
}
