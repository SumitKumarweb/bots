const socket = io();
const clientsTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messageTone = new Audio("/message-tone.mp3");
const loginDiv = document.getElementById("login");
const mainDiv = document.getElementById("main");
const usernameInput = document.getElementById("username");
const loginButton = document.getElementById("login-button");
const title = document.getElementById("title");
// Handle login
loginButton.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username) {
    socket.emit("login", username);
    loginDiv.style.display = "none";
    title.classList.add("rm")
    clientsTotal.style.display = "none";
    mainDiv.style.display = "block";
    nameInput.value = username;
  }
});

// Handle message form submission
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

// Update total clients connected
socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

// Notify when a user connects
socket.on("user-connected", (username) => {
  const element = `<li class="message-feedback"><p class="feedback">${username} joined the chat</p></li>`;
  messageContainer.innerHTML += element;
  scrollToBottom();
});

// Notify when a user disconnects
socket.on("user-disconnected", (username) => {
  const element = `<li class="message-feedback"><p class="feedback">${username} left the chat</p></li>`;
  messageContainer.innerHTML += element;
  scrollToBottom();
});

// Send a message
function sendMessage() {
  const message = messageInput.value.trim();
  if (message === "") return;

  const data = {
    name: nameInput.value,
    message: message,
    dateTime: new Date(),
  };

  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

// Display a received message
socket.on("chat-message", (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

// Add message to the UI
function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
      <p class="message">
        ${data.message} <br>
        <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>
  `;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

// Scroll the message container to the bottom
function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Handle typing feedback
messageInput.addEventListener("focus", () => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", () => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("blur", () => {
  socket.emit("feedback", {
    feedback: "",
  });
});

// Display typing feedback
socket.on("feedback", (data) => {
  clearFeedback();
  if (data.feedback) {
    const element = `
      <li class="message-feedback">
        <p class="feedback" id="feedback">${data.feedback}</p>
      </li>
    `;
    messageContainer.innerHTML += element;
  }
});

// Clear feedback messages
function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
