const Bundler = require('parcel-bundler');
const path = require('path');
const fs = require('fs');

// Move all files in /public to /output
const publicDir = path.join(__dirname, '../public');
const outputDir = path.join(__dirname, '../output');

// Make directory output
fs.mkdir(outputDir, { recursive: true }, (err) => {});

// Use fs.copyFile() to copy all files in /public to /output
fs.readdir(publicDir, (err, files) => {
  files.forEach((file) => {
    fs.copyFile(path.join(publicDir, file), path.join(outputDir, file), (err) => {
      if (err) throw err;
    });
  });
});

const options = {
    outDir: './output',
    publicUrl: './',
    sourceMaps: false,
    autoInstall: false,
    hmr: false,
    target: 'browser',
};

(async () => {
    const bundler = new Bundler([
      "./src/app.html",
      "./src/admin.html",
      "./src/deliverMessage.html",
      "./src/login.html",
    ], options);
    bundler.bundle();

    bundler.on('bundled', (bundle) => {
      console.log(`Bundle is ready.`);

      // Quit script
      process.exit();
    });
})();