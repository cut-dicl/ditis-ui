async function runSimulator(
  trace,
  configuration,
  path,
  maxEvents,
  areMLFilesEnabled,
  javaPath,
  maxMemory
) {
  const fc = require("fs");
  try {
    const jc = require("java-caller");
    const jpath = require("path");

    const java = new jc.JavaCaller({
      rootPath: javaPath,
      mainClass: "cy.ac.cut.ditis.service.SimulatorService",
      additionalJavaArgs: areMLFilesEnabled
        ? `-javaagent:${jpath.dirname(javaPath)}/lib/sizeofag-1.0.4.jar`
        : "",
    });

    const c = configuration; // configuration path
    const o = path; // output path for everything
    const r = path; // report path
    const t = trace;

    let params = []

    if (maxMemory)
      params.push(`-Xmx${maxMemory}G`);
      
    params.push("-c",c);
    params.push("-o",o);
    params.push("-r",r);
    params.push("-t",t);
    if (areMLFilesEnabled)
      params.push("-e", path);
    if (maxEvents)
      params.push("-m",maxEvents);

    let { status, stdout, stderr, childJavaProcess } = await java.run(params,
      { detached: true, windowless: true }
    );

    if (stderr && stderr.length > 0) {
      throw new Error(stderr);
    }

    return childJavaProcess.pid || -1;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = { runSimulator };
