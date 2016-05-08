"use strict";
var path = require("path");
var express = require("express");
var fs = require("fs");
var exphbs = require("express-handlebars");
var gzipStatic = require("connect-gzip-static");
var vhost = require("vhost");
function site_set_router(site, root, cfg) {
    var route_path = path.join(root, cfg.routes || "routes", "index.js");
    if (!fs.existsSync(route_path))
        return;
    var route = require(route_path);
    site.use(route(express.Router()));
}
exports.site_set_router = site_set_router;
function site_set_view_engine(site, root, cfg) {
    var view_path = cfg.views || "views";
    if (!fs.existsSync(path.join(root, view_path)))
        return;
    site.set("view engine", ".hbs");
    site.set("views", path.join(root, view_path));
    site.engine(".hbs", exphbs({
        defaultLayout: cfg.defaultLayout || "main",
        extname: ".hbs",
        layoutsDir: path.join(root, cfg.viewsLayouts || (view_path + "/layouts/"))
    }));
}
exports.site_set_view_engine = site_set_view_engine;
function site_set_static_index_file(site, root, cfg) {
    var static_root = path.join(root, cfg.public || "public");
    if (!fs.existsSync(static_root))
        return;
    site.get(/.*\//, function (req, res) {
        var file1 = path.join(static_root, req.path, "index.htm");
        fs.exists(file1, function (exists) {
            if (exists)
                return res.sendFile(file1);
            var file2 = path.join(root, req.path, "index.html");
            fs.exists(file2, function (exists) {
                if (exists)
                    return res.sendFile(file2);
                res.status(404);
                res.type("txt").send("Not found");
            });
        });
    });
}
exports.site_set_static_index_file = site_set_static_index_file;
function site_set_static_root(site, root, cfg) {
    var static_root = path.join(root, cfg.public || "public");
    if (!fs.existsSync(static_root))
        return;
    site.use(gzipStatic(static_root));
}
exports.site_set_static_root = site_set_static_root;
function site_setup(app, root, cfg) {
    app.set("x-powered-by", false);
    site_set_view_engine(app, root, cfg);
    site_set_router(app, root, cfg);
    site_set_static_root(app, root, cfg);
    site_set_static_index_file(app, root, cfg);
    app.use(function (req, res, next) {
        res.status(404);
        res.type("txt").send("Not found");
    });
}
exports.site_setup = site_setup;
function load_config(root) {
    var cfg_file = path.join(root, "site-config.json");
    var cfg = fs.existsSync(cfg_file) ? JSON.parse(fs.readFileSync(cfg_file, "utf8")) : {};
    return cfg;
}
exports.load_config = load_config;
function site_create(root) {
    var site = express();
    site_setup(site, root, load_config(root));
    return site;
}
exports.site_create = site_create;
function sub_site_create(root, cfg) {
    var site = express();
    site_setup(site, root, cfg);
    return site;
}
exports.sub_site_create = sub_site_create;
function site_container_add_site(container, root) {
    root = path.resolve(root);
    var sites_path = path.join(root, "sites");
    if (!fs.existsSync(sites_path))
        return;
    fs.readdirSync(sites_path).forEach(function (name) {
        console.log("loading site " + name + " ...");
        var sroot = path.join(sites_path, name);
        var scfg = load_config(sroot);
        var ssite = sub_site_create(sroot, scfg);
        if (!scfg.domains)
            scfg.domains = [name];
        scfg.domains.forEach(function (domain) {
            console.log("\tbinding domain " + domain + " ...");
            container.use(vhost(domain, ssite));
        });
    });
}
exports.site_container_add_site = site_container_add_site;
function site_container_create(root) {
    var site = express();
    site_container_add_site(site, root);
    site_setup(site, root, load_config(root));
    return site;
}
exports.site_container_create = site_container_create;

//# sourceMappingURL=index.js.map
