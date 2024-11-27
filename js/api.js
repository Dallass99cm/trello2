const API_BASE_URL = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/";

const request = async (endpoint, method = "GET", body = null) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(
                `Erro na requisição ${method} ${endpoint} | Status: ${response.status} | Mensagem: ${errorMessage}`
            );
        }

        return response.json();
    } catch (error) {
        console.error(`Erro na API: ${error.message}`);
        throw error;
    }
};

const requests = {
    GetColumnsByBoardId: async (boardId) => {
        if (!boardId || isNaN(boardId)) {
            throw new Error("BoardId inválido. Certifique-se de que é um número.");
        }
        return request(`ColumnByBoardId?BoardId=${boardId}`, "GET");
    },
    GetBoards: async () => request("Boards"),
    CreateBoard: async (board) => request("Board", "POST", board),
};

export default requests;