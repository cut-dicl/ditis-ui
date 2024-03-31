async function runOptimizer(trace, configuration, outputPath, reportsEnabled, tracesEnabled, maxEvents, maxMemory, javaPath, path) {
    try {
        const jc = require("java-caller");
        const java = new jc.JavaCaller({
            rootPath:
                javaPath,
            mainClass: "cy.ac.cut.ditis.service.OptimizerService",
        });
        const o = outputPath;
        const t = trace;
        const sc = configuration.storage=="Default Storage Configuration"? javaPath+"/../conf/storage.properties" : 
            `${path}/configurations/${configuration.storage}.properties`;
        const oc = configuration.optimizer=="Default Optimizer Configuration"? javaPath+"/../conf/optimizer.properties": 
            `${path}/configurations/${configuration.optimizer}.properties`;
        const vc = configuration.variance=="Default Variance Configuration"? javaPath+"/../conf/variance.properties" : 
            `${path}/configurations/${configuration.variance}.properties`
        const r = reportsEnabled? "": "-srd";
        const s = tracesEnabled ? "" : "-ssd";
        const m = maxEvents ? "-m " + maxEvents : "";
        const mem = maxMemory ? `-Xmx${maxMemory}G`  : "";

        const {status, stdout, stderr, childJavaProcess} = await java.run([mem,`-o "${o}"`, `-t "${t}"`, `-sc "${sc}"`, `-oc "${oc}"`, `-vc "${vc}"`, `${r}`, `${s}`, `${m}`], { detached: true, windowless: true});
        if ( stderr && stderr.length > 0 ) throw new Error(stderr);
        return childJavaProcess.pid;
    } catch (err) {
        console.log(err);
        return -1;
    }
}

module.exports = { runOptimizer };