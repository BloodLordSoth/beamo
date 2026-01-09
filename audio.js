import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const llm = new OpenAI({
    apiKey: process.env.API_KEY
})

async function createAudio(track) {
    const response = await llm.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'onyx',
        input: track
    })

    const reply = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync('intro.mp3', reply)   
}
createAudio('Hey there! My name is Beamo, the perfect AI assistant for your every day tasks.')