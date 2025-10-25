package com.assessment.backend.util;

import java.security.SecureRandom;
import java.util.Random;

public class AccessCodeGenerator {

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Ohne 0,1,I,O
    private static final int CODE_LENGTH = 6;
    
    private static final String TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int TOKEN_LENGTH = 64;
    
    private static final Random SECURE_RANDOM = new SecureRandom();

    /**
     * Generiert einen kurzen, eindeutigen Access Code (z.B. ERC78X)
     * 6 Zeichen aus A-Z (ohne I,O) und 2-9 (ohne 0,1)
     */
    public static String generateAccessCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = SECURE_RANDOM.nextInt(CODE_ALPHABET.length());
            code.append(CODE_ALPHABET.charAt(index));
        }
        return code.toString();
    }

    /**
     * Generiert einen langen, geheimen Access Token für E-Mail-Links
     * 64 Zeichen alphanumerisch (URL-safe)
     */
    public static String generateAccessToken() {
        StringBuilder token = new StringBuilder(TOKEN_LENGTH);
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            int index = SECURE_RANDOM.nextInt(TOKEN_ALPHABET.length());
            token.append(TOKEN_ALPHABET.charAt(index));
        }
        return token.toString();
    }
}