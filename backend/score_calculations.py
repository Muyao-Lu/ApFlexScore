from math import e
from copy import deepcopy
import json

MAX_PAIRWISE_SIM = 0.97998935
MIN_PAIRWISE_SIM = 0.15854637
with open("embeddings.json", "r") as f:
    embeddings_json = json.load(f)

def cosine_similarity_normalized(a, b):
    assert len(a) == len(b)
    dot_product = 0
    mag_a = 0
    mag_b = 0
    for i in range(len(a)):
        dot_product += a[i] * b[i]
        mag_a += a[i] ** 2
        mag_b += b[i] ** 2

    mag_a = mag_a ** 0.5
    mag_b = mag_b ** 0.5
    res = dot_product / (mag_a * mag_b)

    return (res - MIN_PAIRWISE_SIM)/(MAX_PAIRWISE_SIM - MIN_PAIRWISE_SIM)



def calculate_debuff(ap1, ap2):
    similarity = cosine_similarity_normalized(embeddings_json[ap1], embeddings_json[ap2])
    try:
        debuff_percent = (e**(4.2*similarity) - 1)/(e**4.2 - 1)
    except ZeroDivisionError:
        debuff_percent = 0
    except Exception as error:
        print(error)
        debuff_percent = 0

    return debuff_percent

def apply_all_sim_debuffs(list_of_aps):
    list_of_aps_c = deepcopy(list_of_aps)
    for base_index in range(len(list_of_aps_c)):
        for second_index in range(base_index+1, len(list_of_aps_c)):
            debuff = calculate_debuff(list_of_aps_c[base_index]["ap"], list_of_aps_c[second_index]["ap"])
            if debuff > 0.05:
                if list_of_aps_c[base_index]["score"] < list_of_aps_c[second_index]["score"]:
                    list_of_aps_c[base_index]["score"] *= (1-debuff)
                    print("Debuffed", list_of_aps_c[base_index], "by", debuff)
                else:
                    list_of_aps_c[second_index]["score"] *= (1 - debuff)
                    print("Debuffed", list_of_aps_c[second_index], "by", debuff)
            else:
                pass
    return list_of_aps_c

def apply_buffs(list_of_aps, multipliers_json):
    list_of_aps_c = deepcopy(list_of_aps)
    for ap in list_of_aps_c:
        if ap["grade_taken"] in ["freshman", "sophomore", "middle_school"]:
            ap["score"] *= multipliers_json[ap["grade_taken"]]["multiplier"]
        else:
            pass

        for item in ap["modifiers"]:
            if item in ["self_study", "out_of_school", "high_average", "perfect_score", "med_average"]:
                ap["score"] *= multipliers_json[item]["multiplier"]
            else:
                pass

    return list_of_aps_c

def calculate_score(aps: dict, raw_scores_json, multipliers_json) -> dict:
    """
    :param aps: Json containing APs in the following format
    {
      "middle_school": {"AP taken in grade 8 or earlier": {"score": score/None if not yet received, "modifiers": [...]}}
      "freshman": {"AP taken in grade 9": {"score": score/None if not yet received, "modifiers": [...]}},
      "sophomore": {"AP taken in grade 10": {"score": score/None if not yet received, "modifiers": [...]}},
      "junior": {"AP taken in grade 11": {"score": score/None if not yet received, "modifiers": [...]}},
      "senior": {"AP taken in grade 12": {"score": score/None if not yet received, "modifiers": [...]}}
    }

    :param raw_scores_json: For internal use only. Dict of AP Scores
    :param multipliers_json: For internal use only. Dict of AP Multipliers
    :return: Dict with the following information
    {
      "raw": {"ap1": raw score, "ap2": raw score},
      "aggregate": {"ap1": weighted, "ap2": weighted},
      "raw_total": total raw score,
      "aggregate_total": total aggregate score
    }
    """
    aggregate_scores = []
    for grade in aps.keys():
        corr_aps = aps[grade]

        for ap in corr_aps.keys():
            ap_score = aps[grade][ap]["score"]
            if ap_score is not None:
                aggregate_scores.append({"score": raw_scores_json[ap]["score"] * raw_scores_json[ap]["distribution"][ap_score-1],
                                         "grade_taken": grade,
                                         "ap": ap,
                                         "modifiers": aps[grade][ap]["modifiers"]})

            else:
                aggregate_scores.append({"score": raw_scores_json[ap]["score"],
                                         "grade_taken": grade,
                                         "ap": ap,
                                         "modifiers": aps[grade][ap]["modifiers"]})
    multiplied_scores = apply_all_sim_debuffs(apply_buffs(aggregate_scores, multipliers_json))
    multiplied_total = sum(map(lambda x: x["score"], multiplied_scores))

    for item in multiplied_scores:
        item.pop("modifiers")
    raw_scores = {}
    for item in aggregate_scores:
        raw_scores[item["ap"]] = item["score"]
    raw_total = sum([raw_scores[key] for key in raw_scores])
    print(multiplied_scores)

    sorted_multiplied_scores = deepcopy(multiplied_scores)
    sorted_multiplied_scores.sort(key=lambda x: x["score"], reverse=True)

    if len(sorted_multiplied_scores) > 3:
        top = {item["ap"]: item["score"] for item in sorted_multiplied_scores[:3]}
    else:
        top = {item["ap"]: item["score"] for item in sorted_multiplied_scores}



    return {
        "raw": raw_scores,
        "aggregate": multiplied_scores,
        "raw_total": raw_total,
        "aggregate_total": multiplied_total,
        "top": top,
        "error": None
    }
