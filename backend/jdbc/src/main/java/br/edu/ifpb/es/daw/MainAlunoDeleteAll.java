package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.PersistenciaDawException;
import br.edu.ifpb.es.daw.dao.impl.AlunoDAOImpl;
import br.edu.ifpb.es.daw.entities.Aluno;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;

public class MainAlunoDeleteAll {

    public static void main(String[] args) throws DawException, PersistenciaDawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            AlunoDAOImpl dao = new AlunoDAOImpl(emf);

            List<Aluno> todos = dao.getAll();
            System.out.println("Alunos encontrados: " + todos.size());

            for (Aluno a : todos) {
                dao.delete(a.getId());
                System.out.println("Removido: " + a);
            }

            System.out.println("Todos os alunos removidos.");
        }
    }
}
