import twilio from 'twilio'
import * as dotenv from 'dotenv'
import {MSG_TEMPLATES} from '../msgtemplates.js'

let client = null
dotenv.config()
const accountSid = process.env.MSG_TWILIO_ACCT_ID;
const authToken = process.env.MSG_TWILIO_ACCT_TOKEN;
const extNumber = process.env.MSG_TWILIO_NUMBER;
const mobilePrefix = process.env.MSG_TWILIO_COUNTRY_CODE;

const init = () => {
    if (accountSid === '' || authToken === '') {
        return false
    } else {
        client = twilio(accountSid, authToken);
    }
}

const santizeNumber = (clientNumber) => {
    return '+'+mobilePrefix+clientNumber;
}

const formatMessage = (template, args) => {
    return template.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
}

const submtQueueMessage = (clientNumber, queueNumber, waitingTime) => {
    init();
    clientNumber = santizeNumber(clientNumber)
    client.messages.create({
        body: formatMessage(MSG_TEMPLATES.NEWQUEUE, [queueNumber, waitingTime]),
        from: extNumber,
        to: clientNumber
    })
  .then(message => console.log(message.sid));
}

const reminderMessage = (clientNumber, waitingTime) => {
    init();
    clientNumber = santizeNumber(clientNumber)
    client.messages.create({
        body: formatMessage(MSG_TEMPLATES.UPCOMINGQUEUE, [waitingTime]),
        from: extNumber,
        to: clientNumber
    })
  .then(message => console.log(message.sid));
}

export default {
    submtQueueMessage,
    reminderMessage
}