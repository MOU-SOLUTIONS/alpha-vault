-- SQL INSERT statements for debt_history data
-- Linked to the first 3 debts (IDs 1, 2, 3) that were inserted

-- ============================================================
-- DEBT 1: Chase Credit Card (debt_id = 1)
-- Principal: $5,000 | Remaining: $4,500 | So $500 was paid
-- ============================================================

-- Payment 1: Initial payment of $200
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    1,  -- Chase Credit Card
    '2024-01-20',
    200.00,
    4800.00,  -- 5000 - 200
    'CARD',
    'Online payment through bank portal',
    0,
    CURRENT_TIMESTAMP
);

-- Payment 2: Second payment of $150
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    1,  -- Chase Credit Card
    '2024-02-05',
    150.00,
    4650.00,  -- 4800 - 150
    'TRANSFER',
    'Automatic payment from checking account',
    0,
    CURRENT_TIMESTAMP
);

-- Payment 3: Third payment of $150 (minimum payment)
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    1,  -- Chase Credit Card
    '2024-02-15',  -- Current due date from debt
    150.00,
    4500.00,  -- 4650 - 150 (matches current remaining amount)
    'TRANSFER',
    'Minimum payment - on time',
    0,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- DEBT 2: Federal Student Loan (debt_id = 2)
-- Principal: $25,000 | Remaining: $23,500 | So $1,500 was paid
-- ============================================================

-- Payment 1: Initial payment of $500
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    2,  -- Federal Student Loan
    '2024-01-15',
    500.00,
    24500.00,  -- 25000 - 500
    'TRANSFER',
    'First payment after loan disbursement',
    0,
    CURRENT_TIMESTAMP
);

-- Payment 2: Second payment of $500
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    2,  -- Federal Student Loan
    '2024-02-01',
    500.00,
    24000.00,  -- 24500 - 500
    'TRANSFER',
    'Monthly payment - automatic withdrawal',
    0,
    CURRENT_TIMESTAMP
);

-- Payment 3: Third payment of $500
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    2,  -- Federal Student Loan
    '2024-03-01',  -- Current due date from debt
    500.00,
    23500.00,  -- 24000 - 500 (matches current remaining amount)
    'TRANSFER',
    'Monthly payment - exceeds minimum payment of $250',
    0,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- DEBT 3: Car Loan (debt_id = 3)
-- Principal: $18,000 | Remaining: $16,500 | So $1,500 was paid
-- ============================================================

-- Payment 1: First car payment of $350 (minimum)
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    3,  -- Car Loan
    '2024-01-20',
    350.00,
    17650.00,  -- 18000 - 350
    'TRANSFER',
    'Monthly car payment - automatic deduction',
    0,
    CURRENT_TIMESTAMP
);

-- Payment 2: Second payment of $400 (above minimum)
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    3,  -- Car Loan
    '2024-02-10',
    400.00,
    17250.00,  -- 17650 - 400
    'TRANSFER',
    'Extra payment to reduce principal faster',
    0,
    CURRENT_TIMESTAMP
);

-- Payment 3: Third payment of $350 (minimum)
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    3,  -- Car Loan
    '2024-02-20',  -- Current due date from debt
    350.00,
    16900.00,  -- 17250 - 350
    'TRANSFER',
    'Monthly payment - on time',
    0,
    CURRENT_TIMESTAMP
);

-- Payment 4: Fourth payment of $400 (extra payment)
INSERT INTO debt_history (
    debt_id,
    payment_date,
    payment_amount,
    remaining_after_payment,
    payment_method,
    note,
    version,
    created_at
) VALUES (
    3,  -- Car Loan
    '2024-02-25',
    400.00,
    16500.00,  -- 16900 - 400 (matches current remaining amount)
    'TRANSFER',
    'Additional principal payment to reduce loan term',
    0,
    CURRENT_TIMESTAMP
);

