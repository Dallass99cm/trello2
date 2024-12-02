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
function renderBoards(boardsToShow) {
    boardsList.innerHTML = '';
    
    boardsToShow.forEach(board => {
        // Criar container principal do quadro (inclui quadro + tarefas)
        const boardContainer = document.createElement('div');
        boardContainer.className = 'board-container';

        // Criar elemento do quadro
        const boardElement = document.createElement('div');
        boardElement.className = 'board-item';
        boardElement.innerHTML = `
            <img src="images/folder-closed.png" alt="Pasta" class="folder-icon">
            <span>${board.Name}</span>
        `;

        // Criar container para as tarefas (inicialmente oculto)
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks-tree hidden';
        
        // Adicionar evento de clique no quadro
        boardElement.addEventListener('click', async () => {
            const isExpanded = !tasksContainer.classList.contains('hidden');
            
            // Remove active de todos os outros quadros
            document.querySelectorAll('.board-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.folder-icon').src = 'images/folder-closed.png';
            });
            
            if (!isExpanded) {
                // Expande o quadro
                boardElement.classList.add('active');
                boardElement.querySelector('.folder-icon').src = 'images/folder-open.png';
                
                // Carrega e mostra as tarefas
                try {
                    const columns = await requests.GetColumnsByBoardId(board.Id);
                    tasksContainer.innerHTML = '';
                    
                    for (const column of columns) {
                        const tasks = await requests.GetTasksByColumnId(column.Id);
                        const columnElement = document.createElement('div');
                        columnElement.className = 'column-tree';
                        columnElement.innerHTML = `
                            <div class="column-header-tree">
                                <img src="images/archive-icon.png" alt="Arquivo" class="task-icon">
                                <span>${column.Name}</span>
                            </div>
                            <div class="tasks-list-tree">
                                ${tasks.length === 0 ? 
                                    '<div class="task-item-tree">Nenhuma tarefa</div>' :
                                    tasks.map(task => `
                                        <div class="task-item-tree" data-task='${JSON.stringify(task)}'>
                                            <img src="images/document-icon.png" alt="Documento" class="task-icon">
                                            ${task.Description}
                                        </div>
                                    `).join('')
                                }
                            </div>
                        `;
                        tasksContainer.appendChild(columnElement);
                    }
                    
                    tasksContainer.classList.remove('hidden');
                } catch (error) {
                    console.error('Erro ao carregar tarefas:', error);
                }
            } else {
                // Recolhe o quadro
                boardElement.classList.remove('active');
                boardElement.querySelector('.folder-icon').src = 'images/folder-closed.png';
                tasksContainer.classList.add('hidden');
            }
        });

        // Montar a estrutura
        boardContainer.appendChild(boardElement);
        boardContainer.appendChild(tasksContainer);
        boardsList.appendChild(boardContainer);
    });
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

// Função para criar novo quadro
async function createNewBoard() {
    const name = prompt('Digite o nome do novo quadro:');
    if (!name) return;
    
    try {
        await requests.CreateBoard({ Name: name });
        await loadBoards();
    } catch (error) {
        console.error('Erro ao criar quadro:', error);
    }
}

// Adiciona os event listeners
themeBtn.addEventListener('click', toggleTheme);
logoutBtn.addEventListener('click', logout);
searchInput.addEventListener('input', handleSearch);
newBoardBtn.addEventListener('click', createNewBoard);

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

// Adicione o evento de clique após criar o elemento
const columnElement = document.createElement('div');
columnElement.className = 'column-tree';
columnElement.innerHTML = `
    <div class="column-header-tree">
        <img src="images/archive-icon.png" alt="Arquivo" class="task-icon">
        <span>${column.Name}</span>
    </div>
    <div class="tasks-list-tree">
        ${tasks.length === 0 ? 
            '<div class="task-item-tree">Nenhuma tarefa</div>' :
            tasks.map(task => `
                <div class="task-item-tree" data-task='${JSON.stringify(task)}'>
                    <img src="images/document-icon.png" alt="Documento" class="task-icon">
                    ${task.Description}
                </div>
            `).join('')
        }
    </div>
`;

// Adicione o evento de clique após criar o elemento
columnElement.querySelectorAll('.task-item-tree').forEach(taskElement => {
    taskElement.addEventListener('click', (e) => {
        const task = JSON.parse(e.currentTarget.dataset.task);
        const mainContent = document.querySelector('.content');
        
        // Cria ou atualiza a área de detalhes
        let taskDetailsArea = document.querySelector('.task-details-area');
        if (!taskDetailsArea) {
            taskDetailsArea = document.createElement('div');
            taskDetailsArea.className = 'task-details-area';
            mainContent.appendChild(taskDetailsArea);
        }

        taskDetailsArea.innerHTML = `
            <div class="task-details">
                <div class="task-details-header">
                    <h2>
                        <img src="images/document-icon.png" alt="Documento" class="task-icon">
                        ${task.Description}
                    </h2>
                </div>
                <div class="task-details-content">
                    <div class="task-info">
                        <p><strong>ID:</strong> ${task.Id}</p>
                        <p><strong>Status:</strong> ${task.Status || 'Em andamento'}</p>
                        <p><strong>Criado em:</strong> ${new Date(task.CreatedOn).toLocaleDateString()}</p>
                    </div>
                    <div class="task-actions">
                        <button class="task-button edit">Editar</button>
                        <button class="task-button delete">Excluir</button>
                    </div>
                </div>
            </div>
        `;
    });
});