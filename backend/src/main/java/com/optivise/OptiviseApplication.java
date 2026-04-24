package com.optivise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OptiviseApplication {

    public static void main(String[] args) {
        try {
            SpringApplication.run(OptiviseApplication.class, args);
        } catch (Exception e) {
            System.err.println("=== STARTUP FAILED ===");
            Throwable cause = e;
            while (cause.getCause() != null) cause = cause.getCause();
            System.err.println("Root cause: " + cause.getClass().getName());
            System.err.println("Message:    " + cause.getMessage());
            System.err.println("======================");
            throw e;
        }
    }
}
