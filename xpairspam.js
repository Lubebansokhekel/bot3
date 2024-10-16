const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require('pino');
const readline = require("readline");


    const color = [
        '\x1b[31m', 
        '\x1b[32m', 
        '\x1b[33m', 
        '\x1b[34m', 
        '\x1b[35m', 
        '\x1b[36m', 
        '\x1b[37m',
        '\x1b[90m' 
    ];
    const nerakaColor = color[Math.floor(Math.random() * color.length)];

const xColor = '\x1b[0m';

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => { rl.question(text, resolve) });
};

async function NerakaProject() {
    const { state } = await useMultiFileAuthState('./77/session');
    const Nerakaz = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });
    try {
        // Ask for phone number
        const phoneNumber = await question(nerakaColor + '𝑬𝒏𝒕𝒆𝒓 𝑻𝒉𝒆 𝑻𝒂𝒓𝒈𝒆𝒕 𝑵𝒖𝒎𝒃𝒆𝒓 𝑩𝒐𝒔𝒔 : ' + xColor);
        
        // Request the desired number of pairing codes
        const nerakaCodes = parseInt(await question(nerakaColor + '𝑱𝒖𝒎𝒍𝒂𝒉 : '+ xColor));

        if (isNaN(nerakaCodes) || nerakaCodes <= 0) {
            console.log('𝑬𝒙𝒂𝒎𝒑𝒍𝒆 : 20.');
            return;
        }

        // Get and display pairing code
        for (let i = 0; i < nerakaCodes; i++) {
            try {
                let code = await Nerakaz.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(nerakaColor + `${phoneNumber} [${i + 1}/${nerakaCodes}]`+ xColor);
            } catch (error) {
                console.error('Error:', error.message);
            }
        }
    } catch (error) {
                 console.error('error') ;
}

    return Nerakaz;
}
console.log(nerakaColor + `╔═╗┌─┐┌─┐┌┬┐  ╔╗╔┌─┐┌┬┐┬┌─┐┬┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
╚═╗├─┘├─┤│││  ║║║│ │ │ │├┤ ││  ├─┤ │ ││ ││││
╚═╝┴  ┴ ┴┴ ┴  ╝╚╝└─┘ ┴ ┴└  ┴└─┘┴ ┴ ┴ ┴└─┘┘└┘` + xColor);

NerakaProject();