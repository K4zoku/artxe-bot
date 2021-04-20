const reply = async (text, lang="vi") =>
	fetch(`https://simsumi.herokuapp.com/api?lang=${lang}&text=${encodeURI(text)}`)
		.then(res => res.json())
		.then(json => json.success ?? "")
		.catch(error);

module.exports = {
	reply,
}