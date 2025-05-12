const newMessagesBundle = $('Agrupar e Format Mensagens').item.json;
const currentBatchOfMessages = newMessagesBundle.messages || [];
const remoteJid = newMessagesBundle.remoteJid;

let historicMessagesArray = [];

const existingChatObjectString = $input.item.json.existing_chat_object_string;

if (existingChatObjectString) {
  try {
    const existingChatObject = JSON.parse(existingChatObjectString);
    if (existingChatObject && Array.isArray(existingChatObject.messages)) {
      historicMessagesArray = existingChatObject.messages;
    } else {
      console.warn('Campo messages não encontrado ou não é array no objeto do Redis para: ' + remoteJid);
    }
  } catch (e) {
    console.warn('Falha ao parsear objeto de chat existente do Redis para: ' + remoteJid, e);
  }
}

const combinedMessages = historicMessagesArray.concat(currentBatchOfMessages);


const uniqueMessages = [];
const seenIds = new Set();
for (const msg of combinedMessages) {
  if (msg.messageId) {
    if (!seenIds.has(msg.messageId)) {
      uniqueMessages.push(msg);
      seenIds.add(msg.messageId);
    }
  } else {
    uniqueMessages.push(msg); 
  }
}


const MAX_HISTORY_SIZE = 500; 
const finalMessageArray = uniqueMessages.length > MAX_HISTORY_SIZE ? uniqueMessages.slice(-MAX_HISTORY_SIZE) : uniqueMessages;

const finalStorageObject = {
    messages: finalMessageArray, 
    senders: newMessagesBundle.senders,
    sellers: newMessagesBundle.sellers,
    customers: newMessagesBundle.customers,
    timestamp: Date.now()
};

return [{
  json: {
    remoteJid: remoteJid,
    stringified_updated_storage_object: JSON.stringify(finalStorageObject)
  }
}];