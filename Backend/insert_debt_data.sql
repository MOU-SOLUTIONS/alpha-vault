-- SQL INSERT statements for debt data
-- Make sure to replace user_id values with actual user IDs from your users table

-- Example 1: Credit Card Debt
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Chase Credit Card',
    '****1234',
    'USD',
    5000.00,
    4500.00,
    18.9900,  -- 18.99% APR
    150.00,
    '2024-02-15',
    'MONTHLY',
    'ACTIVE',
    'Credit card balance from emergency expenses',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 2: Student Loan
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Federal Student Loan',
    'SL-2023-456789',
    'USD',
    25000.00,
    23500.00,
    4.5000,  -- 4.5% APR
    250.00,
    '2024-03-01',
    'MONTHLY',
    'ACTIVE',
    'Student loan for undergraduate degree',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 3: Car Loan
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Auto Finance Company',
    'AUTO-789012',
    'USD',
    18000.00,
    16500.00,
    5.2500,  -- 5.25% APR
    350.00,
    '2024-02-20',
    'MONTHLY',
    'ACTIVE',
    '2022 Honda Civic financing',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 4: Personal Loan
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Personal Loan Bank',
    'PL-987654',
    'USD',
    10000.00,
    8200.00,
    12.0000,  -- 12% APR
    280.00,
    '2024-02-10',
    'MONTHLY',
    'ACTIVE',
    'Personal loan for home improvement',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 5: Delinquent Debt (Overdue)
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Medical Provider',
    'MED-2023-001',
    'USD',
    3000.00,
    3000.00,
    0.0000,  -- 0% APR (no interest)
    100.00,
    '2024-01-15',  -- Past due date
    'MONTHLY',
    'DELINQUENT',
    'Medical bill overdue - need to contact provider',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 6: Paid Off Debt
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Credit Union Loan',
    'CU-111222',
    'USD',
    5000.00,
    0.00,
    6.0000,  -- 6% APR
    150.00,
    '2024-01-30',
    'MONTHLY',
    'PAID_OFF',
    'Successfully paid off in January 2024',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 7: Credit Card with Higher Balance
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'American Express',
    '****5678',
    'USD',
    12000.00,
    11500.00,
    21.2400,  -- 21.24% APR
    300.00,
    '2024-02-25',
    'MONTHLY',
    'ACTIVE',
    'Business expenses credit card',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 8: Mortgage (if treated as debt)
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Mortgage Bank',
    'MTG-2020-888888',
    'USD',
    250000.00,
    235000.00,
    3.7500,  -- 3.75% APR
    1200.00,
    '2024-03-01',
    'MONTHLY',
    'ACTIVE',
    '30-year fixed rate mortgage',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 9: Weekly Payment Debt
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'Payday Loan Service',
    'PD-2024-001',
    'USD',
    500.00,
    450.00,
    36.0000,  -- 36% APR
    50.00,
    '2024-02-16',
    'WEEKLY',
    'ACTIVE',
    'Short-term loan - high interest',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Example 10: Debt in Different Currency
INSERT INTO debts (
    user_id,
    creditor_name,
    account_ref,
    currency,
    principal_amount,
    remaining_amount,
    interest_rate_apr,
    min_payment,
    due_date,
    billing_cycle,
    status,
    notes,
    version,
    created_at,
    updated_at
) VALUES (
    1,  -- Replace with actual user_id
    'European Bank',
    'EUR-LOAN-001',
    'EUR',
    15000.00,
    14200.00,
    3.5000,  -- 3.5% APR
    400.00,
    '2024-03-05',
    'MONTHLY',
    'ACTIVE',
    'Personal loan in EUR currency',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

