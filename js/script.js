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
    table["data"][row][tag].push(elm);
}

function addDiff2Row(table, row, colCount) {
    for (var i = 0; i < colCount; i++) {
        onedate = moment(table["data"][row]["fromData"][i], "DDMMMYY");
        twodate = moment(table["data"][row]["toData"][i], "DDMMMYY");
        days = twodate.diff(onedate, "days");
        if (currentDays == days) { // currentDays can match any day diff
            // Making sure that actual dates also match
            if ((onedate.format("DDMMM-YYYY") == ("01" + fromDateStr)) &&
                (twodate.format("DDMMM-YYYY") == ("01" + toDateStr))) {
                    table["data"][row]["diff"].push("C");
                } else 
                    table["data"][row]["diff"].push(days);
        } else
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
            
            table["data"][row] = {
                'fromData': [],
                'toData': [],
                'diff': []
            };
            for (var c = 0; c < cols.length; c++) {
                var col = cols[c];
                addRow2Data(table, prev, 'fromData', row, col, fromData["meta"]["currentDate"]);
                addRow2Data(table, curr, 'toData', row, col, toData["meta"]["currentDate"]);
            }
            addDiff2Row(table, row, cols.length);
        }

        var tableElm = document.getElementById("table" + (index + 1));
        $("#table" + (index + 1)).empty();

        let headerElm = tableElm.createTHead();
        let rowElm = headerElm.insertRow();
        table["cols"].unshift(tablename);
        table["cols"].forEach(function (item, index) {
            let thElm = document.createElement("th");
            let text = document.createTextNode(item);
            thElm.appendChild(text);
            thElm.style.textAlign = "center";
            thElm.style.verticalAlign = "middle";
            rowElm.appendChild(thElm);
        });

        table["rows"].forEach(function (rowItem, index) {

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
                    // if (subRowItem === "diff")
                    //     if (isNaN(cellItem))
                    //         text = document.createTextNode('-');
                    tdElm.appendChild(text);
                    tdElm.style.textAlign = 'center';
                    tdElm.style.verticalAlign = "middle";
                    if (subRowItem === "diff") {
                        tdElm.style.fontSize = "large";
                        tdElm.style.fontWeight = "bold";
                        if (cellItem === "C")
                            tdElm.style.color = "MediumSeaGreen";
                        else {
                            if (cellItem > 0 ) {
                                tdElm.style.color = "MediumSeaGreen";
                            } else {
                                tdElm.style.color = "Red";
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
var fromDate = null;
var toDate = null;
var fromDateStr = "";
var toDateStr = "";
var currentDays = null;

// Set the startDateStr and endDateStr according to the data
var startDateStr = "Jan-2017";
var endDateStr = "Sep-2020";
// console.log(startDateStr);
// console.log(endDateStr);


$("#datepickerfrom").datepicker({
    format: "M-yyyy",
    startDate: startDateStr,
    endDate: endDateStr,
    startView: "months",
    minViewMode: "months", // Hides dates
    orientation: "left",
    autoclose: true,
}).on("changeDate", function (e) {
    fromDate = moment(e.date).startOf('month');
    // Set the TO start month, a month after the FROM month
    $('#datepickerto').datepicker('setStartDate', moment(fromDate).add(1, 'months').format('MMM-YYYY'));
    fromDateStr = fromDate.format('MMM-YYYY');
    fromData = getMonthData("data/" + fromDate.format('YYYY') + "/" + fromDateStr.toLowerCase() + ".json");
    currentDays = toDate.diff(fromDate, "days");
    if (fromData && toData) {
        drawTables(fromData, toData, fromDateStr, toDateStr);
    }
});

$("#datepickerto").datepicker({
    format: "M-yyyy",
    startDate: startDateStr,
    endDate: endDateStr,
    startView: "months",
    minViewMode: "months", // Hides dates
    orientation: "right",
    autoclose: true,
}).on("changeDate", function (e) {
    toDate = moment(e.date).startOf('month');
    // Set the FROM end month, a month before the TO month
    $('#datepickerfrom').datepicker('setEndDate', moment(toDate).subtract(1, 'months').format('MMM-YYYY'));
    toDateStr = toDate.format('MMM-YYYY');
    toData = getMonthData("data/" + toDate.format('YYYY') + "/" + toDateStr.toLowerCase() + ".json");
    currentDays = toDate.diff(fromDate, "days");
    if (fromData && toData) {
        drawTables(fromData, toData, fromDateStr, toDateStr);
    }
});

//                           //
// Set default dates on load //  
//                           //

// Update FROM with the month-1 with the latest data
fromDate = moment(endDateStr, 'MMM-YYYY').subtract(1, 'months')
fromDateStr = fromDate.format('MMM-YYYY');
$("#datepickerfrom").datepicker("update", fromDateStr);
// Update TO with the month with the latest data
toDate = moment(endDateStr, 'MMM-YYYY');
toDateStr = endDateStr
$("#datepickerto").datepicker("update", endDateStr);

// Set the start date of TO to the month with the latest data
$('#datepickerfrom').datepicker('setEndDate', fromDateStr);
// Set the start date of TO to the month with the latest data
$('#datepickerto').datepicker('setStartDate', endDateStr);

// console.log(fromDateStr);
// console.log(toDateStr);

fromData = getMonthData("data/" + fromDate.format('YYYY') + "/" + fromDateStr.toLowerCase() + ".json");
toData = getMonthData("data/" + toDate.format('YYYY') + "/" + toDateStr.toLowerCase() + ".json");
currentDays = moment(toDateStr, 'MMM-YYYY').diff(moment(fromDateStr, 'MMM-YYYY'), "days");

// console.log("drawTables");
drawTables(fromData, toData, fromDateStr, toDateStr);




