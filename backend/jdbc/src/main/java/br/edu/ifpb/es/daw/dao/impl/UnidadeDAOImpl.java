package br.edu.ifpb.es.daw.dao.impl;

import br.edu.ifpb.es.daw.dao.UnidadeDAO;
import br.edu.ifpb.es.daw.entities.Unidade;
import jakarta.persistence.EntityManagerFactory;

/**
 * Implementação do DAO para Unidade.
 *
 * Todo o comportamento de persistência (save, update, delete,
 * getByID, getAll) já está implementado em AbstractDAOImpl.
 * Basta passar a classe da entidade e o EMF no construtor.
 */
public class UnidadeDAOImpl extends AbstractDAOImpl<Unidade, Integer> implements UnidadeDAO {

    public UnidadeDAOImpl(EntityManagerFactory emf) {
        super(Unidade.class, emf);
    }
}
