# aria

spotify notch for windows.

I genuinely thought this would be a quick project, I am uhhhh a few hours in. it's inspired by the notches on apple products and the dynamic island. I found myself using it a lot especially when playing games. It's coded in tauri because electron felt too heavy for a simple app like this. Most of the stuff is coded in react + vite so idk if I bit myself in the ass there, whatever.

## what it does

- little notch widget that lives at the top center of your screen (duh)
- shows current song, artist, album art
- play/pause, skip forward, skip back
- ctrl+shift+s to hide/show if it's in the way

## stack

tauri 2 + react + vite + typescript. no electron, i'm not stupid.

## setup

you need a spotify premium account (you need for spotify api, sorry)

still a wip, connecting to spotify is kinda dog rn LOL

## notes

- the app registers `aria://` as a custom url scheme for the oauth callback. if you're asked about it, just say yes
- I designed this app for windows, idk if it'll work on mac or linux. fork it if you wanna
- tokens are stored in localStorage and auto-refresh so you shouldn't have to log in more than once