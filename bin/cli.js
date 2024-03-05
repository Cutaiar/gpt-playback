#!/usr/bin/env node

import readConversation from "../index.js";
// Make sure the user called hte program with the url as an arg
if (process.argv.length < 3) {
    console.log('Usage: gpt-playback <conversation-url>');
    process.exit(1); // Exit the program with an error code (1)
}

readConversation(process.argv[2]);