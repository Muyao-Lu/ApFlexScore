
const gradeTabs = ["middle_school", "freshman", "sophomore", "junior", "senior"];
const gradeStyleInfo = {
                        "middle_school": {"name": "Middle School", "color": "#009cde"},
                        "freshman": {"name": "Freshman", "color": "#0077d9"},
                        "sophomore": {"name": "Sophomore", "color": "#324dc7"},
                        "junior": {"name": "Junior", "color": "#5f3da9"},
                        "senior": {"name": "Senior", "color": "#702f8a"}
                    }

function makeActive(id){
    let domNode =  document.querySelector("#" + id);
    if (domNode.classList.contains("inactive")){
        domNode.classList.remove("inactive");
    }
   
    domNode.classList.add("active");
}

function makeInactive(id){
    let domNode = document.querySelector("#" + id)
    if (domNode.classList.contains("active")){
        domNode.classList.remove("active");
    }
    domNode.classList.add("inactive");
}

function makeAllInactive(id_list){
    for (let id of id_list){
        makeInactive(id);
    }
}

export function toggleVisualGradeTab(target){
    makeAllInactive(gradeTabs);
    makeActive(target);
}

export function showDropDown(){
    const dropdown = document.querySelector("#ap-dropdown")
    if (dropdown.classList.contains("disabled")){
        dropdown.classList.remove("disabled");
        dropdown.classList.add("enabled");
        dropdown.innerHTML = `<div class="dropdown-item" id="initial-prompt">Type to show options</div>`;

    }
   
    
}

export function hideDropDown(){
    const dropdown = document.querySelector("#ap-dropdown")
    if (dropdown.classList.contains("enabled")){
        dropdown.classList.remove("enabled");
        dropdown.classList.add("disabled");
        dropdown.innerHTML = "";
    }
}



export function loadGradeAPs(gradeName){
    document.querySelector("#grade-ap-info").style.display = "block";
    document.querySelector("#grade-access-prompt").style.display = "none";
    document.querySelector("#grade-name").textContent = "APs for " + gradeStyleInfo[gradeName].name + " year"
    document.querySelector("body").style.setProperty("--grade-specific-color", gradeStyleInfo[gradeName].color);

    for (let item of document.querySelectorAll(".ap-row")){
        if (item.dataset.grade == gradeName){
            item.style.display = "block";
        }
        else{
            item.style.display = "none";
        }
    }
    
}

export function toggleScoreButtons(element){
    for (let item of element.parentNode.querySelectorAll(".ap-score-button")){
        item.classList.add("disabled");
        if (item.classList.contains("enabled")){
            item.classList.remove("enabled");
            item.classList.add("disabled");
        }
    }

    element.classList.remove("disabled");
    element.classList.add("enabled")
}

export function toggleBadgeButton(element){
    if (element.classList.contains("enabled")){
        element.classList.remove("enabled");
        element.classList.add("disabled");
    }
    else{
        element.classList.remove("disabled");
        element.classList.add("enabled");
    }
}

function getGridHeight(){
    let table = document.querySelector("#ap-table");
    let container = document.querySelector("#grade-ap-info");

    let apRow = document.createElement("div");
    let apTable = document.querySelector("#ap-table");
    apRow.className = "ap-row sizing";
    apRow.innerHTML = `<div class="ap-name">
                        <span class="ap-icon">Sizing</span>
                        <h2>Sizing</h2>
                    </div>
                    <div class="ap-score-input">
                        <p class="ui-bold-font">Your Score</p>
                        <div class="ap-score-button" data-ap-grade="1">
                            1
                        </div>

                        <div class="ap-score-button" data-ap-grade="2">
                            2
                        </div>
                        
                        <div class="ap-score-button" data-ap-grade="3">
                            3
                        </div>

                        <div class="ap-score-button" data-ap-grade="4">
                            4
                        </div>
                        <div class="ap-score-button" data-ap-grade="5">
                            5
                        </div>
                        <div class="ap-score-button" data-ap-grade="none">
                            N/A
                        </div>
                    </div>
                    <div class="ap-badge-input">
                        <p class="ui-bold-font">Multipliers</p> 
                        <div class="ap-badge-button" data-badge-code="self_study">
                            Self Study<br>
                            <small>Self studied completely</small>
                        </div>
                        <div class="ap-badge-button" data-badge-code="out_of_school">
                            Partial Self Study<br>
                            <small>Got some help from a tutor, but still did the AP outside of school</small>
                        </div>
                        <div class="ap-badge-button" data-badge-code="perfect_score">
                            Perfect Score<br>
                            <small>Only for those rare Perfect Score letters</small>
                        </div>
                    </div>
                    <div class="remove-button">Remove AP</div>`
    

    let needRem = false;
    if (container.style.display == "none"){
        container.style.display = "block";
        needRem = true;
    }
    
    table.appendChild(apRow);
    let height = apRow.offsetHeight;
    apRow.remove();

    if (needRem){
        container.style.display = "none";
    }

    return height;
    
}

