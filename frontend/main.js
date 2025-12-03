async function submitArticle() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });

    alert("Article Saved!!")
    loadArticles();
}


async function loadArticles() {
    const res = await fetch("/api/list");
    const data = await res.json();

    const list = document.getElementById("articleList");
    list.innerHTML = "";

    data.articles.forEach(name => {
        const li = document.createElement("li")

        li.innerHTML = `
            <strong>${name}</strong>
            <button onclick="readArticle('${name}')">Read</button>
            <button onclick="deleteArticle('${name}')">Delete</button>
        `;

        list.appendChild(li);
    })
}


async function readArticle(filename) {
    const res = await fetch(`/api/read/${filename}`);
    const data = await res.json();

    alert("Content:\n\n + data.content");
}


async function deleteArticle(filename) {
    await fetch(`/api/delete/${filename}`, {
        method: "DELETE"
    });
    
    alert("Delete: " + filename);
    loadArticles();
}

document.getElementById("submitBtn").onclick = submitArticle;
loadArticles();