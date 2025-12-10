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
        console.log(article)
        li.innerHTML = `
            <strong>${article.title}</strong>
            <button onclick="readArticle('${article.id}')">Read</button>
            <button onclick="deleteArticle('${article.id}')">Delete</button>
        `;

        list.appendChild(li);
    })
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
    document.getElementById("updateBtn").onclick = () => updateArticle(article_id);
}


async function deleteArticle(article_id) {
    await fetch(`/articles/${article_id}`, { method: "DELETE" });
    alert("Kill it!");
    loadArticles();
}


document.getElementById("createBtn").onclick = createArticle;
loadArticles();