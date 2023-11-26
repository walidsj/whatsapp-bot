const wppconnect = require('@wppconnect-team/wppconnect')

/**
 * @class WABot
 * @description Class untuk membuat bot WhatsApp
 * @method start Inisialisasi bot WhatsApp agar bisa digunakan method-methodnya
 * @method stop Stop bot WhatsApp
 * @property {import('@wppconnect-team/wppconnect').Client} client
 *
 */
class WABot {
    constructor() {
        this.client = null
    }

    async start() {
        const client = await wppconnect.create({
            session: 'my_session',
            puppeteerOptions: {
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        })
        this.client = client

        const botMsg = `🤖 *Halo! Saya adalah Bot WhatsApp* 🤖\n\nTerima kasih telah menghubungi saya. Namun, mohon maaf saat ini saya tidak dapat menjawab pesan/panggilan/grup Anda.\n\nJika Anda memiliki pertanyaan atau membutuhkan bantuan, silakan hubungi nomor berikut.\n\nSekali lagi mohon maaf atas keterbatasan ini dan terima kasih atas pengertian Anda. 🙏🏻`

        const sendTextAndVcard = async (from, text) => {
            await this.client.sendText(from, text)
            await this.client.sendContactVcard(
                from,
                `${process.env.CONTACT}@c.us`,
                process.env.NAME
            )
        }

        // response otomatis jika ada pesan masuk
        this.client.onMessage(async (message) => {
            const { from, type } = message
            switch (type) {
                case 'chat':
                case 'image':
                case 'video':
                case 'document':
                case 'audio':
                case 'ptt':
                case 'sticker':
                case 'location':
                    await sendTextAndVcard(from, botMsg)
                    break
            }
        })

        // response reject otomatis dan mengirim pesan jika ada panggilan masuk
        this.client.onIncomingCall(async (call) => {
            await this.client.rejectCall(call.id)
            await sendTextAndVcard(call.peerJid, botMsg)
        })
    }

    async stop() {
        await this.client.close()
    }
}

const waBot = new WABot()

module.exports = waBot
