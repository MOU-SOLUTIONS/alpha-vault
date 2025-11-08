/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: BudgetException
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class BudgetException extends RuntimeException {
    public BudgetException(String message) { super(message); }
    public BudgetException(String message, Throwable cause) { super(message, cause); }
}
