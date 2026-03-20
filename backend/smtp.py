import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv
import requests

load_dotenv()


def _get_smtp_config():
    sender_email = (os.getenv("SMTP_EMAIL") or "").strip()
    sender_password = (os.getenv("SMTP_PASSWORD") or "").strip()
    server_addr = (os.getenv("SMTP_SERVER") or "").strip()
    port_raw = (os.getenv("SMTP_PORT") or "").strip()

    smtp_login = (os.getenv("SMTP_LOGIN") or sender_email).strip()

    if not sender_email or not sender_password or not server_addr:
        raise RuntimeError(
            "Missing SMTP configuration. Required: SMTP_EMAIL, SMTP_PASSWORD, SMTP_SERVER (and optionally SMTP_PORT and SMTP_LOGIN)."
        )

    sender_password = sender_password.replace(" ", "")

    port = int(port_raw) if port_raw else 587
    return sender_email, smtp_login, sender_password, server_addr, port


def _get_brevo_api_config():
    """
    Configuration for Brevo HTTP API.
    Used in production where outbound SMTP may be blocked.
    """
    api_key = (os.getenv("BREVO_API_KEY") or "").strip()
    sender_email = (os.getenv("SMTP_EMAIL") or "").strip()
    sender_name = (os.getenv("SMTP_FROM_NAME") or "BunkMaster").strip()

    if not api_key:
        raise RuntimeError("Missing BREVO_API_KEY for Brevo HTTP API mode.")
    if not sender_email:
        raise RuntimeError("Missing SMTP_EMAIL (sender email) for Brevo HTTP API mode.")

    return api_key, sender_email, sender_name


def _send_via_smtp(recipient_email, subject, body):
    sender_email, smtp_login, sender_password, server_addr, port = _get_smtp_config()

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = f"BunkMaster <{sender_email}>"
    msg["To"] = recipient_email

    print(f"Attempting to send OTP email via SMTP to {recipient_email}...")
    timeout = float(os.getenv("SMTP_TIMEOUT", "20"))

    if port == 465:
        with smtplib.SMTP_SSL(server_addr, port, timeout=timeout) as server:
            server.ehlo()
            server.login(smtp_login, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())
    else:
        with smtplib.SMTP(server_addr, port, timeout=timeout) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_login, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())


def _send_via_brevo_api(recipient_email, subject, body):
    api_key, sender_email, sender_name = _get_brevo_api_config()

    print(f"Attempting to send OTP email via Brevo API to {recipient_email}...")

    payload = {
        "sender": {"email": sender_email, "name": sender_name},
        "to": [{"email": recipient_email}],
        "subject": subject,
        "textContent": body,
    }

    timeout = float(os.getenv("SMTP_TIMEOUT", "20"))
    resp = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        json=payload,
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout=timeout,
    )

    if resp.status_code >= 400:
        raise RuntimeError(
            f"Brevo API error {resp.status_code}: {resp.text[:200]}"
        )


def send_otp_email(email, otp, subject=None, body=None):
    if not subject:
        subject = "Your verification OTP"
    if not body:
        body = f"Your OTP for verification is: {otp}"

    try:
        # Prefer Brevo HTTP API when configured (best for production).
        if os.getenv("BREVO_API_KEY"):
            _send_via_brevo_api(email, subject, body)
        else:
            _send_via_smtp(email, subject, body)

        print(f"OTP email sent successfully to {email}!")
    except Exception as e:
        print(f"Failed to send OTP email: {type(e).__name__}: {e}")
        raise