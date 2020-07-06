// FUNCTIONS //

function getMonthData(filename) {
    var jsonData = null;
    $.ajax({
        async: false,
        dataType: "json",
        url: filename,
        success(response) {
            jsonData = response;
        }
    });
    return jsonData;
}

function uniqueSortedArray(curr, prev) {
    // https://stackoverflow.com/questions/41608815/how-to-merge-toData-arrays-in-javascript-and-keep-their-order
    result = curr.reduce(function (a, cV, cI) {
        return a.concat([cV, prev[cI]]);
    }, []);
    result = result.concat(prev.splice(curr.length));
    result = result.filter(Boolean);
    result = [...new Set(result)];
    return result;
}

function combinedRows(curr, prev) {
    return uniqueSortedArray(Object.keys(curr), Object.keys(prev));
}

function combinedCols(curr, prev) {
    currkey = Object.keys(curr)[0]
    prevkey = Object.keys(prev)[0]
    return uniqueSortedArray(Object.keys(curr[currkey]),
        Object.keys(curr[prevkey]));
}

function addRow2Data(table, data, tag, row, col, currentdate) {
    let elm = currentdate;
    if (row in data)
        if (col in data[row])
            if (data[row][col] != "C")
                elm = data[row][col];
    // if (row in data) {
    //     if (col in data[row]) {
    //         if (data[row][col] == "C")
    //             table["data"][row][tag].push(data["meta"]["currentdate"]);
    //         else
    //             table["data"][row][tag].push(data[row][col]);
    //     } else {
    //         table["data"][row][tag].push(data["meta"]["currentdate"]);
    //     }
    // } else {
    //     table["data"][row][tag].push(data["meta"]["currentdate"]);
    // }
    table["data"][row][tag].push(elm);
    // console.log("CELL:" + table["data"][row][tag][0]);
}

function addDiff2Row(table, row, colCount) {
    for (var i = 0; i < colCount; i++) {
        onedate = moment(table["data"][row]["fromData"][i], "DDMMMYY");
        twodate = moment(table["data"][row]["toData"][i], "DDMMMYY");
        days = twodate.diff(onedate, "days");
        if (currentDays == days)
            table["data"][row]["diff"].push("C");
        else
            table["data"][row]["diff"].push(days);
    }
}

function drawTables(fromData, toData, fromDateStr, toDateStr) {

    var tablenames = ["Family-Action", "Family-Final",
        "Employment-Action", "Employment-Final"]

    tablenames.forEach(function (tablename, index) {

        var prev = fromData[tablename];
        var curr = toData[tablename];
        // console.log(prev);
        // console.log(curr);
        var rows = combinedRows(curr, prev)
        var cols = combinedCols(curr, prev);
        // console.log(rows);
        // console.log(cols);

        var table = {
            'rows': rows,
            'cols': cols,
            "data": {}
        }

        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            // console.log(cols);
            table["data"][row] = {
                'fromData': [],
                'toData': [],
                'diff': []
            };
            for (var c = 0; c < cols.length; c++) {
                var col = cols[c];
                addRow2Data(table, prev, 'fromData', row, col, fromData["meta"]["currentDate"]);
                addRow2Data(table, curr, 'toData', row, col, toData["meta"]["currentDate"]);
                // console.log(table);
                // console.log(table["data"]['F1']['fromData']);
            }
            addDiff2Row(table, row, cols.length);
            // console.log(table["data"][row]["diff"]);
        }
        // console.log(table);
        // console.log(JSON.stringify(table, null, 4));

        var tableElm = document.getElementById("table" + (index + 1));
        $("#table" + (index + 1)).empty();

        let headerElm = tableElm.createTHead();
        let rowElm = headerElm.insertRow();
        table["cols"].unshift(tablename);
        table["cols"].forEach(function (item, index) {
            let thElm = document.createElement("th");
            let text = document.createTextNode(item);
            thElm.appendChild(text);
            rowElm.appendChild(thElm);
        });

        table["rows"].forEach(function (rowItem, index) {
            
            // let rowElm = tableElm.insertRow();

            // let tdElm = document.createElement("th");
            // let text = document.createTextNode(rowItem);
            // tdElm.appendChild(text);
            // tdElm.rowSpan = 4;
            // tdElm.style.textAlign = "center";
            // tdElm.style.verticalAlign = "middle";
            // rowElm.appendChild(tdElm);

            let rowSubHeader = ["fromData", "diff", "toData"];

            rowSubHeader.forEach(function (subRowItem, index) {

                let rowElm = tableElm.insertRow();

                let text = document.createTextNode(rowItem);
                if (subRowItem == "fromData")
                    text = document.createTextNode(fromDateStr);
                if (subRowItem == "toData")
                    text = document.createTextNode(toDateStr);

                let tdElm = document.createElement("td");
                if (subRowItem == "diff")
                    tdElm = document.createElement("th");

                tdElm.appendChild(text);
                if (subRowItem != "diff")
                    tdElm.style.color = "lightgray"
                tdElm.style.textAlign = "center";
                tdElm.style.verticalAlign = "middle";
                rowElm.appendChild(tdElm);

                table["data"][rowItem][subRowItem].forEach(function (cellItem, index) {
                    let tdElm = document.createElement("td");
                    let text = document.createTextNode(cellItem);
                    tdElm.appendChild(text);
                    tdElm.style.textAlign = 'center';
                    tdElm.style.verticalAlign = "middle";
                    if (subRowItem === "diff") {
                        if (cellItem === "C")
                            tdElm.style.color = "#009933";
                        else {
                            if (cellItem > 0 ) {
                                tdElm.style.color = "#009933";
                            } else {
                                tdElm.style.color = "#FF0000";
                            }
                        }
                    }
                    rowElm.appendChild(tdElm);
                });
            });
        });
    });
}

