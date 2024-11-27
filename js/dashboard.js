import requests from './api.js';

let currentPage = 1;
const boardsPerPage = 9; // 9 quadros por página
let boards = []; // Armazena os quadros recuperados da API

// Seletores de elementos
const boardListElement = document.getElementById("board-list");
const createFirstBoardButton = document.getElementById("create-first-board");
const welcomeContainer = document.getElementById("welcome-container");
const logoutButton = document.getElementById("logout-btn");
const showBoardsButton = document.getElementById("show-boards-btn");
const backButton = document.getElementById("back-btn");
const prevPageButton = document.getElementById("prev-page-btn");
const nextPageButton = document.getElementById("next-page-btn");

// Atualizar exibição da página atual
function updatePagination() {
  const start = (currentPage - 1) * boardsPerPage;
  const end = start + boardsPerPage;
  const boardsToDisplay = boards.slice(start, end);

  renderBoards(boardsToDisplay);

  // Ativa ou desativa os botões de navegação
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = end >= boards.length;
}

// Configurar os botões de navegação
prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updatePagination();
  }
});

nextPageButton.addEventListener("click", () => {
  if ((currentPage * boardsPerPage) < boards.length) {
    currentPage++;
    updatePagination();
  }
});

// Renderizar quadros na interface principal
function renderBoards(boardsToRender) {
  boardListElement.innerHTML = ""; // Limpa os quadros anteriores

  boardsToRender.forEach((board) => {
    const boardElement = document.createElement("div");
    boardElement.classList.add("board-card");

    // Adiciona o texto dentro de um <p> para controle de layout
    const textElement = document.createElement("p");
    textElement.textContent = board.Name;
    boardElement.appendChild(textElement);

    // Clique para redirecionar ao quadro
    boardElement.addEventListener("click", () => {
      window.location.href = `quadros.html?boardId=${board.Id}`;
    });

    boardListElement.appendChild(boardElement);
  });

  boardListElement.classList.remove("hidden");
  document.querySelector(".carousel-controls").classList.remove("hidden");
}

// Buscar quadros da API e iniciar exibição
async function loadBoards() {
  try {
    boards = await requests.GetBoards();
    if (boards.length > 0) {
      currentPage = 1;
      updatePagination();
    } else {
      alert("Nenhum quadro encontrado.");
    }
  } catch (error) {
    console.error("Erro ao carregar quadros:", error.message);
  }
}

// Configurar botão "Ver Quadros"
showBoardsButton.addEventListener("click", async () => {
  await loadBoards();
  welcomeContainer.classList.add("hidden");
  boardListElement.classList.remove("hidden");
  backButton.classList.remove("hidden");
  showBoardsButton.classList.add("hidden");
});

// Configurar botão "Voltar"
backButton.addEventListener("click", () => {
  welcomeContainer.classList.remove("hidden");
  boardListElement.classList.add("hidden");
  backButton.classList.add("hidden");
  showBoardsButton.classList.remove("hidden");
  document.querySelector(".carousel-controls").classList.add("hidden");
});

// Configurar botão de logout
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// Criar novo quadro
createFirstBoardButton.addEventListener("click", () => {
  const boardName = prompt("Digite o nome do novo quadro:");
  if (boardName) {
    createBoard(boardName);
  }
});

// Função para criar um novo quadro
async function createBoard(name) {
  try {
    const newBoard = await requests.CreateBoard({ Name: name });
    alert(`Quadro "${newBoard.Name}" criado com sucesso!`);
    boards = await requests.GetBoards();
    updatePagination();
  } catch (error) {
    console.error("Erro ao criar quadro:", error.message);
    alert("Erro ao criar quadro. Verifique os dados e tente novamente.");
  }
};