const chatDataRaw = $json.chat_data_raw_dashboard;
let parsedChatData = { 
  messages: [],
  sellers: {},
  customers: {}
};


try {
  if (chatDataRaw && typeof chatDataRaw === 'string') {
    parsedChatData = JSON.parse(chatDataRaw) || parsedChatData;
  } else if (chatDataRaw && typeof chatDataRaw === 'object') {
    parsedChatData = chatDataRaw;
  }
} catch (e) {
  console.error("Error parsing chat data for dashboard:", e);
}


if (!parsedChatData.messages) parsedChatData.messages = [];
if (!parsedChatData.sellers) parsedChatData.sellers = {};
if (!parsedChatData.customers) parsedChatData.customers = {};


const remoteJid = $('Armazenar Mensagens (Atualizado)').item.json.remoteJid;

const getDynamicName = (isFromMe, defaultName) => {
    try {
        if (isFromMe) {
            return (parsedChatData.sellers && Object.values(parsedChatData.sellers)[0] ? 
                   Object.values(parsedChatData.sellers)[0].name : null) || defaultName;
        } else {
            return (parsedChatData.customers && Object.values(parsedChatData.customers)[0] ? 
                   Object.values(parsedChatData.customers)[0].name : null) || defaultName;
        }
    } catch (e) {
        console.error("Error in getDynamicName for dashboard:", e);
        return defaultName;
    }
}

const conversationForIa = (parsedChatData.messages || []).map(msg => {
  try {
    const senderName = getDynamicName(msg.fromMe, msg.fromMe ? 'Vendedor' : 'Cliente');
    let textContent = msg.text || '';
    
    if (msg.messageType === 'audio_transcribed' && msg.isTranscribed) {
      textContent = msg.text;
    } else if (msg.messageType === 'audio' && !msg.isTranscribed) {
      textContent = '[MENSAGEM DE ÁUDIO]';
    } else if (!msg.text && msg.messageType !== 'image' && 
               msg.messageType !== 'video' && msg.messageType !== 'sticker' && 
               msg.messageType !== 'document') {
      textContent = '[MENSAGEM SEM TEXTO]';
    }
    
    return `${senderName}: ${textContent}`;
  } catch (e) {
    console.error("Error processing message for dashboard IA:", e, "Message:", msg);
    return '[ERRO AO PROCESSAR MENSAGEM]';
  }
}).join('\n');

const fullChatHistoryArray = (parsedChatData.messages || []).map(msg => {
  try {
    return {
      sender: msg.fromMe ? 'Vendedor' : 'Cliente',
      senderName: getDynamicName(msg.fromMe, msg.fromMe ? 'Vendedor' : 'Cliente'),
      text: msg.text || (msg.messageType === 'audio' && !msg.isTranscribed ? '[AUDIO]' : 
            (msg.messageType !== 'conversation' && msg.messageType !== 'extendedTextMessage' && 
             msg.messageType !== 'audio_transcribed' ? `[${msg.messageType || 'MIDIA'}]` : 
             '[CONTEÚDO INDISPONÍVEL]')),
      timestamp: msg.timestamp,
      messageType: msg.messageType,
      fromMe: msg.fromMe
    };
  } catch (e) {
    console.error("Error formatting message for dashboard history:", e);
    return {
      sender: 'Erro',
      senderName: 'Erro',
      text: '[ERRO AO FORMATAR MENSAGEM]',
      timestamp: Date.now(),
      messageType: 'error',
      fromMe: false
    };
  }
});

return [{ 
  json: {
    remoteJid: remoteJid,
    conversation_for_ia: conversationForIa,
    full_chat_history_array: fullChatHistoryArray,
    raw_chat_data: parsedChatData 
  } 
}];