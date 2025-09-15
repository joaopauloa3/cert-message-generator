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

    if (columns.length >= 7) {
        const nameClientRaw = columns[1].innerText.trim();
        const typeCertifie = columns[5].innerText.trim();
        const dateEnd = columns[6].innerText.trim();


      const nameClientClean = nameClientRaw.split('(')[0].trim();

      clients.push({
        name: nameClientClean,
        type: typeCertifie,
        dateEnd: dateEnd,

      })
    }
    chrome.runtime.sendMessage({ data: clients });
  });
  
    console.log("Dados extraídos da tabela"); 
}

readDataTable();