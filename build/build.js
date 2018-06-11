const fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    shell = require('shelljs'),
    uglify = require('uglify-js'),
    rollup = require('rollup'),
    spawn = require('child_process').spawn,
    alias = require('rollup-plugin-alias'),
    replace = require('rollup-plugin-replace'),
    project = require('../package.json'),
    tsconfig = require('../tsconfig.json'),
    output = resolve('dist');

const banner =
`/**
  * ${project.name} v${project.version}
  * (c) 2017-${new Date().getFullYear()} Xiaoboost
  * @license MIT
  */`;

const configs = [
    {
        file: resolve(`dist/${project.name}.js`),
        format: 'umd',
        env: 'development',
    },
    {
        file: resolve(`dist/${project.name}.min.js`),
        format: 'umd',
        env: 'production',
    },
    {
        file: resolve(`dist/${project.name}.esm.js`),
        format: 'cjs',
        env: 'development',
    },
    {
        file: resolve(`dist/${project.name}.esm.min.js`),
        format: 'cjs',
        env: 'production',
    },
];

function resolve(_path) {
    return path.resolve(__dirname, '../', _path);
}

function getSize(code) {
    return (code.length / 1024).toFixed(2) + 'kb';
}

function promiseSpawn(command, ...args) {
    return new Promise((resolve, reject) => {
        const task = spawn(command, args);
        task.on('close', resolve);
        task.on('error', reject);
    });
}

function createEnv(config) {
    const environment = {
        input: {
            'input': resolve('lib/index.js'),
            'plugins': [
                alias({
                    'tslib': resolve('node_modules/tslib/tslib.es6.js'),
                }),
            ],
        },
        output: {
            banner,
            'exports': 'named',
            'file': config.file,
            'format': config.format,
            'name': 'tvue',
        },
    };

    if (config.env) {
        environment.input.plugins.unshift(replace({
            'process.env.NODE_ENV': JSON.stringify(config.env),
        }));
    }

    return environment;
}

function write(dest, code) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dest, code, (err) => {
            if (err) {
                return reject(err);
            }

            console.log(chalk.blue(path.relative(process.cwd(), dest)) + '  ' + getSize(code));
            resolve();
        });
    });
}

console.log('\x1Bc');
console.log(chalk.yellow('> Start Compile:\n'));
shell.rm('-rf', output);
shell.mkdir('-p', output);

async function main() {
    await promiseSpawn('node', 'node_modules/typescript/lib/tsc.js', '-p', '.');

    for (const config of configs) {
        const { input, output } = createEnv(config);
        const bundle = await rollup.rollup(input);

        let { code } = await bundle.generate(output);

        if (/min\.js$/.test(output.file)) {
            code = uglify.minify(code, {
                output: {
                    preamble: output.banner,
                    ascii_only: true,
                },
            }).code;
        }

        await write(output.file, code);
    }

    shell.rm('-rf', tsconfig.compilerOptions.outDir);

    console.log(chalk.yellow('\n> Finish Compile.'));
}

main();
