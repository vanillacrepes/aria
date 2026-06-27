# aria | roadmap

## phase 1 | shell
get a window on screen that looks and behaves like a notch.

- [x] scaffold Tauri 2 + React + Vite + TypeScript
- [x] configure tauri.conf.json 
- [x] center notch at window render
- [x] build static UI

## phase 2 | show/hide
make the notch appear and disappear correctly.

- [x] register Ctrl+Shift+S toggle
- [x] CSS slide-up animation on hide, slide-down on show

## phase 3 | Spotify auth
get a valid Spotify access token. no UI changes yet, just auth working end to end.

- [x] implement PKCE auth flow
- [x] register aria:// deep-link scheme
- [x] handle aria://callback and exchange code for tokens
- [x] fixed Windows double-instance issue with tauri-plugin-single-instance
- [x] store and auto-refresh tokens

## phase 4 | live data
replace hardcoded UI with real Spotify state.

- [x] fetch current playback from Spotify Web API every 3s
- [x] display live track name, artist, and album art
- [x] smooth progress bar with CSS transition interpolation
- [x] snap progress on song change

## phase 5 | controls
make the buttons actually do things.

- [x] play / pause toggle
- [x] skip forward
- [x] skip back

## phase 6 | polish
make it look pretty

- [x] notch hover behavior
- [x] proper login ui