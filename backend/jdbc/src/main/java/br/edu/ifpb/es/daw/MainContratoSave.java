package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.impl.ContratoDAOImpl;
import br.edu.ifpb.es.daw.entities.Contrato;
import br.edu.ifpb.es.daw.entities.StatusContrato;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.time.LocalDate;

public class MainContratoSave {

    public static void main(String[] args) throws DawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            ContratoDAOImpl dao = new ContratoDAOImpl(emf);

            Contrato contrato = new Contrato();
            // Nesta fase, sem relacionamentos mapeados
            contrato.setDataInicio(LocalDate.now());
            contrato.setDataTermino(LocalDate.now().plusDays(30));
            contrato.setStatus(StatusContrato.ATIVO);

            dao.save(contrato);

            System.out.println("Contrato salvo: " + contrato);
        }
    }
}
