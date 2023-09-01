# Update Workflow
Requires a MacOS system, Windows system, Xcode, Command-line tools, Git, Node, NPM/yarn.

Commit to `dev` branch with changes over time. When a new update is intended to be released, make the following changes:

### Update versioning
Update version in `package.json` to ensure auto-update works correctly:
```
"version": "x.y.z",
```

Update version in `src/js/app.js` to ensure the proper version is displayed in the app:
```
window.gitHubVersion = 'x.y.z';
```

Update version in `docs/assets/index.js` to ensure the website download button points to the latest file:
```
const version = "2.10.6";
```

### Add MacOS Executables
```
export GH_TOKEN=(your github token)
cd app
yarn pub
```

This will generate MacOS executables for the latest version, generate a new release tag on GitHub (`r0hin/parallel`), and upload files automatically. Do not publish the release on GitHub until Windows executables are uploaded.

### Add Windows Executables
By committing and pushing the latest changes on GitHub, the public website will update to target the latest version. To add the windows executables to the release, push the latest changes and pull them on a Windows system and run the following:
```
set GH_TOKEN=(your github token)
cd app
yarn pubWin
```
This will generate Windows and Linux executables for the latest version, and upload it to the newly created draft release tag on GitHub. Once all versions are added to the release, publish the release by merging `dev` into `main` on GitHub. This will release a new version of the website and web app so that the download buttons on the newly-updated website work.


### Code-Signing MacOS (Important)
See [here](https://www.electron.build/code-signing.html) or [here](https://dev.to/awohletz/how-i-sign-and-notarize-my-electron-app-on-macos-59bb) to set up code-signing.

Essentially, in `Certificates, IDs, & Profiles` within Apple Developer console, create Developer ID Application and Developer ID Installer certificates. Download and open both to install them into your MacOS keychain. `Electron-builder` should automatically sign apps now.

### Notarizing MacOS (Important)
With Xcode and command line tools installed, store your Apple Developer credentials in the `notarytool` keychain:
```
xcrun notarytool store-credentials --apple-id "name@example.com" --team-id "ABCD123456"
```
Name the profile `Main`. Enter the application specific password here for the Apple Developer ID (not Apple ID password).

Now, use the process after every release to notarize:

```
xcrun notarytool submit path-to-dist/Parallel-x.x.x.dmg --keychain-profile "Main" 
xcrun notarytool submit path-to-dist/Parallel-x.x.x-arm64.dmg --keychain-profile "Main" 
```
You will get a UUID or ID from Apple. To check progress, use the following:
```
xcrun notarytool wait [uuid] --keychain-profile "Main"
```
Once, its approved, use the folowing to staple the ticket to the distributions:
```
xcrun stapler staple path-to-dist/Parallel-x.x.x.dmg
xcrun stapler staple path-to-dist/Parallel-x.x.x-arm64.dmg
```
Once, signed, notarized, and stapled successfully, edit the published release on GitHub and replace the two MacOS DMG files with the stapled versions.

<hr>

Contact me with any questions.