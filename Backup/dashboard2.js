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
                
                const columnsHTML = await Promise.all(columns.map(async col => {
                    const tasks = await requests.GetTasksByColumnId(col.Id);
                    return `
                        <div class="column" data-position="${col.Position || 0}">
                            <div class="column-header">
                                <h3>
                                    ${col.Name}
                                    <span class="task-count">${tasks.length}</span>
                                </h3>
                                <div class="column-actions">
                                    <button onclick="handleEditColumn(event)" class="edit-column-btn" data-id="${col.Id}">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Editar
                                    </button>
                                    <button onclick="handleDeleteColumn(event)" class="delete-column-btn" data-column-id="${col.Id}">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Excluir
                                    </button>
                                </div>
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
                }));
                
                taskDetailsArea.innerHTML = `
                    <div class="board-panel" data-board-id="${board.Id}">
                        <div class="board-panel-header">
                            <h2>
                                <img src="images/folder-open.png" alt="Pasta" class="folder-icon">
                                ${board.Name}
                            </h2>
                            <button class="add-column-btn" data-board-id="${board.Id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 5v14"></path>
                                    <path d="M5 12h14"></path>
                                </svg>
                                Nova Coluna
                            </button>
                        </div>
                        <div class="columns-container">
                            ${columnsHTML.join('')}
                        </div>
                    </div>
                `;
                
                taskDetailsArea.classList.remove('hidden');
                
                // Adiciona event listeners para os botões
                document.querySelectorAll('.edit-column-btn').forEach(button => {
                    button.addEventListener('click', handleEditColumn);
                });

                // Adiciona event listeners para os botões de excluir
                document.querySelectorAll('.delete-column-btn').forEach(button => {
                    button.addEventListener('click', handleDeleteColumn);
                });
                
                const addColumnBtn = taskDetailsArea.querySelector('.add-column-btn');
                if (addColumnBtn) {
                    addColumnBtn.addEventListener('click', () => {
                        const boardId = addColumnBtn.getAttribute('data-board-id');
                        handleCreateColumn(boardId);
                    });
                }
                
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

window.handleEditColumn = async function(event) {
    event.stopPropagation();
    const columnElement = event.target.closest('.column');
    const columnId = event.target.closest('.edit-column-btn').dataset.id;
    const columnName = columnElement.querySelector('h3').textContent.trim().replace(/\d+/g, '').trim();
    
    const boardPanel = document.querySelector('.board-panel');
    const boardId = boardPanel.dataset.boardId;
    
    console.log('BoardId:', boardId, 'ColumnId:', columnId);
    
    try {
        // Inserir o HTML diretamente ao invés de carregar de um arquivo
        const html = `
            <div id="editarColunaOverlay" class="popup-overlay" style="background: transparent !important;">
                <div class="popup-content">
                    <div class="popup-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Editar Coluna
                        </h2>
                        <button id="closeEditarColunaBtn" class="close-button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="popup-body">
                        <div class="form-group">
                            <label for="columnName">Nome da Coluna</label>
                            <input type="text" id="columnName" class="form-input" placeholder="Digite o nome da coluna" required>
                            <small class="form-help">O nome ajuda a identificar o propósito desta coluna no quadro.</small>
                        </div>
                    </div>
                    <div class="popup-footer">
                        <button id="cancelEditColumnBtn" class="secondary-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                            </svg>
                            Cancelar
                        </button>
                        <button id="saveColumnBtn" class="primary-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('criarQuadroContainer').insertAdjacentHTML('beforeend', html);
        
        // Aguarda o próximo ciclo do event loop para garantir que o DOM foi atualizado
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const overlay = document.getElementById('editarColunaOverlay');
        if (!overlay) {
            throw new Error('Elemento overlay não encontrado');
        }
        
        const closeBtn = document.getElementById('closeEditarColunaBtn');
        const saveBtn = document.getElementById('saveColumnBtn');
        const cancelBtn = document.getElementById('cancelEditColumnBtn');
        const nameInput = document.getElementById('columnName');
        
        if (!nameInput || !closeBtn || !saveBtn || !cancelBtn) {
            throw new Error('Elementos do formulário não encontrados');
        }
        
        // Define o valor do input
        nameInput.value = columnName;
        
        // Mostra o overlay
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        const closePopup = () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        };
        
        closeBtn.addEventListener('click', closePopup);
        cancelBtn.addEventListener('click', closePopup);
        
        saveBtn.addEventListener('click', async () => {
            try {
                const newName = nameInput.value.trim();
                if (!newName) {
                    alert('Por favor, insira um nome para a coluna');
                    return;
                }
                
                const columnData = {
                    Id: parseInt(columnId),
                    Name: newName,
                    BoardId: parseInt(boardId),
                    IsActive: true,
                    Position: parseInt(columnElement.dataset.position || '0')
                };
                
                console.log('Dados para atualização:', columnData);
                
                await requests.UpdateColumn(columnData);
                closePopup();
                
                const activeBoard = document.querySelector('.board-item.active');
                if (activeBoard) {
                    activeBoard.click();
                }
            } catch (error) {
                console.error('Erro ao salvar coluna:', error);
                alert('Erro ao salvar as alterações');
            }
        });
        
    } catch (error) {
        console.error('Erro ao editar coluna:', error);
        alert('Erro ao carregar o formulário de edição');
    }
};
