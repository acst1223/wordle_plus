import json

def check(word, alphabet):
    if len(word) == 0:
        return False
    for a in word:
        if a not in alphabet:
            return False
    return True

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
with open("../dicts/en.txt", encoding="utf-8") as f:
    words = f.readlines()
    words = [word.strip().upper() for word in words]
    words = [word for word in words if check(word, alphabet)]
    words = list(set(words))
    words.sort()

with open("../dicts/en.json", 'w', encoding="utf-8") as f:
    json.dump({
        "words": words,
        "alphabet": alphabet,
    }, f, ensure_ascii=False, indent=4)
print(len(words))