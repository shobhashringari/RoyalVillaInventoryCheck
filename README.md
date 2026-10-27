# HTML Project

A simple starter project for HTML, CSS, and JavaScript.

## Run locally

Serve the project with a local server (the form loads its activity list from
`activities.json`, which requires HTTP rather than opening the HTML file directly):

```bash
cd /path/to/html-project
python3 -m http.server 8000
```

Then visit http://localhost:8000/InventoryTracker.html

## Edit the activity list

Change the strings in `activities.json` to add, remove, or update the fixed
activity descriptions. Keep the file as a JSON array of non-empty strings, then
refresh the form. The **Add Additional Activity / Item** button still adds
editable descriptions for an individual form session.

## Android APK Build

This project is configured with Capacitor to generate a native Android APK.

### Build the APK locally

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Build web assets and sync:
   ```bash
   npm run build
   ```

3. Build the Debug APK:
   ```bash
   npm run build:apk
   ```

The compiled APK will be located at:
`RoyalVillaInventory-debug.apk` (and `android/app/build/outputs/apk/debug/app-debug.apk`)
