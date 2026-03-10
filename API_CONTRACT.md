# Recommendation Backend – API Contract

This document describes how the frontend (React Native app) should interact with the recommendation backend service.

The backend provides a personalized, scrollable content feed (Inshorts-style) for movies and TV shows and continuously improves recommendations based on user interactions.

---

## Base URL

http://localhost:3000

(Replace with the deployed backend URL in production.)

---

## Authentication

Currently, no authentication is required.
User identification is handled via the userId field sent from the frontend.

---

## POST /api/recommend

Returns a personalized, paginated feed optimized for vertical scrolling.

### Request Body

{
  "userId": "user_001",
  "types": ["movie", "tv"],
  "genre": "action",
  "language": "english",
  "mood": "excited",
  "page": 1,
  "limit": 10
}

---

### Response

{
  "page": 1,
  "limit": 10,
  "hasMore": true,
  "data": [
    {
      "id": 123,
      "title": "Movie Name",
      "overview": "Short description of the content",
      "poster": "https://image.tmdb.org/t/p/w500/xyz.jpg",
      "type": "movie",
      "score": 87.4
    }
  ]
}

---

## POST /api/event

Tracks user interaction events to personalize future recommendations.

### Request Body

{
  "userId": "user_001",
  "contentId": 123,
  "type": "movie",
  "event": "watch_time",
  "duration": 12.5
}

---

### Response

{
  "success": true
}

---

## Notes

- Backend is stateless and safe to integrate
- MongoDB stores only recommendation signals
- API is extensible for future improvements
