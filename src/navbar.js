export default function navbar()
{
    const nav=document.querySelector("#navbar");
    nav.innerHTML=`
    <div class="logo-container">
            <img src="../assets/new_logo.jpeg" alt="Bharat Rail Logo" class="logo">
        </div>
        <ul class="nav-links">
            <li><a href="../index.html">Home</a></li>
            <li><a href="login.html" id="nav-login-link">Login</a></li>
            <li><a href="#">Bookings</a></li>
            <li><a href="#">Contact</a></li>
        </ul>
        <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
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