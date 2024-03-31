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

    const java = new jc.JavaCaller({
      rootPath: javaPath,
      mainClass: "cy.ac.cut.ditis.service.SimulatorService",
      additionalJavaArgs: areMLFilesEnabled
        ? `-javaagent:${javaPath}/../lib/sizeofag-1.0.4.jar`
        : "",
    });

    const c = configuration; // configuration path
    const e = areMLFilesEnabled ? path : ""; //export ML files
    const o = path; // output path for everything
    const r = path; // report path
    const t = trace;
    const m = maxEvents ? maxEvents : ""; // max events
    const mem = maxMemory ? `-Xmx${maxMemory}G` : "";

    let { status, stdout, stderr, childJavaProcess } = await java.run(
      [
        mem,
        `-c "${c}"`,
        areMLFilesEnabled ? `-e "${e}"` : ``,
        `-o "${o}"`,
        `-r "${r}"`,
        `-t "${t}"`,
        maxEvents ? `-m "${m}"` : `${m}`,
      ],
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
