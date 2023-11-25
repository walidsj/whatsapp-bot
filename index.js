const express = require('express')
const compression = require('compression')
require('dotenv').config()
const { name, version, author } = require('./package.json')
const waBot = require('./client')

waBot.start()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())

const PORT = process.env.PORT || 5678
const KEY = process.env.KEY || 'secret'

app.get('/', (req, res) =>
    res.json({ message: `Hello from ${name} v${version} by ${author}!` })
)

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

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`))
