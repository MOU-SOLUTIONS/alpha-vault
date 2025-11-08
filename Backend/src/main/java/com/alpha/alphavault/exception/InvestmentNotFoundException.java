/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: InvestmentNotFoundException — 404 resource missing
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class InvestmentNotFoundException extends RuntimeException {
    public InvestmentNotFoundException(String message) { super(message); }
}
