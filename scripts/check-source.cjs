const fs = require("fs"),
  path = require("path"),
  parser = require("@babel/parser");
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
}
const files = [
  "App.js",
  "index.js",
  ...walk("src").filter((f) => /\.js$/.test(f)),
];
for (const file of files) {
  const tree = parser.parse(fs.readFileSync(file, "utf8"), {
    sourceType: "module",
    plugins: ["jsx"],
  });
  for (const node of tree.program.body) {
    const src = node.source?.value;
    if (src?.startsWith(".")) {
      const base = path.resolve(path.dirname(file), src);
      if (
        ![base, base + ".js", path.join(base, "index.js")].some((f) =>
          fs.existsSync(f),
        )
      )
        throw Error(file + ": missing " + src);
    }
  }
}
console.log(
  "Parsed " + files.length + " source files; all relative imports resolve.",
);
