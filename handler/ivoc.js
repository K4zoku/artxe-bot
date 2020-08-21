const request = require('request');
const Logger = require('../terminal/Logger');
const svg2img = require('svg2img');
const fs = require('fs');
const path = require('path');
const {__rootdir} = require('../root');
const {fileNewName, numberWithCommas} = require('./utils');

module.exports = {
    getData: (country="global", message) => {
        let result = {
            case: 0, recovered:0, dead:0
        };
        let url = "https://coronavirus-19-api.herokuapp.com";
        if (country.toLowerCase() === "global") {
              url += "/all";
        } else {
            url += "/countries/";
            url += country;
        }
        request({
            url: url,
            json: false
        }, (error, response, body) => {
            if (error) Logger.error(error);
            Logger.debug("API response: " + body);
            if (body === "Country not found") {
                message.channel.send(body);
                return;
            }
            result = JSON.parse(body);
            let displayCountry = country.split("");
            displayCountry = displayCountry.shift().toUpperCase() + displayCountry.join("");
            let pngFile = renderPNG(result);
            message.channel.send(displayCountry, {files: [pngFile]}).then().catch(Logger.error);
            try {
                fs.unlinkSync(pngFile);
                Logger.debug("[sync] File deleted " + pngFile);
            } catch {
                Logger.error("Delete Fail, attempting to try again with async");
                fs.unlink(pngFile, () => {Logger.debug("[async] File deleted " + pngFile)});
            }
        });
        return result;
    },
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {
    let start = polarToCartesian(x, y, radius, endAngle);
    let end = polarToCartesian(x, y, radius, startAngle);
    let arcSweep = endAngle - startAngle <= 180 ? '0' : '1';
    return [
        'M', start.x, start.y,
        'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
        'L', x, y,
        'L', start.x, start.y
    ].join(' ');
}
const onePercent = 3.6; // degree
function createChartSVG(dataPercent, startAngle=0) {
    const dataFixed = parseFloat(parseFloat(dataPercent).toFixed(2));
    const endAngle = (dataFixed * onePercent) + startAngle;
    return describeArc(67.733345, 67.733345, 51.971222, startAngle, endAngle);
}

function renderPNG(data) {
    const infected = data["cases"];
    const recovered = data["recovered"];
    const deaths = data["deaths"];
    const recoveredPercent = (recovered/infected)*100;
    const deadPercent = (deaths/infected)*100;
    const currentInfected = infected-recovered-deaths;
    const currentInfectedPercent = 100-recoveredPercent-deadPercent;
    const infectedChart = createChartSVG(currentInfectedPercent);
    const recoveredChart = infected > 0 ?
        createChartSVG(recoveredPercent, currentInfectedPercent*onePercent) :
        createChartSVG(100);
    const deathsChart = createChartSVG(deadPercent, (currentInfectedPercent+recoveredPercent)*onePercent);
    let svgData =
        fs.readFileSync(
            path.join(__rootdir, "app", "ncov", "ncov-chart-template.svg"),
            "utf-8"
        )
        .replace("${infectedChart}", infectedChart)
        .replace("${recoveredChart}", recoveredChart)
        .replace("${deathsChart}", deathsChart)
        .replace("${infected}", numberWithCommas(infected))
        .replace("${currentInfected}", numberWithCommas(currentInfected))
        .replace("${recovered}", numberWithCommas(recovered))
        .replace("${deaths}", numberWithCommas(deaths))
    ;
    let pngName = "ncov-inc.png";
    svg2img(svgData, function(error, buffer) {
        if (error) return Logger.error(error.stack);
        pngName = fileNewName(path.join(__rootdir, ".cache"), pngName);
        fs.writeFileSync(path.join(__rootdir, ".cache", pngName), buffer);
        Logger.debug('File written ' + path.join(__rootdir, ".cache", pngName));
    });
    return path.join(__rootdir, ".cache", pngName);
}