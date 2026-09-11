"""Blind / pattern solutions that use collections.Counter.

Companion to the plain-dict versions in the pattern lessons.
"""

from collections import Counter


def is_anagram(s, t):
    if len(s) != len(t):
        return False
    return Counter(s) == Counter(t)


def top_k_frequent(nums, k):
    return [num for num, _ in Counter(nums).most_common(k)]


def min_window(s, t):
    if not t or not s:
        return ""
    need = Counter(t)
    missing = len(need)
    have = Counter()
    best_len, best_l, best_r = float("inf"), 0, 0
    left = 0
    for right, ch in enumerate(s):
        have[ch] += 1
        if ch in need and have[ch] == need[ch]:
            missing -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                best_len, best_l, best_r = right - left + 1, left, right
            left_ch = s[left]
            have[left_ch] -= 1
            if left_ch in need and have[left_ch] < need[left_ch]:
                missing += 1
            left += 1
    return "" if best_len == float("inf") else s[best_l : best_r + 1]


def group_anagrams(strs):
    groups = {}
    for s in strs:
        key = tuple(sorted(Counter(s).items()))
        groups.setdefault(key, []).append(s)
    return list(groups.values())


def subarray_sum(nums, k):
    freq = Counter({0: 1})
    prefix = ans = 0
    for n in nums:
        prefix += n
        ans += freq[prefix - k]
        freq[prefix] += 1
    return ans


if __name__ == "__main__":
    print(is_anagram("anagram", "nagaram"))
    print(is_anagram("rat", "car"))
    print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))
    print(min_window("ADOBECODEBANC", "ABC"))
    print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
    print(subarray_sum([1, 1, 1], 2))
