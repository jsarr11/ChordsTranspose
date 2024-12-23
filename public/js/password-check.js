// Define the password as a constant
const PASSWORD = "1234";

// Get elements
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submit-password");
const errorMessage = document.getElementById("error-message");
const passwordContainer = document.getElementById("password-container");
const content = document.getElementById("content");

// Check if the user is already authenticated in this session
if (sessionStorage.getItem("authenticated") === "true") {
    // If authenticated, show the content directly
    passwordContainer.style.display = "none";
    content.style.display = "block";
}

// Add event listener for password submission
submitButton.addEventListener("click", () => {
    const enteredPassword = passwordInput.value;
    if (enteredPassword === PASSWORD) {
        // Save authentication status in Session Storage
        sessionStorage.setItem("authenticated", "true");

        // Hide password container and show the content
        passwordContainer.style.display = "none";
        content.style.display = "block";
    } else {
        // Show error message for incorrect password
        errorMessage.style.display = "block";
    }
});
