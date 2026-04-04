# BharatRail – Modern IRCTC Redesign 🚂

BharatRail is a premium, state-of-the-art redesign of the Indian Railways (IRCTC) booking experience. It focuses on visual excellence, speed, and a seamless user journey from search to ticket confirmation.

![BharatRail Banner](./assets/loginbg.png)

## ✨ Key Features

- **🎯 Advanced Search Engine**: Find trains between any two stations with instant results.
- **⚡ Smart Sorting**: Sort results by "Cheapest First", "Fastest First", "Early Departure", or "Late Departure".
- **💎 Premium Aesthetics**: Modern glassmorphic UI using custom CSS and Tailwind, featuring deep space backgrounds and smooth transitions.
- **📄 Digital E-Ticket**: Automated ticket generation on the confirmation page with a scannable **QR Code** containing plain-text journey details.
- **🎫 PNR Tracking**: Integrated PNR status checker with a clean, detailed result view.
- **📱 Fully Responsive**: A mobile-first approach ensuring the booking experience is flawless on any device.

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript (ES Module-based logic)
- **Styling**: Vanilla CSS (Custom Design System) + Tailwind CSS
- **Icons**: Lucide Icons & Font Awesome 6
- **QR Engine**: [QRServer API](https://goqr.me/api/) for edge-delivered dynamic ticket generation.

## 📂 Project Structure

```text
IRCTC_Redesign/
├── index.html            # Landing / Hero Page
├── pages/                # Application Screens
│   ├── main.html         # Search Interface
│   ├── searchresult.html  # Search/PNR Results
│   ├── checkout.html     # Passenger Details & Payment
│   ├── confirm.html      # Digital Ticket & QR Code
│   └── login.html        # Modern Authentication UI
├── src/                  # Core Logic
│   ├── searchEngineMachine.js # Database handling & Search UI
│   ├── checkout.js       # Passenger form & URL data transfer
│   └── navbar.js         # Shared navigation logic
├── style/                # Styling Assets
│   ├── variables.css     # Design System Tokens
│   ├── main.css          # Global themes
│   └── checkout.css      # Frosted glass layouts
└── assets/               # High-quality backgrounds & banners
```

## 🚀 Getting Started

1. Clone the repository.
2. Open `index.html` in any modern web browser.
3. (Optional) Use a local development server like **Live Server** for the best experience with ES Modules.

## 🎫 The QR Ticket
The booking confirmation generates a QR code that stores a **Plain Text Receipt**. When scanned with a smartphone, it displays:
- Train Name & ID
- Origin & Destination
- Journey Duration
- Passenger Names & Details

---
*Developed with ❤️ as a modern alternative for Indian Railway commuters.*
