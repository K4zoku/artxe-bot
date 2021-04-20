const {URL} = require("url");
const NodeCache = require("node-cache");
const cache = new NodeCache({stdTTL: 60*5});

module.exports = new Router("^osu", handler);

async function handler(request, response) {
    let r = {
        status: 200,
        encoding: "utf-8",
        headers: {},
        content: ""
    }
    let url = new URL("http://127.0.0.1" + request.url.toLowerCase());
    let k = url.pathname.substr("/osu/".length);
    let args = k.split("/");
    do {
        if (args.length !== 2 && args[0] !== "download") {
            r.status = 404;
            r.headers["content-type"] = "application/json";
            r.content = JSON.stringify({
                code: 404,
                message: "Not found",
            });
            break;
        }

        if (cache.has(k)) {
            r = cache.get(k);
            break;
        }

        let noVideo = bool(url.searchParams.get("novideo"));
        let id = +args[1];
        let dl = "https://api.chimu.moe/v1/download/{id}?n={n}";
        dl = placeholder(dl, {id: id, n: noVideo ? 1 : 0});
        let res = await fetch(dl);
        r.headers["content-type"] = res.headers.get("content-type");
        if (res.status === 200) {
            r.headers["content-length"] = res.headers.get("content-length");
            r.headers["content-disposition"] = res.headers.get("content-disposition");
            r.content = await res.buffer();
            break;
        }

        r.status = res.status;
        res = await res.json();
        r.content = JSON.stringify({
            code: res.code,
            message: res.message,
        });
    } while(0);
    !cache.has(k) && cache.set(k, r);

    response.writeHead(r.status, r.headers);
    response.end(r.content, r.encoding);
    info(r.status);
}

const info = _ => Logger.info(_, {label: "HTTP/Route/Osu"})
const bool = (v) => v == "" || v == 1 || v == true;