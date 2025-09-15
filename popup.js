function processAndShowResult(clients) {
    console.log("Função processarEExibirResultados foi chamada com:", clients);
    const containerClients = document.getElementById("container-clients");

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

    if (clients.length === 0) {
        console.log("Nenhum cliente para exibir. Inserindo mensagem de aviso.")
        containerClients.innerHTML="<p>Nenhum cliente encontrado na tabela.</p>";
        return
    }

    clients.forEach(client => {
        finalText1 = "";
        finalText2 = "";
        finalText3 = "";

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
        const btnCopy = document.createElement('button');
        btnCopy.innerText = "Copiar texto"
        btnCopy.onclick = () => {
            navigator.clipboard.writeText(finalText3)
                .then(() => {
                    btnCopy.innerText = "Copiado";
                    setTimeout(() => {
                        btnCopy.innerText = "Copiat texto"
                    }, 2000)
                })
        }
    
        itemDiv.appendChild(textP);
        itemDiv.appendChild(btnCopy)
        containerClients.appendChild(itemDiv)
        textP.innerText = finalText3;
    });
}

document.addEventListener('DOMContentLoaded', () => {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("MENSAGEM RECEBIDA DO CONTENT.JS:", message);
    if (message.error) {
        alert(message.error);
        return;
    }
    if (message.data) {
        processAndShowResult(message.data);
    }
});