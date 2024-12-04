import requests from './api.js';  // Importa as funções da API

function initializePopup() {
    console.log('Inicializando popup...');
    
    const newBoardBtn = document.getElementById('newBoardBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    
    console.log('Botão encontrado:', newBoardBtn);
    console.log('Popup encontrado:', popupOverlay);

    if (!newBoardBtn || !popupOverlay) {
        console.log('Elementos não encontrados, tentando novamente em 100ms');
        setTimeout(initializePopup, 100);
        return;
    }

    // Abrir popup
    newBoardBtn.addEventListener('click', (e) => {
        console.log('Clique no botão detectado');
        e.preventDefault();
        e.stopPropagation();
        popupOverlay.style.display = 'flex';
    });

    const closePopupBtn = document.getElementById('closePopupBtn');
    const createBoardBtn = document.getElementById('createBoardBtn');

    // Fechar popup
    closePopupBtn.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
        limparCampos();
    });

    // Criar quadro
    createBoardBtn.addEventListener('click', async () => {
        const nome = document.getElementById('boardName').value;
        const descricao = document.getElementById('boardDescription').value;

        if (!nome.trim()) {
            alert('Por favor, insira um nome para o quadro');
            return;
        }

        try {
            const response = await requests.post('/boards', {
                nome: nome,
                descricao: descricao
            });

            if (response.ok) {
                alert('Quadro criado com sucesso!');
                popupOverlay.style.display = 'none';
                limparCampos();
                // Opcional: recarregar a página ou atualizar a lista de quadros
                window.location.reload();
            } else {
                alert('Erro ao criar o quadro');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao criar o quadro');
        }
    });
}

function limparCampos() {
    document.getElementById('boardName').value = '';
    document.getElementById('boardDescription').value = '';
}

// Espera o HTML ser carregado
document.addEventListener('DOMContentLoaded', () => {
    const newBoardBtn = document.getElementById('newBoardBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.getElementById('closePopupBtn');

    if (newBoardBtn && popupOverlay) {
        // Abrir popup
        newBoardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            popupOverlay.classList.add('active');
        });

        // Fechar popup
        closePopupBtn.addEventListener('click', () => {
            popupOverlay.classList.remove('active');
        });
    } else {
        console.error('Elementos não encontrados');
    }
});

// Escuta o evento de recarregar quadros
document.addEventListener('loadBoards', async () => {
    try {
        const boards = await requests.GetBoards();
        // Dispara um evento para atualizar a lista de quadros
        const event = new CustomEvent('boardsUpdated', { detail: boards });
        document.dispatchEvent(event);
    } catch (error) {
        console.error('Erro ao recarregar quadros:', error);
    }
}); 