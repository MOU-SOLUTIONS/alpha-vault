package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.PriorityLevel;
import com.alpha.alphavault.enums.SavingGoalCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "saving_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double targetAmount;

    @Column(nullable = false)
    private double currentAmount;

    @Column(nullable = false)
    private LocalDate creationDate;

    @Column(nullable = false)
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SavingGoalCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriorityLevel priority;

    @PrePersist
    protected void onCreate() {
        creationDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        // No need for update timestamp, but could be added if required
    }

    // Getters for lowercase enum values
    public String getCategoryLowerCase() {
        return category != null ? category.getLowerCase() : null;
    }

    public String getPriorityLowerCase() {
        return priority != null ? priority.getLowerCase() : null;
    }
}
