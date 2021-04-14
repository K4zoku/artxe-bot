const http = require("http");
const {readFile, readdir, stat, access} = require("fs").promises;
const {join} = require("path");
const mime = require("mime");
const root = join(__dirname, "../..");

(async () => {
	const server = http.createServer((req, res) => 
		onRequest(req, res)
		.catch(err => {
			console.error(err);
			res.writeHead(500);
			res.end();
		})
	);
	let port = process.env.PORT || 42783;
	server.listen(port);
	console.log("Listening on port " + port);
})().catch(console.error);

const exists = async file => access(file).then(() => true).catch(() => false)

const onRequest = async (req, res) => {
	let file = join(root, req.url);
	let httpCode = 500;
	let contentType = "text/plain";
	let content = "";
	if (await exists(file)) {
		httpCode = 200;
		let fstat = await stat(file);
		if (fstat.isFile()) {
			contentType = mime.getType(file) ?? contentType;
			content = await readFile(file, "utf-8");
		} else if (fstat.isDirectory()) {
			contentType = "text/html";
			content = (await readdir(file))
				.filter(f => !f.startsWith("."))
				.map(f => join(req.url, f))
				.map(f => `<a href="${f}"> ${f} </a>`)
				.join("<br/>");
		}
	} else {
		httpCode = 404;
		content = "Not found";
	}
	console.log(`${httpCode} | ${req.url}`);
	res.writeHead(httpCode, { 
		'Content-Type': contentType 
	});
	res.end(content, 'utf-8');
}