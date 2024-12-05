import requests from './api.js';

window.handleManageTask = async function(event, columnId, taskId = null) {
    event.preventDefault();
    event.stopPropagation();

    const overlay = document.getElementById('gerenciarTarefaOverlay');
    const titleElement = document.getElementById('gerenciarTarefaTitle');
    const closeBtn = document.getElementById('closeGerenciarTarefaBtn');
    const cancelBtn = document.getElementById('cancelGerenciarTarefaBtn');
    const saveBtn = document.getElementById('saveTaskBtn');
    const deleteBtn = document.getElementById('deleteTaskBtn');
    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');

    const closePopup = () => {
        overlay.style.display = 'none';
        overlay.classList.remove('active');
        titleInput.value = '';
        descriptionInput.value = '';
        prioritySelect.value = '1';
        dueDateInput.value = '';
    };

    closeBtn.onclick = closePopup;
    cancelBtn.onclick = closePopup;

    // Se tiver taskId, é edição
    if (taskId && taskId > 0) {
        titleElement.textContent = 'Editar Tarefa';
        deleteBtn.style.display = 'flex';
        
        try {
            const taskElement = event.target.closest('.task-menu-item');
            const taskData = {
                Title: taskElement.dataset.title,
                Description: taskElement.dataset.description,
                Priority: taskElement.dataset.priority,
                DueDate: taskElement.dataset.dueDate
            };

            titleInput.value = taskData.Title;
            descriptionInput.value = taskData.Description;
            prioritySelect.value = taskData.Priority;
            dueDateInput.value = taskData.DueDate ? taskData.DueDate.split('T')[0] : '';
        } catch (error) {
            console.error('Erro ao carregar dados da tarefa:', error);
            closePopup();
            return;
        }
    } else {
        titleElement.textContent = 'Nova Tarefa';
        deleteBtn.style.display = 'none';
    }

    deleteBtn.onclick = async () => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            try {
                await requests.DeleteTask(taskId);
                closePopup();
                
                const activeBoard = document.querySelector('.board-item.active');
                if (activeBoard) {
                    activeBoard.click();
                }
            } catch (error) {
                console.error('Erro ao excluir tarefa:', error);
                alert('Erro ao excluir a tarefa');
            }
        }
    };

    saveBtn.onclick = async () => {
        const title = titleInput.value.trim();
        if (!title) {
            alert('Por favor, insira um título para a tarefa');
            return;
        }

        const taskData = {
            Id: taskId || 0,
            Title: title,
            Description: descriptionInput.value.trim(),
            Priority: parseInt(prioritySelect.value),
            DueDate: dueDateInput.value,
            ColumnId: parseInt(columnId),
            IsActive: true
        };

        try {
            if (taskId) {
                await requests.UpdateTask(taskData);
            } else {
                await requests.CreateTask(taskData);
            }
            
            closePopup();
            
            const activeBoard = document.querySelector('.board-item.active');
            if (activeBoard) {
                activeBoard.click();
            }
        } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
            alert('Erro ao salvar a tarefa');
        }
    };

    overlay.style.display = 'flex';
    overlay.classList.add('active');
    titleInput.focus();
};

window.handleTaskMenu = function(event, button) {
    event.preventDefault();
    event.stopPropagation();

    // Fecha todos os outros menus abertos
    document.querySelectorAll('.task-menu.active').forEach(menu => {
        if (menu !== button.nextElementSibling) {
            menu.classList.remove('active');
        }
    });

    // Toggle do menu atual
    const menu = button.nextElementSibling;
    menu.classList.toggle('active');

    // Fecha o menu quando clicar fora dele
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && !button.contains(e.target)) {
            menu.classList.remove('active');
            document.removeEventListener('click', closeMenu);
        }
    };

    document.addEventListener('click', closeMenu);
};

window.handleDeleteTask = async function(event, taskId) {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        try {
            await requests.DeleteTask(taskId);
            
            const activeBoard = document.querySelector('.board-item.active');
            if (activeBoard) {
                activeBoard.click();
            }
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            alert('Erro ao excluir a tarefa');
        }
    }
}; 