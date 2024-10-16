//WELCOME TO SECRET DIRAJA

require('./settings')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const { default: NerakazConnect, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, Browsers} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const Pino = require("pino")
const readline = require("readline")
const colors = require('colors')
const { start } = require('./lib/spinner')
const cfonts = require('cfonts');
const { color, bgcolor } = require('./lib/color')
const { parsePhoneNumber } = require("libphonenumber-js")
let _welcome = JSON.parse(fs.readFileSync('./database/welcome.json'))
let _left = JSON.parse(fs.readFileSync('./database/left.json'))
const makeWASocket = require("@whiskeysockets/baileys").default

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})

let phoneNumber = "60172450429"
let bigboss = JSON.parse(fs.readFileSync('./database/bigboss.json'))

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))
         
async function startNerakaz() {
//------------------------------------------------------
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"
    const Nerakaz = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, // popping up QR in terminal log
      browser: Browsers.windows('Firefox'), // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)

         return msg?.message || ""
      },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })
   
   store.bind(Nerakaz.ev)

    // login use pairing code
   // source code https://github.com/WhiskeySockets/Baileys/blob/master/Example/example.ts#L61
   if (pairingCode && !Nerakaz.authState.creds.registered) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')

      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +60177480773")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Sila Isi Whatsapp Number Boss Bermula Dengan +60🩸\nFor example: +60177480773 : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +60177480773")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Sila Isi Whatsapp Number Boss Bermula Dengan +60🩸\nFor example: +60177480773 : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await Nerakaz.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code Boss : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }

    Nerakaz.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast' )
            if (!Nerakaz.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            const m = smsg(Nerakaz, mek, store)
            require("./Sakral")(Nerakaz, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })
    
 	//DETECT WELCOME GROUP
