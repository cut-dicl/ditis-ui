async function analyzeTrace(path, javaPath) {
  try {
    const jc = require("java-caller");
    const java = new jc.JavaCaller({
      rootPath: javaPath,
      mainClass: "cy.ac.cut.ditis.service.SimTraceParser",
    });

    const { status, stdout, stderr } = await java.run([`-t "${path}"`], {
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

    const { status, stdout, stderr } = await java.run([`-t ${path}`], {
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
