const button = document.getElementById("loadUsers");
const usersDiv = document.getElementById("users");

let users = [];
let posts = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let showOnlyFavorites = false;

async function loadData() {
    try {
        button.disabled = true;
        button.textContent = "Загрузка...";
        usersDiv.innerHTML = "<p>Загрузка данных...</p>";

        const usersResponse = await fetch("https://jsonplaceholder.typicode.com/users");
        const postsResponse = await fetch("https://jsonplaceholder.typicode.com/posts");

        users = await usersResponse.json();
        posts = await postsResponse.json();

        renderUsers();
    } catch (error) {
        usersDiv.innerHTML = "<p>Ошибка загрузки данных 😢</p>";
        console.error(error);
    } finally {
        button.disabled = false;
        button.textContent = "Загрузить пользователей";
    }
}

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function renderUsers(searchValue = "") {
    let filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (showOnlyFavorites) {
        filteredUsers = filteredUsers.filter(user => favorites.includes(user.id));
    }

    let html = `
        <h1>Список пользователей</h1>
        <input 
            type="text" 
            id="searchInput" 
            placeholder="Поиск по имени"
            value="${searchValue}"
        >

        <button 
            id="showAllBtn" 
            class="${!showOnlyFavorites ? "active-filter" : ""}"
        >
            Все
        </button>

        <button 
            id="showFavoritesBtn" 
            class="${showOnlyFavorites ? "active-filter" : ""}"
        >
            Только избранные
        </button>
    `;

    if (filteredUsers.length === 0) {
        html += `<p>Пользователи не найдены</p>`;
        usersDiv.innerHTML = html;
        return;
    }

    filteredUsers.forEach(user => {
        const userPosts = posts.filter(post => post.userId === user.id);
        const isFavorite = favorites.includes(user.id);

        html += `
            <div class="user-card" data-id="${user.id}" data-name="${user.name}">
                <h2>${user.name}</h2>
                <p>Email: ${user.email}</p>
                <p>Постов: ${userPosts.length}</p>
                <button 
                    class="favorite-btn ${isFavorite ? "favorite-active" : ""}" 
                    data-id="${user.id}"
                >
                    ${isFavorite ? "★ Убрать из избранного" : "☆ В избранное"}
                </button>
            </div>
        `;
    });

    usersDiv.innerHTML = html;
}




function renderUserPosts(userId, userName) {
    const userPosts = posts.filter(post => post.userId === Number(userId));
    const isFavorite = favorites.includes(Number(userId));

    let html = `
        <h1>Посты пользователя: ${userName}</h1>
        <button id="backButton">Назад к пользователям</button>
        <button 
            class="favorite-btn ${isFavorite ? "favorite-active" : ""}" 
            data-id="${userId}"
        >
            ${isFavorite ? "★ Убрать из избранного" : "☆ В избранное"}
        </button>
    `;

    if (userPosts.length === 0) {
        html += `<p>У этого пользователя нет постов</p>`;
    }

    userPosts.forEach(post => {
        html += `
            <div class="post-card">
                <h2>${post.title}</h2>
                <p>${post.body}</p>
            </div>
        `;
    });

    usersDiv.innerHTML = html;
}

function toggleFavorite(userId) {
    userId = Number(userId);

    if (favorites.includes(userId)) {
        favorites = favorites.filter(id => id !== userId);
    } else {
        favorites.push(userId);
    }

    saveFavorites();
}

button.addEventListener("click", loadData);

usersDiv.addEventListener("click", (event) => {
    if (event.target.id === "backButton") {
        renderUsers();
        return;
    }

    if (event.target.id === "showAllBtn") {
        showOnlyFavorites = false;
        const searchInput = document.getElementById("searchInput");
        const currentSearch = searchInput ? searchInput.value : "";
        renderUsers(currentSearch);
        return;
    }

    if (event.target.id === "showFavoritesBtn") {
        showOnlyFavorites = true;
        const searchInput = document.getElementById("searchInput");
        const currentSearch = searchInput ? searchInput.value : "";
        renderUsers(currentSearch);
        return;
    }

    if (event.target.classList.contains("favorite-btn")) {
        const userId = event.target.dataset.id;
        toggleFavorite(userId);

        const card = event.target.closest(".user-card");

        if (card) {
            const searchInput = document.getElementById("searchInput");
            const currentSearch = searchInput ? searchInput.value : "";
            renderUsers(currentSearch);
        } else {
            const user = users.find(user => user.id === Number(userId));
            renderUserPosts(userId, user.name);
        }

        return;
    }

    const card = event.target.closest(".user-card");

    if (!card) return;

    const userId = card.dataset.id;
    const userName = card.dataset.name;

    renderUserPosts(userId, userName);
});

usersDiv.addEventListener("input", (event) => {
    if (event.target.id === "searchInput") {
        renderUsers(event.target.value);
    }
});
