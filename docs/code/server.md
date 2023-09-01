# Launching development server
In `main.js`:

Convert
```
// In development:
// win.loadURL(`http://localhost:1234/app.html${URLARGUMENTS}`)

// In production:
host.startServer(win, URLARGUMENTS); 
```
Into
```
// In development:
win.loadURL(`http://localhost:1234/app.html${URLARGUMENTS}`)

// In production:
// host.startServer(win, URLARGUMENTS); 
```

Then:

- cd into `/app`
- `yarn` or `npm install`
- `yarn start` or `npm start`
- In another shell, `npm run electron`
 



Edit files in `app/src/`. Changes will be updated live.