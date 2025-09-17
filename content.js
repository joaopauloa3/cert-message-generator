console.log("Content script INJETADO e pronto para rodar.");
function readDataTable() {
  const table = document.querySelector('#tabelaResultados');
  console.log("Tentando encontrar a tabela #tabelaResultados. Resultado:", table)

  if (!table) {
      chrome.runtime.sendMessage({ error: 'Tabela com id="tabelaResultados" não foi encontrada na página.' });
      return;
}

const rows = table.querySelectorAll('tbody tr');
console.log(`Encontradas ${rows.length} linhas (<tr>) na tabela.`);
const clients = [];

  rows.forEach(row => {
    const columns = row.querySelectorAll("td");

    if (columns.length >= 1) {
        const nameClientRaw = columns[0].innerText.trim();
        const typeCertifie = columns[4].innerText.trim();
        const dateEnd = columns[5].innerText.trim();
        let telefoneFinal = 'Teste telefone final';
        const celulaContato = columns[3]; 
      
      if (celulaContato) {
        const todosOsSpans = celulaContato.querySelectorAll('span');

        for (const span of todosOsSpans) {
          const textoDoSpan = span.innerText;
         const digitosEncontrados = textoDoSpan.match(/\d/g);

          if (digitosEncontrados && digitosEncontrados.length >= 8) {
            
            const apenasNumeros = digitosEncontrados.join('');
            
            if (apenasNumeros.length >= 10) {
              telefoneFinal = '+55' + apenasNumeros;
            }
            break; 
          }
        }
      }

    nameClientRaw.toUpperCase();
    if (nameClientRaw.includes("INDICAÇÃO")) {
      nameClientRaw.split("INDICAÇÃO")[0].trim();
    }




    const nameClientClean = nameClientRaw;

    const clienteId = `${nameClientRaw}#${typeCertifie}`;

    clients.push({
      id: clienteId,
      name: nameClientClean,
      type: typeCertifie,
      dateEnd: dateEnd,
      tel: telefoneFinal,

    })
    }
    const clientesUnicos = [...new Map(clients.map(client => [client.id, client])).values()];

    // Enviamos a lista de clientes únicos para o popup
    chrome.runtime.sendMessage({ data: clientesUnicos });
  });
  
  console.log("Dados extraídos da tabela"); 
}

readDataTable();