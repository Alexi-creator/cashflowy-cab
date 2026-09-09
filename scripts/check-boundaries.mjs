#!/usr/bin/env node
/**
 * Layer and slice boundaries that Biome cannot express: its `noRestrictedImports` matches the
 * import string against a glob, while these rules need to know where a path actually leads.
 * Four things are checked:
 *
 *   1. an import never goes up the layers        (`modules/…` -> `@/pages/…`)
 *   2. a relative path never leaves its layer    (`pages/…` -> `../modules/…`)
 *   3. nor leaves into a neighbouring slice      (`goals/…` -> `../../auth/hooks/useAuthStore`)
 *   4. a slice is not reached through the alias from inside itself
 *
 * Rules 2 and 3 are what stop a private file of a neighbour being dragged in past its public
 * entry — exactly the bypass Biome used to let through. Rule 4 keeps a slice portable: inside
 * itself it walks `./` and `../`, so it can be renamed without touching its own files.
 */
import { globSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const SRC = path.join(import.meta.dirname, "..", "src")
/** Layer order: imports may only go down this list. */
const LAYERS = ["app", "pages", "modules", "shared"]
/** Layers where a slice is exactly one folder inside the layer. */
const SLICED = new Set(["modules"])

const partsOf = (file) => path.relative(SRC, file).split(path.sep)
const layerOf = (file) => partsOf(file)[0]
const sliceOf = (file) => {
  const [layer, name] = partsOf(file)
  return SLICED.has(layer) ? `${layer}/${name}` : null
}

const resolve = (spec, from) => {
  const base = spec.startsWith("@/")
    ? path.join(SRC, spec.slice(2))
    : path.resolve(path.dirname(from), spec)
  for (const c of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    try {
      if (statSync(c).isFile()) return c
    } catch {}
  }
  return base
}

const problems = []

for (const rel of globSync("**/*.{ts,tsx}", { cwd: SRC })) {
  const file = path.join(SRC, rel)
  const source = readFileSync(file, "utf8")

  for (const [, spec] of source.matchAll(/^\s*(?:import|export)[^"'\n]*from\s+"([^"]+)"/gm)) {
    const isRelative = spec.startsWith(".")
    if (!isRelative && !spec.startsWith("@/")) continue

    const target = resolve(spec, file)
    if (!target.startsWith(SRC)) continue

    const from = layerOf(file)
    const to = layerOf(target)

    if (isRelative) {
      if (to !== from) {
        problems.push([rel, spec, `relative path leaves layer ${from}/ for ${to}/`])
      } else if (sliceOf(file) && sliceOf(target) !== sliceOf(file)) {
        problems.push([
          rel,
          spec,
          `relative path leaves into the neighbouring slice ${sliceOf(target)} — reach it through @/${sliceOf(target)}`,
        ])
      }
      continue
    }

    if (sliceOf(file) && sliceOf(target) === sliceOf(file)) {
      problems.push([
        rel,
        spec,
        "own slice through the alias — inside a slice use relative paths (./ and ../)",
      ])
    } else if (LAYERS.indexOf(to) < LAYERS.indexOf(from)) {
      problems.push([rel, spec, `import goes up the layers: ${from}/ knows nothing about ${to}/`])
    }
  }
}

if (problems.length) {
  console.error(`Boundaries violated in ${problems.length} place(s):\n`)
  for (const [file, spec, why] of problems) console.error(`  src/${file}\n    "${spec}" — ${why}\n`)
  process.exit(1)
}

console.log("Layer and slice boundaries: no violations")
