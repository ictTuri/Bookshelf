package com.arturmolla.bookshelf;

import com.arturmolla.bookshelf.model.user.Role;
import com.arturmolla.bookshelf.repository.RepositoryRole;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@EnableAsync
public class ApiApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		SpringApplication.run(ApiApplication.class, args);
	}

	@Bean
	public CommandLineRunner runner(RepositoryRole repositoryRole) {
		return args -> {
			if (repositoryRole.findByName("USER").isEmpty()) {
				repositoryRole.save(Role.builder().name("USER").build());
			}
		};
	}

}
