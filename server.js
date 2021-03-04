const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const templates = require('./templates.json');

function createFolder(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

class Options {
    constructor(filename) {
        this.RECEIVE_PATH = "receive/";
        this.SHARED_PATH = "shared/";
        this.SERVER_IP = require('ip').address();
        this.PORT = 8080;
        if (fs.existsSync(filename)) {
            this.getFromFile(filename)
        } else {
            this.saveToFile(filename)
        }
    }
    setOption(option, value) {
        switch (option){
            case "SHARED_PATH":
                this.SHARED_PATH = value.trim().endsWith("/") ? value.trim() : value.trim() + "/";
                createFolder(this.SHARED_PATH);
                break;
            case "RECEIVE_PATH":
                this.RECEIVE_PATH = value.trim().endsWith("/") ? value.trim() : value.trim() + "/";
                createFolder(this.RECEIVE_PATH);
                break;
            case "PORT":
                this.PORT = parseInt(value.trim());
                if (parseInt(this.PORT) < 1025) {
                    console.log("[WARNING] You must start the server as admin to be able to bind to this port ! ");
                }
                break;
            default:
                console.log("[OPTIONS] Unknown option");
        }

    }
    saveToFile(filename) {
        console.log("[CONFIG] Saving to file: " + filename);
        let content =
            "RECEIVE_PATH = " + this.RECEIVE_PATH + "\n" +
            "SHARED_PATH = " + this.SHARED_PATH + "\n" +
            "PORT = " + this.PORT;
        fs.writeFileSync('options.txt', content, new function() {
            console.log("[CONFIG] Error saving to " + filename);
        });
    }

    getFromFile(filename) {
        let file = fs.readFileSync(filename).toString();
        file.split('\n').forEach(line => this.getOptionFromLine(line));
    }
    getOptionFromLine(line) {
        let option = line.split('=');
            if (option.length > 1) {
                console.log("[OPTIONS] Defining option " + option[0].trim() + " to " + option[1].trim());
                switch (option[0].trim()) {
                    case "SHARED_PATH":
                        this.SHARED_PATH = option[1].trim().endsWith("/") ? option[1].trim() : option[1].trim() + "/";
                        createFolder(this.SHARED_PATH);
                        break;
                    case "RECEIVE_PATH":
                        this.RECEIVE_PATH = option[1].trim().endsWith("/") ? option[1].trim() : option[1].trim() + "/";
                        createFolder(this.RECEIVE_PATH);
                        break;
                    case "PORT":
                        this.PORT = option[1].trim();
                        if (parseInt(this.PORT) < 1025) {
                            console.log("[WARNING] You must start the server as admin to be able to bind to this port ! ");
                        }
                        break;
                    default:
                        console.log("[OPTIONS] Unknown option");
                }
            }
    }
}

class QR {
    constructor() {
        this.QRAPI = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";
        this.qrIcon = "data:image/png;base64,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";
        this.linkIcon = "data:image/png;base64,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";
    }
}

function absoluteLink(relativeLink) {
    return "http://" + options.SERVER_IP + ":" + options.PORT + relativeLink;
}

function getQrIcon(target) {
    return "<img class='icon' onclick='openQr(" + '"' + qrOptions.QRAPI + target + '"' + ")' src='" + qrOptions.qrIcon + "'>";
}

function getIconSpan(target) {
    return "<span class='flex'><input type='text' value='" + target + "' readonly style='width:0;opacity:0;position:absolute;' />"
        + getQrIcon(target)
        + '<svg onclick="copyLink(this);" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather icon feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
        + "<p class='notif'>Link Copied</p></span>";
}

function addLink(link) {
    let links = fs.readFileSync('links.txt').toString();
    let lines = links.split('\n');
    if (lines[lines.length - 1] === link) {
        console.log('[LINKS] Link is the same as the last one');
        return;
    }
    lines.unshift(link);
    fs.writeFileSync("links.txt", lines.join('\n'), new function (error) {
        console.log("[LINKS] Error writing links file !" + error);
    })
}

function getLinks() {
    if (!fs.existsSync("links.txt")) fs.writeFileSync("links.txt", "https://manvan.fr");
    let links = fs.readFileSync('links.txt').toString();
    let lines = links.split('\n');
    let output = '';
    lines.forEach(function (line) {
        if (line.length > 0) {
            output += '<li class="flex">' + "<a target='_blank' href='" + line + "'><span class='fileLink'>" + normalizeLink(line) + "</span></a>";
            output += getIconSpan(line) + '</li>\n';
        }
    });
    return output;
}


function normalizeLink(link) {
    return link.split("http://").join().split("www").join().split("https://").join();
}

function populateVariables(html) {
    let output = html.toString();
    output = output.split("$IP").join(options.SERVER_IP)
    .split("$Port").join(options.PORT)
    .split("$SharedPath").join(options.SHARED_PATH)
    .split("$ReceivePath").join(options.RECEIVE_PATH);
    return output;
}

console.log('\n=========================================')
console.log('~     Starting LAN FileShare Server     ~');
console.log('=========================================\n')

const options = new Options("options.txt");
const qrOptions = new QR();

console.log("[START-UP] Server is running on : http://" + options.SERVER_IP + ":" + options.PORT + "\n");

http.createServer(function (req, res) {

    // =============== Configuration interface =============== //
    if (req.headers['host'].startsWith("localhost") || req.headers['host'].startsWith("127.")) {
        if (req.url === '/path') {
            console.log("[CONFIG] Config updated");
            let form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                options.setOption("RECEIVE_PATH", fields["ReceivePath"]);
                options.setOption("SHARED_PATH", fields["SharedPath"]);
                options.setOption("PORT", fields["Port"]);
            });
            res.writeHead(301, {"Location": "/"});
            res.end();
        } else {
            console.log('[CONFIG] Interface opened');
            let output = templates.header + templates.config;
            output = populateVariables(output);
            res.write(output);
            return res.end();
        }
    } else {
        // =============== File Upload =============== //
        if (req.url === '/fileupload') {
            let form = new formidable.IncomingForm({maxFileSize: 4000 * 1024 * 1024});
            let files = [];
            let fields = [];
            form.on('field', function (field, value) {
                fields.push([field, value]);
            })
            form.on('file', function (field, file) {
                files.push(file);
                console.log("[UPLOAD] Received : ", file.name);
            })
            form.on('end', function () {
                //console.log("fichiers :",files);
                let linkStr = "<section><h2>File(s) successfully uploaded :</h2><ul>";
                files.forEach(function (file) {
                    if (file.size > 0) {
                        let oldpath = file.path;
                        let fileName = file.name;
                        let newpath = options.RECEIVE_PATH + fileName;
                        fs.copyFile(oldpath, newpath, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                        linkStr += "<li class='flex'><a href='/shared/" + fileName + "'>" + fileName + "</a>";
                        linkStr += getIconSpan(absoluteLink("/shared/" + fileName)) + '</li>';
                    }
                });
                linkStr += "</ul></p></body></html>";
                res.writeHead(200, {'Content-Type': 'appl'});
                res.write(populateVariables(templates.header));
                res.write(linkStr);
                return res.end();
            });
            form.parse(req);
        } else if (req.url === '/list') {
            // =============== Files List =============== //
            fs.readdir(options.SHARED_PATH, function (err, files) {
                if (err) {
                    return console.log('[FILE] Unable to scan directory: ' + err);
                }
                res.writeHead(200, {'Content-Type': 'appl'});
                let header = templates.header
                res.write(populateVariables(header));
                let output =
                    "<section>" +
                        "<h2>List of shared files</h2>" +
                        "<h3>Shared directory path : <code>" + options.SHARED_PATH + "</code></h3>" +
                        "<ul>";
                if (files.length<1) {
                    output += "<li><a href='#' style='font-style: italic'>(Empty directory)</a></li>";
                } else {
                    files.forEach(function (file) {
                        if (fs.lstatSync(options.SHARED_PATH + file).isFile()) {
                            output += "<li class='flex'><a href='/files/" + file + "'><span class='fileLink'>" + file + '</span></a>';
                            output += getIconSpan(absoluteLink('/files/' + file)) + "</li>";
                        }
                    });
                }
                output += "</ul></section></div></body></html>";
                res.write(output);
                return res.end();
            });
            // =============== File download =============== //
        } else if (req.url.startsWith("/files/")) {
            console.log("[FILE] looking for " + options.SHARED_PATH + decodeURI(req.url.slice(7)));
            try {
                let output = fs.readFileSync(options.SHARED_PATH + decodeURI(req.url.slice(7)));
                res.writeHead(200, {'Content-Disposition': 'attachment; filename="' + decodeURI(req.url.slice(7)) + '"'});
                res.write(output);
                console.log('[FILE] Sent');
            } catch (e) {
                console.log('[FILE] Not Found');
                res.writeHead(404);
                res.write("File not foud");
            }
            return res.end();
        } else if (req.url.startsWith("/shared/")) {
            console.log("[FILE] looking for " + options.RECEIVE_PATH + decodeURI(req.url.slice(8)));
            try {
                let output = fs.readFileSync(options.RECEIVE_PATH + decodeURI(req.url.slice(8)));
                res.writeHead(200, {'Content-Disposition': 'attachment; filename="' + decodeURI(req.url.slice(8)) + '"'});
                res.write(output);
                console.log('[FILE] Sent');
            } catch (e) {
                console.log('[FILE] Not Found');
                res.writeHead(404);
                res.write("File not foud");
            }
            return res.end();
        } else if (req.url === '/link') {
            // =============== Add Link =============== //
            let form = new formidable.IncomingForm();
            form.parse(req, function (err, fields) {
                addLink(fields["link"]);
            });
            res.writeHead(301, {"Location": "/"});
            res.end();
            // =============== Kill Server =============== //
        } else if (req.url === '/death') {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('Server closed');
            res.end();
            process.exit();
            // =============== Index =============== //
        } else if (req.url === '/') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            let indexString = templates.index;
            let output = templates.header + indexString.replace('$LinksList', getLinks());
            res.write(populateVariables(output));
            return res.end();
        } else {
            // =============== 404 =============== //
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write("Error 404 : Not Found.");
            return res.end();
        }
    }
}).listen(options.PORT);

