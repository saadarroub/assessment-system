package com.assessment.backend.security.reset;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "password_reset_sms")
public class PasswordResetSmsEntity {

  @Id
  private UUID id;

  @Column(nullable = false, length = 32)
  private String phone;

  @Column(name = "code_hash", nullable = false, length = 255)
  private String codeHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(nullable = false)
  private int attempts = 0;

  @Column(name = "verified_at")
  private Instant verifiedAt;

  @Column(name = "used_at")
  private Instant usedAt;

  @Column(name = "resend_after", nullable = false)
  private Instant resendAfter;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  void prePersist() {
    if (id == null) id = UUID.randomUUID();
    if (createdAt == null) createdAt = Instant.now();
  }

  public UUID getId() { return id; }
  public void setId(UUID id) { this.id = id; }

  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }

  public String getCodeHash() { return codeHash; }
  public void setCodeHash(String codeHash) { this.codeHash = codeHash; }

  public Instant getExpiresAt() { return expiresAt; }
  public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

  public int getAttempts() { return attempts; }
  public void setAttempts(int attempts) { this.attempts = attempts; }

  public Instant getVerifiedAt() { return verifiedAt; }
  public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

  public Instant getUsedAt() { return usedAt; }
  public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }

  public Instant getResendAfter() { return resendAfter; }
  public void setResendAfter(Instant resendAfter) { this.resendAfter = resendAfter; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
