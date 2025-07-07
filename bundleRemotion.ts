import { bundle } from "@remotion/bundler";
import path from "path";
import fs from "fs";

bundle({
  entryPoint: path.join(process.cwd(), "./remotion/index.ts"),
}).then((bundleLocation) => {
  fs.writeFileSync("remotionBundle.txt", bundleLocation);

  console.log(
    "✅📃 Wrote location to bundle at " +
      path.join(process.cwd(), "remoteBundle.txt")
  );
});
