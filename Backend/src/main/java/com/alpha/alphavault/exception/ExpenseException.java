/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: ExpenseException
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class ExpenseException extends RuntimeException {
    public ExpenseException(String message) { super(message); }
    public ExpenseException(String message, Throwable cause) { super(message, cause); }
}
