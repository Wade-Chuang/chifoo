# -*- coding: utf-8 -*-
"""從正賦的共用題庫 math_units.js 擷取「只有國小」的版本給啟賦用。

用法（在 chifoo 資料夾下）：
    python tools/trim_elementary.py

來源：../jenfoo/practice/data/math_units.js（正賦線上練習的完整題庫＝主檔）
輸出：data/math_units.js（啟賦用，只留國小單元，檔尾補上 MATH_UNITS 匯出）

做法：保留所有共用函式與設定，只刪掉 g 不是「小○」的 unit({...}) 整段，
以及「複製單元換年級」那些只會產生國高中單元的敘述。

之後主檔更新國小單元時，重跑這支就好，不要手動改 data/math_units.js。
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.normpath(os.path.join(ROOT, "..", "jenfoo", "practice", "data", "math_units.js"))
DST = os.path.join(ROOT, "data", "math_units.js")
EXPORT = "\nvar MATH_UNITS=U.filter(function(u){return /^小/.test(u.g)});\n"

# ---------------------------------------------------------------- JS 掃描
REGEX_PREV = set("(,=:[!&|?{};+-*%~^<>") | {"\n"}
KEYWORDS = ("return", "typeof", "case", "in", "of", "new", "delete", "void", "instanceof")


def _regex_allowed(s, i):
    """位置 i 的 '/' 是正規式開頭（True）還是除號（False）。"""
    j = i - 1
    while j >= 0 and s[j] in " \t\r\n":
        j -= 1
    if j < 0:
        return True
    if s[j] in REGEX_PREV:
        return True
    k = j
    while k >= 0 and (s[k].isalnum() or s[k] == "_"):
        k -= 1
    return s[k + 1:j + 1] in KEYWORDS


def walk(s, i, depth=1):
    """從 i（開括號的下一個字元）往後掃，跳過字串／樣板／正規式／註解，
    回傳括號深度歸零之後的位置。"""
    while i < len(s):
        c = s[i]
        nxt = s[i + 1] if i + 1 < len(s) else ""
        if c == "/" and nxt == "/":
            i = s.find("\n", i)
            if i < 0:
                return len(s)
            continue
        if c == "/" and nxt == "*":
            j = s.find("*/", i + 2)
            i = len(s) if j < 0 else j + 2
            continue
        if c in "'\"":
            q = c
            i += 1
            while i < len(s):
                if s[i] == "\\":
                    i += 2
                    continue
                if s[i] == q:
                    i += 1
                    break
                i += 1
            continue
        if c == "`":
            i += 1
            while i < len(s):
                if s[i] == "\\":
                    i += 2
                    continue
                if s[i] == "`":
                    i += 1
                    break
                if s[i] == "$" and i + 1 < len(s) and s[i + 1] == "{":
                    i = walk(s, i + 2)
                    continue
                i += 1
            continue
        if c == "/" and _regex_allowed(s, i):
            i += 1
            in_class = False
            while i < len(s):
                if s[i] == "\\":
                    i += 2
                    continue
                if s[i] == "[":
                    in_class = True
                elif s[i] == "]":
                    in_class = False
                elif s[i] == "\n":
                    break
                elif s[i] == "/" and not in_class:
                    i += 1
                    break
                i += 1
            while i < len(s) and s[i].isalpha():
                i += 1
            continue
        if c in "([{":
            depth += 1
        elif c in ")]}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    return i


def eat_semi(s, i):
    while i < len(s) and s[i] in ";\r\n":
        i += 1
    return i


# ---------------------------------------------------------------- 擷取
def unit_spans(s):
    spans = []
    for m in re.finditer(r"\bunit\(", s):
        spans.append((m.start(), eat_semi(s, walk(s, m.end()))))
    return spans


def grade_of(block):
    m = re.search(r"\bg:\s*['\"]([^'\"]+)", block)
    return m.group(1) if m else ""


def drop_clone_maps(s):
    """刪掉「複製某單元換個年級名稱」的整段敘述（複製出來的都是國高中／技高單元）。"""
    n = 0
    while True:
        m = re.search(r"\.forEach\(\(\[from,\s*id,\s*g,\s*name\]\)", s)
        if not m:
            break
        start = s.rfind("[[", 0, m.start())
        if start < 0:
            break
        end = eat_semi(s, walk(s, m.start() + len(".forEach(")))
        s = s[:start] + s[end:]
        n += 1
    return s, n


def drop_reorder_iifes(s):
    """刪掉把國中／技高單元重新排序的 IIFE（單元都移除後它們會出錯）。"""
    n = 0
    for marker in ("(()=>{const ORDER=", "(()=>{const JH="):
        while True:
            i = s.find(marker)
            if i < 0:
                break
            end = walk(s, i + 1)
            while end < len(s) and s[end] in " \t\r\n":
                end += 1
            if s[end:end + 2] == "()":        # IIFE 結尾的呼叫括號
                end += 2
            end = eat_semi(s, end)
            s = s[:i] + s[end:]
            n += 1
    return s, n


def main():
    if not os.path.exists(SRC):
        sys.exit("找不到主檔：" + SRC)
    s = open(SRC, encoding="utf-8").read()
    s, maps = drop_clone_maps(s)
    s, iifes = drop_reorder_iifes(s)

    out, last, keep, drop = [], 0, [], []
    for a, b in unit_spans(s):
        g = grade_of(s[a:b])
        if g.startswith("小"):
            keep.append(g)
            continue
        drop.append(g)
        out.append(s[last:a])
        last = b
    out.append(s[last:])
    trimmed = "".join(out)
    if "MATH_UNITS" not in trimmed:
        trimmed = trimmed.rstrip() + "\n" + EXPORT

    open(DST, "w", encoding="utf-8", newline="\n").write(trimmed)
    print("保留國小 %d 個單元，刪掉其他學段 %d 個單元、%d 段複製敘述、%d 段排序程式" % (len(keep), len(drop), maps, iifes))
    print("主檔 %d KB → 啟賦版 %d KB" % (len(s) // 1024, len(trimmed) // 1024))


if __name__ == "__main__":
    main()
