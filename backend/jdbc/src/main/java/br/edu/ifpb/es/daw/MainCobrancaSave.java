package br.edu.ifpb.es.daw;

import br.edu.ifpb.es.daw.dao.impl.CobrancaDAOImpl;
import br.edu.ifpb.es.daw.entities.Cobranca;
import br.edu.ifpb.es.daw.entities.StatusCobranca;
import br.edu.ifpb.es.daw.util.EMFUtil;
import jakarta.persistence.EntityManagerFactory;
import java.math.BigDecimal;
import java.time.LocalDate;

public class MainCobrancaSave {

    public static void main(String[] args) throws DawException {
        try (EntityManagerFactory emf = EMFUtil.build()) {

            CobrancaDAOImpl dao = new CobrancaDAOImpl(emf);

            Cobranca cobranca = new Cobranca();
            // Nesta fase, sem relacionamentos mapeados
            cobranca.setDataVencimento(LocalDate.now().plusDays(30));
            cobranca.setValor(new BigDecimal("99.90"));
            // dataPagamento null: ainda não foi paga
            cobranca.setDataPagamento(null);
            cobranca.setFormaPagamento(null);
            cobranca.setStatus(StatusCobranca.PENDENTE);

            dao.save(cobranca);

            System.out.println("Cobrança salva: " + cobranca);
        }
    }
}
