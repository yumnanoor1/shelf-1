import json
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB = Path(__file__).parent / "books.json"
Status = Literal["to-read", "reading", "done"]

app = FastAPI(title="Shelf API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class BookIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    author: str = Field(default="", max_length=80)
    status: Status = "to-read"


class BookPatch(BaseModel):
    status: Status


def load() -> list[dict]:
    return json.loads(DB.read_text()) if DB.exists() else []


def save(books: list[dict]) -> None:
    DB.write_text(json.dumps(books, indent=2))


@app.get("/books")
def list_books():
    return load()


@app.post("/books", status_code=201)
def add_book(book: BookIn):
    books = load()
    item = {"id": max((b["id"] for b in books), default=0) + 1, **book.model_dump()}
    books.append(item)
    save(books)
    return item


@app.patch("/books/{book_id}")
def update_status(book_id: int, patch: BookPatch):
    books = load()
    for b in books:
        if b["id"] == book_id:
            b["status"] = patch.status
            save(books)
            return b
    raise HTTPException(404, "Book not found")


@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int):
    books = load()
    if not any(b["id"] == book_id for b in books):
        raise HTTPException(404, "Book not found")
    save([b for b in books if b["id"] != book_id])
