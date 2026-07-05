


export function initializeJson(){
    let data_json = {};
    data_json["middle_school"] = {};
    data_json["freshman"] = {};
    data_json["sophomore"] = {};
    data_json["junior"] = {};
    data_json["senior"] = {};

    return data_json;

}

function strToInt(string){
    if (Number.isNaN(+ string)){
        return null
    }
    else{
        return + string;
    }
    
}

export function serialize(){
    let data = initializeJson();
    for (let item of document.querySelectorAll(".ap-row")){
        let score = null;
        let grade = item.dataset.grade;
        let modifiers = [];
        let apName = item.dataset.apCode
        for (let score_display of item.querySelectorAll(".ap-score-button")){
            if (score_display.classList.contains("enabled")){
                score = strToInt(score_display.dataset.apGrade);
            }
        }

        for (let badge_display of item.querySelectorAll(".ap-badge-button")){
            if (badge_display.classList.contains("enabled")){
                modifiers.push(badge_display.dataset.badgeCode);
            }
            
        }

        data[grade][apName] = {"score": score, "modifiers": modifiers};
    }
    return data;
}

export function save(){
    let data = JSON.stringify(serialize());
    console.log(`Saved ${data}`);
    localStorage.setItem("ap_data", data);
}

export function load(){
    let data = JSON.parse(localStorage.getItem("ap_data"));
    console.log(`Loaded ${data}`);
    return data;
}

export function saveScore(scoreJson){
    console.log(`Saved score ${JSON.stringify(scoreJson)}`);
    localStorage.setItem("ap_scoring", JSON.stringify(scoreJson));
}

export function loadScore(){
    let score = JSON.parse(localStorage.getItem("ap_scoring"));
    console.log(`Loaded score ${score}`);
    return score;
}