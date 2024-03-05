# gpt-voice-session-playback

Playback your ChatGPT voice sessions using OpenAI TTS.

Of course the package is free, but if you'd like to support me, I greatly appreciate it.

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="120">](https://www.buymeacoffee.com/cutaiar)

## ✅ Prerequisites

Make sure you have a recent version of `NodeJS` and `npm`
Make sure you have set up an OpenAI API Key as an Environment Variable [according to their instructions](https://platform.openai.com/docs/quickstart/step-2-set-up-your-api-key).

## ⬇️ Installation

`npm i -g gpt-voice-session-playback`

## ❓ How to use

1. Open the chat you want to playback, click the "Share" button in the top right corner, and press "Copy link" 
3. Run `gpt-voice-session-playback <conversation-link>` in the terminal. This will grab the conversation from the link you copied and start playback.

## 🛠️ Development

1. Clone this repo
2. Run `npm i` and `npm link`
3. Test the program using `gpt-voice-session-playback <conversation-link>`

`// TODO: Does this conflict with the global install if you have one?`