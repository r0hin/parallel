const Bundler = require('parcel-bundler');

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