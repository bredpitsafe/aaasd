const request = require('request');
const SLACK_BOT_TOKEN = String(process.env.SLACK_BOT_TOKEN);
let URL = 'https://slack.com/api/chat.postMessage';

function sendRequest(data, channel) {
    const body = {
        channel: channel,
        text: data.header,
        attachments: [
            {
                color: data.color,
                text: data.text,
            },
        ],
    };
    const options = {
        method: 'POST',
        url: URL,
        headers: {
            Authorization: 'Bearer ' + SLACK_BOT_TOKEN,
        },
        json: body,
    };
    request(options, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });
}

module.exports = sendRequest;
