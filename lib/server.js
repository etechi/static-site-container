"use strict";
var sc = require("./index");
function main() {
    var program = require("commander");
    program
        .version('0.0.5')
        .description('A simple static web servier for handling multiple sites with different domains.')
        .usage('[options] <site path root...>')
        .option('-p, --port <n>', 'Add listen port [80]', function (s) { return parseInt(s); }, 80)
        .parse(process.argv);
    console.log(program.args);
    if (!program.args || program.args.length != 1) {
        program.help();
        return;
    }
    var site = sc.site_container_create(program.args[0]);
    site.listen(program.port);
    console.log("static web server listening at " + program.port);
}
main();

//# sourceMappingURL=server.js.map
