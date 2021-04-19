const fetch = require("node-fetch");
const {logger} = process.global;
/**
* @param {string} text
* @return {string}
*/
const reply = async (text, lang="vi") => 
	fetch(`https://simsumi.herokuapp.com/api?lang=${lang}&text=${encodeURI(text)}`)
		.then(res => res.json())
		.catch(error => logger.error(error.stack))
		.then(json => json.success ?? "");

module.exports = {
	reply: reply
}
