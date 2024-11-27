import requests from './api.js';

// Seletores de elementos
const boardDropdown = document.getElementById("board-dropdown");
const boardListElement = document.getElementById("board-list");
const boardColumnsElement = document.getElementById("board-columns");
const createFirstBoardButton = document.getElementById("create-first-board");
const welcomeContainer = document.getElementById("welcome-container");
const logoutButton = document.getElementById("logout-btn");
const showBoardsButton = document.getElementById("show-boards-btn");

// Inicialização após DOM estar carregado
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM carregado, inicializando...");
    setupInitialView();
    loadBoards(); // Apenas popula o dropdown
    setupLogoutButton();
});

// Configurar visão inicial
function setupInitialView() {
    console.log("Configuração inicial...");
    boardListElement.classList.add("hidden"); // Esconde a lista de quadros
    boardColumnsElement.classList.add("hidden"); // Esconde as colunas
    welcomeContainer.classList.remove("hidden"); // Mostra o botão inicial
}

// Carregar todos os quadros para o dropdown (sem renderizar diretamente)
async function loadBoards() {
    try {
        console.log("Carregando quadros...");
        const boards = await requests.GetBoards();
        console.log("Quadros carregados:", boards);

        if (!boards || boards.length === 0) {
            alert("Nenhum quadro encontrado. Crie um novo para começar!");
            setupInitialView(); // Mostra o botão de criar quadro
        } else {
            populateDropdown(boards); // Apenas popula o dropdown
        }
    } catch (error) {
        console.error("Erro ao carregar quadros:", error.message);
        alert("Erro ao carregar quadros. Tente novamente mais tarde.");
    }
}

// Botão para mostrar os quadros ao clicar
showBoardsButton.addEventListener("click", async () => {
    try {
        const boards = await requests.GetBoards();
        renderBoards(boards); // Renderiza os quadros
    } catch (error) {
        console.error("Erro ao carregar quadros:", error.message);
    }
});

// Popular dropdown com os quadros
function populateDropdown(boards) {
    console.log("Populando dropdown...");
    boardDropdown.innerHTML = '<option value="" disabled selected>Selecionar Quadro</option>';
    boards.forEach(board => {
        const option = document.createElement("option");
        option.value = board.Id;
        option.textContent = board.Name;
        boardDropdown.appendChild(option);
    });

    boardDropdown.addEventListener("change", () => {
        const selectedBoardId = parseInt(boardDropdown.value, 10);
        console.log("Quadro selecionado com ID:", selectedBoardId);
        if (selectedBoardId) {
            loadColumns(selectedBoardId);
        } else {
            console.error("Nenhum ID válido foi selecionado.");
        }
    });
}

// Renderizar quadros na interface principal
function renderBoards(boards) {
    console.log("Renderizando quadros...");
    boardListElement.innerHTML = ""; // Limpa os quadros anteriores
    welcomeContainer.classList.add("hidden"); // Esconde o botão inicial

    boards.forEach(board => {
        const boardElement = document.createElement("div");
        boardElement.classList.add("board-card");
        boardElement.textContent = board.Name;

        boardElement.addEventListener("click", () => {
            console.log("Carregando colunas do quadro:", board.Name);
            loadColumns(board.Id);
        });

        boardListElement.appendChild(boardElement);
    });

    boardListElement.classList.remove("hidden"); // Mostra os quadros
}

// Carregar colunas de um quadro
export async function loadColumns(boardId) {
    try {
        if (!boardId) {
            throw new Error("ID do quadro não fornecido!");
        }

        console.log("Carregando colunas para o quadro ID:", boardId);
        const columns = await requests.GetColumnsByBoardId(boardId);
        console.log("Colunas carregadas:", columns);

        if (!columns || columns.length === 0) {
            alert("Nenhuma coluna encontrada neste quadro.");
            renderColumns([]); // Renderiza uma interface limpa
            return;
        }

        renderColumns(columns); // Renderiza as colunas corretamente
    } catch (error) {
        console.error("Erro ao carregar colunas:", error.message);
    }
}

// Renderizar colunas na interface
function renderColumns(columns) {
    console.log("Renderizando colunas...");
    boardListElement.classList.add("hidden"); // Esconde a lista de quadros
    boardColumnsElement.innerHTML = ""; // Limpa colunas anteriores
    boardColumnsElement.classList.remove("hidden"); // Mostra as colunas

    if (columns.length === 0) {
        const noColumnMessage = document.createElement("p");
        noColumnMessage.textContent = "Nenhuma coluna encontrada neste quadro.";
        boardColumnsElement.appendChild(noColumnMessage);
        return;
    }

    columns.forEach(column => {
        const columnElement = document.createElement("div");
        columnElement.classList.add("column-card");
        columnElement.textContent = column.Name;

        boardColumnsElement.appendChild(columnElement);
    });
}

// Criar novo quadro
createFirstBoardButton.addEventListener("click", () => {
    const boardName = prompt("Digite o nome do novo quadro:");
    if (boardName) {
        createBoard(boardName);
    }
});

async function createBoard(name) {
    try {
        console.log("Criando quadro:", name);
        const newBoard = await requests.CreateBoard({ Name: name });
        alert(`Quadro "${newBoard.Name}" criado com sucesso!`);
        loadBoards();
    } catch (error) {
        console.error("Erro ao criar quadro:", error.message);
        alert("Erro ao criar quadro. Verifique os dados e tente novamente.");
    }
}

// Configurar botão de logout
function setupLogoutButton() {
    logoutButton.addEventListener("click", () => {
        console.log("Logout clicado...");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });
}