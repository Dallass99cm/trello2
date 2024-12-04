import requests from './api.js';

// Captura elementos do DOM
const themeBtn = document.getElementById('themeBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const boardsList = document.getElementById('boardsList');
const newBoardBtn = document.getElementById('newBoardBtn');

// Variável global para armazenar os quadros
let boards = [];

// Função para carregar os quadros
async function loadBoards() {
    try {
        const response = await requests.GetBoards();
        console.log('Quadros carregados:', response);
        boards = response;
        renderBoards(boards);
    } catch (error) {
        console.error('Erro ao carregar quadros:', error);
    }
}

// Função para renderizar os quadros com estrutura em árvore
async function renderBoards(boardsToShow) {
    boardsList.innerHTML = '';
    
    for (const board of boardsToShow) {
        const boardContainer = document.createElement('div');
        boardContainer.className = 'board-container';
        
        const boardElement = document.createElement('div');
        boardElement.className = 'board-item';
        boardElement.innerHTML = `
            <img src="images/folder-closed.png" alt="Pasta" class="folder-icon">
            <span>${board.Name}</span>
        `;
        
        boardElement.addEventListener('click', async () => {
            try {
                // Remove active de outros quadros
                document.querySelectorAll('.board-item').forEach(item => {
                    item.classList.remove('active');
                    item.querySelector('.folder-icon').src = 'images/folder-closed.png';
                });
                
                // Atualiza o estado do quadro atual
                boardElement.classList.add('active');
                boardElement.querySelector('.folder-icon').src = 'images/folder-open.png';
                
                // Carrega as colunas
                const columns = await requests.GetColumnsByBoardId(board.Id);
                const taskDetailsArea = document.getElementById('taskDetailsArea');
                
                // Monta o HTML das colunas
                let columnsHTML = '';
                
                for (const col of columns) {
                    const tasks = await requests.GetTasksByColumnId(col.Id);
                    
                    columnsHTML += `
                        <div class="board-column">
                            <div class="column-header">
                                <h3>
                                    ${col.Name}
                                    <span class="task-count">${tasks.length}</span>
                                </h3>
                            </div>
                            <div class="column-tasks">
                                ${tasks.map(task => `
                                    <div class="task-item">
                                        <div class="task-description">${task.Description}</div>
                                        <div class="task-badges">
                                            <span class="task-badge">ID: ${task.Id}</span>
                                            <span class="task-badge">${task.Status || 'Em andamento'}</span>
                                        </div>
                                    </div>
                                `).join('')}
                                <div class="add-card-button">
                                    + Adicionar um cartão
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // Atualiza o painel direito
                taskDetailsArea.innerHTML = `
                    <div class="board-panel">
                        <div class="board-panel-header">
                            <h2>
                                <img src="images/folder-open.png" alt="Pasta" class="folder-icon">
                                ${board.Name}
                            </h2>
                        </div>
                        <div class="board-columns">
                            ${columnsHTML}
                        </div>
                    </div>
                `;
                
                taskDetailsArea.classList.remove('hidden');
                
            } catch (error) {
                console.error('Erro ao carregar conteúdo do quadro:', error);
            }
        });
        
        boardContainer.appendChild(boardElement);
        boardsList.appendChild(boardContainer);
    }
}

// Função para alternar o tema
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Função para fazer logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Função para pesquisar quadros
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredBoards = boards.filter(board => 
        board.Name.toLowerCase().includes(searchTerm)
    );
    renderBoards(filteredBoards);
}

// Adiciona os event listeners
themeBtn.addEventListener('click', toggleTheme);
logoutBtn.addEventListener('click', logout);
searchInput.addEventListener('input', handleSearch);

// Carrega o tema inicial
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeBtn.textContent = '☀️';
}

// Carrega os quadros ao iniciar
loadBoards();

// Verifica autenticação
if (!localStorage.getItem('user')) {
    window.location.href = 'index.html';
}

// Adicione isso junto com os outros event listeners
document.addEventListener('boardsUpdated', () => {
    loadBoards();
});

// E torne a função loadBoards acessível para outros módulos
export { loadBoards };