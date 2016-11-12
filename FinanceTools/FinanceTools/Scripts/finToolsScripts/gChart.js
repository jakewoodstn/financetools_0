var chart;
var options;
var currentChartType = '';
var gdata;
var tdata;
var alldata=[{},{}];
var gtable;
var ttable;
var table=[];
var numDomainParam = 0;
var includeIdField = 0;
var heightFactor = $(window).height() <= 800 ? 0.7 * $(window).height() : 0.5 * $(window).height();

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function setViewColumns(dv) {
     viewColumns = [];

     colCount = data.getNumberOfColumns();
        for (i = 0; i < colCount-4; i++) {
            viewColumns.push(i);
        }

        if (includeIdField != 0) {
            viewColumns.push(dv.getColumnIndex("_id"));
        }
 
        viewColumns.push(dv.getColumnIndex("accountingDate"));
        viewColumns.push(dv.getColumnIndex("payee"));
        viewColumns.push(dv.getColumnIndex("amount"));


        dv.setColumns(viewColumns);
        
}

function distinctValues(matrix, column) {
    var retArray = [];

    for (x = 0; x < matrix.length; x++) {
        if (retArray.indexOf(matrix[x][column]) == -1) {
            retArray.push(matrix[x][column]);
        }
    }

    return retArray;

}

function selectHandler(srcObj, targObj) {

    a = srcObj.getSelection();
    b = [];
    for (i = 0; i < a.length; i++) {
        b[i] = { row: a[i].row };
    }
        targObj.setSelection(b);
}

function getChartOptions(params) {
    var title ={};

    title.vaxis = chartType == 'BarChart' ? params.domainFields[params.domainFields.length - 1].alias : (params.domainFields.length == 1 ? 'Value' : toTitleCase(params.metrics[0]));
    title.vaxisformat = (params.metrics[0].substr(0, 3) == 'pct' ? '#0.0%' : '$###,###,###');
    title.haxis = chartType == 'BarChart' ? 'Values' : params.domainFields[params.domainFields.length - 1].alias;
    title.chart = params.domainFields.length == 1 ? (params.metrics.length == 1 ? toTitleCase(params.metrics[0]) + ' by ' + params.domainFields[0].alias : 'Transactions by ' + params.domainFields[0].alias) : toTitleCase(params.metrics[0])+ ': ' + params.domainFields[0].alias + ' by ' + params.domainFields[1].alias;

    options = { 'title': title.chart, 'height':heightFactor,
         'axisTitlesPosition': 'out', 'hAxis': { 'title': title.haxis }, 'vAxis': { 'title': title.vaxis, 'format': title.vaxisformat, 'gridlines': {color:'#000',count:15} },
        'animation': { 'duration': '1000' }, 'legend': { 'position': 'top', 'textStyle': { 'fontSize': '16'} }
    };

    return options;
}

function getTabOptions() { 
    return { width:$('#table_div_trans').width().toString(), page: 'enable', pageSize: 20 };
}

function filterTTable(srcObj) {
    targetValue = [];
    selected = srcObj.getSelection();
    if (selected.length > 0) {
        
        targetValue[0] = gdata.getValue(srcObj.getSelection()[0].row, 0);
        targetValue[1] = gdata.getColumnId(srcObj.getSelection()[0].column);
        filterArray = [];

        if (numDomainParam > 1) {
            filterArray.push({ column: 1, value: targetValue[0] });
            filterArray.push({ column: 0, value: targetValue[1] });
        }
        else {
            filterArray.push({ column: 0, value: targetValue[0] });
        }
        
        dv.setRows(tdata.getFilteredRows(filterArray));
    }
    else {
        dv = new google.visualization.DataView(tdata);
    }
    
    ttable.draw(dv, tabOptions);
}

//function selectTTableHandler() {  }
function selectGTableHandler() {
    try {
        selectHandler(gtable, chart);
        filterTTable(gtable);
    } catch (ex) { }
}

function selectChartHandler() {
    try {
        selectHandler(chart, gtable);
        filterTTable(chart);
    } catch (ex) { }
}

function formatData(myData, foptions) {
    for (var k = 0; k < foptions.length; k++) {
        var formatter = new google.visualization.NumberFormat(foptions[k].formatObj);
        if (k == 0 && foptions[k].name == 'all') {
            for (var l = 1; l < myData.getNumberOfColumns(); l++) {
                formatter.format(myData, l);
            }
        } else{
          if(myData.getColumnIndex(foptions[k].name)>=0){
              formatter.format(myData, myData.getColumnIndex(foptions[k].name));
          }
        }

    }
    
    return myData;
    
}

