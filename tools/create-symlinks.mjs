import * as fs from "fs";
import path from "path";

console.log("Reforging Symlinks");

const configFile = path.join(process.cwd(), "foundry-config.json");
if (fs.existsSync(configFile)) {
  let fileRoot = "";
  try {
    const fc = await fs.promises.readFile("foundry-config.json", "utf-8");

    const foundryConfig = JSON.parse(fc);
    console.log("Foundry config file exists, reading from ", configFile);

    // As of 13.338, the Node install is *not* nested but electron installs *are*
    const shouldExist = path.join(
      foundryConfig.installPath,
      "Contents",
      "Resources",
      "app"
    );
    const pathExists = fs.existsSync(shouldExist);

    if (pathExists) {
      fileRoot = shouldExist;
    } else {
      throw new Error("Path does not exist: " + shouldExist);
    }

    console.log(`Foundry install path: ${fileRoot}`);
  } catch (err) {
    console.error(`Error: ${err}`);
    process.exit(1);
  }

  try {
    await fs.promises.mkdir("foundry");
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }

  // Javascript files
  console.log("Creating symlinks for JS files");
  for (const p of ["client", "common", "tsconfig.json"]) {
    try {
      const targetPath = path.join(fileRoot, p);
      if (!fs.existsSync(targetPath)) {
        console.warn(`Target path does not exist: ${targetPath}`);
        continue;
      }
      await fs.promises.symlink(
        path.join(fileRoot, p),
        path.join("foundry", p)
      );
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
    }
  }

  // Language files
  try {
    console.log("Creating symlink for lang files");
    await fs.promises.symlink(
      path.join(fileRoot, "public", "lang"),
      path.join("foundry", "lang")
    );
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
} else {
  console.log("Foundry config file did not exist.", configFile);
}
