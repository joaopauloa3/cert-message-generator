async function getContactedClients() {
  const result = await chrome.storage.local.get(['contactedClients']);
  const contacted = result.contactedClients || {};
  const umaSemanaAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentContacts = {};
  for (const id in contacted) {
    if (contacted[id] > umaSemanaAtras) {
      recentContacts[id] = contacted[id];
    }
  }
  await chrome.storage.local.set({ contactedClients: recentContacts });
  return recentContacts;
}
async function saveContactedClient(clientId) {
  const result = await chrome.storage.local.get(['contactedClients']);
  const contacted = result.contactedClients || {};
  contacted[clientId] = Date.now(); // Salva o ID com o timestamp atual
  await chrome.storage.local.set({ contactedClients: contacted });
}


async function handleClick(e) {
    clickedButton = e.target;

    const textToCopy = clickedButton.dataset.text;
    const tel = clickedButton.dataset.tel;
    const clientId = clickedButton.dataset.clientId; 

    if (!textToCopy || !tel || !clientId) {
        console.error('Dados não encontrados no botão.');
        return;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
        const linkWhatsapp= `whatsapp://send?phone=${tel}`;
        window.open(linkWhatsapp, '_blank');
    });
}
async function handleClickSave(e) {
    clickedButton = e.target;
    const clientId = clickedButton.dataset.clientId; 

    if (!clientId) {
        console.error('Dados não encontrados no botão.');
        return;
    }
    await saveContactedClient(clientId);
    clickedButton.parentElement.style.display = 'none';
}



function processAndShowResult(clients, contactedIds) {
    console.log("Função processarEExibirResultados foi chamada com:", clients);
    const containerClients = document.getElementById("container-clients");
    const clientsToShow = clients.filter(client => !contactedIds[client.id]);
    containerClients.innerHTML = "";
const templateCNPJ = `
Bom dia/ Boa tarde!
Prezado(a) {EMPRESA}
O certificado digital {TIPO-CERTIFICADO} da sua empresa vence dia {DATA-VENCIMENTO}
Para evitar transtornos eventuais e garantir a continuidade de suas operações sem interrupções, recomendamos que a renovação seja feita o quanto antes. 
Estamos a disposição para ajudá-lo(a) com um processo de atualização ágil e eficiente.  
Entre em contato e garanta a continuidade de seus serviços sem preocupações. 
Atenciosamente, 
DigitalSafe.`

const templateCPF = `
Bom dia/ Boa tarde! 
Prezado (a), {NOME}
O seu certificado digital {TIPO-CERTIFICADO} vence dia {DATA-VENCIMENTO}  
Para evitar transtornos eventuais e garantir a continuidade de suas operações sem interrupções, recomendamos que a renovação seja feita o quanto antes. 
Estamos a disposição para ajudá-lo(a) com um processo de atualização ágil e eficiente. Entre em contato e garanta a continuidade de seus serviços sem preocupações. 
Atenciosamente, 
DigitalSafe `

    if (clientsToShow.length === 0) {
        console.log("Nenhum cliente para exibir. Inserindo mensagem de aviso.")
        containerClients.innerHTML="<p>Nenhum cliente encontrado na tabela.</p>";
        return
    }

    clientsToShow.forEach(client => {
        let finalText1 = "";
        let finalText2 = "";
        let finalText3 = "";

        if (client.type.toUpperCase().includes("CNPJ")) {
            finalText1 = templateCNPJ.replace("{EMPRESA}", client.name);
            finalText2 = finalText1.replace("{TIPO-CERTIFICADO}", client.type);
            finalText3 = finalText2.replace("{DATA-VENCIMENTO}", client.dateEnd);
        }else {
            finalText1 = templateCPF.replace("{NOME}", client.name);
            finalText2 = finalText1.replace("{TIPO-CERTIFICADO}", client.type);
            finalText3 = finalText2.replace("{DATA-VENCIMENTO}", client.dateEnd);
        }

        const itemDiv = document.createElement('div');
        const textP = document.createElement('p');
        const btnSave = document.createElement('button');
        const btnWhatsapp = document.createElement('button');
        
        btnWhatsapp.dataset.text = finalText3;
        btnWhatsapp.dataset.tel = client.tel;
        btnWhatsapp.dataset.clientId = client.id;
        btnSave.dataset.clientId = client.id;

        // 5. Atribuímos a nossa função de clique única para este botão.
        btnWhatsapp.onclick = handleClick;
        btnSave.onclick = handleClickSave;
        btnWhatsapp.innerText = "Enviar por Zap"
        btnSave.innerText = "Concluído"
         
        itemDiv.appendChild(textP);
        itemDiv.appendChild(btnSave)
        containerClients.appendChild(itemDiv)
        itemDiv.appendChild(btnWhatsapp); 
        textP.innerText = finalText3;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('container-clients');
    container.innerHTML = '<p>Verificando contatos anteriores...</p>';

  const contactedIds = await getContactedClients();
  chrome.runtime.onMessage.addListener((message) => {
    if (message.data) {
      processAndShowResult(message.data, contactedIds);
    }
  });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            
            console.log("Injetando content.js na aba:", tabs[0].id)
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
              });
        }
    });
});
