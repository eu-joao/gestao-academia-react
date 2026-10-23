package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.PersistenciaDawException;
import br.edu.ifpb.es.daw.dao.impl.UnidadeDAOImpl;
import br.edu.ifpb.es.daw.entities.Unidade;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;

public class MainUnidadeDeleteAll {

    public static void main(String[] args) throws DawException, PersistenciaDawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            UnidadeDAOImpl dao = new UnidadeDAOImpl(emf);

            List<Unidade> todas = dao.getAll();
            System.out.println("Unidades encontradas: " + todas.size());

            for (Unidade u : todas) {
                dao.delete(u.getId());
                System.out.println("Removida: " + u);
            }

            System.out.println("Todas as unidades removidas.");
        }
    }
}
