package com.smartvenue.backend;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class BCryptHashGeneratorTest {

    @Test
    void generateAndVerifyBCryptHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String passHash = encoder.encode("Password123!");
        String adminHash = encoder.encode("AdminPass123!");

        System.out.println("HASH_PASSWORD123=" + passHash);
        System.out.println("HASH_ADMINPASS123=" + adminHash);

        assertTrue(encoder.matches("Password123!", passHash));
        assertTrue(encoder.matches("AdminPass123!", adminHash));
    }
}
