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
    CreateBoard: async (data) => {
        const response = await fetch(`${BASE_URL}/Board`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    GetTasksByColumnId: async (columnId) => {
        const response = await fetch(`${BASE_URL}/TasksByColumnId?ColumnId=${columnId}`);
        return await response.json();
    }
};

export default requests;