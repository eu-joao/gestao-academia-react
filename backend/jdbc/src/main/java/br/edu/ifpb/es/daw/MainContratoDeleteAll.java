package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.PersistenciaDawException;
import br.edu.ifpb.es.daw.dao.impl.ContratoDAOImpl;
import br.edu.ifpb.es.daw.entities.Contrato;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;

public class MainContratoDeleteAll {

    public static void main(String[] args) throws DawException, PersistenciaDawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            ContratoDAOImpl dao = new ContratoDAOImpl(emf);

            List<Contrato> todos = dao.getAll();
            System.out.println("Contratos encontrados: " + todos.size());

            for (Contrato c : todos) {
                dao.delete(c.getId());
                System.out.println("Removido: " + c);
            }

            System.out.println("Todos os contratos removidos.");
        }
    }
}
