const getJSON = require("bent")("json");
const {logger} = process.global;
/**
* @param {string} text
* @return {string}
*/
const reply = async (text, lang="vi") => 
	getJSON(`https://simsumi.herokuapp.com/api?lang=${lang}&text=${encodeURI(text)}`)
		.catch(error => logger.error(error.stack))
		.then(json => json.success ?? "");

module.exports = {
	reply: reply
}
