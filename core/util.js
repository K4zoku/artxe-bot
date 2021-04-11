const fs = require("fs");
const {join} = require("path");
const {createReadStream, createWriteStream} = fs;
const {access} = fs.promises;
const {createGzip} = require("zlib");
const pipe = require("util").promisify(require("stream").pipeline);

module.exports = {
	fileExists: fileExists,
	fileNewName: fileNewName,
	gzip: gzip,
}

async function fileExists(file) {
	return access(file).then(() => true).catch(() => false);
}

async function fileNewName(path, name, ext = "", format = f => join(f.path, `${f.name}-${f.n}.${f.ext}`)) {
    let f = {
      path: path,
      name: name,
      ext: ext,
      n: 1
    }
    let fullPath;
    while (await fileExists(fullPath = await format(f))) f.n++;
    return fullPath;
}

async function gzip(input, output) {
  const gzip = createGzip();
  const source = createReadStream(input);
  const destination = createWriteStream(output);
  await pipe(source, gzip, destination);
}