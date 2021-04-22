const FormData = require("form-data");
const fetch = require("node-fetch");

async function apiCall(imgBuffer, type = "png") {
    let body = new FormData();
    body.append("img_bytes", imgBuffer, {
        filename: "detect." + type,
    });
    let res = await fetch("https://api.zalo.ai/v1/ninedash/detect", {
        method: "POST",
        headers: {
            apikey: process.env.ZALO_API_KEY,
        },
        body
    });
    return res.status !== 200 ? false : res.json();
}

async function isIllegal(imgBuffer, type) {
    const res = await apiCall(imgBuffer, type);
    return res && !!res.data.have_ninedash;
}

module.exports = {
    apiCall,
    isIllegal,
}