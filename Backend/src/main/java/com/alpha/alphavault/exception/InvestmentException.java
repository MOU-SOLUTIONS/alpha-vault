/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: InvestmentException — domain/server errors
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class InvestmentException extends RuntimeException {
    public InvestmentException(String message) { super(message); }
    public InvestmentException(String message, Throwable cause) { super(message, cause); }
}
