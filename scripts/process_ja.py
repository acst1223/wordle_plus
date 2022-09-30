import json
from tqdm import tqdm

alphabet = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨワヲラリルレロガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォッャュョヮンヴー"

def isHiragana(c):
    # ぁ (12353) - ゖ (12438)
    return 12353 <= ord(c) <= 12438

def isKatakana(c):
    # ァ (12449) - ヶ (12534)
    # ー (12540), not considered
    return 12449 <= ord(c) <= 12534

def hiragana2katakana(c):
    if isHiragana(c):
        return chr(ord(c) + 96)
    else:
        return c

def checkInAlphabet(w, alphabet):
    if len(w) == 0:
        return False
    for c in w:
        if not c in alphabet:
            return False
    return True

def hiraganaWord2katakanaWord(w):
    return ''.join([hiragana2katakana(c) for c in w])

with open("../dicts/n1-n5.txt") as f:
    n1WordList = f.readlines()
    n1WordList = [w.strip().split(",")[1] for w in n1WordList]
    n1WordList = set(n1WordList)
    print("#N1 Word List:", len(n1WordList))

with open("../dicts/JmdictFurigana.json", encoding="utf-8-sig") as f:
    lines = json.load(f)
    raw_readings = [line['reading'] for line in lines if line["text"] in n1WordList]
    raw_readings = set(raw_readings)
    print("#raw_readings:", len(raw_readings))

katakana_readings = set()
for r in tqdm(raw_readings):
    k = hiraganaWord2katakanaWord(r)
    if checkInAlphabet(k, alphabet):
        katakana_readings.add(k)
print("#readings:", len(katakana_readings))

katakana_readings = list(katakana_readings)
katakana_readings.sort()

with open("../dicts/ja.json", 'w', encoding="utf-8") as f:
    json.dump({
        "words": katakana_readings,
        "alphabet": alphabet,
    }, f, ensure_ascii=False, indent=4)
