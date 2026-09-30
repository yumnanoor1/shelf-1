const API = "http://localhost:8000";
const NEXT = { "to-read": "reading", reading: "done", done: "to-read" };
const LABEL = { "to-read": "To read", reading: "Reading", done: "Done" };
const shelf = document.getElementById("shelf");
const errorEl = document.getElementById("error");

async function api(path, options) {
  try {
    const res = await fetch(API + path, { headers: { "Content-Type": "application/json" }, ...options });
    if (!res.ok) throw new Error("Request failed (" + res.status + ")");
    errorEl.textContent = "";
    return res.status === 204 ? null : res.json();
  } catch (e) {
    errorEl.textContent = "Can't reach the backend. Start it with: uvicorn main:app --reload";
    throw e;
  }
}

function render(books) {
  shelf.innerHTML = "";
  document.getElementById("empty").hidden = books.length > 0;
  for (const b of books) {
    const wrap = document.createElement("div");
    wrap.className = "spine-wrap";

    const spine = document.createElement("button");
    spine.className = "spine " + b.status;
    spine.title = b.title + (b.author ? " by " + b.author : "") + " (" + LABEL[b.status] + ")";
    spine.innerHTML = "<span></span><small></small>";
    spine.querySelector("span").textContent = b.title;
    spine.querySelector("small").textContent = LABEL[b.status];
    spine.onclick = async () => {
      await api("/books/" + b.id, { method: "PATCH", body: JSON.stringify({ status: NEXT[b.status] }) });
      load();
    };

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.setAttribute("aria-label", "Delete " + b.title);
    del.onclick = async () => { await api("/books/" + b.id, { method: "DELETE" }); load(); };

    wrap.append(spine, del);
    shelf.append(wrap);
  }
}

async function load() { render(await api("/books")); }

document.getElementById("add").onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById("title");
  const author = document.getElementById("author");
  await api("/books", { method: "POST", body: JSON.stringify({ title: title.value.trim(), author: author.value.trim() }) });
  e.target.reset();
  load();
};

load().catch(() => {});
