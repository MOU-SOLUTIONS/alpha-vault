/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: DebtException
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class DebtException extends RuntimeException {
    public DebtException(String message) { super(message); }
    public DebtException(String message, Throwable cause) { super(message, cause); }
}
