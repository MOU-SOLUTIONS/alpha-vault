package com.alpha.alphavault.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "debt_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "debt_id", nullable = false)
    private Debt debt;

    @Column(nullable = false)
    @JsonFormat(pattern = "MM/dd/yyyy")
    private Date paymentDate;

    @Column(nullable = false)
    private double paymentAmount;

    private String note;

    @Column(nullable = false)
    private double remainingAfterPayment;

    public DebtHistory(Double paymentAmount, String note) {
    }

    @PrePersist
    protected void onCreate() {
        // Record the date of payment and remaining balance when a new payment is made
    }

    @PreUpdate
    protected void onUpdate() {
        // Optionally, update timestamp on modification (if any).
    }

    public Object getRemainingAmount() {
        return remainingAfterPayment;  // Returns the remaining amount stored after a payment
    }
}
