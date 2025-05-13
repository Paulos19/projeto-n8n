// Safely access the 'data' object from the input node's JSON
const inputData = $('É Resposta Avaliação').first()?.json?.data;

// Safely access 'text' and 'remoteJid' from the 'data' object
const texto = inputData?.text;
const remoteJid = inputData?.remoteJid;

// Check if 'texto' was successfully retrieved and is a string
if (typeof texto !== 'string') {
  return [
    {
      json: {
        avaliacao_valida: false,
        error: "Não foi possível ler o texto da mensagem para avaliação ou o texto é inválido.",
        remoteJid: remoteJid // remoteJid might still be available or undefined
      }
    }
  ];
}

// Attempt to parse the note from the text
const nota = parseInt(texto.trim());

if (!isNaN(nota) && nota >= 0 && nota <= 10) {
  return [
    {
      json: {
        avaliacao_valida: true,
        nota: nota,
        remoteJid: remoteJid
      }
    }
  ];
} else {
  return [
    {
      json: {
        avaliacao_valida: false,
        error: `O texto "${texto}" não contém uma nota válida entre 0 e 10.`,
        remoteJid: remoteJid
      }
    }
  ];
}