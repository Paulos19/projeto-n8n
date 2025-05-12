const messages = $input.all();
const groupedMessages = {};
let firstRemoteJid = null; 

const getSafe = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((acc, key) => {
    try {
      return acc && acc[key] !== undefined ? acc[key] : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }, obj);
};

messages.forEach(msg => {
  try {
    
    const remoteJid = getSafe(msg, 'json.data.remoteJid');
    if (!remoteJid) {
      console.log('Mensagem sem remoteJid, ignorando:', msg);
      return; 
    }
    
    if (!firstRemoteJid) firstRemoteJid = remoteJid;

    const fromMe = getSafe(msg, 'json.data.fromMe', false);
    let text = getSafe(msg, 'json.data.text', '');
    const messageType = getSafe(msg, 'json.data.messageType', 'unknown');
    const isTranscribed = getSafe(msg, 'json.data.is_transcribed', false);

    if (messageType === 'audio' && !isTranscribed) {
        text = '[MENSAGEM DE ÁUDIO NÃO TRANSCRITA]';
    } else if (!text && messageType === 'audio_transcribed') {
        text = '[TRANSCRIÇÃO VAZIA OU FALHOU]';
    } else if (!text) {
        text = '[MENSAGEM SEM TEXTO]';
    }

    const instance = getSafe(msg, 'json.evo.instance');
    const pushName = getSafe(msg, 'json.data.pushName', 'Cliente');
    const messageId = getSafe(msg, 'json.data.id');
    const timestamp = getSafe(msg, 'json.data.messageTimestamp', Date.now() / 1000);

    const sender = fromMe ? 'Vendedor' : 'Cliente';
    const senderId = fromMe ? instance : remoteJid;

    if (!groupedMessages[remoteJid]) {
      groupedMessages[remoteJid] = {
        messages: [],
        senders: {},
        sellers: {},
        customers: {}
      };
    }

    
    if (fromMe && instance && !groupedMessages[remoteJid].sellers[instance]) {
      groupedMessages[remoteJid].sellers[instance] = {
        name: 'Vendedor (' + instance + ')',
        instance: instance
      };
    }

    
    if (!fromMe && !groupedMessages[remoteJid].customers[remoteJid]) {
      groupedMessages[remoteJid].customers[remoteJid] = {
        name: pushName || 'Cliente',
        number: remoteJid
      };
    }

    
    groupedMessages[remoteJid].messages.push({
      text: text,
      fromMe: fromMe,
      sender: sender,
      senderId: senderId,
      timestamp: timestamp,
      messageId: messageId,
      messageType: messageType,
      isTranscribed: isTranscribed,
      rawData: msg.json
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error, 'Mensagem:', msg);
  }
});


const output = [];
for (const remoteJid in groupedMessages) {
  try {
    
    if (Object.keys(groupedMessages[remoteJid].customers).length === 0 && remoteJid) {
        groupedMessages[remoteJid].customers[remoteJid] = {
            name: 'Cliente',
            number: remoteJid
        };
    }

    
     if (Object.keys(groupedMessages[remoteJid].sellers).length === 0) {
        
        let defaultInstance = 'InstanciaPadrao';
        const firstFromMeMsg = groupedMessages[remoteJid].messages.find(m => m.fromMe && m.rawData?.evo?.instance);
        // Verifica que firstFromMeMsg.rawData.evo.instance sea una cadena no vacía antes de usarla
        if (firstFromMeMsg && firstFromMeMsg.rawData?.evo?.instance && firstFromMeMsg.rawData.evo.instance !== "") {
            defaultInstance = firstFromMeMsg.rawData.evo.instance;
        }
        groupedMessages[remoteJid].sellers[defaultInstance] = {
            name: `Vendedor (${defaultInstance})`,
            instance: defaultInstance
        };
    }

    // Modificación para determinar sellerInstance:
    let sellerInstance = Object.values(groupedMessages[remoteJid].sellers)[0]?.instance;
    if (sellerInstance === "" || sellerInstance === undefined) {
      sellerInstance = 'InstanciaPadrao'; // Si es cadena vacía o undefined, usa 'InstanciaPadrao'
    }

    output.push({
      json: {
        remoteJid: remoteJid,
        messages: groupedMessages[remoteJid].messages,
        senders: {
          ...groupedMessages[remoteJid].sellers,
          ...groupedMessages[remoteJid].customers
        },
        sellers: groupedMessages[remoteJid].sellers,
        customers: groupedMessages[remoteJid].customers,
        instanceName: sellerInstance, // Usa el sellerInstance modificado
        formattedMessages: groupedMessages[remoteJid].messages.map(msg => {
          return {
            sender: msg.sender,
            senderId: msg.senderId,
            text: msg.text,
            timestamp: msg.timestamp,
            messageId: msg.messageId,
            messageType: msg.messageType
          };
        }),
        conversationContext: {
          seller: Object.values(groupedMessages[remoteJid].sellers)[0] || null,
          customer: Object.values(groupedMessages[remoteJid].customers)[0] || null
        }
      }
    });
  } catch (error) {
    console.error('Erro ao formatar saída para remoteJid:', remoteJid, error);
  }
}


if (output.length === 0 && firstRemoteJid) {
    console.warn(`Nenhuma mensagem processada para ${firstRemoteJid}, criando saída padrão.`);
    output.push({
        json: {
            remoteJid: firstRemoteJid,
            messages: [],
            senders: { [firstRemoteJid]: { name: 'Cliente', number: firstRemoteJid } },
            sellers: {},
            customers: { [firstRemoteJid]: { name: 'Cliente', number: firstRemoteJid } },
            instanceName: null, // Mantenido como null aquí, ya que no hay datos de instancia
            formattedMessages: [],
            conversationContext: { seller: null, customer: { name: 'Cliente', number: firstRemoteJid } }
        }
    });
}


return output;