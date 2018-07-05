const port = 8080,
    path = require('path'),
    app = new (require('koa'))(),
    chalk = require('chalk'),
    webpack = require('webpack'),
    baseConfig = require('../example/webpack.config'),
    FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

console.log(chalk.yellow('> Start Compile:\n'));

baseConfig.plugins.push(
    new FriendlyErrorsPlugin()
);

app.use(require('koa-static')(path.join(__dirname, '../example')));
app.listen(port);

const compiler = webpack(baseConfig);
compiler.watch(
    {
        ignored: /node_modules/,
    },
    (err) => {
        if (err) {
            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            return;
        }

        console.log(chalk.yellow(`Your application is already set at http://localhost:${port}/.`));
    }
);
