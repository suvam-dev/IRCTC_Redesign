export default function navbar()
{
    const nav = document.querySelector(".navbar");
    if (!nav) return; // Prevent crashing if navbar isn't found
    
    const isRoot = !window.location.pathname.includes('/pages/');
    const basePath = isRoot ? "./" : "../";
    const pagesPath = isRoot ? "./pages/" : "./";
    
    // Only inject innerHTML if it's currently empty, to avoid overwriting the manual HTML if it exists
    if (!nav.innerHTML.trim() || nav.children.length === 0) {
        nav.innerHTML = `
        <div class="logo-container">
                <img src="${basePath}assets/new_logo.jpeg" alt="Bharat Rail Logo" class="logo">
            </div>
            <ul class="nav-links">
                <li><a href="${basePath}index.html">Home</a></li>
                <li><a href="${pagesPath}login.html" id="nav-login-link">Login</a></li>
                <li><a href="${pagesPath}wheremytrain.html">Bookings</a></li>
                <li><a href="${pagesPath}contact.html">Contact</a></li>
            </ul>
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
            `;
    }
    
    const hamburger = nav.querySelector(".hamburger");
    const navLinks = nav.querySelector(".nav-links");
    if (hamburger && navLinks) {
        hamburger.onclick = () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        };
    }
}