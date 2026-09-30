package com.dsaviz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DsaVizApplication {
    public static void main(String[] args) {
        SpringApplication.run(DsaVizApplication.class, args);
    }
}