function loadCallback(chartType, dataArrayObject, params, dataTypes, metrics) {
 
    //master task list - called in callback from google.load in outsideCall (exposed method)
    gdata = {};
    gfoptions = [];
    gfoptionSet = {};
    params.dataTypes = dataTypes;
    params.metrics = metrics;

    if (metrics.length>0 && metrics[0].substring(0, 3) == 'pct') {
        gfoptionSet.fractionDigits = 1;
        gfoptionSet.pattern = '###.0%';
    } else {
        gfoptionSet.fractionDigits = 0;
        gfoptionSet.prefix = '$';
    }

    gfoptions.push({ name: 'all', formatObj: gfoptionSet });

    tdata = {};
    tfoptions = [];
    tfoptionSet = {};

    tfoptionSet.fractionDigits = 2;
    tfoptionSet.prefix = '$';

    tfoptions.push({ name: "amount", formatObj: tfoptionSet });

    if (renderchart || rendergroupedTable) {
        gdata = loadData(dataArrayObject, params, dataTypes, metrics, undefined);
        gdata = formatData(gdata,gfoptions);
    } else {
        tdata = loadData(dataArrayObject, params, dataTypes, metrics,'tableOnly');
        tdata = formatData(tdata, tfoptions);
    }

    if (renderchart) { loadGoogleChart(chartType, params, 'chart_div', gdata);  }
    if (rendergroupedTable) { loadGoogleTable(params, 'table_div_grouped', gdata,false);}
    if (rendertransTable) { loadGoogleTable(params, 'table_div_trans', tdata,true); }
    alldata[0] = $.isEmptyObject(gdata) ? alldata[0] : gdata;
    gdata = alldata[0];
    alldata[1] = $.isEmptyObject(tdata) ? alldata[1] : tdata;
    tdata = alldata[1];
    gtable = table[0];
    ttable = table[1];
    if (table[0] != undefined) { google.visualization.events.addListener(table[0], 'select', selectGTableHandler) };
    //if (table[1] != undefined) { google.visualization.events.addListener(table[1], 'select', selectTTableHandler) };
}

function outsideCall(chartType, dataArrayObject, params, dataTypes, metrics,targets) {
    renderchart = targets.indexOf('chart') >= 0;    
    rendergroupedTable = targets.indexOf('groupedTable') >= 0;
    rendertransTable= targets.indexOf('transTable') >= 0;

    //undraw previous chart
    //wrapped in try/catch because I don't feel like figuring out how to tell whether chart is drawn or not
    try {
       if (rendergroupedTable) { table[0].clearChart(); }
       if (renderchart) { chart.clearChart(); }
       if (rendertransTable) { table[1].clearChart(); }
    } catch (e) { }

    //pretty hacked together...empties table[] array if both tables defined.  Implies every other call is a fresh set of tables.
    if (table.length >= 2) { table = []; }

    //heavy lifting above in loadCallback()
    google.load('visualization'
                , '1.0'
                , { 'packages': ['corechart', 'table']
                , 'callback': function () { loadCallback(chartType, dataArrayObject, params, dataTypes, metrics); }
                });
}

function loadData(dataArrayObject, params, dataTypes, metrics,seriesModel) {

    //passthrough to assignData that made a lot more sense several revisions ago 
    //when there was actually code here.

    numDomainParam = params.domainFields.length;
    data = assignData(dataArrayObject, params, dataTypes, metrics,seriesModel);
    return data;
}

function loadGoogleTable(params, target, data, useView) {

    useView = useView == undefined ? false : useView;
    tableFunction = google.visualization.Table;
    table[table.length] = new tableFunction(document.getElementById(target));
    tabOptions = getTabOptions();
    if (useView) {
        dv = new google.visualization.DataView(data);
        setViewColumns(dv);
        table[table.length - 1].draw(dv, tabOptions);
    } else {
        table[table.length - 1].draw(data, tabOptions);
    }
}

function loadGoogleChart(chartType, params,target,data) {
    target = target === undefined ? 'chart_div' : target;

    if (chartType === undefined) { chartType = 'PieChart'; }

    if (chart === undefined || chartType != currentChartType) {
        var chartfunction = getChartFunction(chartType);
        chart = new chartfunction(document.getElementById(target))
    };

    if (params.domainFields.length <= 2) {
        var options = getChartOptions(params);
        chart.draw(data, options);
        currentChartType = chartType;
    }

    google.visualization.events.addListener(chart, 'select', selectChartHandler);

}

function getChartFunction(chartType) {
    var f;
    switch (chartType) {
        case 'BarChart':
            f = google.visualization.BarChart;
            break;
        case 'ColumnChart':
            f = google.visualization.ColumnChart;
            break;
        case 'PieChart':
            f = google.visualization.PieChart;
            break;
        case 'LineChart':
            f = google.visualization.LineChart;
            break; default:
            break;
    }

    return f;
}

