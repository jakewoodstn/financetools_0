
function markSplitDeleted(evt) {
    var lineindex = evt.data.lineindex;
    if ($('#splitDetailTable tr[lineindex="' + lineindex + '"]').find('select').attr('splitid') != 0) {
        $('#splitDetailTable tr[lineindex="' + lineindex + '"]').addClass('deletedSplitLine');
    } else {
        $('#splitDetailTable tr[lineindex="' + lineindex + '"]').remove();
    }
    changeSplit();
}

function saveSplit() {
    var test = $("#splitPanel").find('.unbalanced');
    if (test.length > 0) { alert('Cannot save unbalanced split'); return; }

    if ((usedLineCount() > 1) || (usedLineCount() == 1 && $('#splitDetailTable tr.deletedSplitLine').length > 0)) {
        var saves = $("#splitDetailTable :selected").filter(":not([value='0'])").parents('select');
        for (var isv = 0; isv < saves.length; isv++) {
            var sel = $('#' + saves[isv].id);
            var cat = parseInt(sel.find(":selected").val());
            var li = sel.attr('lineindex');
            var amt = $("#splitDetailTable #amount" + li).children('input').val();
            var splitid = sel.attr('splitid');
            if ($('#splitDetailTable tr[lineindex="' + li + '"]:not(.deletedSplitLine)').length > 0) {
                $.ajax({
                    type: 'POST',
                    url: '/Content/shared/dataRetrieveJSON.cshtml',
                    data: { "procedure": 'saveSplit',
                        "var0": splitid,
                        "var1": $('#splitPanel').attr('tranid'),
                        "var2": cat,
                        "var3": amt,
                        "ct": 4
                    },
                    dataType: 'html'
                });
            }
            else if ($('#splitDetailTable tr.deletedSplitLine[lineindex="' + li + '"]').length > 0 && splitid != 0) {
                $.ajax({
                    type: 'POST',
                    url: '/Content/shared/dataRetrieveJSON.cshtml',
                    data: { "procedure": 'deleteSplit',
                        "var0": splitid,
                        "ct": 1
                    },
                    dataType: 'html'
                });
            }
        }
    }
    else if (usedLineCount() == 1) { $('#splitPanel').toggle(false); }
    else { $('#splitPanel').toggle(false); }
    $('#splitPanel').toggle(false);
    $('#Category' + $('#splitPanel').attr('tranid')).text('Split');
}

function addSplit() {
    var splitLineData = { "amount": "0.00", "categoryid": 0, "splittransactionid": 0, "transactionId": 0, "lineIndex": 0 }

    splitLineData['lineIndex'] = lineCount() + 1;
    splitLineData['transactionId'] = $("#splitPanel").attr('tranid');
    var tb = $("#splitDetailTable").find('tbody');
    var tr = renderSplitLine(splitLineData);
    $(tb).append(tr);

}

function changeSplit() {
    if (!(this === undefined)) {
        var ipt = $(this).find('input');
        if (!(ipt.val() === undefined) && (ipt.val().substring(0, 1) == '-' || ipt.val().substring(0, 1) == '+')) {
            ipt.val(parseFloat(ipt.val()).toFixed(2));
        } else {
            ipt.val(parseFloat('-' + ipt.val()).toFixed(2));
        }



    }
    var tot = 0.0;
    var amts = $('#splitDetailTable tr:not(".deletedSplitLine")').find('.splitDetailAmount')
    for (var iamt = 0; iamt < amts.length; iamt++) {
        tot += parseFloat($(amts[iamt]).val());

    }
    $('#splitAssigned').text(parseFloat(tot).toFixed(2));
    if (parseFloat(tot).toFixed(2) == parseFloat($('#splitTotal').text().replace('$','')).toFixed(2)) {
        $('#splitAssigned').removeClass('unbalanced');
        $('#splitRemaining').addClass('balancedHidden');
        $('#splitRemaining').removeClass('unbalanced');
    } else {
        $('#splitRemaining').find('span').text(parseFloat(parseFloat($('#splitTotal').text().replace('$','')) - parseFloat(tot)).toFixed(2));
        $('#splitRemaining').addClass('unbalanced');
        $('#splitRemaining').removeClass('balancedHidden');
        $('#splitAssigned').addClass('unbalanced');
    }
}

function renderSplitLine(splitLineData) {

    var amt = splitLineData['amount'];
    var catid = splitLineData['categoryid'];
    var splitline = splitLineData['splittransactionid'];
    var tranid = splitLineData['transactionId'];
    var lineIndex = splitLineData['lineIndex'];

    var tr = document.createElement('tr');
    $(tr).attr('lineindex', lineIndex);
    var tds = [0, 0, 0]
    var td = document.createElement('td');
    var jtd = $(td);
    jtd.attr('id', 'category' + lineIndex);
    jtd.attr('lineIndex', lineIndex);
    jtd.html(renderSelector('select' + lineIndex));
    jtd.children('select').attr('lineIndex', lineIndex);
    jtd.children('select').attr('splitId', splitline);
    if (catid.length > 0) {
        jtd.children().find('option:selected').attr('selected', false);
        jtd.children().find('option[value="' + catid + '"]').attr('selected', true);
    }

    tds[0] = td;

    td = document.createElement('td');
    jtd = $(td);
    jtd.attr('id', 'amount' + lineIndex);
    var amtIpt = document.createElement('input');
    $(amtIpt).attr('type', 'text');
    $(amtIpt).attr('value', parseFloat(amt).toFixed(2));
    $(amtIpt).attr('lineIndex', lineIndex);
    $(amtIpt).addClass('splitDetailAmount');
    jtd.append(amtIpt)
    jtd.change(changeSplit);
    tds[1] = td;

    td = document.createElement('td');
    jtd = $(td);
    jtd.attr('id', 'delete' + lineIndex);
    var sp = document.createElement('span');
    var jsp = $(sp);
    jsp.addClass('splitPanelButton');
    jsp.click({ "lineindex": lineIndex }, markSplitDeleted);

    var img = document.createElement('img');
    var jimg = $(img);
    jimg.attr('alt', 'delete split line')
    jimg.attr('src', '/Images/redminus.png');
    jimg.addClass('tinyButton');
    jimg.addClass('visible');
    jsp.append(img);
    jtd.append(sp);

    tds[2] = td;

    $(tr).append(tds[0]);
    $(tr).append(tds[1]);
    $(tr).append(tds[2]);
    return tr;
}

function renderSplit(splitData) {
    var tb = document.createElement('tbody');
    var linecount = 0;

    //Rendering Split Data

    for (var i in splitData) {
        var obj = splitData[i];
        var tranid = obj['transactionId'];
        obj.lineIndex = linecount;
        var tr = renderSplitLine(obj);
        $(tb).append(tr);
        linecount += 1;
    }

    $('#splitDetailTable').append(tb);

    $('#splitTotal').text($('#amount' + tranid).text());
    changeSplit();
}

function getSplitData(tranId, callback) {
    $.ajax(
            {
                type: 'POST',
                url: "/Content/shared/dataRetrieveJSON.cshtml",
                data:
                {
                    "procedure": "getSplitDetailsJSON",
                    "var0": tranId,
                    "ct": 1
                },
                dataType: "json",
                success: function (retData) {
                    callback(retData);
                }
            });
}


function split(evt) {
    var trans = this.parentElement;
    evt.stopPropagation();
    $("#splitPanel").toggle(true);
    $("#splitPanel").attr('tranid', trans.id.substring(8, 17));
    $("#splitPanel").children().find("tbody").remove();
    getSplitData(trans.id.substring(8, 17), renderSplit);
}