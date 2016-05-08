///<reference path="../typings/main.d.ts"/>
import path = require("path");
import express = require("express");
import fs = require("fs");

const exphbs = require("express-handlebars");
const gzipStatic = require("connect-gzip-static");
const vhost = require("vhost");

interface SiteConfig {
    public?: string;
    views?: string;
    viewsLayouts?: string;
    defaultLayout?: string;
    routes?: string;
    domains?: string[];
    port?: number;
}
export function site_set_router(site: express.Express, root: string, cfg: SiteConfig): void {
    const route_path = path.join(root, cfg.routes || "routes", "index.js");
    if (!fs.existsSync(route_path))
        return;
    const route = require(route_path);
    site.use(route(express.Router()));
}
export function site_set_view_engine(site: express.Express, root: string, cfg: SiteConfig): void {
    const view_path = cfg.views || "views";
    if (!fs.existsSync(path.join(root, view_path)))
        return;
    site.set("view engine", ".hbs");
    site.set("views", path.join(root, view_path));

    site.engine(
        ".hbs",
        exphbs({
            defaultLayout: cfg.defaultLayout || "main",
            extname: ".hbs",
            layoutsDir: path.join(root, cfg.viewsLayouts || (view_path + "/layouts/"))
        })
    );
}

export function site_set_static_index_file(site: express.Express, root: string, cfg: SiteConfig): void {
    const static_root = path.join(root, cfg.public || "public");
    if (!fs.existsSync(static_root))
        return;
    site.get(/.*\//, (req, res) => {
        const file1 = path.join(static_root, req.path, "index.htm");
        fs.exists(file1, (exists) => {
            if (exists)
                return res.sendFile(file1);
            const file2 = path.join(root, req.path, "index.html");
            fs.exists(file2, (exists) => {
                if (exists)
                    return res.sendFile(file2);
                res.status(404);
                res.type("txt").send("Not found");
            });
        });
    });
}
export function site_set_static_root(site: express.Express, root: string, cfg: SiteConfig): void {
    const static_root = path.join(root, cfg.public || "public");
    if (!fs.existsSync(static_root))
        return;
    site.use(gzipStatic(static_root));
}

export function site_setup(app: express.Express, root: string, cfg: SiteConfig): void {
    app.set("x-powered-by", false);

    site_set_view_engine(app, root, cfg);
    site_set_router(app, root, cfg);

    site_set_static_root(app, root, cfg);
    site_set_static_index_file(app, root, cfg);

    app.use((req, res, next) => {
        res.status(404);
        res.type("txt").send("Not found");
    });
}

export function load_config(root: string): SiteConfig {
    const cfg_file = path.join(root, "site-config.json");
    const cfg = fs.existsSync(cfg_file) ? <SiteConfig>JSON.parse(fs.readFileSync(cfg_file, "utf8")) : {};
    return cfg;
}
export function site_create(root: string): express.Express {
    const site = express();
    site_setup(site, root, load_config(root));
    return site;
}
export function sub_site_create(root: string, cfg: SiteConfig): express.Express {
    const site = express();
    site_setup(site, root, cfg);
    return site;
}
export function site_container_add_site(container: express.Express, root: string) {
    root=path.resolve(root);
    const sites_path = path.join(root, "sites");
    
    if (!fs.existsSync(sites_path)) return;
    fs.readdirSync(sites_path).forEach(name => {
        console.log("loading site " + name + " ...");
        const sroot = path.join(sites_path, name);
        const scfg = load_config(sroot);
        const ssite = sub_site_create(sroot, scfg);
        if (!scfg.domains) scfg.domains = [name];
        scfg.domains.forEach(domain => {
            console.log("\tbinding domain " + domain + " ...");
            container.use(vhost(domain, ssite));
        });
    });
}

export function site_container_create(root: string): express.Express {
    const site = express();
    site_container_add_site(site, root);
    site_setup(site, root, load_config(root));
    return site;
}


