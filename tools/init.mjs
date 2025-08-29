import readline from "readline";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

let appId = "my-app-id";
let title = "My App Title";
let description = "My App Description";
let author = "Dr. Nunya D. Business";
appId = await question("Enter module ID: ");
title = await question("Enter module title: ");
description = await question("Enter module description: ");
author = await question("Enter author name: ");

const moduleTemplate = `
{
  "id": "${appId}",
  "title": "${title}",
  "description": "${description}",
  "version": "1.0.0",
  "authors": [
    {
      "name": "${author}",
      "url": "https://github.com/<YOUR-GITHUB>"
    }
  ],
  "compatibility": {
    "minimum": "12",
    "verified": "13"
  },
  "styles": ["dist/main.css"],
  "esmodules": ["dist/main.js"],
  "packs": [],
  "languages": [
    {
      "lang": "en",
      "name": "English",
      "path": "lang/en.json"
    }
  ],
  "flags": {
    "hotReload": {
      "extensions": ["css", "html", "hbs", "json", "mjs", "js", "ts", "tsx"]
    }
  },
  "url": "https://github.com/<YOUR-GITHUB>/${appId}",
  "manifest": "https://raw.githubusercontent.com/<YOUR-GITHUB>/${appId}/main/src/module.json",
  "download": "https://github.com/<YOUR-GITHUB>/${appId}/archive/main.zip"
}
`;

try {
  const moduleJsonPath = path.join(process.cwd(), "module.json");
  fs.writeFileSync(moduleJsonPath, moduleTemplate.trim(), "utf8");
  console.log(`Module configuration written to ${moduleJsonPath}`);
} catch (err) {
  console.error("Error writing module.json:", err);
}

let foundryInstallPath = "/Applications/Foundry Virtual Tabletop.app/";
foundryInstallPath = await question("Enter Foundry VTT installation path: ");
const foundryConfigTemplate = `
{
  "installPath": "${foundryInstallPath}",
}
`;

try {
  const foundryConfigPath = path.join(process.cwd(), "foundry-config.json");
  fs.writeFileSync(foundryConfigPath, foundryConfigTemplate.trim(), "utf8");
  console.log(`Foundry configuration written to ${foundryConfigPath}`);
} catch (err) {
  console.error("Error writing foundry-config.json:", err);
}
rl.close();

console.log(
  "Building initial project (required for initial module recognition in foundry)..."
);
exec("pnpm run build", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  console.log(stdout);
  console.log(
    "Initialization complete. You can now run 'pnpm link-foundry' to create symlinks to foundry application code to improve intellisense."
  );
});
