var gStartDt;
var gEndDt;
var gSerName;

function retrieveCatData(startdt, enddt, acct, callback) {
    gStartDt = startdt;
    gEndDt = enddt;

    if (acct == 0) {

        $.post("/Content/shared/dataRetrieveJSON.cshtml",
                    { "procedure": "rCatJSON",
                        "var0": startdt,
                        "var1": enddt,
                        "ct": 2
                    },
                function (data) {
                    callback(data);
                });
    } else {
        
        $.post("/Content/shared/dataRetrieveJSON.cshtml",
                    { "procedure": "rCatJSON",
                        "var0": startdt,
                        "var1": enddt,
                        "var2": acct,
                        "ct": 3
                    },
                function (data) {
                    callback(data);
                });


    }

}


function filterGrids(catName, payName) {


    // startdt = $("flexTrans").flexOptions;

    $("#flexTrans").flexOptions(
               { params:
                    [
                      { name: 'procedure', value: 'rCatDetailJSON' },
                      { name: 'var0', value: gStartDt },
                      { name: 'var1', value: gEndDt },
                      { name: 'var2', value: catName === null ? payName : catName },
                      { name: 'var3', value: catName === null ? 'payee' : 'subcategory' },
                      { name: 'var4', value: 2 },
                      { name: 'ct', value: 5 }
                    ]
               }
            );

    $("#flexTrans").flexReload();

    if (payName === null) {
        $("#flexPay")[0].grid.loading = false;
        $("#flexPay").flexOptions(
               { params:
                    [
                      { name: 'procedure', value: 'rCatSummaryJSON' },
                      { name: 'var0', value: gStartDt },
                      { name: 'var1', value: gEndDt },
                      { name: 'var2', value: catName },
                      { name: 'var3', value: 'payee' },
                      { name: 'var4', value: 'subcategory' },
                      { name: 'ct', value: 5 }
                    ]
               }
            );
        $("#flexPay").flexReload();
    } else {
        $("#flexCat").flexOptions(
           { params:
                [
                  { name: 'procedure', value: 'rCatSummaryJSON' },
                  { name: 'var0', value: gStartDt },
                  { name: 'var1', value: gEndDt },
                  { name: 'var2', value: payName },
                  { name: 'var3', value: 'category' },
                  { name: 'var4', value: 'payee' },
                  { name: 'ct', value: 5 }
                ]
           }
            );
        $("#flexCat").flexReload();

    }
}

function returnData(startdt, enddt, seriesName) {

    seriesName = seriesName === null ? gSerName : seriesName;
    startdt = startdt === null ? gStartDt : startdt;
    enddt = enddt === null ? gEndDt : enddt;

    gSerName = seriesName;

    $("#flexTrans").flexOptions(
           { params:
                [
                  { name: 'procedure', value: 'rCatDetailJSON' },
                  { name: 'var0', value: startdt },
                  { name: 'var1', value: enddt },
                  { name: 'var2', value: seriesName },
                  { name: 'var3', value: 'category' },
                  { name: 'var4', value: 2 },
                  { name: 'ct', value: 5 }
                ]
           }
            );
    $("#flexTrans").flexReload();
    $("#flexCat")[0].grid.loading = false;
    $("#flexCat").flexOptions(
           { params:
                [
                  { name: 'procedure', value: 'rCatSummaryJSON' },
                  { name: 'var0', value: startdt },
                  { name: 'var1', value: enddt },
                  { name: 'var2', value: seriesName },
                  { name: 'var3', value: 'category' },
                  { name: 'var4', value: 'category' },
                  { name: 'ct', value: 5 }
                ]
           }
            );
    $("#flexCat").flexReload();

    $("#flexPay")[0].grid.loading = false;
    $("#flexPay").flexOptions(
           { params:
                [
                  { name: 'procedure', value: 'rCatSummaryJSON' },
                  { name: 'var0', value: startdt },
                  { name: 'var1', value: enddt },
                  { name: 'var2', value: seriesName },
                  { name: 'var3', value: 'payee' },
                  { name: 'var4', value: 'category' },
                  { name: 'ct', value: 5 }
                ]
           }
            );
    $("#flexPay").flexReload();


}


function renderCat(tit, startdt, enddt, target,acct) {
    retrieveCatData(startdt, enddt, acct, function (datstr) {

        if (tit == "") { tit = "Spending " + $.datepicker.formatDate('m/d/y', $.datepicker.parseDate('m/d/yy', startdt)).toString() + ' to ' + $.datepicker.formatDate('m/d/y', $.datepicker.parseDate('m/d/yy', enddt)).toString(); }
        $(function () {
            var chart;
            $(document).ready(function () {
                var g = $.parseJSON(datstr);
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        marginRight: 100,
                        marginLeft: 100,
                        height: 300
                    },
                    title: {
                        text: tit,
                        useHTML: true
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage}</b>({point.y})',
                        percentageDecimals: 1,
                        valueDecimals: 2,
                        valuePrefix: '$',
                        percentageSuffix: '%'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                color: '#000000',
                                connectorColor: '#000000',
                                formatter: function () {
                                    return this.point.name;
                                },
                                style: { fontSize: '8pt', width: 100 }
                            },
                            events: {
                                click: function (event) {
                                    returnData(startdt, enddt, event.point.name);
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Spending',
                        data: g
                    }]
                });
            });

        });
    });
}