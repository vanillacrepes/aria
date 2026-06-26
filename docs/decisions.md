# aria | decisions

## Which framework?

Electron vs Tauri

- from my research, these were the two most popular technologies to make a desktop app.
- electron is heavier than tauri, which is the main reason why I chose tauri.
- aria is supposed to be a lightweight overlay app, I don't need all the overhead electron gives.
- I can use tauri with react + vite, all is good.

chosen: tauri

---

## which Spotify integration approach?

two ways to control Spotify from a third-party app:

1. **simulate keypresses** to the Spotify window using media keys
2. **Spotify Web API** official API with OAuth

1 works for free accounts and has zero latency, but it breaks whenever Spotify updates their app.

2 requires Premium and has a slight network delay, but it's stable, official, and gives me everything. I have premium, and all the info + controls I need will be readily available.

chosen: Spotify Web API

---

## how to handle the Windows deep-link callback?

on Windows, `aria://callback` works by re-launching the app exe with the url as a command-line argument. to fix it, I used **tauri-plugin-single-instance** which intercepts the second launch, kills it, and forwards the URL to the existing instance via a custom emitted event.
