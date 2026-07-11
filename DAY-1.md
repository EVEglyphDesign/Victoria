# Day 1 — Quickstart

Welcome, Victoria. This is an on-ramp, not a to-do list. The goal today is simple: get your own tools set up, look at one picture, and add one real file. That's a successful Day 1.

Everything here is built so that once you see what's being done, you can do the exact same things **for yourself** — your own account, your own repo, your own twin.

---

## 0. Set up your own tools (20 min)

You don't need to borrow anyone's setup. Two accounts and you're fully independent. For now, the subscriptions for both are covered for you, so cost is not a reason to hold back — just get set up and start.

Both are yours, in your name. That matters for what comes next: at any point you can back everything up to your own device and walk away with all of it (see section D).

### A. Create your own GitHub account

GitHub is where your twin lives — a place to keep files and track changes.

1. Go to **https://github.com/signup**
2. Enter your email, pick a password, and choose a username (this is public — pick something you're happy to be known by).
3. Verify your email when GitHub sends the confirmation.
4. Choose the **Free** plan. It's all you need.

That's it — you now have your own account, not a guest seat on someone else's.

### B. Get set up with Perplexity

Perplexity is the assistant side — it can help you write, research, and build, and it's what we'll use to work on the twin.

1. Go to **https://www.perplexity.ai** and sign up (email or Google/Apple sign-in).
2. Explore the assistant: ask it anything, upload a file, have it help you draft.
3. When you're ready, it can help you scaffold and fill your own version of this repo — the same way this one was built.

### C. (Later) Make this repo your own

When you decide you want to run with it, this repo can be **transferred to your GitHub account** so you own it outright — or you can fork it and start fresh. No rush. Today, just having the two accounts is enough.

---

### D. Back up everything to your own device (so you can always walk away)

This is the most important part. Sovereignty means you can leave at any time and keep everything. Nothing here traps your data on someone else's service.

**Back up your repo (your twin) to any device:**

- **Easiest — download a ZIP:** on your repo's GitHub page, click the green **Code** button → **Download ZIP**. That's a complete copy of everything, saved wherever you want — laptop, phone, external drive.
- **Or clone it** (keeps history, easy to re-sync later):
  ```bash
  git clone https://github.com/<your-username>/Victoria.git
  ```
- Drop that copy on any device you own. Do it whenever you like — weekly, monthly, before any big change.

**Back up the data behind it too:** anything you exported from your own accounts (see [`data-export/`](data-export/)) is already a file you hold. Keep those copies on your own device alongside the repo.

**The guarantee:** if you ever want to stop, you don't have to ask anyone or untangle anything. You already have the whole thing on your own hardware. Delete the online copies, keep yours, and walk away clean. That option never expires.

---

## 1. Look at the picture (5 min)

Open the map on your phone or laptop:

**https://eveglyphdesign.github.io/Victoria/**

Tap or hover any glowing point. Each one tells you how it connects to the others. Notice the shape of the idea: three independent lines — **technology, faith, ancestry** — all crossing at one person in the center. That's the whole concept of a digital twin in one image. Don't overthink it; just get the feel.

---

## 2. Understand the three layers (5 min)

Your twin is built from three folders. Each answers one question:

| Folder | The question | Think of it as |
|---|---|---|
| **`identity/`** | Where do you come from? | Who you *are* |
| **`capability/`** | What can you do? | What you *know how to do* |
| **`values/`** | How do you decide what's worth doing? | How you *choose* |

Fill these three, and the point in the middle — you — comes into focus.

---

## 3. Add your first file (15 min)

Don't try to fill everything. Pick the **one folder that feels easiest right now** and write a short file.

**Suggested first step — `identity/about-me.md`:**

> - Where I'm from and the roots that matter to me
> - The languages I think in
> - The one thread that runs through my whole life
> - How I'd introduce myself to someone who needs to understand me fast

A few honest sentences beats a blank page. First person, your own voice.

**The easiest way (no command line):** on GitHub, open the `identity/` folder, click **Add file → Create new file**, name it `about-me.md`, type, and hit **Commit**.

**Or via command line:**

```bash
git add identity/about-me.md
git commit -m "add: about me"
git push
```

---

## 4. That's Day 1

You now have your own accounts, the picture, the structure, and one real bearing on the map. Everything after this is the same loop, one file at a time:

**pick a layer → answer a prompt → commit → repeat.**

There's no "finished." The twin gets sharper every time you add a file, and it's good enough when its answers start sounding like *you*.

---

## What we're actually testing

Here's the bigger experiment, so you know where this is headed. As you build your twin with these tools, we'll compare how close **Perplexity gets to a truly *sovereign* model** — one that's fully yours: your data, your infrastructure, answering as you, under your control, with nothing depending on an outside service.

Perplexity is the fast, accessible starting point. A sovereign model is the destination. The gap between them — what's easy today vs. what still needs to be truly your own — is exactly what we'll measure as we go. Every file you add is also a data point in that test.

---

### If you want to go further today
- Read [`README.md`](README.md) for the full idea.
- Skim the prompts in [`capability/`](capability/) and [`values/`](values/).
- Peek at [`data-export/`](data-export/) — optional, for when you want to bring in data from your own accounts.

### Ground rules (always)
- Everything here is **yours**, contributed **by you, about you**.
- Nothing is mandatory. Blank is fine, partial is fine.
- If you'd want it deleted later, leave it out for now — you can always add it.
- You can back up everything to your own device and walk away at any time (section D). That door is always open.

Welcome aboard. See you Monday.
