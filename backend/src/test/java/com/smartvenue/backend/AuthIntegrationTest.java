package com.smartvenue.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.dto.AuthDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev-h2")
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testSuccessfulRegistration() throws Exception {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setEmail("newuser" + System.currentTimeMillis() + "@test.com");
        req.setPassword("Password123!");
        req.setFullName("New Test User");
        req.setRole(UserRole.CUSTOMER);
        req.setPhone("1234567890");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is(req.getEmail().toLowerCase())))
                .andExpect(jsonPath("$.role", is("CUSTOMER")));
    }

    @Test
    void testRejectAdminSelfRegistration() throws Exception {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setEmail("hacker" + System.currentTimeMillis() + "@test.com");
        req.setPassword("Password123!");
        req.setFullName("Malicious Admin Attempt");
        req.setRole(UserRole.ADMIN);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Self-registration as ADMIN is not permitted")));
    }

    @Test
    void testRejectDuplicateEmailRegistration() throws Exception {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setEmail("customer@demo.com");
        req.setPassword("Password123!");
        req.setFullName("Duplicate User");
        req.setRole(UserRole.CUSTOMER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("Conflict")));
    }

    @Test
    void testSuccessfulLogin() throws Exception {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest();
        req.setEmail("customer@demo.com");
        req.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("customer@demo.com")))
                .andExpect(jsonPath("$.role", is("CUSTOMER")));
    }

    @Test
    void testBadCredentialsLogin() throws Exception {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest();
        req.setEmail("customer@demo.com");
        req.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    void testUnauthorizedAccessReturnsConsistentJson() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.path", is("/api/auth/me")));
    }
}
