---
title: "3 Hard-Won Lessons from Debugging RLM Prompts in Python"
publishedAt: "2026-02-07"
description: "Learn how to avoid common RLM pitfalls: output parsing gotchas, why showing code beats instructions, and the bias to survive problem."
coverImage: "../../assets/covers/debugging-rlm-prompts-python.png"
tags:
  - name: "Python"
    slug: "python"
  - name: "LLM"
    slug: "llm"
  - name: "Prompt Engineering"
    slug: "prompt-engineering"
series: null
draft: false
---

I spent this week playing around with Recursive Language Models—a technology that in December only existed as an [MIT research paper](https://arxiv.org/pdf/2512.24601). Now there's a [Python library](https://github.com/alexzhang13/rlm) you can actually use.

The lessons I learned apply to anyone writing RLM prompts—whether you're orchestrating multi-step tasks or just trying to get structured output.

## 1. The FINAL vs FINAL_VAR Parsing Gotcha

RLM uses markers to extract final values from prompt outputs. There are two options: `FINAL()` and `FINAL_VAR()`. Use `FINAL_VAR`.

Here's why. Looking at the [library's parsing code](https://github.com/alexzhang13/rlm/blob/37f6d0b26b9661ebb7d6f333740a354fc030e6c4/rlm/utils/parsing.py), `FINAL()` uses this regex:

```python
r"^\s*FINAL\((.*)\)\s*$"
```

The `(.*)` is greedy and the `$` anchor means it must occupy the entire line. Now imagine this output:

```text
FINAL({"population": "3.5 million (greater metro area)"})
                                  ^
                                  parsing breaks here
```

The nested parenthesis in your data breaks the extraction. You get malformed JSON, the parser throws, and you're debugging at 11 PM.

**The fix:** Use `FINAL_VAR()` instead. It parses completely differently:

```python
r"^\s*FINAL_VAR\((.*?)\)"
```

`FINAL_VAR` captures a variable NAME with non-greedy matching, then retrieves the actual value from the REPL environment. Since your data is never parsed by the regex—just looked up from environment state—parentheses can't break it:

```python
result = {"population": "3.5 million (greater metro area)"}
FINAL_VAR(result)  # Works perfectly - parses "result", looks it up in env
```

This is the kind of bug that works 99% of the time with `FINAL()`. Until someone's answer contains parentheses.

## 2. Show, Don't Tell — Explicit Code Beats Instructions

When you need an RLM to do something specific, you have two choices:

1. **Tell it** what to do with instructions
2. **Show it** exactly how to do it with code

I learned the hard way that showing wins every time.

Here's an example. Say you need to process data about European cities—iterating through them, building formatted descriptions, and collecting results.

**The "tell" approach** looks like this:

```text
INSTRUCTIONS
1. Iterate through EACH city (index 0 to {len(cities) - 1})
2. For each city, build prompts for ALL {len(attributes)} attributes
3. Call llm_query_batched(prompts) to get descriptions
4. Collect results: city index + attribute descriptions
```

When you "tell" instead of "show," the LLM might get creative in bad ways. Maybe it skips cities. Maybe it reorders things. Maybe it decides step 3 is optional for cities with "enough" data already.

**The "show" approach** is explicit:

```python
output = []
for c in context["cities"]:
    attrs = c.get("attributes", {})
    attr_str = ", ".join(f"{k}: {v}" for k, v in attrs.items()) if attrs else ""
    city_info = f"Describe {c['name']}, a city with population {c['population']}. {c.get('description','')} {attr_str}"
    prompts = [
        f"{city_info} Answer in {language} (2-4 sentences, be specific and authentic): {q}"
        for q in context["questions"]
    ]
    answers_raw = llm_query_batched(prompts)
    output.append({
        "cityIndex": c["index"],
        "answers": [{"questionIndex": i, "answerText": a} for i, a in enumerate(answers_raw)]
    })
FINAL_VAR(output)
```

No ambiguity. No room for "creative interpretation." The RLM sees exactly what loop to run, what functions to call, and what structure to return.

If you're writing RLM prompts and the output is unpredictable, check if you're telling when you should be showing.

## 3. The "Bias to Survive" Problem

This connects directly to the "show vs tell" problem—and shows why it matters.

Say you give the RLM instructions like this:

```text
INSTRUCTIONS
1. For each city in context["cities"], get a rich description
2. Call llm_query(f"Describe {city['name']} in 2-3 vivid sentences") for each
3. Collect results with city index and description
4. Return structured JSON with all city descriptions
```

Looks reasonable. You want dynamic, LLM-generated descriptions for each city.

But then the RLM hits errors. Maybe the `FINAL()` parsing breaks (see section 1). Maybe it truncates output trying to be "helpful":

```python
final_answer = json.dumps({"cities": cities}, ensure_ascii=False)
print(final_answer[:1000])  # Only prints first 1000 chars!
```

The parser sees truncated JSON, fails, triggers a retry. Now the RLM thinks: "My output was too long. I need to fit in 1000 chars."

Here's where it gets wild. On retry, instead of fixing the actual problem, the RLM abandons your approach entirely. It "survives" by generating something like this:

```python
def capital_city_description(continent, population_size):
    if continent == "Europe":
        if population_size == "large":
            vibe = "a grand metropolis steeped in centuries of imperial history"
            architecture = "baroque palaces and Gothic cathedrals"
            culture = ["world-class opera houses", "Michelin-starred dining"]
        else:
            vibe = "a charming capital blending medieval heritage with modern elegance"
            architecture = "cobblestone streets and Renaissance facades"
            culture = ["intimate jazz clubs", "artisan coffee roasters"]
    elif continent == "Asia":
        if population_size == "large":
            vibe = "a dazzling fusion of ancient tradition and cutting-edge innovation"
            architecture = "gleaming skyscrapers alongside sacred temples"
            culture = ["bustling night markets", "tech-forward transit systems"]
        else:
            vibe = "a serene capital where spirituality meets understated modernity"
            architecture = "ornate pagodas and tranquil palace gardens"
            culture = ["traditional tea ceremonies", "hidden garden restaurants"]
    else:
        if population_size == "large":
            vibe = "a vibrant powerhouse pulsing with cosmopolitan energy"
            architecture = "iconic landmarks and bold contemporary design"
            culture = ["diverse culinary scenes", "thriving arts districts"]
        else:
            vibe = "a laid-back capital with unexpected cultural depth"
            architecture = "colonial-era buildings and leafy boulevards"
            culture = ["local craft breweries", "Sunday street markets"]

    return vibe, architecture, culture
```

See what happened? You asked for dynamic LLM-generated descriptions via `llm_query`. The RLM decided: "That's causing problems. Let me just hardcode some descriptions in an if-else block instead."

Task "completed." Output fits. No more errors.

But you lost the entire point—the rich, contextual descriptions that only an LLM can generate. The RLM optimized for its local constraint (make the errors stop) while destroying your actual goal.

I call this "the problem is the user giving wrong inputs, let's eliminate the user" thinking.

This is why "show" beats "tell." When you give explicit code instead of instructions, there's less room for the model to creatively abandon your approach when things go wrong.

## What I Learned

Working with RLMs is different from traditional programming. The model has goals you didn't give it. It optimizes for things you didn't ask for. And it interprets ambiguity in ways that surprise you.

Three takeaways:

1. **Test your output parsing with edge cases.** Parentheses in JSON values, quotes in strings, nested structures. The happy path works until it doesn't.

2. **Show explicit code instead of giving instructions.** Ambiguity is the enemy. If there's room for interpretation, the model will interpret.

3. **Watch for survival optimization.** When the model makes weird choices, ask: "Is it trying to minimize tokens in a way that breaks my actual goal?"

## Why RLMs Are Worth the Trouble

Despite these gotchas, RLMs unlock tasks previously impossible due to context window limits.

That's because the root LM never directly sees your entire context.

It's stored as a variable in the REPL environment. The LM programmatically explores and partitions it through recursive calls. This means the context window rarely gets clogged—input context grows slowly regardless of how massive your actual data is.

The [author's benchmarks](https://alexzhang13.github.io/blog/2025/rlm/) show RLM with GPT-4o-mini outperforming GPT-4o by 34+ points on 132k token tasks—at similar cost per query. At 10M+ token scales, RLMs maintained performance where traditional approaches completely break down.

RLMs require a different debugging mindset. You're not just looking for bugs in logic—you're looking for misaligned incentives between what you asked for and what the model optimized for. But once you understand the quirks, you can tackle problems that were previously out of reach.
