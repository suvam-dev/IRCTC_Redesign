
function navbar() {
    // Determine relative path base (root vs pages folder)
    const isInsidePages = window.location.pathname.includes('/pages/');
    const basePath = isInsidePages ? '../' : './';
    const pagePrefix = isInsidePages ? '' : 'pages/';

    const navItems = [
        { title: "Home", link: `${basePath}index.html` },
        { title: "Where is my train", link: `${basePath}${pagePrefix}wheremytrain.html` },
        { title: "PNR Status", link: `${basePath}${pagePrefix}pnrstatus.html` },
        { title: "Train Schedule", link: `${basePath}${pagePrefix}trainschedule.html` },
        { title: "Login", link: `${basePath}${pagePrefix}login.html`, id: "nav-login-link" },
        { title: "Bookings", link: "#" },
        { title: "Contact", link: "#" }
    ];

    const navLinksHTML = navItems.map(item => 
        `<li><a href="${item.link}" ${item.id ? `id="${item.id}"` : ''}>${item.title}</a></li>`
    ).join('');

    const navbarContainer = document.getElementById("navbar");
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <div class="logo-container">
                <img src="${basePath}assets/new_logo.jpeg" alt="Bharat Rail Logo" class="logo">
            </div>
            <ul class="nav-links">
                ${navLinksHTML}
            </ul>
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        // Attach hamburger logic
        const hamburger = navbarContainer.querySelector(".hamburger");
        const navLinks = navbarContainer.querySelector(".nav-links");
        if (hamburger && navLinks) {
            hamburger.onclick = () => {
                hamburger.classList.toggle("active");
                navLinks.classList.toggle("active");
            };
        }
    }
}

// Call navbar on load
document.addEventListener("DOMContentLoaded", navbar);