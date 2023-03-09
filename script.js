// Function to add commas as thousands separators
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function parseData() {
    // Get the input data from the textarea element
    var inputData = document.getElementById("data-input").value;
    
    // Split the input data into individual sections based on the "Name:" header
    var sections = inputData.split("Name:");
    
    // Remove the first empty section
    sections.shift();
    
    // Create an empty table to hold the parsed data
    var tableData = [];
    
    // Loop through each section and parse the data
    for (var i = 0; i < sections.length; i++) {
        // Extract the name and ID from the section header
        var nameId = sections[i].match(/\[(\d+)\]/);
        var name = sections[i].substr(0, nameId.index).trim();
        var id = nameId[1];
        
        // Extract the stats from the section body
        var strength = sections[i].match(/Strength: (\d+,?\d*)/)[1].replace(/,/g, "");
        var speed = sections[i].match(/Speed: (\d+,?\d*)/)[1].replace(/,/g, "");
        var dexterity = sections[i].match(/Dexterity: (\d+,?\d*)/)[1].replace(/,/g, "");
        var defense = sections[i].match(/Defense: (\d+,?\d*)/)[1].replace(/,/g, "");
        var total = sections[i].match(/Total:\s*([\d,]+)/)[1].replace(/,/g, "");
        var dexterity2 = speed * 14;
        var defense2 = strength * 14;
        
        // Create a row of data for the current section
        var rowData = [name + "[" + id + "]", strength, speed, dexterity, defense, total, dexterity2, defense2];
        
        // Add the row data to the table data
        tableData.push(rowData);
    }
    
    // Create the HTML table from the parsed data
    var tableHtml = 
    `<table>
        <thead>
            <tr>
                <th>Name[ID]</th>
                <th>Strength</th>
                <th>Speed</th>
                <th>Dexterity</th>
                <th>Defense</th>
                <th>Total</th>
                <th>Dexterity<br>(1 in 6 attacks hit you)</th>
                <th>Defense<br>(You take 0 damage)</th>
            </tr>
        </thead>
    <tbody>`;
    
    for (var i = 0; i < tableData.length; i++) {
    tableHtml += "<tr>";
        for (var j = 0; j < tableData[i].length; j++) {
            if (j === 0) {
            // If this is the first or second column (i.e. Name[ID]), do not add commas
            tableHtml += "<td>" + tableData[i][j] + "</td>";
            } else {
            // Otherwise, add commas to the number string
            tableHtml += "<td>" + numberWithCommas(tableData[i][j]) + "</td>";
            }
        }
        tableHtml += "</tr>";
    }
            
    tableHtml += "</tbody></table>";
            
    // Display the table HTML in the result element
    document.getElementById("result").innerHTML = tableHtml;
    }
    function sortTable() {
    // Get the table element
    var table = document.getElementsByTagName("table")[0];
    
    // Get the table body rows
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    
    // Create an array to hold the row data
    var rowData = [];
    
    // Loop through the table body rows and extract the data
    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName("td");
        var nameId = cells[0].innerText.match(/\[(\d+)\]/);
        var name = cells[0].innerText.substr(0, nameId.index).trim();
        var id = nameId[1];
        var strength = parseInt(cells[1].innerText.replace(/,/g, ""));
        var defense = parseInt(cells[2].innerText.replace(/,/g, ""));
        var speed = parseInt(cells[3].innerText.replace(/,/g, ""));
        var dexterity = parseInt(cells[4].innerText.replace(/,/g, ""));
        var total = parseInt(cells[5].innerText.replace(/,/g, ""));
        var dexterity2 = parseInt(cells[6].innerText.replace(/,/g, ""));
        var defense2 = parseInt(cells[7].innerText.replace(/,/g, ""));
        rowData.push({ name: name, id: id, strength: strength, defense: defense, speed: speed, dexterity: dexterity, total: total, dexterity2: dexterity2, defense2: defense2 });
    }
    
    // Sort the row data by total
    rowData.sort(function(a, b) {
        return b.total - a.total;
    });
    
    // Rebuild the table body rows using the sorted data
    var tbody = document.createElement("tbody");
    
    for (var i = 0; i < rowData.length; i++) {
        var row = document.createElement("tr");
        var nameId = rowData[i].name + "[" + rowData[i].id + "]";
        var nameCell = document.createElement("td");
        nameCell.innerText = nameId;
        row.appendChild(nameCell);
        var strengthCell = document.createElement("td");
        strengthCell.innerText = numberWithCommas(rowData[i].strength);
        row.appendChild(strengthCell);
        var defenseCell = document.createElement("td");
        defenseCell.innerText = numberWithCommas(rowData[i].defense);
        row.appendChild(defenseCell);
        var speedCell = document.createElement("td");
        speedCell.innerText = numberWithCommas(rowData[i].speed);
        row.appendChild(speedCell);
        var dexterityCell = document.createElement("td");
        dexterityCell.innerText = numberWithCommas(rowData[i].dexterity);
        row.appendChild(dexterityCell);
        var totalCell = document.createElement("td");
        totalCell.innerText = numberWithCommas(rowData[i].total);
        row.appendChild(totalCell);
        var dex2Cell = document.createElement("td");
        dex2Cell.innerText = numberWithCommas(rowData[i].dexterity2);
        row.appendChild(dex2Cell);
        var def2Cell = document.createElement("td");
        def2Cell.innerText = numberWithCommas(rowData[i].defense2);
        row.appendChild(def2Cell);
        tbody.appendChild(row);
    }
    
    // Replace the table body with the sorted data
    table.replaceChild(tbody, table.getElementsByTagName("tbody")[0]);
    }