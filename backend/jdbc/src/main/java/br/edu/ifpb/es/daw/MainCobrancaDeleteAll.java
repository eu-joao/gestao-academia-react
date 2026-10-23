package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.PersistenciaDawException;
import br.edu.ifpb.es.daw.dao.impl.CobrancaDAOImpl;
import br.edu.ifpb.es.daw.entities.Cobranca;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;

public class MainCobrancaDeleteAll {

    public static void main(String[] args) throws DawException, PersistenciaDawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            CobrancaDAOImpl dao = new CobrancaDAOImpl(emf);

            List<Cobranca> todas = dao.getAll();
            System.out.println("Cobranças encontradas: " + todas.size());

            for (Cobranca c : todas) {
                dao.delete(c.getId());
                System.out.println("Removida: " + c);
            }

            System.out.println("Todas as cobranças removidas.");
        }
    }
}
