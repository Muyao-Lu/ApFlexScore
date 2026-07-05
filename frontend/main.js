import {serialize, initializeJson, save, load, saveScore, loadScore} from "./convert.js";
import {enterLoading, exitLoading, createApCard, updateAlertOn, updateAlertOff, setGridHeight, showDropDown, 
    hideDropDown, toggleVisualGradeTab, loadGradeAPs, toggleBadgeButton, toggleScoreButtons} from "./styling.js";
{
const apData = {
    "Comp Sci Principles": { code: "comp_sci_principles", symbol: "💻" },
    "Psychology": { code: "psychology", symbol: "🧠" },
    "Comp Sci A": { code: "comp_sci_a", symbol: "🖥️" },
    "Human Geography": { code: "human_geography", symbol: "🌍" },
    "Environmental Science": { code: "environmental_science", symbol: "🌱" },
    "United States Government and Politics": { code: "us_gov_politics", symbol: "🏛️" },
    "Microeconomics": { code: "microeconomics", symbol: "📉" },
    "Macroeconomics": { code: "macroeconomics", symbol: "📈" },
    "Statistics": { code: "statistics", symbol: "📊" },
    "Art History": { code: "art_history", symbol: "🖼️" },
    "English Language and Composition": { code: "english_language", symbol: "✍️" },
    "Calculus AB": { code: "calculus_ab", symbol: "➗" },
    "Calculus BC": { code: "calculus_bc", symbol: "📐" },
    "United States History": { code: "us_history", symbol: "📜" },
    "World History": { code: "world_history", symbol: "🌎" },
    "Biology": { code: "biology", symbol: "🧬" },
    "European History": { code: "european_history", symbol: "🏰" },
    "Music Theory": { code: "music_theory", symbol: "🎵" },
    "Physics 2": { code: "physics_2", symbol: "⚛️" },
    "Physics 1": { code: "physics_1", symbol: "🔭" },
    "English Literature and Composition": { code: "english_lit", symbol: "📚" },
    "Chemistry": { code: "chemistry", symbol: "🧪" },
    "Physics C: Mechanics": { code: "physics_c_mech", symbol: "⚙️" },
    "Physics C: E&M": { code: "physics_c_em", symbol: "🔌" },
    "Precalculus": { code: "precalculus", symbol: "📏" },
    "Seminar": { code: "seminar", symbol: "💬" },
    "Research": { code: "research", symbol: "🔍" },
    "Comparative Gov. and Politics": { code: "us_comparative_gov", symbol: "🌐" }
};
const gradeTabs = ["middle_school", "freshman", "sophomore", "junior", "senior"];

let createApAllowed = false;
let currentActiveGrade = null;
let apCount = 0;
const mode = "deployment"


function normalizeText(text){
    return text.replaceAll(" ", "").toLowerCase();
}

function autoCompleteAPs(current_text){
    createApAllowed = false;
    let results = []
    const dropdown = document.querySelector("#ap-dropdown");
    for (let item of Object.keys(apData)){
        
        if (normalizeText(item).startsWith(normalizeText(current_text))){
            results.push(item); 
        }
    }
    if (results.length > 5){
        results = results.slice(0, 5);
    }
    
    dropdown.innerHTML = "";

    for (let item of results){
        let divItem = document.createElement("div");
        divItem.className = "dropdown-item";
        divItem.textContent = item;
        divItem.addEventListener("click", () => autoCompleteApName(item))
        dropdown.appendChild(divItem);

        
    }
}

function autoCompleteApName(apName){
    document.querySelector("#add-ap-name").value = apName;
    createApAllowed = true;
}


function confirmAddApRow(apName){
    if (Object.keys(apData).indexOf(apName) == -1 || ! createApAllowed){
        return;
    }
    ap_name_input.value = "";

    const apTable = document.querySelector("#ap-table");
    const apRow = createApCard(apData[apName].code, currentActiveGrade, 
                                      apName, apData[apName].symbol, null, null);

    apTable.insertBefore(apRow, apTable.children[apTable.children.length - 1]);
    for (let item of apRow.querySelectorAll(".ap-score-button")){
        item.addEventListener("click", () => toggleScoreButtons(item));
    }
    for (let item of apRow.querySelectorAll(".ap-badge-button")){
        item.addEventListener("click", () => toggleBadgeButton(item));
    }
    apRow.querySelector(".remove-button").addEventListener("click", () => {apRow.remove(); apCount --; updateAlertOn()});
    apCount ++;
    updateAlertOn();
}


async function getScoring(json){
    let endpoint;
    if (mode == "testing"){
        endpoint = "http://127.0.0.1:8000/grade";
    }
    else{
        endpoint = "https://ap-flex-score.vercel.app/grade";
    }
    try{
       

        const response = await fetch(endpoint, {
            headers: {
                "Content-Type": "application/json",
            }, 
            method: "POST",
            body: JSON.stringify({"ap_data": json})
        })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        
        return result;


    }
    catch (error){
        console.error(error.message)
    }
}

function updateFlexBreakdown(json){
    for (let item of document.querySelectorAll(".flex-score-display")){
        item.textContent = "NC";
        item.title = "Not counted. A more recent AP was found with the same information that was used instead.";
    }

    for (let item of Object.keys(json.aggregate)){
        let current_ap = json.aggregate[item];
        let element = document.querySelector(`[data-ap-code="${current_ap.ap}"][data-grade="${current_ap.grade_taken}"]`);
        
        let flex_display = element.querySelector(".flex-score-display");
        flex_display.textContent = Math.round(current_ap.score * 10)/10;
        flex_display.title = "This is the particular AP's contribution to the total flex score";

    }
}

function loadDOM(){
    const json = load();
    const apTable = document.querySelector("#ap-table");

    
    for (let grade of Object.keys(json)){
        for (let apCode of Object.keys(json[grade])){

            let apName;
            for (let key of Object.keys(apData)){
                if (apData[key].code == apCode){
                    apName = key;
                }
            }

            let apRow = createApCard(apCode, grade, 
                                    apName, apData[apName].symbol, 
                                    json[grade][apCode].score, json[grade][apCode].modifiers);
            apTable.insertBefore(apRow, apTable.children[apTable.children.length - 1]);
            for (let item of apRow.querySelectorAll(".ap-score-button")){
                item.addEventListener("click", () => toggleScoreButtons(item));
            }
            for (let item of apRow.querySelectorAll(".ap-badge-button")){
                item.addEventListener("click", () => toggleBadgeButton(item));
            }
            apRow.querySelector(".remove-button").addEventListener("click", () => {apRow.remove(); apCount --; updateAlertOn()});
            apCount ++;
        }
    }
}

function transferCertificateData(w){
    w.addEventListener("DOMContentLoaded", () => w.injectData(loadScore()))
}

const grade_access_buttons = document.querySelectorAll(".grade-access-button");
const ap_name_input = document.querySelector("#add-ap-name");
const tab_buttons = document.querySelectorAll(".navbutton");
const ap_score_buttons = document.querySelectorAll(".ap-score-button");
const ap_badge_buttons = document.querySelectorAll(".ap-badge-button");


ap_name_input.addEventListener("input", function(event){autoCompleteAPs(event.target.value)});
document.querySelector("#add-ap-confirm").addEventListener("click", () => confirmAddApRow(ap_name_input.value));

for (let item of ap_score_buttons){
    item.addEventListener("click", () => {
        toggleScoreButtons(item);
        updateAlertOn();
    });
}

for (let item of ap_badge_buttons){
    item.addEventListener("click", () => {
        toggleBadgeButton(item);
        updateAlertOn();
    });
}

for (let item of gradeTabs){
    document.querySelector("#" + item).addEventListener("click", () => {
        toggleVisualGradeTab(item); 
    });
}


for (let button of grade_access_buttons){
    
    
    button.addEventListener("click", () => {
        currentActiveGrade=button.dataset.grade;
        loadGradeAPs(currentActiveGrade);
    });
}

for (let button of tab_buttons){
    button.addEventListener("click", () => {
        save();
        let newWindow = window.open(button.dataset.url, button.dataset.target);
        if (button.dataset.function){
            if (button.dataset.function == "transferCertificateData"){
                transferCertificateData(newWindow);
            }
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    loadDOM();
    setGridHeight(); 
    window.addEventListener("resize", setGridHeight)
})

ap_name_input.addEventListener("focus", showDropDown);
ap_name_input.addEventListener("focusout", () => setTimeout(hideDropDown, 500));
document.querySelector("#submit").addEventListener("click", async () => {
    enterLoading();
    let result = await getScoring(serialize()); 
    setTimeout(() => {
        if (result){
            document.querySelector("#flex-score.data").textContent = Math.round(result.aggregate_total * 10)/10;
            document.querySelector("#ap-count.data").textContent = apCount;
            updateFlexBreakdown(result);
            saveScore(result);
            exitLoading();
        }
        
    }, 1500);
    
    updateAlertOff();

});
setInterval(save, 1000);

}