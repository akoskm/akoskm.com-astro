---
title: "Stop Making Your TypeScript Types So Broad"
publishedAt: "2025-10-15T05:45:57.541Z"
updatedAt: "2025-10-22T06:00:23.778Z"
description: "I’ll show you why broad TypeScript types hurt readability and how a bottom-up approach makes your code cleaner and clearer."
brief: "Some see TypeScript as a necessary evil.\nThe new linter warnings you have to satisfy, another gotcha to make your coding complex.\nI used to think the same.\nThen I realized bad types were the real problem.\nI think TypeScript is incredible, and it has ..."
readTimeInMinutes: 4
coverImage: "../../assets/posts/stop-making-your-typescript-types-so-broad/cover.png"
tags:
  - name: "TypeScript"
    slug: "typescript"
  - name: "Web Development"
    slug: "web-development"
  - name: "Programming Tips"
    slug: "programming-tips"
  - name: "Software Engineering"
    slug: "software-engineering"
  - name: "code refactoring"
    slug: "code-refactoring"
  - name: "TypeScript Tutorial"
    slug: "typescript-tutorial"
series: null
draft: false
---

Some see TypeScript as a necessary evil.

The new linter warnings you have to satisfy, another gotcha to make your coding complex.

I used to think the same.

Then I realized bad types were the real problem.

I think TypeScript is incredible, and it has become my preferred language since I tried it.

Added complexity?

Yes, but the clarity it brings to the code is well worth it.

However, if you only see TypeScript as a roadblock and you’re working only on satisfying the compiler, you can end up with:

* No additional clarity about your code
    
* More code, because of the new type declarations
    

I'd like to share an example from some code I recently reviewed.

This structure appears fine at first glance, but the type definition ultimately did more harm than good.

```jsx
const objectA = {
    totalWaitTime: {
        chartData: {
            name: "Total Wait Time",
            children: [
                { name: "Stage 1", value: 5 },
                { name: "Stage 2", value: 8 },
            ],
        },
        stats: {
            hasWaitTime: true,
        },
    },
    totalWorkTime: {
        chartData: {
            name: "Total Work Time",
            children: [
                { name: "Stage 1", value: 15 },
                { name: "Stage 2", value: 12 },
            ],
        },
        stats: {
            hasWorkTime: true,
        },
    },
    totalTime: {
        chartData: [
            {
                key: "Stage 1",
                values: [
                    { x: "2023-01-01", y: 20 },
                    { x: "2023-01-02", y: 22 },
                ],
            },
            {
                key: "Stage 2",
                values: [
                    { x: "2023-01-01", y: 18 },
                    { x: "2023-01-02", y: 21 },
                ],
            },
        ],
        stats: {
            hasTotalTime: true,
        },
    },
};
```

How I’d type this if my only goal was to make the TypeScript compiler happy?

I could take a top-down approach and look at what’s possible:

1. The object has keys that are strings and some chart data. I’d write this as `const objectA: Record<string, QueueTimeChartResult> = {`
    
2. Then the values have a `chartData` and a `stats` key, where the values are as follows:
    
    1. `chartData` contains a `name` and an array of `children` or `key` and an array of `values`
        
    2. `stats` contains either `hasWaitTime`, `hasWorkTime`, or `hasTotalTime`
        

Then I’d arrive at something like this:

```typescript
interface QueueTimeChartData {
  key?: string;
  name?: string;
  children?: { name: string, value?: number }[];
  values?: {x: string, y: number}[];
}

export interface QueueTimeStats {
    hasWaitTime?: boolean;
    hasWorkTime?: boolean;
    hasTotalTime?: boolean;
}

export interface QueueTimeChartResult {
    chartData: QueueTimeChartData | QueueTimeChartData[];
    stats: QueueTimeStats;
}
```

