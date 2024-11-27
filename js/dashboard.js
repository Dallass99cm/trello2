const API_BASE_URL = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard";
const boardDropdown = document.getElementById("board-dropdown");
const logoutButton = document.getElementById("logout-btn");
const userNameElement = document.getElementById("user-name");
const createFirstBoardButton = document.getElementById("create-first-board");
const welcomeContainer = document.getElementById("welcome-container");
const boardListElement = document.getElementById("board-list");
const boardColumnsElement = document.getElementById("board-columns");

// Carregar quadros no dropdown ao iniciar
document.addEventListener("DOMContentLoaded", () => {
  setupInitialView();
  loadBoards();
  loadUserDetails();
});

// Configurar visão inicial (exibe apenas o botão de criar quadro)
function setupInitialView() {
  boardListElement.classList.add("hidden");
  boardColumnsElement.classList.add("hidden");
  welcomeContainer.classList.remove("hidden");
}

// Carregar detalhes do usuário
function loadUserDetails() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    userNameElement.textContent = user.email.split("@")[0]; // Exibe nome antes do '@'
  } else {
    window.location.href = "index.html"; // Redireciona para login se não estiver logado
  }
}

// Carregar todos os quadros para o dropdown
async function loadBoards() {
  try {
    const response = await fetch(`${API_BASE_URL}/Boards`);
    if (!response.ok) {
      throw new Error("Erro ao buscar os quadros");
    }

    const boards = await response.json();
    populateDropdown(boards);
  } catch (error) {
    console.error("Erro ao carregar quadros:", error);
  }
}

// Popular dropdown com os quadros
function populateDropdown(boards) {
  boardDropdown.innerHTML = '<option value="" disabled selected>Selecionar Quadro</option>';
  boards.forEach(board => {
    const option = document.createElement("option");
    option.value = board.Id;
    option.textContent = board.Name;
    boardDropdown.appendChild(option);
  });

  // Evento para selecionar um quadro
  boardDropdown.addEventListener("change", () => {
    const selectedBoardId = boardDropdown.value;
    if (selectedBoardId) {
      loadColumns(selectedBoardId);
    }
  });
}

// Criar um novo quadro
async function createBoard(name) {
  try {
    const response = await fetch(`${API_BASE_URL}/Boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: name }),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar quadro");
    }

    const newBoard = await response.json();
    loadBoards(); // Atualiza o dropdown com o novo quadro
    alert(`Quadro "${newBoard.Name}" criado com sucesso! Selecione-o no menu acima.`);
  } catch (error) {
    console.error("Erro ao criar quadro:", error);
    alert("Erro ao criar quadro. Tente novamente.");
  }
}

// Carregar colunas de um quadro
async function loadColumns(boardId) {
  try {
    const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${boardId}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar colunas");
    }

    const columns = await response.json();
    renderColumns(columns);
  } catch (error) {
    console.error("Erro ao carregar colunas:", error);
  }
}

// Renderizar colunas do quadro
function renderColumns(columns) {
  welcomeContainer.classList.add("hidden");
  boardColumnsElement.innerHTML = "";
  boardListElement.classList.add("hidden");
  boardColumnsElement.classList.remove("hidden");

  columns.forEach(column => {
    const columnElement = document.createElement("div");
    columnElement.classList.add("column-card");
    columnElement.textContent = column.Name;

    boardColumnsElement.appendChild(columnElement);
  });
}

// Evento para adicionar novo quadro no botão inicial
createFirstBoardButton.addEventListener("click", () => {
  const boardName = prompt("Digite o nome do novo quadro:");
  if (boardName) {
    createBoard(boardName);
  }
});

// Logout do usuário
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});