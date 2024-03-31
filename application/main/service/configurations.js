export async function getDefaultConfig(javaPath) {

    const jc = require("java-caller");

    const java = new jc.JavaCaller({
        rootPath: javaPath,
        mainClass: "cy.ac.cut.ditis.service.Configuration",
    });

    const {status, stdout, stderr} = await java.run();
    if (stderr) {
        console.log("stderr of the java command is :\n" + stderr);
    }

    return JSON.parse(stdout);
}

export async function getDefaultOptimizerConfig(javaPath){
    const jc = require("java-caller");

    const java = new jc.JavaCaller({
        rootPath: javaPath,
        mainClass: "cy.ac.cut.ditis.service.ConfigurationOptimizer",
    });

    const {status, stdout, stderr} = await java.run();
    if (stderr) {
        console.log("stderr of the java command is :\n" + stderr);
    }
    return JSON.parse(stdout);
}