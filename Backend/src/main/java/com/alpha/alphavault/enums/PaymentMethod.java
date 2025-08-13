package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum PaymentMethod {
    CASH,
    CARD,
    CHECK,
    TRANSFER,
    CRYPTO,
    PAYPAL;

}