// RUN //

var fromData = null;
var toData = null;
var fromDateStr = "";
var toDateStr = "";
var currentDays = null;

// Set the startDate and endDate according to the data
var startDate = moment("Jan-2019").startOf('month').format('MMM-YYYY');
var endDate = moment("Jul-2020").startOf('month').format('MMM-YYYY');

$("#datepickerfrom").datepicker({
    format: "M-yyyy",
    startDate: startDate,
    endDate: endDate,
    startView: "months",
    minViewMode: "months", // Hides dates
    orientation: "left",
}).on("changeDate", function (e) {
    // console.log("datepickerfrom changeDate e.date");
    // console.log(e.date);
    // Set the TO start month, a month after the FROM month
    $('#datepickerto').datepicker('setStartDate', moment(e.date).add(1, 'months').startOf('month').format('MMM-YYYY'));
    // console.log('changeDate datepickerto getStartDate');
    // console.log($('#datepickerto').datepicker('getStartDate'));
    fromDateStr = moment(e.date).startOf('month').format('MMM-YYYY');
    // console.log('changeDate fromDateStr > ' + fromDateStr);
    fromData = getMonthData("data/" + fromDateStr.toLowerCase() + ".json");
    currentDays = moment(toDateStr).diff(moment(fromDateStr), "days");
    if (fromData && toData) {
        drawTables(fromData, toData, fromDateStr, toDateStr);
    }
});

$("#datepickerto").datepicker({
    format: "M-yyyy",
    startDate: startDate,
    endDate: endDate,
    startView: "months",
    minViewMode: "months", // Hides dates
    orientation: "right",
}).on("changeDate", function (e) {
    // console.log("datepickerto changeDate e.date");
    // console.log(e.date);
    // Set the FROM end month, a month before the TO month
    edateStr = moment(e.date).subtract(1, 'months').startOf('month').format('MMM-YYYY');
    $('#datepickerfrom').datepicker('setEndDate', edateStr);
    toDateStr = moment(e.date).startOf('month').format('MMM-YYYY');
    // console.log('changeDate toDateStr > ' + toDateStr)
    toData = getMonthData("data/" + toDateStr.toLowerCase() + ".json");
    currentDays = moment(toDateStr).diff(moment(fromDateStr), "days");
    if (fromData && toData) {
        drawTables(fromData, toData, fromDateStr, toDateStr);
    }
});

// Update FROM with the month-1 with the latest data
fromDateStr = moment(endDate).subtract(1, 'months').format('MMM-YYYY');
$("#datepickerfrom").datepicker("update", fromDateStr);
// Update TO with the month with the latest data
toDateStr = moment(endDate).format('MMM-YYYY');
$("#datepickerto").datepicker("update", endDate);

// Set the start date of TO to the month with the latest data
$('#datepickerfrom').datepicker('setEndDate', fromDateStr);
// Set the start date of TO to the month with the latest data
$('#datepickerto').datepicker('setStartDate', moment(endDate).startOf('month').format('MMM-YYYY'));
// Trigger a changeDate on TO
// $("#datepickerto").datepicker().trigger('changeDate');

// console.log(oneDateStr);
// console.log(endDate);

fromData = getMonthData("data/" + fromDateStr.toLowerCase() + ".json");
toData = getMonthData("data/" + toDateStr.toLowerCase() + ".json");
currentDays = moment(toDateStr).diff(moment(fromDateStr), "days");

// console.log("drawTables");
drawTables(fromData, toData, fromDateStr, toDateStr);




