// Writes html templates files as attributes in templates.json file, to prevent unnecessary I/O.

const fs = require('fs');

let templates = {}
// directory path
const dir = './html/';

// list all files in the directory
files = fs.readdirSync(dir);

files.forEach(file => {
        templates[file.split(".")[0]] = fs.readFileSync(dir+file).toString();
});

fs.writeFileSync('./templates.json',JSON.stringify(templates));