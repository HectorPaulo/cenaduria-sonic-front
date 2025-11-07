const fs = require("fs");
const path = require("path");
require("dotenv").config();

const targetPath = path.join(
  __dirname,
  "..",
  "src",
  "environments",
  "environment.ts"
);

const env = {
  production: false,
  CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:8100",
  BASE_URL: process.env.BASE_URL || "http://localhost:8081",
  PORT: process.env.PORT || 8081,

  // Firebase
  FIREBASE_SERVICE_ACCOUNT:
    process.env.FIREBASE_SERVICE_ACCOUNT || 
      "file:./firebase-credentials.json",
};

const fileContent = `export const environment = ${JSON.stringify(env, null, 2)} as const;
`;

fs.writeFileSync(targetPath, fileContent, { encoding: "utf8" });
console.log("Wrote", targetPath);
