import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def _get_smtp_config():
    sender_email = (os.getenv("SMTP_EMAIL") or "").strip()
    sender_password = (os.getenv("SMTP_PASSWORD") or "").strip()
    server_addr = (os.getenv("SMTP_SERVER") or "").strip()
    port_raw = (os.getenv("SMTP_PORT") or "").strip()

    if not sender_email or not sender_password or not server_addr:
        raise RuntimeError(
            "Missing SMTP configuration. Required: SMTP_EMAIL, SMTP_PASSWORD, SMTP_SERVER (and optionally SMTP_PORT)."
        )

    sender_password = sender_password.replace(" ", "")

    port = int(port_raw) if port_raw else 587
    return sender_email, sender_password, server_addr, port


def send_otp_email(email, otp):
    sender_email, sender_password, server_addr, port = _get_smtp_config()

    subject = "Your verification OTP"
    body= f"Your OTP for verification is: {otp}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email

    try:
        print(f"Attempting to send OTP email to {email}...")
        timeout = float(os.getenv("SMTP_TIMEOUT", "20"))

        if port == 465:
            with smtplib.SMTP_SSL(server_addr, port, timeout=timeout) as server:
                server.ehlo()
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, email, msg.as_string())
        else:
            with smtplib.SMTP(server_addr, port, timeout=timeout) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, email, msg.as_string())
        print(f"OTP email sent successfully to {email}!")
    except Exception as e:
        print(f"Failed to send OTP email: {type(e).__name__}: {e}")
        raise