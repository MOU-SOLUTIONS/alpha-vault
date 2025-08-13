package com.alpha.alphavault.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String preferredLanguage;
    private String currency;

    @Column(nullable = false)
    private boolean twoFactorEnabled;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user")
    private List<Income> incomes;

    @OneToMany(mappedBy = "user")
    private List<Expense> expenses;

    @OneToMany(mappedBy = "user")
    private List<SavingGoal> savingGoal;

    @OneToMany(mappedBy = "user")
    private List<Debt> debt;

    @OneToMany(mappedBy = "user")
    private List<Investment> investment;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public User(Long id) {
        this.id = id;
    }
}
