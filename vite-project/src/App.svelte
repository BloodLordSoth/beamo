<script>
  import { onMount } from 'svelte'
  import kato from './assets/kato.mp3'
  import openEye from '../src/assets/eyes1.png'
  import blink from '../src/assets/blink.png'
  let canvas;
  let c;
  let stream;
  let chunks;
  let mediaRecorder;
  let audio;
  let timer = 0
  let reply;
  let chattimer = 0
  let eye1 = new Image()
  let eye2 = new Image()
  eye1.src = openEye
  eye2.src = blink

  setInterval(() => {
    timer++
    if (timer === 30) {
      timer = 0
    }
  }, 200)


  onMount(() => {
    c = canvas.getContext('2d')
    if (c) {
      loop(c)
    }
  })
  
  function draw() {
    if (timer >= 29) {
      c.drawImage(eye2, 0, 0)
    } else {
      c.drawImage(eye1, 0, 0)
    }
  }
  
  function loop(c) {
    draw()
    update()
    requestAnimationFrame(loop)
  }
  
  function update() {

  }

  async function recordAudio() {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    const mimeType =
    MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/mp4'

    const extension = mimeType.includes('webm') ? 'webm' : 'mp4'

    mediaRecorder = new MediaRecorder(stream, { mimeType })
    chunks = []

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType })
      
      const formData = new FormData()
      formData.append('file', blob, `audio.${extension}`)

      const res = await fetch('/prompt', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error)
        return
      }

      const data = await res.json()
      reply = data

      switch (data.text) {
        case 'lights':
          audio.src = kato
          audio.volume = 0.3
          audio.play()
          break
        case 'stop':
          audio.stop()
          break
        case 'Youtube':
          window.open('http://www.youtube.com', '_blank')
          data.text = ''
          break
        default:
          audio.src = data.audiourl
          audio.play()
      }

      const chatinter = setInterval(() => {
        chattimer++
        if (chattimer === 20) {
          chattimer = 0
          clearInterval(chatinter)
        }
      }, 300)
    }

    mediaRecorder.start()
  }

  async function t2() {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') return

    mediaRecorder.stop()
    stream.getTracks().forEach(track => track.stop())
  }
</script>

<main>
  <audio bind:this={audio}></audio>
  <canvas bind:this={canvas} id="canvas"></canvas>

  <div id="container">
    {#if chattimer > 0}
    <p id="airesponse">{reply?.text}</p>
    {/if}
    <div id="btndiv">
      <button id="btn" on:click={recordAudio}>Command</button>
      <button id="btn" on:click={t2}>End</button>
    </div>
  </div>
</main>

<style>
  #canvas {
    margin-top: 5vh;
    width: 70vw;
    height: 70vh;
  }
  #container {
    position: absolute;
    bottom: 5vh;
    display: flex;
    width: 60vw;
    height: 8vh;
    color: #fff;
    font-size: 1.2rem;
    font-family: monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  #btn {
    padding: 5px;
    width: 20vw;
    height: 10vh;
    
    background: lightgreen;
    border: none;
  }
  

  @keyframes fade {
    from {
      opacity: 100%
    }
    to {
      opacity: 0%;
    }
  }

  @media (max-height: 400px) {
    #canvas {
      margin: 0;
      margin-top: 0;
      width: 55vw;
      height: 55vh;
    }
    #container {
      right: 0;
      width: 100vw;
      height: 15vh;
    }
  }
</style>