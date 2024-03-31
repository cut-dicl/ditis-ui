export const parseCSV = (file: string) => {
    const csv = require('csv-parser');
    const fs = require('fs');
    const results = { columns: [], data: [] };
    
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (data) => {
                if (results.columns.length === 0) {
                    results.columns = Object.keys(data);
                }
                results.data.push(data);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};