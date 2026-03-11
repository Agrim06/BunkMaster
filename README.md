# 🎓 BunkMaster

BunkMaster is a modern, responsive, and premium smart attendance tracking application. It is designed to help students effortlessly keep track of their classes, monitor their minimum target attendance, and safely manage their bunks without the stress of falling short. 

With a sleek glassmorphism aesthetic and a robust backend, BunkMaster provides a seamless and visually stunning user experience across both desktop and mobile devices.



## ✨ Features

- **Dashboard Insights**: Get a quick overview of your overall percentage, total classes attended vs. missed, and your "safe bunk" allowance directly on your stunning dashboard.
- **Subject Management**: Dynamically add and manage subjects with custom classes per week and daily schedules.
- **Smart Attendance Tracking**: Mark yourself present or absent per subject, with intelligent day-wise tracking that tells you "No classes scheduled today" or confirms "You have class today!".
- **Calendar History**: Visualize your attendance history across an interactive calendar overlay for each subject.
- **Comprehensive Authentication**:
  - Secure Email/Password registration and login.
  - **Email OTP Verification** powered by Brevo SMTP.
  - Complete **Password Reset / Forgot Password** flow.
  - Seamless **Google OAuth** integration.
- **Premium UI/UX**: Built entirely with custom Vanilla CSS featuring dark mode, transparent glassmorphism cards, glowing gradients, micro-animations, and a fully flex/grid responsive layout that perfectly adapts to mobile phones.

## 💻 Tech Stack

### Frontend
- **React.js**: Component-based UI rendering.
- **Vite**: Ultra-fast build tool and development server.
- **React Router**: For seamless single-page application navigation.
- **Pure CSS**: Fully custom, framework-free glassmorphism styling utilizing modern CSS variables.

### Backend
- **FastAPI**: High-performance, async Python web framework.
- **MongoDB**: NoSQL database for flexible and scalable data storage.
- **Pydantic**: Robust data validation and settings management.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (for Frontend)
- Python 3.8+ (for Backend)
- MongoDB Database (Local or Atlas)

### Local Development Setup

**1. Clone the repository**
```bash
git clone https://github.com/Agrim06/BunkMaster.git
cd BunkMaster
```

**2. Setup Backend (FastAPI)**
```bash
cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
# Activate the virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Create a .env file with your MongoDB URL, secret keys, and SMTP credentials
uvicorn main:app --reload
```

**3. Setup Frontend (React + Vite)**
```bash
cd ../frontend
npm install

# Create a .env file and set your VITE_API_URL
npm run dev
```

## 🎨 Design Philosophy
BunkMaster is specifically designed to step away from "boring utility apps". By utilizing deep color palettes, vibrant primary cyans and pinks, subtle drop shadows, and dynamic background filters, the application feels more like a modern, state-of-the-art dashboard and less like a spreadsheet.
