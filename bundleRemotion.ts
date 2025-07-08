import { bundle } from "@remotion/bundler";
import path from "path";
import fs from "fs";

bundle({
  entryPoint: path.join(process.cwd(), "./remotion/index.ts"),
  outDir: path.join(process.cwd(), "./remotionBundle"),
}).then(() => {
  console.log("✅📃 Bundled remotion with the application");
});
