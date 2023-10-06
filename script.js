// util function
const numberWithCommas = (x) => {
  if (!x) {
    return "N/A";
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// util function
function replaceZerosWithNA() {
  const cells = document.querySelectorAll("td");
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const cellText = cell.textContent;
    if (cellText === "0" || cellText === "NaN") {
      cell.textContent = "N/A";
    }
  }
}

// util function
function createTableCell(value) {
  const cell = document.createElement("td");
  cell.textContent = numberWithCommas(value);
  return cell;
}

// util function
function generateFile(csvContent) {
  const filename = "export-" + new Date().toLocaleDateString() + ".csv";
  const encodedUri = encodeURI(csvContent);
  let link = document.querySelector("#csv-download-link");
  if (!link) {
    link = document.createElement("a");
    link.id = "csv-download-link";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
  }
  link.setAttribute("href", encodedUri);
  link.click();
}

// Parse input and generate table
function parseData() {
  const [dataInput, resultDiv] = document.querySelectorAll(
    "#data-input, #result"
  );
  const inputData = `x\n${dataInput.value}`;
  const sections = inputData.split(/(?=\b\w+\s\[\d+\])/).slice(1);

  const variables = {
    strength: /Strength:\s*((?:[\d,]+)|N\/A)/,
    speed: /Speed:\s*((?:[\d,]+)|N\/A)/,
    dexterity: /Dexterity:\s*((?:[\d,]+)|N\/A)/,
    defense: /Defense:\s*((?:[\d,]+)|N\/A)/,
    total: /Total:\s*((?:[\d,]+)|N\/A)/,
  };

  const tableData = sections.map((section) => {
    const [, name, id] = section.match(/^(.*)\[(\d+)\]/);

    const result = Object.fromEntries(
      Object.entries(variables).map(([name, regex]) => {
        const matchResult = section.match(regex);
        return [name, matchResult ? matchResult[1].replace(/,/g, "") : "0"];
      })
    );

    const dexterity2 = result.speed * 14;
    const defense2 = result.strength * 14;

    return [
      `${name}[${id}]`,
      result.strength,
      result.speed,
      result.dexterity,
      result.defense,
      result.total,
      dexterity2,
      defense2,
    ];
  });

  const tableRows = tableData
    .map(([name, ...rowData]) => {
      const cells = rowData
        .map((data) => `<td>${numberWithCommas(data)}</td>`)
        .join("");
      return `<tr><td>${name}</td>${cells}</tr>`;
    })
    .join("");

  const tableHtml = `
    <table>
      <thead>
        <tr>
          <th>Name[ID]</th>
          <th>Strength</th>
          <th>Speed</th>
          <th>Dexterity</th>
          <th>Defense</th>
          <th>Total</th>
          <th>Dexterity (1 in 6 attacks hit you)</th>
          <th>Defense (You take 0 damage)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>`;

  resultDiv.innerHTML = tableHtml;
  sortTable();
}

function sortTable() {
  const table = document.querySelector("table");
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);

  const sanitizeCell = (cell) => {
    const value = cell.textContent.replace(/,/g, "").trim();
    if (value === "0" || value === "N/A" || value === "NaN") {
      return null;
    }
    return parseInt(value);
  };

  const rowData = rows.map((row) => {
    const cells = Array.from(row.cells);
    const [, id] = cells[0].textContent.match(/\[(\d+)\]/);
    const name = cells[0].textContent
      .slice(0, cells[0].textContent.indexOf("["))
      .trim();
    const [strength, speed, dexterity, defense, total, dexterity2, defense2] =
      Array.from({ length: 7 }, (_, i) => sanitizeCell(cells[i + 1]));

    return {
      name,
      id,
      strength,
      speed,
      dexterity,
      defense,
      total,
      dexterity2,
      defense2,
    };
  });

  rowData.sort((a, b) => b.total - a.total);
  tbody.innerHTML = "";

  rowData.forEach((rowData) => {
    const row = document.createElement("tr");
    const nameId = `${rowData.name}[${rowData.id}]`;
    const link = document.createElement("a");

    link.href = `https://www.torn.com/profiles.php?XID=${rowData.id}`;
    link.target = "_blank";
    link.textContent = nameId;

    const nameCell = document.createElement("td");
    nameCell.appendChild(link);
    row.appendChild(nameCell);

    const properties = [
      "strength",
      "speed",
      "dexterity",
      "defense",
      "total",
      "dexterity2",
      "defense2",
    ];
    properties.forEach((property) => {
      row.appendChild(createTableCell(rowData[property]));
    });

    tbody.appendChild(row);
  });
  replaceZerosWithNA();
}

