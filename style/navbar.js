document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            // Toggle hamburger animation
            hamburger.classList.toggle("active");
            // Toggle menu visibility
            navLinks.classList.toggle("active");
        });
    }

    // Optional logic to update "Login" to "Account" if logged in
    // For demonstration purposes, this can be triggered by a specific event or local storage
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if(isLoggedIn) {
        const loginLink = document.getElementById("nav-login-link");
        if(loginLink) {
            loginLink.textContent = "Account";
            loginLink.href = "#account"; // Or the account page URL
        }
    }
});
