const {createServer} = require("http");
const {readFile, readdir, stat, exists} = require("mz/fs");
const {join} = require("path");
const {getType} = require("mime");
const root = join(__dirname, "../..");

module.exports = async () => {
	const server = createServer(onRequest);
	info("Loading routes...");
	await loadRoutes();
	let port = process.env.PORT || 42783;
	server.listen(port);
	info("Listening on port " + port);
}

let routes = [];
const loadRoutes = async () => {
	let rd = join(__src, "http/routers");
	routes = (await readdir(rd))
		.filter(file => file.toLowerCase().endsWith(".js"))
		.map(file => join(rd, file))
		.map(require)
		.filter(object => object instanceof Router); // Router[]
	routes.push(defaultRouter);
}

let defaultRouter = new Router("[\s\S]*", async (request, response) => {
	info(sep);
	info(getClientIP(request));
	let r = {
		status: 200,
		encoding: "utf-8",
		headers: {
			"content-type": "text/plain"
		},
		content: ""
	}
	do {
		let realPath = join(root, request.url);
		if (!(await exists(realPath))) {
			r.status = 404;
			r.headers["content-type"] = "text/html";
			r.content = await readFile(join(__src, "/http/error-documents/404.html"));
			break;
		}

		try {
			let s = await stat(realPath);
			if (s.isFile()) {
				r.headers["content-type"] = getType(realPath) ?? r.headers["content-type"];
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
		} catch (e) {
			r.status = 500;
			error(e);
		}
	} while (0);
	response.writeHead(r.status, r.headers);
	response.end(r.content, r.encoding);
	info(r.status);
});

const sep = "_".repeat(20);

const onRequest = async (request, response) => routes
		.find(r => request.url.substr(1).match(r.matcher))
		.handle(request, response)
		.catch(e => {
			error(e);
			response.writeHead(500);
			response.end();
		});

function wrap(tag, attributes = {}, content) {
	attributes = Object.entries(attributes).map(attr => attr.join("=")).join(" ");
	return content ? `<${tag} ${attributes}> ${content} </${tag}>` : `<${tag} ${attributes}/>`;
}

const getClientIP = (request) => 
	(request.headers && request.headers['x-forwarded-for']) || 
	request.ip ||
	(request.connection && request.connection.remoteAddress);

const info = _ => Logger.info(_, {label: "HTTP/Server"});