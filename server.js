import express from 'express'
import multer from 'multer'
import cors from 'cors'
import { transcribe, transcribeToText } from './ai.js'
import { AppError, UnauthorizedError } from './errors.js'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import path from 'path'

const app = express()
const PORT = 3334
const storage = multer.memoryStorage()
const upload = multer({storage})
app.use(express.json())
app.use(cors())
const __file = fileURLToPath(import.meta.url)
const __dir = path.dirname(__file)
app.use(express.static(path.join(__dir, 'vite-project', 'dist')))

const cache = new Map()

app.post('/prompt', upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file
        
        if (!file) throw new UnauthorizedError();

        const speech = await transcribe(file.buffer)
        const text = await transcribeToText(file.buffer)
        const id = randomUUID()
        cache.set(id, speech)

        setTimeout(() => {
            cache.delete(id)
        }, 50000)
        
        res.status(200).send({text, audiourl: `/audio/${id}`})
    }
    catch (e) {
        next(e)
    }
})

app.get('/audio/:id', (req, res, next) => {
    try {
        const id = req.params.id

        if (!id) throw new UnauthorizedError();

        const audio = cache.get(id)

        if (!audio) throw new UnauthorizedError();

        res.setHeader('Content-Type', 'audio/mpeg')
        res.status(200).send(audio)
    }
    catch (e) {
        next(e)
    }
})

app.use((error, req, res, next) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).send({ error: error.message })
    }

    console.log(error)
    res.status(500).send({ error: 'There was an issue with the server.' })
})

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
})