Nerakaz.ev.on('group-participants.update', async (anu) => {
    if (global.wlcm)
            console.log(anu)
            try {
                let metadata = await Nerakaz.groupMetadata(anu.id)
                const groupDesc = metadata.desc
                let participants = anu.participants
                for (let num of participants) {
                    // Get Profile Picture User
                    try {
                        ppuser = await Nerakaz.profilePictureUrl(num, 'image')
                    } catch {
                        ppuser = 'https://pomf2.lain.la/f/9l748det.jpg'
                    }
    
                    // Get Profile Picture Group
                    try {
                        ppgroup = await Nerakaz.profilePictureUrl(anu.id, 'image')
                    } catch {
                        ppgroup = 'https://pomf2.lain.la/f/9l748det.jpg'
                    }
                   if (anu.action == 'add') {
    let ngel = fs.readFileSync('./777Media/welcome.mp3')
    let contextInfo = {
    externalAdReply: {
    title: `𝑾͒͛͛̈́̾͋𝑬͌̐͋̾͘̚𝑳̀̐͆̈́̚͝𝑪̿͆͋͆͘𝑶͑̈́̔̕͘͝𝑴̔͆͆͘͠𝑬̓̀͒̀͝ @${num.split("@")[0]} 𝑻̿̐̐̀̚𝑶̒̈́͒̓͆͑ ${metadata.subject}`, 
    body: '𝑺𝒊𝒍𝒂𝒌𝒂𝒏 𝑴𝒆𝒏𝒊𝒌𝒎𝒂𝒕𝒊',
    description: '𝑱𝒂𝒏𝒈𝒂𝒏 𝑳𝒖𝒑𝒂 𝑴𝒂𝒌𝒂𝒏',
    mediaType: 1,
    thumbnailUrl: ppuser,
    sourceUrl: "https://chat.whatsapp.com/GOEOOzr0Wc27sD8i3USjb0",
    renderLargerThumbnail: true
    }
    }
    Nerakaz.sendMessage( anu.id,{contextInfo, audio: ngel,mimetype:'audio/mp4', ptt:true })
    } 
    
    else if (anu.action == 'remove') {
    let ngel2 = fs.readFileSync('./777Media/left.mp3')
    let contextInfo = {
    externalAdReply: {
    title: `𝑺͊̿̈́𝑬͋͊͝𝑳͛͠͝𝑨͊͒̕𝑴̿̕̕𝑨́̐͑𝑻͌̽͘ 𝑴͑̕𝑨͆̒̚𝑴͆͑̒𝑷͌͛͑𝑶̀̽͆𝑺̿̈́̕ @${num.split("@")[0]}🩸,`, 
    body: '𝑆𝑒𝑙𝑎𝑚𝑎𝑡 𝑀𝑒𝑛𝑖𝑘𝑚𝑎𝑡𝑖 𝑇𝑎𝑘𝑑𝑖𝑟 𝐴𝑛𝑑𝑎',
    //description: 'Patuhi Deskriptif Yak',
    mediaType: 1,
    thumbnailUrl: ppuser,
    sourceUrl: "https://chat.whatsapp.com/GOEOOzr0Wc27sD8i3USjb0",
    renderLargerThumbnail: true
    }
    }
    
    Nerakaz.sendMessage( anu.id,{contextInfo, audio: ngel2,mimetype:'audio/mp4', ptt:true })
} else if (anu.action == 'promote') {
    let a = `𝑺𝒖𝒄𝒄𝒆𝒔𝒔𝒇𝒖𝒍𝒍𝒚 @${num.split("@")[0]}, 𝑼𝒑 𝑻𝒐 𝑪𝒐𝒑𝒆𝒓𝒂𝒍 𝑰𝒏 ${metadata.subject}`
Nerakaz.sendMessage(anu.id, {
text: a, 
contextInfo: {
externalAdReply: {
title: `${botname}`,
body: `${bigbossname}`,
thumbnailUrl: ppuser,
sourceUrl: "https://chat.whatsapp.com/GOEOOzr0Wc27sD8i3USjb0",
mediaType: 1,
renderLargerThumbnail: true
}}})
} else if (anu.action == 'demote') {
let a = `𝑆𝑢𝑐𝑐𝑒𝑠𝑠𝑓𝑢𝑙𝑙𝑦 @${num.split("@")[0]}, 𝑃𝑢𝑡 𝑇𝑜 𝐻𝑒𝑙𝑙 `
Nerakaz.sendMessage(anu.id, {
text: a, 
contextInfo: {
externalAdReply: {
title: `${botname}`,
body: `${bigbossname}`,
thumbnailUrl: ppuser,
sourceUrl: "https://chat.whatsapp.com/GOEOOzr0Wc27sD8i3USjb0",
mediaType: 1,
renderLargerThumbnail: true
}}})
}
}
} catch (err) {
console.log("_Hai Boss Ini Barang Problem Pada Bahagian Welcome Group_ "+err)
}
})
//autostatus view
        Nerakaz.ev.on('messages.upsert', async chatUpdate => {
        	if (global.autoswview){
            mek = chatUpdate.messages[0]
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            	await Nerakaz.readMessages([mek.key]) }
            }
    })

    Nerakaz.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    Nerakaz.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = Nerakaz.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
    })

    Nerakaz.getName = (jid, withoutContact = false) => {
        id = Nerakaz.decodeJid(jid)
        withoutContact = Nerakaz.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = Nerakaz.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === Nerakaz.decodeJid(Nerakaz.user.id) ?
            Nerakaz.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    Nerakaz.public = true

    Nerakaz.serializeM = (m) => smsg(Nerakaz, m, store)

Nerakaz.ev.on("connection.update",async  (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
        	console.log(chalk.magenta(` `))
            console.log(chalk.yellow(`💎 𝑪𝒐𝒏𝒏𝒆𝒄𝒕𝒆𝒅 𝑻𝒐 𝑵𝒆𝒓𝒂𝒌𝒂  ` + JSON.stringify(Nerakaz.user, null, 2)))
			await delay(1999)
            console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${botname} ]`)}\n\n`))
            console.log(chalk.red(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⡿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⡇⠙⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⣀⡤⡞⢫⡎⢸⢱⠀⠀⠻⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⣝⡒⣶⣶⣶⣾⡯⠟⠛⠁⠈⢳⣼⣸⠀⠀⠀⠈⠣⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠓⠿⣟⣓⣒⣀⡤⠶⠚⠉⢹⣿⠀⠀⠀⠀⠀⠘⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⠳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣟⣿⢿⣶⠒⠒⠒⠒⠒⠲⠶⣶⠶⠶⠦⠼⢿⣦⣀⣀⣀⣀⣀⠀⠀⠈⠳⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⣄⠀⠀⠀⠀⠀⠈⢣⡀⠀⠀⠀⠈⠳⣌⠉⠉⠉⠉⠙⢿⡷⠿⢶⡶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢆⠀⠀⠀⠀⠀⠀⠘⣆⠀⠀⠀⠀⠈⠳⡄⠀⠀⠀⠀⠙⢦⡀⠙⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢧⠀⠀⠀⠀⠀⠀⠈⢧⠀⠀⠀⠀⠀⠙⢆⠀⠀⠀⠀⠈⢳⡀⠈⢳⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣧⠀⠀⠀⠀⠀⠀⠈⢣⠀⠀⠀⠀⠀⠈⣦⠀⠀⠀⠀⠀⠹⡀⠀⠙⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
𝑺𝒆𝒄𝒓𝒆𝒕 𝒄𝒐𝒎𝒑𝒂𝒏𝒚 𝑳𝒕𝒅.𝑪𝒐  ⠹⡆⠀⠀⠀⠀⠀⠀⠈⣧⠀⠀⠀⠀⠀⠘⣇⠀⠀⠀⠀⠀⢻⡄⠀⠈⠳⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⢸⠀⠀⠀⠀⠀⠀⠸⣦⠀⠀⠀⠀⠀⢸⡆⠀⠀⠀⠀⠈⢧⠀⠀⠀⠈⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⠘⡆⠀⡆⠀⠀⠀⠀⡟⡇⠀⠀⠀⠀⠀⣧⠀⠀⠀⠀⠀⢸⣆⠀⠀⠀⠀⠹⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡄⡇⠀⢰⠀⠀⠀⠀⣷⠃⡇⢠⡄⠀⠀⢸⢸⢠⡄⠀⠘⡟⣿⠀⠀⠀⠀⠀⢸⣿⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠟⡿⠀⢸⢀⢀⠀⢠⡟⡔⡇⡌⡇⠀⠀⣺⢸⢸⣿⣰⢀⣧⡿⠀⠀⠀⣀⣴⡿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣤⣤⠤⢤⣤⣾⠀⡇⡀⡌⣸⣼⠀⣴⣿⡇⡇⣿⡇⡆⣀⣿⣿⣸⢹⣿⢸⣿⠀⢰⠒⠾⣿⣻⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡞⠛⣻⣿⣟⡛⠛⣻⡇⢸⢁⣿⡇⣿⣇⣤⣿⣿⢳⣿⢻⢳⣿⣹⣏⡇⣯⣿⠃⣼⣾⡤⢾⠁⠈⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣷⣾⣷⣲⣾⣿⣶⣾⢁⡞⣾⣾⣻⣿⣽⣿⠟⣏⣎⡟⣞⣾⣿⣿⢹⣼⣹⣿⣴⠟⠉⠀⣾⠀⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⢯⣿⣿⣿⣻⣿⠃⡼⣹⢳⣿⣿⣽⣿⣿⣾⡘⣹⣽⣻⡿⣿⣣⣷⡿⠛⢻⡾⠷⣄⢀⣿⠀⢸⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡷⠶⠯⠿⣭⡾⢃⡞⣱⢟⣿⣿⣿⣻⣤⣤⣽⣿⡷⣧⣽⡿⢟⣉⡁⠀⠀⢨⢿⣶⣿⣿⠇⢀⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⣤⣼⣷⣤⣤⣼⣿⣗⣾⣤⣽⣊⣿⣿⣿⣿⢯⡤⠿⣿⣿⣿⡼⠷⠈⢃⣠⣤⣶⣿⣿⣿⢿⣿⠀⣸⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣍⠉⢹⣿⡿⣿⣿⠿⠿⠛⠛⢹⣯⢹⣿⡟⣆⢸⠿⣠⣿⣿⣻⠧⠖⠛⣿⠖⠋⣽⣿⢽⣶⣿⠣⣶⣿⠃⠀⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣷⣼⣿⣷⣿⣿⣶⣄⣀⣀⣀⣠⣤⣿⣿⠛⠿⠿⣛⣻⡷⠋⠀⠀⠀⣿⣶⢾⣿⠟⣫⢴⠏⢠⣿⢻⣧⣴⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢷⣤⣀⠀⠀⢀⣀⡉⠉⠉⠛⢛⣛⣿⠿⣿⣶⣾⣿⣩⣅⡤⠶⠶⠛⠉⠙⠛⣿⣛⣭⠏⢠⣿⠻⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢻⣟⡛⠛⠓⠒⠲⠲⠾⠿⠿⠿⠿⠛⠛⠛⠛⠛⠉⠁⠀⣀⣀⣠⣴⣞⡿⢽⣿⠃⣰⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⣀⠹⣿⡦⣄⣠⣠⣦⣤⣀⣀⣀⣀⣀⣀⣀⣤⣤⡤⠤⠶⠿⠛⣋⣿⣷⣶⡾⡁⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⡿⠋⣼⠿⣻⡿⣿⣻⣟⣦⣄⣀⣠⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣲⣾⣿⣟⣿⣿⠋⣠⣾⠯⢤⣄⡀⠀⢀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣁⢸⡇⠈⣇⠀⣿⠛⣦⠙⢪⣷⠿⠛⠓⠒⠾⠷⣶⡶⠶⠶⢶⣶⣶⣶⣶⣟⣹⣯⣷⠞⢁⣴⠿⢿⡶⣄⡈⠙⣿⡍⠉⣙⡻⣶⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⢿⢿⠇⢿⣄⠘⠳⠽⠷⢯⡀⢹⣇⠀⠀⣀⡤⠤⠤⢤⣈⡛⢶⣞⠁⢀⣀⠀⠉⠻⠟⠡⠴⠛⠛⠛⠋⠛⢳⣍⠀⠸⣿⡄⠈⠛⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠷⣶⣤⣤⣼⠇⠈⠻⣦⣀⢹⣷⣶⠀⠀⠈⠉⠛⢿⣦⣼⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣏⢀⣾⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤`))
            console.log(chalk.cyan(`< ༺═────────────────────────────────────────────═༻ >`))
	        console.log(chalk.magenta(`\n${themeemoji} WELCOME TO SECRET COMPANY DIRAJA`))
            console.log(chalk.magenta(`${themeemoji} APA YANG TERJADI ITU ADALAH TANGGUNGJAWAB KERAJAAN `))
            console.log(chalk.magenta(`${themeemoji} INSTAGRAM: @nafishazlan `))
            console.log(chalk.magenta(`${themeemoji} CREDIT: ${wm}\n`))
            await delay(1999)
cfonts.say('Sakral', {
    font: 'block',
    align: 'left',
    colors: ['red', 'redBright'],
    background: 'transparent',
    rawMode: false,
});
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            startNerakaz()
        }
    })
    Nerakaz.ev.on('creds.update', saveCreds)
    Nerakaz.ev.on("messages.upsert",  () => { })

    Nerakaz.sendText = (jid, text, quoted = '', options) => Nerakaz.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted,
        ...options
    })
    Nerakaz.sendTextWithMentions = async (jid, text, quoted, options = {}) => Nerakaz.sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, {
        quoted
    })
    Nerakaz.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await Nerakaz.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    Nerakaz.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await Nerakaz.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    Nerakaz.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    
    Nerakaz.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
	    size: await getSizeMedia(data),
            ...type,
            data
        }

    }
    
    Nerakaz.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
  let type = await Nerakaz.getFile(path, true);
  let { res, data: file, filename: pathFile } = type;

  if (res && res.status !== 200 || file.length <= 65536) {
    try {
      throw {
        json: JSON.parse(file.toString())
      };
    } catch (e) {
      if (e.json) throw e.json;
    }
  }

  let opt = {
    filename
  };

  if (quoted) opt.quoted = quoted;
  if (!type) options.asDocument = true;

  let mtype = '',
    mimetype = type.mime,
    convert;

  if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
  else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
  else if (/video/.test(type.mime)) mtype = 'video';
  else if (/audio/.test(type.mime)) {
    convert = await (ptt ? toPTT : toAudio)(file, type.ext);
    file = convert.data;
    pathFile = convert.filename;
    mtype = 'audio';
    mimetype = 'audio/ogg; codecs=opus';
  } else mtype = 'document';

  if (options.asDocument) mtype = 'document';

  delete options.asSticker;
  delete options.asLocation;
  delete options.asVideo;
  delete options.asDocument;
  delete options.asImage;

  let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
  let m;

  try {
    m = await Nerakaz.sendMessage(jid, message, { ...opt, ...options });
  } catch (e) {
    //console.error(e)
    m = null;
  } finally {
    if (!m) m = await Nerakaz.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
    file = null;
    return m;
  }
}

    Nerakaz.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }
    }
return startNerakaz()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("conflict")) return
if (e.includes("Socket connection timeout")) return
if (e.includes("not-authorized")) return
if (e.includes("already-exists")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})