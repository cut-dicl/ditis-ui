const kill = require('tree-kill');

export async function killProccess(id, pid) {
    try {
        await kill(pid, 'SIGKILL');
        while (process.kill(pid, 0)) { }

        // Check if the process is still running
        return false;
    } catch (err) {
        return true;
    }
    
}