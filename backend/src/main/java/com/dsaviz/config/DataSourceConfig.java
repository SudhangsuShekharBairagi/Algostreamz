package com.dsaviz.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    /**
     * Declared explicitly so that {@link DataSourceSettings} - and therefore the
     * DATABASE_URL fallback - takes effect instead of Spring Boot's datasource
     * autoconfiguration, which only understands the three-part spring.datasource form.
     */
    @Bean
    @Primary
    public DataSource dataSource(DataSourceSettings settings) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(settings.getJdbcUrl());
        dataSource.setUsername(settings.getUsername());
        dataSource.setPassword(settings.getPassword());
        dataSource.setMaximumPoolSize(settings.getMaxPoolSize());
        dataSource.setMinimumIdle(1);
        dataSource.setPoolName("dsa-viz-pool");
        dataSource.setConnectionTimeout(30_000);
        dataSource.setValidationTimeout(5_000);
        return dataSource;
    }
}
