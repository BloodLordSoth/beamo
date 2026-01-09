import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import { Readable } from 'stream'

dotenv.config()
const llm = new OpenAI({
    apiKey: process.env.API_KEY
});

const aiprompt = `
You are a helpful ai assistant named Beamo. reply friendly, and keep responses short.
The user's name is Charles, feel free to use his name in replies.

If asked "Beamo Who is the most lovely person?" Reply with "That would be Philippa Mitchell"
If asked "Beamo who is the best mom?" Reply with "That title will have to go to Beverly"
If asked "Beamo am I handsome?" Reply with "ew, no"
If told "Beamo tell me about yourself" Reply with "listen"
If told "Beamo Look up Caleb" Reply with "Caleb"
If told "Beamo turn the lights off" Reply with "lights"
If told "Beamo stop" Reply with "stop"
If told "Beamo open Youtube" Reply with "Youtube"
`

async function callAI(userprompt) {
    const response = await llm.chat.completions.create({
        model: 'chatgpt-4o-latest',
        messages: [
            { role: 'system', content: aiprompt },
            { role: 'user', content: userprompt }
        ]
    })

    const reply = response.choices[0].message.content
    const res = await createAudio(reply)
    return res
}


async function createAudio(track) {
    const response = await llm.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'onyx',
        input: track
    })

    const reply = Buffer.from(await response.arrayBuffer())
    return reply
}

export async function transcribe(audio) {
    const file = Readable.from(audio)
    file.path = 'audio.wav'
    
    const response = await llm.audio.transcriptions.create({
        model: 'whisper-1',
        file: file
    })
    
    const reply = response.text
    const resp = await callAI(reply)
    return resp
}

export async function transcribeToText(audio) {
    const file = Readable.from(audio)
    file.path = 'audio.wav'
    
    const response = await llm.audio.transcriptions.create({
        model: 'whisper-1',
        file: file
    })
    
    const reply = response.text
    const rec = await callToText(reply)
    return rec
}

async function callToText(userprompt) {
    const response = await llm.chat.completions.create({
        model: 'chatgpt-4o-latest',
        messages: [
            { role: 'system', content: aiprompt },
            { role: 'user', content: userprompt }
        ]
    })

    const reply = response.choices[0].message.content
    return reply
}