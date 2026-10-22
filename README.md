# Bellhop React

One React/Vite application for the eight supplied Bellhop design exports.

## Run

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. `npm run build` produces `dist/`.

## Pages

| URL | Design page |
| --- | --- |
| `/` | Trang chủ |
| `/booking-engine` | Booking Engine |
| `/cms` | Bellhop CMS |
| `/website` | Bellhop Website |
| `/message` | Bellhop Message |
| `/ai-concierge` | AI Concierge |
| `/payment` | Bellhop Payment |
| `/finance` | Bellhop Finance |

`scripts/merge_design.py` combines the eight source folders into one shared asset/runtime directory before development or production builds. The React entry point handles routes and keeps design page links inside the application. The exported design pages use their own React-based design runtime, so they are embedded as same-origin documents to preserve layout, styling, and interactive widgets. This is a migration layer: the individual pages have not yet been rewritten as native JSX components.

The supplied folders do not include separate PMS or About pages. Their links lead to relevant sections on the home page.
