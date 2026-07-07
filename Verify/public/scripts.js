document.addEventListener("DOMContentLoaded", () => {

    const steps = document.querySelectorAll(".step");
    const button = document.querySelector(".discord-btn");

    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";

    function setStep(index) {
        steps.forEach((step, i) => {
            if (i <= index) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }
        });
    }

    setStep(0);

    window.captchaSuccess = () => {
        setStep(1);

        button.disabled = false;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
    };

    button.addEventListener("mouseenter", () => {
        if (!button.disabled) {
            button.style.transform = "scale(1.02)";
        }
    });

    button.addEventListener("mouseleave", () => {
        button.style.transform = "scale(1)";
    });

    button.addEventListener("click", () => {
        if (button.disabled) return;

        setStep(2);

        button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
        </svg>
        Connexion...
        `;
    });

});
