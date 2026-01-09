package com.assessment.backend.security.reset;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioWhatsAppSender {

  private final String accountSid;
  private final String authToken;
  private final String from; // z.B. "whatsapp:+14155238886"

  public TwilioWhatsAppSender(
      @Value("${twilio.accountSid}") String accountSid,
      @Value("${twilio.authToken}") String authToken,
      @Value("${twilio.whatsapp.from}") String from
  ) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.from = from;
  }

  public void sendTo(String toE164, String text) {
    // toE164: "+49...."  -> Twilio braucht "whatsapp:+49...."
    String to = toE164.startsWith("whatsapp:") ? toE164 : "whatsapp:" + toE164;

    Twilio.init(accountSid, authToken);

    Message.creator(
        new PhoneNumber(to),
        new PhoneNumber(from),
        text
    ).create();
  }
}
