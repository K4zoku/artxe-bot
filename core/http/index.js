const {Readable} = require("stream");
const {parse} = require('url');
const {createServer} = require("http");
const {readFile, readdir, stat, access} = require("fs").promises;
const {join} = require("path");
const {getType} = require("mime");
const root = join(__dirname, "../..");

(async () => {
	const server = createServer((request, response) => 
		onRequest(request, response)
		.catch(err => {
			console.error(err);
			response.writeHead(500);
			response.end();
		})
	);
	let port = process.env.PORT || 42783;
	server.listen(port);
	console.log("Listening on port " + port);
})().catch(console.error);

const exists = async file => access(file).then(() => true).catch(() => false)

const onRequest = async (request, response) => {
	let r = {
		status: 200,
		encoding: "utf-8",
		headers: {},
		content: ""
	}

	if (request.url.toLowerCase().startsWith("/osu")) {
		osu(request, response);
		return;
	}

	do {
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
			console.error(error);
			break;
		}
	} while (0);
	response.writeHead(r.status, r.headers);
	console.log(`${getClientIP(request)} | ${request.url} >> ${r.status}`);
	response.end(r.content, r.encoding);
}

async function osu(request, response) {
	let r = {
		status: 200,
		encoding: "utf-8",
		headers: {},
		content: ""
	}
	let url = parse(request.url.toLowerCase(), true);
	let args = url.pathname.substr("/osu/".length).split("/");
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

		const {batchApply} = require(join(__dirname, "../placeholder"));
		const fetch = require("node-fetch");

		let noVideo = bool(url.query.novideo);
		let dl = "https://api.chimu.moe/v1/download/{id}?n={n}";
		dl = batchApply(dl, {id: +args[1], n: noVideo ? 1 : 0});
		let res = await fetch(dl);

		r.headers["content-type"] = res.headers.get("content-type");
		if (res.status !== 200) {
			r.status = res.status;
			let j = await res.json();
			r.content = JSON.stringify({
				code: j.code,
				message: j.message,
			});
			break;
		}
		r.headers["content-length"] = res.headers.get("content-length");
		r.headers["content-disposition"] = res.headers.get("content-disposition");

		response.writeHead(r.status, r.headers);
		res.body.pipe(response);
		return;
	} while(0);
	
	response.writeHead(r.status, r.headers);
	console.log(`${getClientIP(request)} | ${request.url} >> ${r.status}`);
	response.end(r.content, r.encoding);
	
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
