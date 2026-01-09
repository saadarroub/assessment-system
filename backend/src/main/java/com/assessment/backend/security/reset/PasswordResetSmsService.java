package com.assessment.backend.security.reset;

import com.assessment.backend.entity.User;
import com.assessment.backend.repository.PasswordResetSmsRepository;
import com.assessment.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class PasswordResetSmsService {

  private static final Duration CODE_TTL = Duration.ofMinutes(5);
  private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(45);
  private static final int CODE_DIGITS = 6;
  private static final int MAX_ATTEMPTS = 5;

  private final PasswordResetSmsRepository repo;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final SecureRandom random = new SecureRandom();

  private final TwilioWhatsAppSender whatsAppSender;


 public PasswordResetSmsService(
    PasswordResetSmsRepository repo,
    UserRepository userRepository,
    PasswordEncoder passwordEncoder,
    TwilioWhatsAppSender whatsAppSender
) {
  this.repo = repo;
  this.userRepository = userRepository;
  this.passwordEncoder = passwordEncoder;
  this.whatsAppSender = whatsAppSender;
}


  /**
   * Fordert einen SMS-Resetcode an. Antwort ist absichtlich "neutral".
   * In DEV wird der Code ins Log geschrieben.
   */
  @Transactional
  public void requestCode(String phoneE164) {
    Instant now = Instant.now();

    // Cooldown: wenn zuletzt gerade erst gesendet wurde, neutral "nichts tun"
    var lastOpt = repo.findTopByPhoneOrderByCreatedAtDesc(phoneE164);
    if (lastOpt.isPresent()) {
      var last = lastOpt.get();
      if (last.getResendAfter() != null && now.isBefore(last.getResendAfter())) {
        return;
      }
    }

    String code = generateNumericCode(CODE_DIGITS);

    var entity = new PasswordResetSmsEntity();
    entity.setPhone(phoneE164);
    entity.setCodeHash(passwordEncoder.encode(code));
    entity.setExpiresAt(now.plus(CODE_TTL));
    entity.setResendAfter(now.plus(RESEND_COOLDOWN));

    repo.save(entity);

    // DEV only (später durch echten SMS Sender ersetzen)
    //System.out.println("DEV-SMS to " + phoneE164 + " | Reset code: " + code);
    whatsAppSender.sendTo(phoneE164, "Dein Passwort-Reset Code: " + code + " (5 Minuten gültig)");

  }

  /**
   * Prüft den Code. Bei Erfolg wird verifiedAt gesetzt und die Request-ID zurückgegeben.
   */
  @Transactional
  public UUID verifyCode(String phoneE164, String code) {
    Instant now = Instant.now();

    var latest = repo.findTopByPhoneOrderByCreatedAtDesc(phoneE164)
        .orElseThrow(() -> new IllegalArgumentException("Invalid code"));

    // abgelaufen?
    if (latest.getExpiresAt() != null && now.isAfter(latest.getExpiresAt())) {
      throw new IllegalArgumentException("Invalid code");
    }

    // schon benutzt?
    if (latest.getUsedAt() != null) {
      throw new IllegalArgumentException("Invalid code");
    }

    // attempts erhöhen und begrenzen
    latest.setAttempts(latest.getAttempts() + 1);
    if (latest.getAttempts() > MAX_ATTEMPTS) {
      repo.save(latest);
      throw new IllegalArgumentException("Too many attempts");
    }

    // Code prüfen
    boolean ok = passwordEncoder.matches(code, latest.getCodeHash());
    if (!ok) {
      repo.save(latest);
      throw new IllegalArgumentException("Invalid code");
    }

    // verifiziert markieren
    latest.setVerifiedAt(now);
    repo.save(latest);

    return latest.getId();
  }

  /**
   * Setzt das neue Passwort, wenn vorher verify erfolgreich war.
   * Markiert die Reset-Request danach als used (one-time use).
   */
  @Transactional
  public void confirm(String requestId, String newPassword) {
    Instant now = Instant.now();
    UUID id = UUID.fromString(requestId);

    var req = repo.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Invalid requestId"));

    if (req.getVerifiedAt() == null) {
      throw new IllegalArgumentException("Not verified");
    }
    if (req.getExpiresAt() != null && now.isAfter(req.getExpiresAt())) {
      throw new IllegalArgumentException("Expired");
    }
    if (req.getUsedAt() != null) {
      throw new IllegalArgumentException("Already used");
    }

    // User via Phone finden
    User user = userRepository.findByPhone(req.getPhone())
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    // Passwort setzen (BCrypt)
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    // Request als benutzt markieren
    req.setUsedAt(now);
    repo.save(req);
  }

  private String generateNumericCode(int digits) {
    int floor = (int) Math.pow(10, digits - 1);
    int bound = (int) Math.pow(10, digits) - floor;
    return String.valueOf(floor + random.nextInt(bound));
  }
}
