# Shelf

A small reading-list app. Separate `backend/` (FastAPI) and `frontend/` (plain HTML/CSS/JS).

## Run the backend
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload        # http://localhost:8000  (docs at /docs)

## Run the frontend (second terminal)
    cd frontend
    python -m http.server 5500       # open http://localhost:5500

## API
- GET    /books
- POST   /books          {title, author, status}
- PATCH  /books/{id}     {status}  (to-read | reading | done)
- DELETE /books/{id}

Data is stored in `backend/books.json`.
