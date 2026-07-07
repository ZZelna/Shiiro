document.addEventListener("DOMContentLoaded", () => {

    const steps = document.querySelectorAll(".step");
    const button = document.querySelector(".discord-btn");

    let current = 0;

    function setStep(index){

        steps.forEach((step,i)=>{

            if(i <= index){
                step.classList.add("active");
            }else{
                step.classList.remove("active");
            }

        });

    }

    setStep(0);

    button.addEventListener("mouseenter",()=>{

        button.style.transform="scale(1.02)";

    });

    button.addEventListener("mouseleave",()=>{

        button.style.transform="scale(1)";

    });

    button.addEventListener("click",()=>{

        button.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
        </svg>
        Connexion...
        `;

    });

});
