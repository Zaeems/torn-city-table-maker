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
    const strength = section.match(/Strength: (\d+,?\d*)/)[1].replace(/,/g, "");
    const speed = section.match(/Speed: (\d+,?\d*)/)[1].replace(/,/g, "");
    const dexterity = section
      .match(/Dexterity: (\d+,?\d*)/)[1]
      .replace(/,/g, "");
    const defense = section.match(/Defense: (\d+,?\d*)/)[1].replace(/,/g, "");
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
  const rowData = rows.map((row) => {
    const cells = Array.from(row.cells);
    const nameId = cells[0].innerText.match(/\[(\d+)\]/);
    const name = cells[0].innerText.slice(0, nameId.index).trim();
    const id = nameId[1];
    return {
      name: name,
      id: id,
      strength: parseInt(cells[1].innerText.replaceAll(",", "")),
      defense: parseInt(cells[2].innerText.replaceAll(",", "")),
      speed: parseInt(cells[3].innerText.replaceAll(",", "")),
      dexterity: parseInt(cells[4].innerText.replaceAll(",", "")),
      total: parseInt(cells[5].innerText.replaceAll(",", "")),
      dexterity2: parseInt(cells[6].innerText.replaceAll(",", "")),
      defense2: parseInt(cells[7].innerText.replaceAll(",", "")),
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
    const defenseCell = createTableCell(rowData.defense);
    const speedCell = createTableCell(rowData.speed);
    const dexterityCell = createTableCell(rowData.dexterity);
    const totalCell = createTableCell(rowData.total);
    const dex2Cell = createTableCell(rowData.dexterity2);
    const def2Cell = createTableCell(rowData.defense2);
    row.append(
      strengthCell,
      defenseCell,
      speedCell,
      dexterityCell,
      totalCell,
      dex2Cell,
      def2Cell
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
