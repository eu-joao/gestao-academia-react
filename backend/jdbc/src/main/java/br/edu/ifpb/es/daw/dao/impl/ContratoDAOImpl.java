package br.edu.ifpb.es.daw.dao.impl;

import br.edu.ifpb.es.daw.dao.ContratoDAO;
import br.edu.ifpb.es.daw.entities.Contrato;
import jakarta.persistence.EntityManagerFactory;

public class ContratoDAOImpl extends AbstractDAOImpl<Contrato, Integer> implements ContratoDAO {

    public ContratoDAOImpl(EntityManagerFactory emf) {
        super(Contrato.class, emf);
    }
}
