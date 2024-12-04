const BASE_URL = 'https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard';

const requests = {
    GetColumnsByBoardId: async (boardId) => {
        const response = await fetch(`${BASE_URL}/ColumnByBoardId?BoardId=${boardId}`);
        return await response.json();
    },
    GetBoards: async () => {
        const response = await fetch(`${BASE_URL}/Boards`);
        return await response.json();
    },
    CreateBoard: async (boardData) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;

            if (!userId) {
                throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
            }

            const formattedData = {
                Id: 0,
                Name: boardData.Name,
                Description: boardData.Description || "",
                Color: boardData.Color,
                IsActive: true,
                Position: boardData.Position || 0,
                PersonId: userId,
                CreatedBy: userId
            };

            console.log('Dados formatados:', formattedData);

            const response = await fetch(`${BASE_URL}/Board`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Erro detalhado:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: responseData
                });
                return { ok: false, data: responseData };
            }

            return { ok: true, data: responseData };
        } catch (error) {
            console.error('Erro ao criar quadro:', error);
            throw error;
        }
    },
    GetTasksByColumnId: async (columnId) => {
        const response = await fetch(`${BASE_URL}/TasksByColumnId?ColumnId=${columnId}`);
        return await response.json();
    }
};

export default requests;