You can try this version out for yourself in the following [TypeScript Playground link](https://www.typescriptlang.org/play/?&%20=#code/JYOwLgpgTgZghgYwgAgIoFcKYCrALYQDCAFnFGACJxhzIDeAUMsgNYQCeA-AFzIDOYKKADmAbibIQcAj36CR45gmLAANgBMoEELLqTpEXgKEhhAGmQA3OKsyyQ6PACNoyAL4BtALqKrNzHy6AB5G8qYW7LwOztCePgxuDAwQQQAOAPbkyKCQsIgoGFgQuAQAyjRgfPQSzKR8AOpwwGAlELJO6emqEHAgvrVwDZksre2d3b39yHXY6TSqo7wdXT19NdODAIKW0HDCEI3Ni8jLE2vMA3zbu-v1w8enq+KJyWmZYNng0PBIaJg4+CIpHIACUIHx0KoPowLshlGRKNQ4LxCgCCCQEVQaMgAD5-IqtDHkLFwbxTATUPgo-7FQHlSnPJIIdIgATIdJOABWEAQYE2vDBzKg6gAPMYRBZUbT0cCwGCIVCAHzIAC81VhYDmNkOLUBvBhsIu8OJSP160NFykBF4ACJZvNkDrkK0bWZzRa4SoNFoQLwPO6PRc9FbDMgbfT9sgAIyuvy2UMAVncbsDgeDBltEZQACZY9Z47wABzJgOGrwpj1uCsWimVM2pi51HWtXiCTDVw1V9ZdjVa1R3KAjPXqj3GxE0esN-TWsP2myO4bOwGu0uw5RqTTaP2rj3pmfhmiRmMWfOYXhRpM9qewvehg97HN5-yhqPZkvX8ulq81ipUkcNpt7mHNsIA7WFv3fC5NXmFt-0NMcSW3a8DWvZg2EiMMs2jFdUIuU9wSQ3DDT0EIw2zAAGbMAGYAFpyKjOjj2QDCKMgoig2QUibQo6jGLo3MIl4bM3wgj8wMrcSLRQ1D0MzQ9H0k1N8L-f12JvTjbR42j6MY2MMKjYtRKIkjNMo7SGMovShKjNjUM-a8jOYeyPVrP9pMDGY+1gkDFIgrs3FEIA).

But what’s wrong with this?

I added a type, but the structure isn’t clearer, but more confusing.

Why?

Now it’s *documented* in `QueueTimeStats` we can have an object like this:

```typescript
stats: {
  hasWaitTime: false;
  hasWorkTime: true;
  hasTotalTime: true;
}
```

Which is never the case.

While this is somewhat better than using `any`, the thing is…

<mark>TypeScript isn’t just a static checker — it’s documentation for your code.</mark>

An additional way to convey information about our code, and if your types resemble the above, this can be confusing.

How can we fix this?

By using types that aren’t so forgiving.

In our case, the top-level object seems to hold the same structure, but if you look deeper, `chartData` has two forms, so I’d start from there:

```typescript
export interface ChartData {
    name: string;
    children?: { name: string, value?: number }[];
}

export interface PositionChartData {
    key?: string;
    values?: {x: string, y: number}[];
}
```

I just named the second structure `PositionChartData` because the x and y tell me this is some kind of position on the chart (where probably the X axis is the time and the Y axis is the value).

If I expand further from `chartData`, I can see that for each of the top-level keys, `totalWaitTime`, `totalWorkTime`, and `totalTime`, the key inside `stats` is different and is related to the top-level key.

This is why I have decided to create structures describing these top-level objects:

```typescript
export interface TotalWaitTimeChartData {
    chartData: ChartData;
    stats: {
        hasWaitTime: boolean;
    }
}

export interface TotalWorkTimeChartData {
    chartData: ChartData;
    stats: {
        hasWorkTime: boolean;
    }
}

export type TotalTimeChartData {
    chartData: PositionChartData[];
    stats: {
        hasTotalTime: boolean;
    }
}
```

This version tells a clearer story, one where each object means exactly what it should.

Now it’s clear that you’ll have either:

```typescript
stats: {
  chartData: [...]
  hasTotalTime: boolean;
};
```

or

```typescript
stats: {
  chartData: {...}
  hasWorkTime: boolean;
};
```

but never

```typescript
{
  chartData: [{
    name: "Stage 1",
    value: 5,
    key: "stg-1",
    values: [{
      x: "2023-01-01",
      y: 6
    }]
  }],
  stats: {
	  hasTotalTime: false,
	  hasWorkTime: true
  }
}
```

You can find the updated TypeScript Playground [here](https://www.typescriptlang.org/play/?#code/KYDwDg9gTgLgBASwHY2FAZgQwMbDgYQAtNYARTGTOAbwCg4G4lMBbYALjgGcYpkBzANz1G2QggA2AEyjAkAfk7UmrDt14CANHABumCQFdgipgZYAjNHAC+AbQC6w67VqhIsRCjRZccAAoQXAgwCBBIRCQw5JQ0IgwA1sAAniY8fEhCcbr6Rlwm1CCcaVpwSZxIZpZQdo60zq7g0PDIqBg4eAAqEJQSAOqYwR0IbBFkFFR0jHBikdGYnKNR48JTPBRcSllTxFz9g8Nq5hAQEsCYSCuMzvVuTZ6tPp3d+r3Q8UMjxGMxk6JfS5QFv85pcGGsYBtYlNtphdm8PodjqdzqCbHUXLcPDAkmAnj0EYs5lC-rNxpwAkEQmFCeMHKjwZDftC4DsuviDpwjiczhcstcXNgwjw4BBzAArYDYGAAQU4ACVJdApAAeYoZbRsl4DGAE4HjOAAHzgmr68IONJiRpNutJlAAfHAALzEhgwZ59bUIzbMhgzb7zF0+hjMNicABEJrge3gCLDmi2PrEkhkck4tgTQYYyhDajDAGVKPw8ABGOPZQxqACsNnjmZ92dU4YLmCLcAATGW9BXOAAOGsZ6H2Ws+6zD5kM711lmw6NeuC8Ixj6GjvlLt09V5Qd4cwNTP0AgNMzM58ORzfxY0HOMDvfiaSyJBpm-1lShuD5wslzs5NTF6srqdoQbN8PxbPAO20LsjE4Ys237QChwHACfQnXcfR2c85wXYAlymZCGHw+d3TnI9b1tAN00A0ip0SMp32bVtS1wqcoOASFKMAl9CnfNsAAY2wAZgAWl44sRKY0pOD4+DOOZZRuLDPjBPEkSIMk9s4MIhDmOZLT62fZlaKbT922vWSGFY9iDMzeTwyU4TRPEss6OLPs9Nk2yeP4hyxP45ypOLGTZMQwD3LgEKUMoCFJzrVliJ3bCdKC-trEEIA).

***Conclusion***

How to avoid typing objects too broadly, as was done first in this case?

As I write this, I think what made a difference in my approach was starting with the **inspection of the object’s deepest structure, then moving towards the top-level** object.

While the original type first looked at the top-level object, it made a type that can hold anything that can appear there.

You can call this bottom-up vs. top-down typing – I don’t know if this is actually a term.

But the bottom line is:

Broad types make the code pass, narrow types make it clear.
