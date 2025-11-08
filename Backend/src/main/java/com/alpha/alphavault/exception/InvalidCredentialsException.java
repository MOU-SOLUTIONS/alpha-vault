/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: InvalidCredentialsException
 *  Purpose: Raised when authentication fails due to bad credentials
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() { super("Invalid credentials"); }
    public InvalidCredentialsException(String message) { super(message); }
}
