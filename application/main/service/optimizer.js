async function runOptimizer(trace, configuration, outputPath, reportsEnabled, tracesEnabled, maxEvents, maxMemory, javaPath, path, debugEnabled) {
    try {
        const jc = require("java-caller");
        const jpath = require("path")
        
        const o = outputPath;
        const t = trace;
        const sc = configuration.storage=="Default Storage Configuration"? `${jpath.dirname(javaPath)}/conf/storage.properties` : 
            `${path}/configurations/${configuration.storage}.properties`;
        const oc = configuration.optimizer=="Default Optimizer Configuration"? `${jpath.dirname(javaPath)}/conf/optimizer.properties`: 
            `${path}/configurations/${configuration.optimizer}.properties`;
        const vc = configuration.variance=="Default Variance Configuration"? `${jpath.dirname(javaPath)}/conf/variance.properties` : 
            `${path}/configurations/${configuration.variance}.properties`

        const java = new jc.JavaCaller({
            rootPath:
                javaPath,
            mainClass: "cy.ac.cut.ditis.service.OptimizerService"

        });

        let params = [];
        if (maxMemory)
            params.push(`-Xmx${maxMemory}G`);

        params.push("-sc",sc);
        params.push("-vc",vc);
        params.push("-oc",oc);
        params.push("-t",t);
        params.push("-o",o);
        if (reportsEnabled)
            params.push("-srd");
        if (tracesEnabled)
            params.push("-ssd");
        if (maxEvents)
            params.push("-m",maxEvents);
            
        const { status, stdout, stderr, childJavaProcess } = await java.run(params,
        { detached: true, windowless: true });

        if (stderr && stderr.length > 0) throw new Error(stderr);
        return childJavaProcess.pid || -1;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { runOptimizer };