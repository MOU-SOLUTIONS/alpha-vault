/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: SavingGoalException
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class SavingGoalException extends RuntimeException {
    public SavingGoalException(String message) { super(message); }
    public SavingGoalException(String message, Throwable cause) { super(message, cause); }
}
