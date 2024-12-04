import requests from './api.js';  // Importa as funções da API
import { loadBoards } from './dashboard.js';

let selectedColor = '#6C63FF'; // Cor padrão

function limparCampos() {
    document.getElementById('boardName').value = '';
    document.getElementById('boardDescription').value = '';
    const colorOptions = document.querySelectorAll('.color-option');
    const colorPicker = document.getElementById('colorPicker');
    
    colorOptions.forEach(opt => opt.classList.remove('selected'));
    colorPicker.classList.remove('selected');
    colorOptions[0].classList.add('selected');
    colorPicker.value = '#6C63FF';
    selectedColor = '#6C63FF';
}

// Espera o HTML ser carregado
document.addEventListener('DOMContentLoaded', () => {
    const newBoardBtn = document.getElementById('newBoardBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const colorPicker = document.getElementById('colorPicker');
    const colorOptions = document.querySelectorAll('.color-option');
    const createBoardBtn = document.getElementById('createBoardBtn');

    // Remover event listeners duplicados
    createBoardBtn.replaceWith(createBoardBtn.cloneNode(true));

    // Configurar seletor de cores predefinidas
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            colorPicker.classList.remove('selected');
            option.classList.add('selected');
            selectedColor = option.dataset.color;
            colorPicker.value = selectedColor;
        });
    });

    // Configurar seletor de cor personalizada
    colorPicker.addEventListener('input', (event) => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        colorPicker.classList.add('selected');
        selectedColor = event.target.value;
    });

    // Seleciona a primeira cor por padrão
    colorOptions[0].classList.add('selected');

    if (newBoardBtn && popupOverlay) {
        // Abrir popup
        newBoardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            popupOverlay.classList.add('active');
        });

        // Fechar popup
        closePopupBtn.addEventListener('click', () => {
            popupOverlay.classList.remove('active');
            limparCampos();
        });

        // Criar quadro
        document.getElementById('createBoardBtn').addEventListener('click', async () => {
            const nome = document.getElementById('boardName').value;
            const descricao = document.getElementById('boardDescription').value;

            if (!nome.trim()) {
                alert('Por favor, insira um nome para o quadro.');
                return;
            }

            if (nome.trim().length < 10) {
                alert('O nome do quadro deve ter pelo menos 10 caracteres.');
                return;
            }

            try {
                const boardData = {
                    Name: nome,
                    Description: descricao || "",
                    Color: selectedColor.replace('#', ''),
                    IsActive: true,
                    Position: 0
                };

                console.log('Dados sendo enviados para API:', boardData);

                const result = await requests.CreateBoard(boardData);

                if (!result.ok) {
                    console.error('Erro ao criar quadro:', result.data);
                    const errorMessage = result.data.Errors 
                        ? `Erro: ${result.data.Errors.join(', ')}`
                        : 'Erro desconhecido';
                    alert(errorMessage);
                } else {
                    alert('Quadro criado com sucesso!');
                    popupOverlay.classList.remove('active');
                    limparCampos();
                    loadBoards();
                }
            } catch (error) {
                console.error('Erro completo:', error);
                alert('Erro ao criar o quadro: ' + error.message);
            }
        });
    }
});

// Escuta o evento de recarregar quadros
document.addEventListener('loadBoards', async () => {
    try {
        const boards = await requests.GetBoards();
        const event = new CustomEvent('boardsUpdated', { detail: boards });
        document.dispatchEvent(event);
    } catch (error) {
        console.error('Erro ao recarregar quadros:', error);
    }
}); 