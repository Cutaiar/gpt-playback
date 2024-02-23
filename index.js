import clipboard from "clipboardy";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import playerFn from "play-sound";

const USER_VOICE = "echo";
const AGENT_VOICE = "onyx"

const openai = new OpenAI();
const player = new playerFn({});
const speechFile = path.resolve("./tmp/speech.mp3"); // TODO create tmp if not existing

const getConversationFromClipboard = () => {
  const text = clipboard.readSync();
  const delim = /(User|ChatGPT)/;
  const turns = text.split(delim).filter(t => !["User", "ChatGPT", "\n"].some(m => m===t));
  const response =  {messages: turns.map((turn, i) => {return {role: i % 2 === 0 ? "user" : "agent", content: turn}} )}; // TODO: First message is blank?
  return response;
}

// TODO: Function to fetch conversation from ChatGPT conversation history. This could scrape the conversation from sahre link
async function fetchConversation() {
  // const CONVERSATION_ID = "4748f9e5-2a0a-480d-a8df-230f8d907c8e";
  // const response = await fetch(`https://api.openai.com/v1/conversations/${CONVERSATION_ID}`, {
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // });
  // const conversation = await response.json();
  // return conversation;
}

async function tts(content, voice) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: content,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}

// Grab the conversation from the clipboard, then fetch messages and read aloud in a loop.
async function readConversation() {
  try {
    const conversation = getConversationFromClipboard();
    for (const message of conversation.messages) {
      const text = message.content;
      const voice = message.role === 'user' ? USER_VOICE : AGENT_VOICE;
      await tts(text, voice);
      console.log(`${message.role}:\n ${text}`)
      await play(speechFile);
    }
    // TODO remove tmp
  } catch (error) {
    console.error('Error:', error);
    // TODO remove tmp
  }
}

// Read the current contents of`speachFile` aloud 
async function play(speechFile) {
  const audio = player.play(speechFile, function(err){
    if (err) throw err
  })

  return new Promise((res, rej) => {
    audio.on('exit', (code, signal) => {
      if (code === 0) {
        res();
      } else {
        console.error(`player exited with code ${code} and signal ${signal}`);
        rej();
      }
    });
  })
}

readConversation();