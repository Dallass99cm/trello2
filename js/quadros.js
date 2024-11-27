import requests from './api.js';

// Seletores
const dragList = document.querySelector('.drag-list');
const backButton = document.getElementById('back-btn');
const logoutButton = document.getElementById('logout-btn');

// Obter o ID do quadro da URL
const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get('boardId');

// Redirecionar para a página inicial
backButton.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// Logout do usuário
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Função para carregar as colunas e tarefas
async function loadBoard(boardId) {
  try {
    if (!boardId) {
      alert('ID do quadro não fornecido!');
      return;
    }

    console.log('Carregando colunas para o quadro ID:', boardId);
    const columns = await requests.GetColumnsByBoardId(boardId);

    renderColumns(columns);
  } catch (error) {
    console.error('Erro ao carregar colunas:', error.message);
  }
}

// Renderizar as colunas e tarefas
function renderColumns(columns) {
  dragList.innerHTML = ''; // Limpa colunas anteriores

  columns.forEach((column) => {
    // Criar coluna
    const columnElement = document.createElement('li');
    columnElement.classList.add('drag-column');

    // Criar título da coluna
    const header = document.createElement('h2');
    header.textContent = column.Name;
    header.style.color = getColumnColor(column.Name);
    columnElement.appendChild(header);

    // Criar lista de tarefas
    const taskList = document.createElement('ul');
    taskList.classList.add('drag-item-list');
    column.Tasks.forEach((task) => {
      const taskItem = document.createElement('li');
      taskItem.textContent = task.Name;
      taskItem.classList.add('drag-item');
      taskList.appendChild(taskItem);
    });

    columnElement.appendChild(taskList);
    dragList.appendChild(columnElement);
  });
}

// Obter cores das colunas com base no nome
function getColumnColor(columnName) {
  switch (columnName.toLowerCase()) {
    case 'to do':
      return 'var(--to-do)';
    case 'doing':
      return 'var(--doing)';
    case 'done':
      return 'var(--done)';
    case 'on hold':
      return 'var(--on-hold)';
    default:
      return '#333';
  }
}

// Carregar o quadro ao inicializar
loadBoard(boardId);