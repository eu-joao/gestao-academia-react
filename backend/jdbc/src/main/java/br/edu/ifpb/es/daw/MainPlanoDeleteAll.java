package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.PersistenciaDawException;
import br.edu.ifpb.es.daw.dao.impl.PlanoDAOImpl;
import br.edu.ifpb.es.daw.entities.Plano;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;

public class MainPlanoDeleteAll {

    public static void main(String[] args) throws DawException, PersistenciaDawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            PlanoDAOImpl dao = new PlanoDAOImpl(emf);

            List<Plano> todos = dao.getAll();
            System.out.println("Planos encontrados: " + todos.size());

            for (Plano p : todos) {
                dao.delete(p.getId());
                System.out.println("Removido: " + p);
            }

            System.out.println("Todos os planos removidos.");
        }
    }
}
