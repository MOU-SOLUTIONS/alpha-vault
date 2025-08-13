package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.AuthResponseDTO;
import com.alpha.alphavault.dto.LoginRequestDTO;
import com.alpha.alphavault.dto.RegisterRequestDTO;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.service.UserService;
import com.alpha.alphavault.utils.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.security.sasl.AuthenticationException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder pwEncoder;
    private final UserService userService;

    public AuthController(AuthenticationManager authManager,
                          JwtUtils jwtUtils,
                          PasswordEncoder pwEncoder,
                          UserService userService) {
        this.authManager = authManager;
        this.jwtUtils      = jwtUtils;
        this.pwEncoder     = pwEncoder;
        this.userService   = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequestDTO dto) {
        User u = User.builder()
                .email(dto.getEmail())
                .password(pwEncoder.encode(dto.getPassword()))
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                // fill other defaults…
                .build();
        userService.saveUser(u);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );
        String token = jwtUtils.generateToken(dto.getEmail());
        User u = userService.getUserByEmail(dto.getEmail());
        return ResponseEntity.ok(new AuthResponseDTO(token, "Bearer", u.getId()));
    }

}
