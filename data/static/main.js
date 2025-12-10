async function createArticle() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    await fetch("/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });

    alert("Article Saved!!")
    loadArticles();
}


async function loadArticles() {
    const res = await fetch("/articles");
    const data = await res.json();

    const list = document.getElementById("articleList");
    list.innerHTML = "";

    data.forEach(article => {
        const li = document.createElement("li")
        li.dataset.id = article.id

        li.innerHTML = `
            <strong>${article.title}</strong>
            <button onclick="readArticle('${article.id}')">Read</button>
            <button onclick="deleteArticle('${article.id}')">Delete</button>
        `;

        list.appendChild(li);
    })
    highlightCurrentArticle();
}


async function updateArticle(article_id) {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    await fetch(`/articles/${article_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });

    alert("Article Update!!")
    loadArticles();
}


async function readArticle(article_id) {
    const res = await fetch(`/articles/${article_id}`);
    const data = await res.json();

    document.getElementById("title").value = data.title;
    document.getElementById("content").value = data.content;
    currentArticleId = article_id

    highlightCurrentArticle();
    document.getElementById("updateBtn").onclick = () => updateArticle(article_id);
}


function highlightCurrentArticle() {
    const list = document.getElementById("articleList")
    const items = list.querySelectorAll("li");

    items.forEach(li => {
        if (li.dataset.id === String(currentArticleId)) {
            li.classList.add("active-article");
        } else {
            li.classList.remove("active-article");
        }
    })
}


async function deleteArticle(article_id) {
    await fetch(`/articles/${article_id}`, { method: "DELETE" });
    alert("Kill it!");
    loadArticles();
}

let currentArticleId = null;
document.getElementById("createBtn").onclick = createArticle;
loadArticles();