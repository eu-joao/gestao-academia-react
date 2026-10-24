package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.impl.PlanoDAOImpl;
import br.edu.ifpb.es.daw.entities.Plano;
import br.edu.ifpb.es.daw.entities.TipoPlano;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.math.BigDecimal;

public class MainPlanoSave {

    public static void main(String[] args) throws DawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            PlanoDAOImpl dao = new PlanoDAOImpl(emf);

            Plano plano = new Plano();
            plano.setTipo(TipoPlano.MENSAL);
            plano.setValor(new BigDecimal("99.90"));
            plano.setDuracao(30);
            plano.setPercentualDesconto(new BigDecimal("0.00"));
            plano.setDescricao("Plano mensal sem desconto — acesso ilimitado por 30 dias.");

            dao.save(plano);

            System.out.println("Plano salvo: " + plano);
        }
    }
}
