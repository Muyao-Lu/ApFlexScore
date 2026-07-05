let data;
const tab_buttons = document.querySelectorAll(".navbutton");

const apNameMappings = {"comp_sci_principles": "Comp Sci Principles", 
                        "psychology": "Psychology", 
                        "comp_sci_a": "Comp Sci A", 
                        "human_geography": "Human Geography", 
                        "environmental_science": "Environmental Science", 
                        "us_gov_politics": "United States Government and Politics", 
                        "microeconomics": "Microeconomics", 
                        "macroeconomics": "Macroeconomics", 
                        "statistics": "Statistics", 
                        "art_history": "Art History", 
                        "english_language": "English Language and Composition", 
                        "calculus_ab": "Calculus AB", 
                        "calculus_bc": "Calculus BC", 
                        "us_history": "United States History", 
                        "world_history": "World History", 
                        "biology": "Biology", 
                        "european_history": "European History", 
                        "music_theory": "Music Theory", 
                        "physics_2": "Physics 2", 
                        "physics_1": "Physics 1", 
                        "english_lit": "English Literature and Composition", 
                        "chemistry": "Chemistry", 
                        "physics_c_mech": "Physics C: Mechanics", 
                        "physics_c_em": "Physics C: E&M", 
                        "precalculus": "Precalculus", 
                        "seminar": "Seminar", 
                        "research": "Research", 
                        "us_comparative_gov": "Comparative Gov. and Politics", 
                        "spanish_language": "Spanish Language and Culture"};

function injectData(json){
    data = json;
}

function customizeCertificate(){
    if (data){
        document.querySelector("#flex-score-display").textContent = Math.round(data.aggregate_total * 100) / 100;
        document.querySelector("#flex-score-raw-display").textContent = Math.round(data.raw_total * 100) / 100;
        const topApsElement = document.querySelectorAll(".flex-score-top");
        const topApKeys = Object.keys(data.top)
        for (let i = 0; i < topApKeys.length; i++){
            topApsElement[i].innerHTML = `<span id="score-${i+1}">#${i+1} </span> AP ${apNameMappings[topApKeys[i]]} (${Math.round(data.top[topApKeys[i]] * 100) / 100})`;

        }
    }
    else{
        document.querySelector("#flex-score-display").textContent = "No score yet!";
    }
    
}

function createCertificatePrint(){
    
    const newStyles = document.createElement("link");
    newStyles.rel = "stylesheet";
    newStyles.href = "print_styles.css";
    document.querySelector("head").appendChild(newStyles);
    document.querySelector("#certificate h1").textContent = `${document.querySelector("#name").value}'s Flex Score`;
    setTimeout(print, 100);

    window.addEventListener("afterprint", ()=>window.close());
    

}

let customizeInterval = setInterval(() => {
    if (data !== undefined){
        customizeCertificate();
        clearInterval(customizeInterval);
        document.querySelector("#submit").addEventListener("click", createCertificatePrint);

    }
    for (let button of tab_buttons){
    button.addEventListener("click", () => {
        if (button.dataset.url){
            window.open(button.dataset.url, button.dataset.target);
        }
        
    });
}
}, 10);

