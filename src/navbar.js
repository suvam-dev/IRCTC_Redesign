function initUI() {
    const isPage = window.location.pathname.includes("/pages/");
    const basePath = isPage ? "../" : "./";
    const pagesPath = isPage ? "./" : "./pages/";

    injectNavbar(basePath, pagesPath);
    injectFooter(basePath, pagesPath);

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function injectNavbar(basePath, pagesPath) {
    const nav = document.querySelector(".navbar");
    if (!nav) return;

    nav.innerHTML = `
        <div class="logo-container ">
            <img class="rounded-full" src="${basePath}assets/logo.png" alt="Bharat Rail Logo" class="logo">
        </div>
        <ul class="nav-links">
            <li><a href="${basePath}index.html">Home</a></li>
            <li><a href="${pagesPath}login.html" id="nav-login-link">Login</a></li>
            <li><a href="${pagesPath}wheremytrain.html">Bookings</a></li>
            <li><a href="${pagesPath}searchresult.html">Route Search</a></li>
        </ul>
        <div class="hamburger">
            <i class="fa-solid fa-bars"></i>
        </div>
    `;

    const hamburger = nav.querySelector(".hamburger");
    const navLinks = nav.querySelector(".nav-links");
    if (hamburger && navLinks) {
        hamburger.onclick = () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        };
    }
}

function injectFooter(basePath, pagesPath) {
    const footer = document.querySelector(".footer");
    if (!footer) return;

    footer.innerHTML = `
      
        <div class="footer-container">
            <div class="footer-col brand-col">
                <h2 class="footer-logo rounded-full">
                    <img src="${basePath}assets/logo.png" alt="Bharat Rail Logo" class="footer-logo-img rounded-full">
                </h2>
                <p>BharatRail.com is an official partner of IRCTC to book train tickets and railway inquiries.</p>
            </div>
            <div class="footer-col">
                <h3>Book</h3>
                <ul>
                    <li><a href="#">IRCTC Tickets</a></li>
                    <li><a href="#">Flights</a></li>
                    <li><a href="#">Hotels</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Features</h3>
                <ul>
                    <li><a href="${pagesPath}searchresult.html">PNR Status</a></li>
                    <li><a href="${pagesPath}wheremytrain.html">Train Running Status</a></li>
                    <li><a href="${pagesPath}searchresult.html">Train Schedule</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>About BharatRail</h3>
                <ul>
                    <li><a href="#">Contact Us</a></li>
                    <li><a href="#">Media Kit</a></li>
                    <li><a href="#">Alliances</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Legal</h3>
                <ul>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms & Conditions</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Follow us</h3>
                <div class="social-icons">
                    <a href="#" title="Facebook"><i class="fa-brands fa-facebook"></i></a>
                    <a href="#" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#" title="Twitter / X"><i class="fa-brands fa-x-twitter"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom flex justify-center">
            <p>© 2026 BharatRail.com. All Rights Reserved.</p>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", initUI);
