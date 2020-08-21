module.exports = {
    fallback: (...params) => {
        for (const param of params) {
            if (param !== undefined && param !== null) {
                return param;
            }
        }
    },

    isset: (variable) => {
        return variable !== undefined;
    },

    login: () => {
        const Logger = require("../terminal/Logger");
        process["internal"]["discord"]["client"].login(process["internal"]["discord"]["bot"]["token"])
            .then(() => {
                Logger.info(`[DiscordClient] Logged in as ${process["internal"]["discord"]["client"].user.tag}`)
                process["internal"]["discord"]["bot"]["logged-in"] = true;
            })
            .catch(Logger.error);
    },

    numberWithCommas: (x=0) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    fileNewName: (path, filename, ext) => {
        const fs = require('fs');
        let pos = filename.lastIndexOf(ext);
        let name;
        if (pos > -1) {
            name = filename.slice(0, pos);
        } else {
            name = filename;
        }
        let newName = filename;
        let counter = 1;
        let newPath = path + '/' + filename;

        while (fs.existsSync(newPath)) {
            newName = name + '-' + counter + ext;
            newPath = path + '/' + newName;
            counter++;
        }
        return newName;
    }
}