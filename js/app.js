const API_BASE_URL = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard";
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const errorMessage = document.getElementById("error-message");
const themeToggleButton = document.getElementById("theme-toggle");

// Adiciona o evento de alternância de tema
themeToggleButton.addEventListener("change", toggleTheme);

// Verifica a preferência de tema ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(savedTheme);
    themeToggleButton.checked = savedTheme === "dark-theme"; // Define o estado do toggle
  } else {
    document.body.classList.add("light-theme");
    themeToggleButton.checked = false;
  }
});

// Função para alternar entre o tema light e dark
function toggleTheme() {
  const currentTheme = document.body.classList.contains("light-theme") ? "light-theme" : "dark-theme";
  const newTheme = currentTheme === "light-theme" ? "dark-theme" : "light-theme";
  
  document.body.classList.remove(currentTheme);
  document.body.classList.add(newTheme);

  localStorage.setItem("theme", newTheme);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  console.log("Email informado:", email);

  if (!validateEmail(email)) {
    showError("Por favor, informe um email válido.");
    return;
  }

  const submitButton = loginForm.querySelector("button");
  disableButton(submitButton, true);

  try {
    const url = `${API_BASE_URL}/People?Email=${encodeURIComponent(email)}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        showError("Email não encontrado. Verifique e tente novamente.");
      } else {
        showError("Erro ao validar o email. Tente novamente.");
      }
      return;
    }

    const users = await response.json();
    const user = users.find(u => u.Email.toLowerCase() === email.toLowerCase());

    if (!user) {
      showError("Usuário não encontrado. Verifique o email informado.");
      return;
    }

    localStorage.setItem("user", JSON.stringify({ id: user.Id, email: user.Email }));
    window.location.href = "telainicial.html";

  } catch (error) {
    showError("Não foi possível conectar ao servidor. Tente novamente.");
  } finally {
    disableButton(submitButton, false);
  }
});

// Função para validar o email com regex
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Função para desativar ou ativar o botão
function disableButton(button, disable) {
  button.disabled = disable;
  button.textContent = disable ? "Carregando..." : "Acessar";
}

// Função para exibir mensagens de erro
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}