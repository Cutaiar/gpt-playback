import fs from "fs";
import path from "path";
import OpenAI from "openai";
import playerFn from "play-sound";
import * as puppeteer from "puppeteer"

const USER_VOICE = "echo";
const AGENT_VOICE = "onyx"

/**
 * Create pathToCreate if it doesn't already exist
 * @param {string} pathToCreate - the path to make sure exists
 */
const createTmp = (pathToCreate) => {
  const p = path.resolve(pathToCreate);

fs.mkdir(p, { recursive: true }, (error) => {
  if (error) {
    console.error('Could not ensure path was created:', error);
    return;
  }
});
}

/**
 * Scrape the conversation from a shared a shared gpt conversation url 
 * @param {string} url - shared gpt conversation url to scrape the conversation from; 
 * @returns an array of strings containing the turns of the conversation
 */
const fetchConversation = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const selector = '[data-testid*="conversation-turn"]';

  // Wait for the content to load
  await page.waitForSelector(selector); // Replace 'your-selector' with the actual selector of the turns

  // Scrape the data
  const turns = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[data-testid*="conversation-turn"]')); // Replace 'your-selector' with the actual selector
    const turns = elements.map(element => element.querySelector('[data-message-author-role="assistant"], [data-message-author-role="user"]').innerText)
    return turns;
  });

  // console.log(turns.length);
  turns.forEach(t => console.log(t))
  await browser.close();
  return turns;
};

/**
 * Map an array of conversation turns to an array of objects containing info about who spoke
 * @param {string[]} turns - the turns to decorate
 * @returns an array of objects containing the turns as `content` and the role as `role`
 */
const decorate = (turns) => {
  return turns.map((turn, i) => {return {
    content: turn,
    role: i % 2 === 0 ? "user" : "assistant"
  }})
}

/**
 * Use OpenAI API Text-to-Speech to read `content` aloud
 * // TODO: Steam?
 * @param {string} content - the content to speak
 * @param {string} voice - the voice to use
 */
async function tts(content, voice) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: content,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}

/**
 * Orchestrate scraping the conversation, requesting a tts, and reading aloud each turn, waiting for the previous to complete before moving to the next turn
 * @param {string} url - shared gpt conversation url to scrape the conversation from; 
 */
async function readConversation(url) {
  try {
    const conversation = await fetchConversation(url);
    // return;
    for (const message of decorate(conversation)) {
      const text = message.content;
      const voice = message.role === 'user' ? USER_VOICE : AGENT_VOICE;
      await tts(text, voice);
      console.log(`${message.role}:\n ${text}`)
      await play(speechFile);
    }
    // TODO remove tmp?
  } catch (error) {
    console.error('Error:', error);
    // TODO remove tmp?
  }
}

/**
 * Read the current contents of`speachFile` aloud 
 * @param {string} speechFile - path to the mp3
 * @returns a promise to await for the reading to be done
 */
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

// Make sure the user called hte program with the url as an arg
if (process.argv.length < 3) {
  console.log('Usage: node gpt-voice-session-playback <conversation-url>');
  process.exit(1); // Exit the program with an error code (1)
}

// Set up api, speaker, and paths
const openai = new OpenAI();
const player = new playerFn({});
const tmpPath = "./tmp";
const speechFile = path.resolve(tmpPath, "speech.mp3");
createTmp(tmpPath);

// Go!
readConversation(process.argv[2]);