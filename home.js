// Open Tracker Button

document.getElementById("openTracker").addEventListener("click", () => {

    window.location.href = "tracker.html";

});


// Smooth scrolling for navigation

document.querySelectorAll('nav a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(e){

        e.preventDefault();

        document.querySelector(this.getAttribute("href"))
            .scrollIntoView({
                behavior: "smooth"
            });

    });

});


// Fade-in animation for cards

const cards = document.querySelectorAll(".card, .use-box");

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.style.opacity="1";
            entry.target.style.transform="translateY(0)";

        }

    });

});

cards.forEach(card=>{

    card.style.opacity="0";
    card.style.transform="translateY(40px)";
    card.style.transition="0.7s";

    observer.observe(card);

});
