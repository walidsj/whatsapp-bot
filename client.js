const wppconnect = require('@wppconnect-team/wppconnect')

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

        const botMsg = `🤖 *Halo! Saya adalah Bot WhatsApp* 🤖\n\nTerima kasih telah menghubungi saya. Namun, mohon maaf saat ini saya tidak dapat menjawab pesan/panggilan/grup Anda.\n\nJika Anda memiliki pertanyaan atau membutuhkan bantuan, silakan hubungi _creator_ saya melalui WhatsApp: +${process.env.CONTACT} a.n. *${process.env.NAME}*.\n\nSekali lagi mohon maaf atas keterbatasan ini dan terima kasih atas pengertian Anda. 🙏🏻`

        this.client.onIncomingCall(async (call) => {
            await this.client.rejectCall(call.id)
            await this.client.sendText(call.peerJid, botMsg)
            await this.client.sendContactVcard(
                from,
                `+${process.env.CONTACT}`,
                process.env.NAME
            )
        })

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
                    await this.client.sendText(from, botMsg)
                    await this.client.sendContactVcard(
                        from,
                        `+${process.env.CONTACT}`,
                        process.env.NAME
                    )
                    break
            }
        })
    }

    async stop() {
        await this.client.close()
    }
}

const waBot = new WABot()

module.exports = waBot
