---
title: "gh Says My Token Is Invalid Inside My AI Agent. One security Command Fixed It."
publishedAt: "2026-10-31"
description: "gh returned 401 only when my local-model agent ran it. My login was fine. One security unlock-keychain command inside the agent fixed it, no password asked."
coverImage: "../../assets/covers/gh-token-invalid-ai-agent-macos-keychain.png"
coverAlt: "GitHub and Apple logos beside a locked keyhole. The title reads gh Says My Token Is Invalid, one security command."
tags:
  - name: "AI"
    slug: "ai"
  - name: "GitHub"
    slug: "github"
  - name: "LLM"
    slug: "llm"
series: null
draft: false
---

**The fix:** if `gh` returns 401 "token is invalid" only inside your AI agent on macOS, while it works fine in your own terminal, run this inside the agent:

```bash
security unlock-keychain ~/Library/Keychains/login.keychain-db && gh status
```

`security` is macOS's built-in command-line tool for the keychain. It didn't even ask me for a password, and it holds until you restart. Here's how I got there.

This week I decided to spend some time trying out different local LLMs, to see what my 32GB MacBook Pro is capable of running.

I didn’t get far!

After a bit of research, I decided to start with Ollama as my backend. I installed deepseek-r1:32b and qwen2.5-coder:32b, only to find out that, despite their size, they take up so much memory when loaded that my laptop is unusable with them.

So I reached out to a friend with more experience in local models, who suggested I try Hermes. Hermes has a super nice onboarding and it introduced me to the concept of distilled models.

Distilled models: these models are trained on the reasoning steps of the big models. Imagine walking through Opus on different problems, collecting the traces, then training an Opus-mini from those. The result is a much smaller reasoning model.

So finally I had a `Qwen3.6-35B-A3B-UD-Q4_K_M` running locally where I could get 5-15 t/s. Not the speed you are used to but you could offload some work to it while you were doing other stuff. It actually finished some migrations on my blog before it ran into the first problem:

It couldn’t push to GitHub despite my local gh cli tool being authenticated.

The model told me my GitHub token had expired and I should run `gh auth login`. I said no. A few runs later it told me again, and this time it cited its own memory notes.

My login was fine. `gh status` worked in my normal terminal, it worked in OpenCode, and it worked in a plain herdr pane right next to the broken one. It failed only when Hermes ran it.

## The setup