// Exports the table data to a CSV file
function exportTableToCSV() {
  const sanitizeCell = (cell) => cell.textContent.replaceAll(",", "");

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Column 1,Column 2,Column 3\r\n";

  const rows = document.querySelectorAll("table tr");
  const rowData = Array.from(rows).map((row) =>
    Array.from(row.cells).map(sanitizeCell).join(",")
  );
  csvContent += rowData.join("\r\n");

  generateFile(csvContent);
}

// Exports the table data to YATA with API key used to fetch Faction info
async function exportTableToYATA() {
  const apiKey = document.getElementById("apikey").value;
  const sanitizeCell = (cell) => cell.textContent.replaceAll(",", "");
  const timestamp = Math.floor(Date.now() / 1000);

  const table = document.querySelector("table");
  const rows = Array.from(table.tBodies[0].rows);

  const progressBar = document.getElementById('progress');
  const progressText = document.getElementById('progress-text');
  let fulfilledRequests = 0;

  const rowDataPromises = rows.map(async (row) => {
    const [nameId, strength, speed, dexterity, defense, total] = Array.from(
      row.cells,
      sanitizeCell
    );
    const nameMatch = nameId.match(/\[(\d+)\]/);
    const name = nameMatch ? nameId.slice(0, nameMatch.index).trim() : nameId;
    const id = nameMatch ? nameMatch[1] : null;
    const length = rows.length;

    const [response] = await Promise.allSettled([
      fetch(`https://api.torn.com/user/${id}?selections=profile&key=${apiKey}`),
      new Promise((resolve) => setTimeout(resolve, 100)), // 100 milliseconds delay for each API request
    ]);

    if (response.status === "fulfilled") {
      const data = await response.value.json();
      const faction = data.faction;
      const factionId = faction ? faction.faction_id : null;
      const factionName = faction ? faction.faction_name : null;

      fulfilledRequests++;
      const progress = (fulfilledRequests / rows.length) * 100;
      progressBar.value = progress;
      progressText.textContent = (`${fulfilledRequests} / ${length}`)
      
      return {
        id,
        name,
        factionName,
        factionId,
        strength: parseInt(strength) || null, timestamp,
        speed: parseInt(speed) || null, timestamp,
        dexterity: parseInt(dexterity) || null, timestamp,
        defense: parseInt(defense) || null, timestamp,
        total: parseInt(total) || null, timestamp,
      };
    } else {
      throw new Error(response.reason);
    }
  });

  const rowData = await Promise.all(rowDataPromises);

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent +=
    "target_id,target_name,target_faction_name,target_faction_id,strength,speed,defense,dexterity,total,strength_timestamp,speed_timestamp,defense_timestamp,dexterity_timestamp,total_timestamp\r\n";
  rowData.forEach((row) => {
    const line = Object.values(row).join(",");
    csvContent += line + "\r\n";
  });

  generateFile(csvContent);
}

function showProgress() {
  var progressTextSpan = document.getElementById("progress-text");
  var progressBar = document.getElementById("progress");
  var progressBarDiv = document.getElementById("progress-bar")

  if (progressTextSpan && progressBar) {
    // Elements already exist, reset their values
    progressTextSpan.textContent = "";
    progressBar.value = 0;
  } else {
    var progressSpan = document.createElement("span");
    progressSpan.textContent = "Progress: ";

    var progressTextSpan = document.createElement("span");
    progressTextSpan.id = "progress-text";
    progressSpan.appendChild(progressTextSpan);

    var progressBar = document.createElement("progress");
    progressBar.id = "progress";
    progressBar.value = 0;
    progressBar.max = 100;

    progressBarDiv.appendChild(progressSpan);
    progressBarDiv.appendChild(progressBar);
  }
}