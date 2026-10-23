package br.edu.ifpb.es.daw.util;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

import java.util.HashMap;
import java.util.Map;

/**
 * Utilitário para criar o EntityManagerFactory com credenciais
 * lidas do arquivo .env local (nunca commitado no repositório).
 *
 * Como funciona:
 *   1. O dotenv-java lê o arquivo .env na raiz do projeto.
 *   2. As variáveis DB_URL, DB_USER e DB_PASSWORD são lidas.
 *   3. Um Map com as propriedades JDBC é montado e passado ao JPA.
 *   4. O persistence.xml cuida do resto (Hibernate, pool, etc.).
 *
 * Uso nos Mains:
 *   try (EntityManagerFactory emf = EMFUtil.build()) { ... }
 */
public class EMFUtil {

    private EMFUtil() {}

    public static EntityManagerFactory build() {
        Dotenv dotenv = Dotenv.load();

        Map<String, String> props = new HashMap<>();
        props.put("jakarta.persistence.jdbc.driver",   "org.postgresql.Driver");
        props.put("jakarta.persistence.jdbc.url",      dotenv.get("DB_URL"));
        props.put("jakarta.persistence.jdbc.user",     dotenv.get("DB_USER"));
        props.put("jakarta.persistence.jdbc.password", dotenv.get("DB_PASSWORD"));

        return Persistence.createEntityManagerFactory("daw", props);
    }
}