Hermes is an agent harness, and I always start it from [herdr](https://herdr.dev/). If you loved tmux and you work with multiple agent harnesses like Claude Code, Codex or OpenCode, you’ll love herdr.

I authenticate to GitHub with an SSH key and I've never created a personal access token. My `~/.config/gh/hosts.yml` has no token in it:

```yaml
github.com:
    user: akoskm
    git_protocol: https
```

## The symptom

Inside Hermes, every `gh` call that needed the API failed:

```text
$ gh status
could not load events: failed to get current username:
non-200 OK status code: 401 Unauthorized body: "Requires authentication"
```

```text
$ gh auth status
github.com
  X github.com: authentication failed
  - The github.com token in /Users/akoskm/.config/hosts.yml is invalid.
```

A 401 and "token is invalid". If you only see these two messages, re-login looks like the obvious move.

## What Qwen thought was wrong

Qwen went looking at the environment, which was a reasonable start. It found that `~/.gitconfig` uses gh as the credential helper:

```text
helper = !/opt/homebrew/bin/gh auth git-credential
```

It found four SSH agent sockets under `~/.ssh/agent/`, and only one of them had my key loaded. Pointing `SSH_AUTH_SOCK` at that socket made `git ls-remote` over SSH work. `gh status` still returned 401.

Then it went through a list of things that changed nothing:

- `gh auth setup-git`
- a login shell, `bash -l -c 'gh status'`
- emptying environment variables
- `gh auth login --git-protocol ssh --with-token`, which hung trying to open the browser OAuth flow and timed out

It also checked the keychain with `security find-internet-password -s "github.com"`, got exit code 36, and concluded there was no GitHub password stored. That was the wrong query. gh stores its token as a generic password under the service name `gh:github.com`.

After that, Qwen kept coming back to re-authentication. One run's reasoning said:

```text
The `gh status` command failed because the GitHub CLI token is invalid/expired (401 Unauthorized).
According to the memory notes, the fix is to use `gh auth login -h github.com` rather than deleting hosts.yml.
```

And it told me "your gh auth token has expired." A 401 reads like a bad token, so the model kept landing on the fix for a bad token, and the memory note made sure it landed there every time. It had already used `security` once, for that wrong keychain query. It never tried `security unlock-keychain`.

## Grok's first theory: blame herdr

I pasted Hermes's summary into Grok. It cleared up one thing right away: gh keeps the OAuth token in the macOS login keychain, and `hosts.yml` only holds the username and protocol. So identical config files in both places proved nothing.

Then it blamed herdr. Its theory was that the herdr server runs in a Background launchd session, which can't get at the keychain the way a GUI terminal can, and it linked a herdr issue about keychain-backed tools failing. It suggested restarting the server from a GUI terminal:

```bash
herdr server stop
herdr
```

`launchctl managername` still printed `Background`. Grok's next answer was a LaunchAgent plist to run the herdr server in the GUI domain. At the very bottom, under "Other options", it listed `security unlock-keychain ~/Library/Keychains/login.keychain-db` as a one-liner. Grok said to try the LaunchAgent first, so that one-liner sat there unused.

I didn't set it up. `gh status` worked in plain herdr panes, before the restart and after it. Whatever was broken was specific to Hermes.

## Narrowing it down

Then I pasted the whole thread into Grok Bot. Since herdr panes worked and Hermes didn't, it went after how Hermes runs commands.

### Step 1: environment variables

The first clue was the path in the error. `/Users/akoskm/.config/hosts.yml` is missing the `gh` folder. That could mean `GH_CONFIG_DIR` was pointing at `~/.config`, or that Hermes was injecting a stale `GH_TOKEN` or `GITHUB_TOKEN`, which gh uses before the keychain.

I had Hermes run this through its own command tool:

```bash
env | grep -iE '^(GH_|GITHUB|XDG|HOME=)'
```

The only match was `HOME=/Users/akoskm`. Hermes keeps its own env file, so I checked that too:

```text
$ grep -iE 'GH_|GITHUB' ~/.hermes/.env
# SKILLS HUB (GitHub integration for skill search/install/publish)
# GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
# GITHUB_APP_ID=
```

All commented out. No variable was overriding anything. I never found out why the error printed that odd path.

### Step 2: which gh, and what it sends

```text
$ which -a gh; gh --version
/opt/homebrew/bin/gh
gh version 2.39.2 (2023-11-27)
```

One binary, at the same path my `~/.gitconfig` credential helper points to. (Yes, it's from 2023. It wasn't the cause.)

Then the debug output:

```text
$ GH_DEBUG=api gh api user 2>&1 | head -40
* Request to https://api.github.com/user
> GET /user HTTP/1.1
> Host: api.github.com
> Accept: */*
> Content-Type: application/json; charset=utf-8
> Time-Zone: Europe/Budapest
> User-Agent: GitHub CLI 2.39.2
< HTTP/2.0 401 Unauthorized
```

There's no `Authorization` header in that request. gh wasn't sending an expired token. It had no token to send. "The token is invalid" was gh's way of saying it came up empty.

### Step 3: the false lead

So can Hermes find the token in the keychain?

```text
$ security find-generic-password -s "gh:github.com" -a akoskm > /dev/null; echo "exit $?"
security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.
exit 44
```

That looked like the answer, and it was wrong. The `-a akoskm` filter was the problem. Without it, the lookup returned `exit 0` in Hermes and in my terminal, and `security list-keychains` printed the same three keychains in both. The item's account field is empty (`"acct"<blob>=<NULL>`), so filtering by account name could never match.

Qwen read the same output and decided the token was stored "under a different account identity", so I should re-authenticate to overwrite it. Same advice, new reason.

### Step 4: finding the item vs reading the secret

On macOS, finding a keychain item and reading the secret inside it are separate operations. This reads the secret without printing it, and only counts its characters:

```bash
security find-generic-password -s "gh:github.com" -w | wc -c; echo "exit ${PIPESTATUS[0]}"
```

In my terminal it printed 75. In Hermes:

```text
0
exit 36
```

Hermes could see the item but couldn't read it. Qwen had already hit exit 36 on its first keychain check and moved on.

## The fix

Inside Hermes:

```bash
security unlock-keychain ~/Library/Keychains/login.keychain-db && gh status
```

That fixed it. It didn't ask for a password (my keychain unlocks when I log in to the Mac), and `gh status` worked inside Hermes right after. No re-login, no personal access token, no changes to `hosts.yml`.

Grok Bot is the one that handed me this exact command, after the `wc -c` check. Grok had listed the unlock part earlier as a side option. Qwen, the model actually running inside Hermes, never mentioned it.

You have to repeat the unlock after a restart, but it lasts between sessions.

If you'd rather not touch the keychain from inside the agent, another option is to start the harness with the token already in its environment, from a terminal where gh works:

```bash
GH_TOKEN=$(gh auth token) hermes
```

gh checks `GH_TOKEN` before the keychain. I haven't tried this one myself. Don't paste the raw token into the harness's `.env` file.

## What I'd do next time

When an agent says your credentials are broken, run the exact same command outside the harness before you change anything. If it works there, your credentials are fine and the problem is in how the harness runs commands.

Two checks moved this forward. `GH_DEBUG=api` showed gh had no token to send. `security find-generic-password -w | wc -c`, run in both places, showed Hermes got nothing back when it read the secret.

Don't let the local model inside the harness be the only one debugging the harness. Qwen ran inside Hermes the whole time, had a memory note that said "run gh auth login", and repeated it after every 401, whatever the evidence said. It even used `security` for a keychain query and still never tried `security unlock-keychain`. The command that fixed it came from outside, from Grok Bot, after I pasted Hermes's output into a separate chat. So when your local model keeps offering the same fix, copy its output somewhere else and get a second opinion. And check what it has saved to memory.