function assignData(myArrayObject, params, dataTypes, metrics,seriesModel) {


    //big and ugly
    //makes array out of incoming data JSON
    //then loads that data to google DataTable
    //also pivots the data (when necessary)

    myData = new google.visualization.DataTable();
    var model = myArrayObject[0];
    var mnamesBase = Object.getOwnPropertyNames(model);
    var dataA = {};
    dataA.columns = [];

    if (seriesModel === undefined) {
        switch (params.domainFields.length) {
            case 1:
                seriesModel = 'metrics';
                break;
            case 2:
                seriesModel = 'domainObs';
                break;
            default:
                seriesModel = 'tableOnly';
                break;
        }
    }
    columnFilters = [];
    for (var i = 0; i < params.domainFields.length; i++) {
        columnFilters.push(params.domainFields[i].alias);
    }

    if (metrics === undefined || metrics.length == 0) { metrics.push("expenses"); }

    columnFilters = columnFilters.concat(metrics);

    var mnames = [];

    if (seriesModel == 'metrics' || seriesModel == 'domainObs') {
        for (var h = 0; h < columnFilters.length; h++) {
            if (mnamesBase.indexOf(columnFilters[h]) >= 0) { mnames[h] = columnFilters[h]; }
        } 
    }

    if (seriesModel == 'tableOnly') {
        for (var h = 0; h < columnFilters.length; h++) {
            if (mnamesBase.indexOf(columnFilters[h]) >= 0) { mnames[h] = columnFilters[h]; }
        }
        for (var h = 0; h < mnamesBase.length; h++) {
            if (mnames.indexOf(mnamesBase[h]) < 0) { mnames.push(mnamesBase[h]); }
        } 
    }

    for (var i = 0; i < mnames.length; i++) {
        dataA.columns[i] = {};
        dtArray = Object.getOwnPropertyNames(dataTypes)
        dataA.columns[i].type = dtArray.indexOf(mnames[i]) >= 0 ? dataTypes[mnames[i]] : ($.isNumeric(model[mnames[i]]) ? 'number' : 'string');
        dataA.columns[i].name = mnames[i];
        myData.addColumn(dataA.columns[i].type, dataA.columns[i].name,dataA.columns[i].name);
    }

    dataA.rows = [];

    for (var j = 0; j < myArrayObject.length; j++) {
        var dataRow = myArrayObject[j];
        dataA.rows[j] = [];
        for (var k = 0; k < mnames.length; k++) {
            if (dataA.columns[k].type == 'number') {
                dataA.rows[j][k] = Math.abs(Number(dataRow[mnames[k]]));
            }
            else {
                dataA.rows[j][k] = dataRow[mnames[k]];
            }
        }
    }

    if (seriesModel == 'metrics'||seriesModel=='tableOnly') {

        myData.addRows(dataA.rows);

    }

    if (seriesModel == 'domainObs') {
        var colValues = distinctValues(dataA.rows, 0);
        var rowIndices = distinctValues(dataA.rows, 1);
        dataB = {};
        dataB.columns = [];
        dataB.rows = [];

        dataB.columns[0] = dataA.columns[1];
        for (k = 0; k < colValues.length; k++) {
            myNewCol = {};
            myNewCol.name = colValues[k];
            myNewCol.type = 'number';
            dataB.columns[k + 1] = myNewCol;
        }

        myData.removeColumns(0, myData.getNumberOfColumns());

        for (l = 0; l < dataB.columns.length; l++) {
            myData.addColumn(dataB.columns[l].type,dataB.columns[l].name,dataB.columns[l].name);
        }

        colValues.splice(0, 0, mnames[1]);

        for (n = 0; n < myArrayObject.length; n++) {
            myobj = myArrayObject[n];
            colLocator = colValues.indexOf(myobj[mnames[0]]);
            rowLocator = rowIndices.indexOf(myobj[mnames[1]]);
            dataB.rows[rowLocator] = dataB.rows[rowLocator] === undefined ? [] : dataB.rows[rowLocator];
            if (rowLocator >= 0 && colLocator >= 1) {
                dataB.rows[rowLocator][colLocator] = Math.abs(Number(myobj[mnames[2]]));
            }
        }

        for (p = 0; p < dataB.rows.length; p++) {
            dataB.rows[p][0] = dataB.rows[p][0] === undefined ? rowIndices[p] : dataB.rows[p][0];
            for (q = 1; q < colValues.length; q++) {
                dataB.rows[p][q] = dataB.rows[p][q] === undefined ? 0 : dataB.rows[p][q];
            }
        }

        myData.addRows(dataB.rows);
    }
 
    return myData;    
}
