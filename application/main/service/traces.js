async function analyzeTrace(path, javaPath) {
  try {
    const jc = require("java-caller");
    const java = new jc.JavaCaller({
      rootPath: javaPath,
      mainClass: "cy.ac.cut.ditis.service.SimTraceParser",
    });

    let params = [];
    params.push("-t", path);

    const { status, stdout, stderr } = await java.run(params, {
      windowless: true,
    });
    if (stderr && stderr.length > 0) throw new Error(stderr);
    return stdout;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function testTrace(path, javaPath) {
  try {
    const jc = require("java-caller");
    const java = new jc.JavaCaller({
      rootPath: javaPath,
      mainClass: "cy.ac.cut.ditis.service.TraceTester",
    });

    let params = [];
    params.push("-t", path);

    const { status, stdout, stderr } = await java.run(params, {
      windowless: true,
    });
    if (stderr && stderr.length > 0) throw new Error(stderr);
    return stdout;
  } catch (err) {
    console.log(err);
    return "error";
  }
}

module.exports = { analyzeTrace, testTrace };
