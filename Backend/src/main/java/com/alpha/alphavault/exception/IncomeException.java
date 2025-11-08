/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: IncomeException
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class IncomeException extends RuntimeException {
    public IncomeException(String message) { super(message); }
    public IncomeException(String message, Throwable cause) { super(message, cause); }
}
