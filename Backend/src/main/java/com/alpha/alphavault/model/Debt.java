package com.alpha.alphavault.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "debts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String creditorName;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private double remainingAmount;

    @Column(nullable = false)
    private double interestRate;

    @Column(nullable = false)
    @JsonFormat(pattern = "MM/dd/yyyy")
    private Date dueDate;

    @Column(nullable = false)
    private double minPayment;

    @OneToMany(mappedBy = "debt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DebtHistory> debtHistory;

    @PrePersist
    protected void onCreate() {
        //createdAt = LocalDateTime.now();
        //updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        //updatedAt = LocalDateTime.now();
    }
}
