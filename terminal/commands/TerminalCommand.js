class TerminalCommand {

    constructor(name="", alias=[""], desc="", example="", execute=()=>{}) {
        this.name = name;
        this.alias = alias;
        this.desc = desc;
        this.example = example;
        this.execute = execute;
    }

}

module.exports = TerminalCommand;