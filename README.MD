# QuoteBank

A full-stack web application designed to host a community collection of quotes and memes with voting, account-based isolation, and multi-language support.

![Project Overview](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech](https://img.shields.io/badge/FastAPI-v1.0.0-blue)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS-orange)
![Localization](https://img.shields.io/badge/i18n-EN%20|%20ES%20|%20CA-purple)

---

## 🚀 Features

- **Interactive Voting**: Upvote and downvote content.
- **Content Management**:
  - Post quotes with author attribution.
  - Upload memes (images) directly to the server.
  - **Anonymous Posting**: Toggle to hide your identity while maintaining ownership.
  - **Edit/Delete**: Full control over your contributions.
- **Internationalization (i18n)**: Support for English, Spanish, and Catalan with automatic browser language detection.
- **UI/UX**:
  - **Dark Mode**: Smart theme switching with persistence.
  - **Mobile Optimized**: Responsive design tailored for all devices.
  - **Micro-animations**: Smooth transitions and interactive elements.
- **Admin Dashboard**: Specialized management tools for administrators.

---

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python framework.
- **SQLAlchemy**: Powerful ORM for database management.
- **SQLite**: Reliable, lightweight database.
- **JWT Auth**: Secure authentication using JSON Web Tokens.
- **Pydantic**: Data validation and settings management.

### Frontend
- **Vanilla JS**: Modular, framework-less JavaScript for maximum speed.
- **Vanilla CSS**: Custom-built design system with modern properties.
- **SPA Architecture**: Smooth navigation without page reloads.

---

## 📂 Project Structure

```text
├── backend/            # Python FastAPI application
│   ├── routes/         # API endpoints (users, quotes, memes, etc.)
│   ├── models.py       # Database schemas
│   ├── auth.py         # Security & Authentication logic
│   └── main.py         # Application entry point
├── frontend/           # Web client
│   ├── css/            # Modular stylesheets
│   ├── i18n.js         # Internationalization logic
│   ├── router.js       # SPA Router
│   └── app.js          # Main frontend entry
├── assets/             # Static assets (favicons, etc.)
├── uploads/            # User-uploaded meme images
├── Dockerfile          # Container configuration
└── docker-compose.yml  # Multi-container orchestration
```

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.9+
- Docker (optional)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/othuertas/quotebank.git
   cd quotebank
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   uvicorn backend.main:app --reload
   ```

4. **Access the app**:
   Open `http://localhost:8000` in your browser.

---

## 🐳 Docker Deployment
The service can be self-hosted on a Raspberry Pi with Docker Compose.

1. Create a local `.env` file in the repository root (do not commit it):

   ```dotenv
   JWT_SECRET=replace-with-a-long-random-secret
   ```

2. Validate the Compose configuration:

   ```bash
   docker compose config
   ```

3. Build and deploy from the checked-out repository:

   ```bash
   docker compose up -d --build
   ```

4. Verify status and logs:

   ```bash
   docker compose ps
   docker compose logs --tail=100 quotebank
   ```

Persistent data is stored in the existing bind mounts under `/DATA/AppData/quotebank`:

- `/DATA/AppData/quotebank/quotebank.db` → `/app/quotebank.db`
- `/DATA/AppData/quotebank/backend/uploads` → `/app/backend/uploads`

Back up both the SQLite database and uploads before deployments.

For normal deployments, do **not** run:

```bash
docker compose down -v
```
---

## 🌐 Localization

The app automatically detects your browser language but allows manual overrides via the language switcher in the header.
- **English** (en)
- **Spanish** (es)
- **Catalan** (ca)

---

Built with Gemini's code and [Ot's](https://github.com/othuertas) ideas.
