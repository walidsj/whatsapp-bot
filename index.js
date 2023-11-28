const express = require('express')
const compression = require('compression')
const { name, version, author } = require('./package.json')
const dotenv = require('dotenv')
const cors = require('cors')
const waBot = require('./client')
dotenv.config()

// init whatsapp bot
waBot.start()

const PORT = process.env.PORT || 5678
const KEY = process.env.KEY || 'secret'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())

// hello world (http://HOST:PORT/)
app.get('/', (req, res) =>
    res.json({ message: `Hello from ${name} v${version} by ${author}!` })
)

// url untuk mengirim pesan (http://HOST:PORT/send-message)
app.post('/send-message', async (req, res) => {
    try {
        const { number, message } = req.body
        if (!number || !message)
            throw new Error('Missing number or message parameter.')

        if (
            req.headers.authorization &&
            req.headers.authorization.split(' ')[1] !== KEY
        )
            throw new Error('Invalid key.')

        const sanitizedNumber = number
            .replace(/[^0-9]/g, '')
            .replace(/^0/, '62')
        const whatsappNumber = `${sanitizedNumber}@c.us`

        const isValid = await waBot.client.checkNumberStatus(whatsappNumber)
        if (!isValid.numberExists) throw new Error('Invalid WhatsApp number.')

        await waBot.client.sendText(whatsappNumber, message)
        res.json({ message: 'Message sent!' })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to send message!',
            error: error.message,
        })
    }
})

// jalankan server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`))
