const {join} = require("path");
const {readFile} = require("fs").promises;
const s2i = require("util").promisify(require("svg2img"));

module.exports = {
	render: render,
	getData: getData
}

const API_URL = "https://disease.sh/v3/covid-19/";
async function getData(country) {
	const reqPath = country ? "countries/" + country : "all"
	return (await fetch(API_URL + reqPath));
}

const cx = 68;
const cy = 68;
const r = 52;
const rt = 24;
const colors = {
	blank: "#6e7983",
	active: "#970c0c",
};
async function render(data) {
	let {cases, deaths, active, recovered} = data;
	cases = cases ?? 0;
	deaths = deaths ?? 0;
	active = active ?? 0;
	recovered = recovered ?? 0;

    const deathsRate = (deaths/cases)*100;
    const activeRate = (active/cases)*100;
	const recoveredRate = (recovered/cases)*100;

   	const deathsChart = createChartSVG(deathsRate);
    const activeChart = createChartSVG(activeRate, deathsRate);
    const recoveredChart = createChartSVG(recoveredRate, 100-recoveredRate);
    const isGlobal = !data.country;
    const country = (!isGlobal && data.countryInfo.iso2.toLowerCase()) ?? "global";
    const mapColor = isGlobal ? colors.active : colors.blank;
	const placeholders = {
		cx, cy, r, rt, country, mapColor,
		recovered: recovered.toLocaleString(),
		infected: cases.toLocaleString(),
		active: active.toLocaleString(),
		deaths: deaths.toLocaleString(),
		activeChart, recoveredChart, deathsChart
	}
	const fileContent = await readFile(join(__dirname, "optimized.svg"), "utf-8");
	const svg = placeholder(fileContent, placeholders);
    return s2i(svg, {
    	width: 1790,
    	height: 768
    }); // return buffer
}

const p2a = p => (p % 100) * 3.6;
function createChartSVG(rate, offset=0) {
	offset = p2a(offset);
    return describeArc(cx, cy, r, offset, p2a(rate) + offset);
}

function describeArc(x, y, r, startAngle, endAngle) {
    let start = polarToCartesian(x, y, r, endAngle);
    let end = polarToCartesian(x, y, r, startAngle);
    let arcSweep = endAngle - startAngle <= 180 ? 0 : 1;
    return [
        'M', start.x, start.y,
        'A', r, r, 0, arcSweep, 0, end.x, end.y,
        'L', x, y,
        'L', start.x, start.y
    ].join(' ');
}

const d2r = deg => (deg - 90) * Math.PI / 180;
function polarToCartesian(cx, cy, d, deg) {
    let rad = d2r(deg);
    return {
        x: cx + (d * Math.cos(rad)),
        y: cy + (d * Math.sin(rad))
    };
}
