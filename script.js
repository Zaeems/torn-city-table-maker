function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function replaceZerosWithNA() {
  var cells = document.getElementsByTagName("td");
  for (var i = 0; i < cells.length; i++) {
    if (cells[i].innerText === "0" || cells[i].innerText === "NaN") {
      cells[i].innerText = "N/A";
    }
  }
}

function createTableCell(value) {
  const cell = document.createElement("td");
  cell.innerText = numberWithCommas(value);
  return cell;
}

function parseData() {
  const inputData = document.getElementById("data-input").value;
  const sections = inputData.split("Name:");
  sections.shift();
  const tableData = sections.map((section) => {
    const nameId = section.match(/\[(\d+)\]/);
    const name = section.substr(0, nameId.index).trim();
    const id = nameId[1];
    const strength = section.match(/Strength:\s*([\d,]+)/)[1].replace(/,/g, "");
    const speed = section.match(/Speed:\s*([\d,]+)/)[1].replace(/,/g, "");
    const dexterity = section.match(/Dexterity:\s*([\d,]+)/)[1].replace(/,/g, "");
    const defense = section.match(/Defense:\s*([\d,]+)/)[1].replace(/,/g, "");
    const total = section.match(/Total:\s*([\d,]+)/)[1].replace(/,/g, "");
    const dexterity2 = speed * 14;
    const defense2 = strength * 14;
    return [
      name + "[" + id + "]",
      strength,
      speed,
      dexterity,
      defense,
      total,
      dexterity2,
      defense2,
    ];
  });

  const tableHtml =
    "<table>" +
    "<thead><tr>" +
    "<th>Name[ID]</th>" +
    "<th>Strength</th>" +
    "<th>Speed</th>" +
    "<th>Dexterity</th>" +
    "<th>Defense</th>" +
    "<th>Total</th>" +
    "<th>Dexterity (1 in 6 attacks hit you)</th>" +
    "<th>Defense (You take 0 damage)</th>" +
    "</tr></thead>" +
    "<tbody>" +
    tableData
      .map((rowData) => {
        return (
          "<tr>" +
          rowData
            .map((data, i) => {
              return i === 0
                ? "<td>" + data + "</td>"
                : "<td>" + numberWithCommas(data) + "</td>";
            })
            .join("") +
          "</tr>"
        );
      })
      .join("") +
    "</tbody>" +
    "</table>";

  document.getElementById("result").innerHTML = tableHtml;
  replaceZerosWithNA();
}

function sortTable() {
  const table = document.querySelector("table");
  const rows = Array.from(table.tBodies[0].rows);

  const sanitizeCell = (cell) => cell.innerText.replaceAll(",", "");

  const rowData = rows.map((row) => {
    const cells = Array.from(row.cells);
    const nameId = cells[0].innerText.match(/\[(\d+)\]/);
    const name = cells[0].innerText.slice(0, nameId.index).trim();
    const id = nameId[1];
    const strength = parseInt(sanitizeCell(cells[1]));
    const speed = parseInt(sanitizeCell(cells[2])) || null;
    const dexterity = parseInt(sanitizeCell(cells[3])) || null;
    const defense = parseInt(sanitizeCell(cells[4])) || null;
    const total = parseInt(sanitizeCell(cells[5])) || null;
    const dexterity2 = parseInt(sanitizeCell(cells[6])) || null;
    const defense2 = parseInt(sanitizeCell(cells[7])) || null;
    return {
      name: name,
      id: id,
      strength, speed, dexterity, defense, total, dexterity2, defense2,
    };
  });
  rowData.sort((a, b) => b.total - a.total);
  const tbody = document.createElement("tbody");
  rowData.forEach((rowData) => {
    const row = document.createElement("tr");
    const nameId = `${rowData.name}[${rowData.id}]`;
    const nameCell = document.createElement("td");
    nameCell.innerText = nameId;
    row.appendChild(nameCell);
    const strengthCell = createTableCell(rowData.strength);
    const speedCell = createTableCell(rowData.speed);
    const dexterityCell = createTableCell(rowData.dexterity);
    const defenseCell = createTableCell(rowData.defense);
    const totalCell = createTableCell(rowData.total);
    const dex2Cell = createTableCell(rowData.dexterity2);
    const def2Cell = createTableCell(rowData.defense2);
    row.append(
      strengthCell, speedCell, dexterityCell, defenseCell, totalCell, dex2Cell, def2Cell
    );
    tbody.appendChild(row);
  });
  table.replaceChild(tbody, table.tBodies[0]);
  replaceZerosWithNA();
}

function exportTableToCSV() {
  const filename = "export-" + new Date().toLocaleDateString() + ".csv";
  const rows = document.querySelectorAll("table tr");

  // Replace comma with empty string to avoid issues with numbers greater than 999
  const sanitizeCell = (cell) => cell.innerText.replaceAll(",", "");

  let csvContent = "data:text/csv;charset=utf-8,";

  rows.forEach((row) => {
    const rowData = Array.from(row.cells).map(sanitizeCell).join(",");
    csvContent += rowData + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "export-<date>.csv".
}

function exportTableToYATA() {
  const apiKey = document.getElementById("apikey").value;
  
  const filename = "export-" + new Date().toLocaleDateString() + ".csv";
  const table = document.querySelector("table");
  const rows = Array.from(table.tBodies[0].rows);

  // Replace comma with empty string to avoid issues with numbers greater than 999
  const sanitizeCell = (cell) => cell.innerText.replaceAll(",", "");
  let csvContent = "data:text/csv;charset=utf-8,";

  // Add headers to CSV file
  csvContent += "target_id,target_name,target_faction_name,target_faction_id,strength,speed,defense,dexterity,total,strength_timestamp,speed_timestamp,defense_timestamp,dexterity_timestamp,total_timestamp\r\n";

  const rowData = rows.map((row) => {
    const cells = Array.from(row.cells);
    const nameId = cells[0].innerText.match(/\[(\d+)\]/);
    const name = cells[0].innerText.slice(0, nameId.index).trim();
    const id = nameId[1];
    const strength = parseInt(sanitizeCell(cells[1]));
    const speed = parseInt(sanitizeCell(cells[2])) || null;
    const dexterity = parseInt(sanitizeCell(cells[3])) || null;
    const defense = parseInt(sanitizeCell(cells[4])) || null;
    const total = parseInt(sanitizeCell(cells[5])) || null;
    const strength_timestamp = Date.now()
    const speed_timestamp = Date.now()
    const defense_timestamp = Date.now()
    const dexterity_timestamp = Date.now()
    const total_timestamp = Date.now()

    return fetch(`https://api.torn.com/user/${id}?selections=profile&key=${apiKey}`)
     .then(response => response.json())
     .then(data => {
      const faction = data.faction;
      const factionId = faction ? faction.faction_id : null;
      const factionName = faction ? faction.faction_name : null;
      console.log("Target Faction ID:", factionId);
      console.log("Target Faction Name:", factionName);

      return {
        id, name, factionName, factionId, strength, speed, dexterity, defense, total, strength_timestamp, speed_timestamp, defense_timestamp, dexterity_timestamp, total_timestamp,
      };
    })
    .catch(error => {
      throw error;
    });
  });

  Promise.all(rowData)
  .then((rows) => {
    rows.forEach((row) => {
      const values = Object.values(row);
      const line = values.join(",");
      csvContent += line + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "export-<date>.csv".
  })
  .catch(error => {
    console.error(error);
  })
}