import { readdir, rm, cp, writeFile } from "node:fs/promises";
import { env, argv } from "node:process";
import esbuild, { type BuildOptions } from "esbuild";
import { htmlPlugin } from "@craftamap/esbuild-plugin-html";
import dotenv from "dotenv";

if (!env.CI) dotenv.config();

const serveDev = argv[2] === "serve";
const analyze = argv.includes("--analyze");

const sourcedir = "src";
const outdir = "build";

const entryPoints = [
    `${sourcedir}/index.tsx`,
    `${sourcedir}/index.css`
];

env.NODE_ENV = serveDev ? "development" : "production";

const pickAsJsonFromEnv = (keys: string[]) => keys
    .reduce((all, key) => ({ ...all, ["process.env." + key]: JSON.stringify(env[key] ?? null) }), {});

const loader = [".png", ".jpg", ".svg", ".webp", ".webm", ".weba", ".mp3", ".mp4", ".otf", ".woff", ".woff2"]
    .reduce((loaders, ext) => ({ ...loaders, [ext]: "file" }), {});

const buildOptions: BuildOptions = {
    entryPoints,
    entryNames: "[name]-[hash]",
    chunkNames: "[name]-[hash]",
    outdir,
    bundle: true,
    minify: !serveDev,
    sourcemap: true,
    splitting: true,
    metafile: true,
    target: "es2020",
    format: "esm",
    define: pickAsJsonFromEnv([
        "NODE_ENV"
    ]),
    loader,
    plugins: [
        htmlPlugin({
            files: [{
                entryPoints,
                filename: "index.html", 
                scriptLoading: "module",
                htmlTemplate: `${sourcedir}/index.html`,
                define: env as {}
            }]
        })
    ],
    logLevel: serveDev ? "error" : "info"
};

(async () => {

    for (const f of await readdir(outdir)) {
        if (!f.startsWith(".")) await rm(`${outdir}/${f}`, { recursive: true });
    }

    await cp(`${sourcedir}/assets`, `${outdir}/assets`, { recursive: true });

    if (serveDev) {
    
        const context = await esbuild.context(buildOptions);

        const terminate = async () => {
            await context.dispose();
            process.exit();
        };

        process.on("SIGINT", terminate);
        process.on("SIGTERM", terminate);

        await context.watch();
        const { port } = await context.serve({ servedir: outdir, port: 8080 });

        console.info(`Server started on http://localhost:${port}`);
    
    } else {

        const result = await esbuild.build(buildOptions);

        if (analyze && result.metafile) {

            await writeFile(`${outdir}/build-meta.json`, JSON.stringify(result.metafile));

            console.info(await esbuild.analyzeMetafile(result.metafile, { verbose: false }));
        }
    }

})();
