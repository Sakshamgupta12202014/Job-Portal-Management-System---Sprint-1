package com.jobportal.Exceptions;

public class InvalidJobTypeException extends RuntimeException {
    public InvalidJobTypeException(String message) {
        super(message);
    }
}