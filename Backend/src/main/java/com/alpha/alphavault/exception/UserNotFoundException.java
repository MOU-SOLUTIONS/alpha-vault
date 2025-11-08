/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Exception: UserNotFoundException
 *  Purpose: Thrown when a user lookup fails
 * ================================================================
 */
package com.alpha.alphavault.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) { super(message); }
}
