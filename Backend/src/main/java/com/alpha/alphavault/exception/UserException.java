/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: UserException
 *  Purpose: General runtime exception for user-related operations
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class UserException extends RuntimeException {
    public UserException(String message) { super(message); }
    public UserException(String message, Throwable cause) { super(message, cause); }
}
