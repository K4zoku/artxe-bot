const {join} = require("path");
const {batchApply} = require(join(process.global.src, "core", "placeholder"));
const {readFile} = require("fs").promises;
const getJSON = require("bent")("json");
const {promisify} = require("util");
const svg2img = require("svg2img");
const s2i = promisify(svg2img);



module.exports = {
	render: render,
	getData: async country => getJSON(`https://disease.sh/v3/covid-19/${country ? "countries/" + country : "all"}`)
}

const cx = 68;
const cy = 68;
const r = 52;

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

	const placeholders = {
		cx: cx,
		cy: cy,
		r: r,
		recovered: recovered.toLocaleString(),
		infected: cases.toLocaleString(),
		active: active.toLocaleString(),
		deaths: deaths.toLocaleString(),
		activeChart: activeChart,
		recoveredChart: recoveredChart,
		deathsChart: deathsChart
	}
	const svg = batchApply(await readFile(join(__dirname, "chart.svg"), "utf-8"), placeholders);
    return s2i(svg); // return buffer
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
