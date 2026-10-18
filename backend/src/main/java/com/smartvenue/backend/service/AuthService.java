package com.smartvenue.backend.service;

import com.smartvenue.backend.config.JwtTokenProvider;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.dto.AuthDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (request.getRole() == UserRole.ADMIN) {
            throw new Exceptions.BadRequestException("Self-registration as ADMIN is not permitted.");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new Exceptions.ConflictException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getEmail().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getRole(),
                request.getPhone()
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser);

        return new AuthDto.AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new Exceptions.BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exceptions.BadRequestException("Invalid email or password");
        }

        if (!user.getEnabled()) {
            throw new Exceptions.ForbiddenException("Your account has been disabled");
        }

        String token = tokenProvider.generateToken(user);

        return new AuthDto.AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new Exceptions.ForbiddenException("User is not authenticated");
        }
        return (User) authentication.getPrincipal();
    }
}
