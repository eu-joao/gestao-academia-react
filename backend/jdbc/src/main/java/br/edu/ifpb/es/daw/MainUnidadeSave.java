package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.impl.UnidadeDAOImpl;
import br.edu.ifpb.es.daw.entities.Unidade;
import br.edu.ifpb.es.daw.util.EMFUtil;
import br.edu.ifpb.es.daw.util.Util;
import jakarta.persistence.EntityManagerFactory;

public class MainUnidadeSave {

    public static void main(String[] args) throws DawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            UnidadeDAOImpl dao = new UnidadeDAOImpl(emf);

            Unidade unidade = new Unidade();
            unidade.setNome("Academia Central");
            unidade.setEndereco("Rua das Flores, 123 - Esperança/PB");
            // nanoTime garante CNPJ e telefone únicos a cada execução
            unidade.setCnpj(Util.generateUniqueString(14));
            unidade.setTelefone(Util.generateUniqueString(20));

            dao.save(unidade);

            System.out.println("Unidade salva: " + unidade);
        }
    }
}
