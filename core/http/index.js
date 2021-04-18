const {Readable} = require("stream");
const {parse} = require('url');
const {createServer} = require("http");
const {readFile, readdir, stat, access} = require("fs").promises;
const {join} = require("path");
const {getType} = require("mime");
const root = join(__dirname, "../..");

module.exports = async logger => {
	const server = createServer((request, response) => 
		onRequest(logger, request, response)
		.catch(err => {
			logger.error(err.stack);
			response.writeHead(500);
			response.end();
		})
	);
	let port = process.env.PORT || 42783;
	server.listen(port);
	logger.info("Listening on port " + port);
}

const exists = async file => access(file).then(() => true).catch(() => false)

const sep = "_".repeat(20);

let routes = {
	"^osu": osu,
}

const onRequest = async (logger, request, response) => {
	logger.info(sep);
	logger.info(getClientIP(request));
	let r = {
		status: 200,
		encoding: "utf-8",
		headers: {},
		content: ""
	}

	do {
		let u = request.url.substr(1);
		let fn = false;
		for (const [match, rfn] of Object.entries(routes)) {
			if (u.match(match)) {
				fn = rfn;
				break;
			}
		}

		if (fn) {
			r = await fn(request);
			break;
		}

		let realPath = join(root, request.url);
		if (!(await exists(realPath))) {
			r.status = 404;
			r.content = "Not found";
			break;
		}

		try {
			let s = await stat(realPath);
			if (s.isFile()) {
				r.headers["content-type"] = getType(realPath) ?? undefined;
				r.headers["content-length"] = s.size; // unit: bytes
				r.content = await readFile(realPath);
			} else if (s.isDirectory()) {
				r.headers["content-type"] = "text/html";
				let ls = (await readdir(realPath))
					.filter(name => !name.startsWith("."))
					.map(name => join(request.url, name))
					.map(path => wrap("a", {href: path}, path.substr(1)));

				// if not root, add a link to up folder
				request.url !== "/" && 
				ls.unshift(wrap("a", {href: join(request.url, "../")}, "../"));

				r.content = ls.join(wrap("br"));
			}
		} catch (error) {
			r.status = 500;
			logger.error(error);
		}
	} while (0);
	response.writeHead(r.status, r.headers);
	logger.info(r.status);
	logger.info(sep);
	response.end(r.content, r.encoding);
}

const NodeCache = require("node-cache");
const cache = new NodeCache({stdTTL: 60*5});

async function osu(request) {
	let r = {
		status: 200,
		encoding: "utf-8",
		headers: {},
		content: ""
	}
	let url = parse(request.url.toLowerCase(), true);
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

		const {batchApply} = require(join(__dirname, "../placeholder"));
		const fetch = require("node-fetch");

		let noVideo = bool(url.query.novideo);
		let id = +args[1];
		let dl = "https://api.chimu.moe/v1/download/{id}?n={n}";
		dl = batchApply(dl, {id: id, n: noVideo ? 1 : 0});
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
	return r;
}

const bool = (v) => v == "" || v == 1 || v == true;

function wrap(tag, attributes = {}, content) {
	attributes = Object.entries(attributes).map(attr => attr.join("=")).join(" ");
	return content ? `<${tag} ${attributes}> ${content} </${tag}>` : `<${tag} ${attributes}/>`;
}

const getClientIP = (request) => 
	(request.headers && request.headers['x-forwarded-for']) || 
	request.ip || request._remoteAddress || 
	(request.connection && request.connection.remoteAddress);
