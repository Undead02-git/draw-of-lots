const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

    const pathToLoad = path.join(app.getAppPath(), 'out', 'index.html');

    win.loadFile(pathToLoad)
        .catch(err => {
            console.error("Failed to load Next.js index.html:", err);
            // Fallback for debugging, if necessary
            // win.loadFile(path.join(__dirname, "../out/index.html"));
        });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
