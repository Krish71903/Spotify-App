# Spotify Analyzer 🎧

A full-stack web application that analyzes your Spotify listening habits and provides personalized music recommendations using machine learning.

## 🌟 Features

- **Spotify Integration**: Seamless login with Spotify OAuth 2.0
- **Music Analysis**: Visualize your listening patterns and song features
- **Smart Recommendations**: Get personalized music suggestions using ML
- **Shareable Profile**: Share your music taste with friends

## 🛠️ Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: FastAPI, Python, Scikit-learn
- **Database**: PostgreSQL
- **Authentication**: Spotify OAuth 2.0
- **Deployment**: Vercel (frontend) + Render/Railway (backend)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- PostgreSQL
- Spotify Developer Account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Spotify API credentials
   ```

5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   # Add your backend API URL and Spotify client ID
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Environment Variables

### Backend (.env)
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8000/callback
DATABASE_URL=postgresql://user:password@localhost:5432/spotify_analyzer
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_SPOTIFY_CLIENT_ID=your_client_id
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spotify Web API
- FastAPI
- React
- TailwindCSS
- Scikit-learn 