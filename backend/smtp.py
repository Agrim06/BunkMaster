import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_otp_email(email,otp):
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")

    subject = "Your verification OTP"
    body= f"Your OTP for verification is: {otp}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email

    try:
        print(f"Attempting to send OTP email to {email}...")
        port = os.getenv("SMTP_PORT")
        server_addr = os.getenv("SMTP_SERVER")
        
        with smtplib.SMTP(server_addr, int(port) if port else 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
        print(f"OTP email sent successfully to {email}!")
    except Exception as e:
        print(f"Failed to send OTP email: {e}")