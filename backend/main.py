from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, AfterValidator
from score_calculations import calculate_score
from typing import Annotated
from copy import deepcopy
import json

mode = "deployment"
app = FastAPI()

with open("apscores.json", "r") as f:
    raw_scores_json = json.load(f)

with open("multipliers.json", "r") as f:
    multipliers_json = json.load(f)

origins = [
    "*", # Change once we get a domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def has_valid_data(data: dict) -> dict:
    valid_keys = ["middle_school", "freshman", "sophomore", "junior", "senior"]
    valid_aps = list(raw_scores_json.keys())
    valid_multipliers = list(multipliers_json.keys())
    for grade in data.keys():
        if grade not in valid_keys:
            raise ValueError("{key} not a valid grade".format(key=grade))
        else:
            for ap in data[grade].keys():
                if ap not in valid_aps:
                    raise ValueError("{ap} is not a valid course!".format(ap=ap))
                else:
                    for modifier in data[grade][ap]["modifiers"]:
                        if modifier not in valid_multipliers:
                            raise ValueError("{mult} is not a valid modifier!".format(mult=modifier))


    return data

def remove_duplicates(data: dict):
    seen = set()
    data_copy = deepcopy(data)
    no_score_aps = {"middle_school": {},
                    "freshman": {},
                    "sophomore": {},
                    "junior": {},
                    "senior": {}}
    for grade in list(data.keys())[::-1]:
        for ap in data[grade].keys():
            if data[grade][ap]["score"] is not None:
                if ap not in seen:
                    seen.add(ap)
                else:
                    data_copy[grade].pop(ap)
            else:
                no_score_aps[grade][ap] = data[grade][ap]
                data_copy[grade].pop(ap)

    for grade in no_score_aps.keys():
        for ap in no_score_aps[grade].keys():
            if ap in seen:
                pass
            else:
                data_copy[grade][ap] = no_score_aps[grade][ap]
                seen.add(ap)

    return data_copy



class ScoreRequestModel(BaseModel):
    """
        :param ap_data: Json containing APs in the following format
        {
          "middle_school": {"AP taken in grade 8 or earlier": {"score": score/None if not yet received, "modifiers": [...]}}
          "freshman": {"AP taken in grade 9": {"score": score/None if not yet received, "modifiers": [...]}},
          "sophomore": {"AP taken in grade 10": {"score": score/None if not yet received, "modifiers": [...]}},
          "junior": {"AP taken in grade 11": {"score": score/None if not yet received, "modifiers": [...]}},
          "senior": {"AP taken in grade 12": {"score": score/None if not yet received, "modifiers": [...]}}
        }
        :return: Dict with the following information
        {
          "raw": {"ap1": raw score, "ap2": raw score} or None,
          "aggregate": {"ap1": weighted, "ap2": weighted} or None,
          "raw_total": total raw score,
          "aggregate_total": total aggregate score,
          "error": None
        }
    """
    ap_data: Annotated[dict, AfterValidator(has_valid_data)]

@app.post("/grade")
def generate_grade(aps: ScoreRequestModel):
    try:
        return calculate_score(remove_duplicates(aps.ap_data), raw_scores_json, multipliers_json)
    except Exception as e:
        return {"raw": None,
                "aggregate": None,
                "raw_total": None,
                "aggregate_total": None,
                "top": None,
                "error": str(e)
                }

if mode == "testing":
    if __name__ == "__main__":
        uvicorn.run(app)