export function setGridHeight(){
    let gridHeight = getGridHeight();
    document.querySelector("#add-ap").style.height = gridHeight + "px";
    console.log(gridHeight);
}

export function updateAlertOn(){
    document.querySelector("#update-alert").style.display = "inline-block";
}

export function updateAlertOff(){
    document.querySelector("#update-alert").style.display = "none";
}

export function createApCard(code, grade, name, symbol, obtainedGrade, modifiers){
    let apRow = document.createElement("div");
    apRow.className = "ap-row";
    apRow.dataset.apCode = code;
    apRow.dataset.grade = grade;
    apRow.innerHTML = `<div class="ap-name">
                        <span class="ap-icon">${symbol}</span>
                        <h2>${name}</h2>
                        <span class="flex-score-display">N/A</span>
                    </div>
                    <div class="ap-score-input">
                        <p class="ui-bold-font">Your Score</p>
                        <div class="ap-score-button" data-ap-grade="1">
                            1
                        </div>

                        <div class="ap-score-button" data-ap-grade="2">
                            2
                        </div>
                        
                        <div class="ap-score-button" data-ap-grade="3">
                            3
                        </div>

                        <div class="ap-score-button" data-ap-grade="4">
                            4
                        </div>
                        <div class="ap-score-button" data-ap-grade="5">
                            5
                        </div>
                        <div class="ap-score-button" data-ap-grade="none">
                            N/A
                        </div>
                    </div>
                    <div class="ap-badge-input">
                        <p class="ui-bold-font">Multipliers</p> 
                        <div class="ap-badge-button" data-badge-code="self_study">
                            Self Study<br>
                            <small>Self studied completely</small>
                        </div>
                        <div class="ap-badge-button" data-badge-code="out_of_school">
                            Partial Self Study<br>
                            <small>Got some help from a tutor, but still did the AP outside of school</small>
                        </div>
                        <div class="ap-badge-button" data-badge-code="perfect_score">
                            Perfect Score<br>
                            <small>Only for those rare Perfect Score letters</small>
                        </div>
                    </div>
                    <div class="remove-button button">Remove AP</div>`
    
    if (obtainedGrade){
        try{
            apRow.querySelector(`[data-ap-grade="${obtainedGrade}"]`).classList.add("enabled");
        }
        catch (e){
            apRow.querySelector(`[data-ap-grade="none"]`).classList.add("enabled");
            console.error(e);
        }
        
    }
    else{
        apRow.querySelector(`[data-ap-grade="none"]`).classList.add("enabled");
    }

    if (modifiers){
        for (let modifier of modifiers){
            try{
                apRow.querySelector(`[data-badge-code="${modifier}"]`).classList.add("enabled");
            }
            catch (e){
                console.error(e);
            }
        }
    }
    
    return apRow;
}

export function enterLoading(){
    document.querySelector("#loading-text").style.display = "flex";
}

export function exitLoading(){
    document.querySelector("#loading-text").style.display = "none";
}

export function createSecretMessage(element, text, index=1){
    /* The main purpose of AP is to flex. Getting into a good university is just a byproduct*/
    if (index >= text.length){
        element.textContent = text.slice(0, index);
        setTimeout(() => element.textContent = "", 2000);
        return;
    }

    element.textContent = text.slice(0, index);
    setTimeout(() => createSecretMessage(element, text, index+1), 50);

}
