
var selectedElem;
var shiftDown;
var shiftSelectDir = 0;
var accountDisplay = ['baChecking', 'chaseCredit']


$(document).keydown(function (evt) {
    if (evt.keyCode === 16) {
        shiftDown = true;
    }
});


$(document).keyup(function (evt) {
    if (evt.keyCode === 16) {
        shiftDown = false;
    }
});


function selectedTransArray() {
    var myArr = new Array();
    $('.transSelected').each(function () {
        myArr.push($(this).attr("id"));
    });
    return myArr;
}

function approve() {
    var myArr = selectedTransArray();
    $("#loadingDiv").toggle(true);
    $('#buttonPanel').hide();
    $.ajax({
        type: 'POST',
        url: '/Content/shared/dataRetrieveJSON.cshtml',
        data: { "procedure": "approveCat",
            "var0": String(myArr),
            "ct": 1
        },
        dataType: 'html'
    });
    var elem = $('.sortSelected')[0];
    $(elem).toggleClass('asc');
    changeSort(elem, renderTrans);
    getButtons(renderButtons);

}

function assign(src, index) {
    var myArr = selectedTransArray();
    $.ajax({
        type: 'POST',
        url: '/Content/shared/dataRetrieveJSON.cshtml',
        data: { "procedure": "assignCat",
            "var0": String(myArr),
            "var1": ($(src).is("img") || $(src).is("span")) ? $('#catLabel' + $(src).attr("i")).html() : $("#selectAny option:selected").attr("id"),
            "ct": 2
        },
        dataType: 'html',
        success: function (data) {
            $('.transSelected .transCatName').html(($(src).is("img") || $(src).is("span")) ? $('#catLabel' + $(src).attr("i")).html() : $("#selectAny option:selected").attr("id"));
            $('.transSelected').toggleClass('transSelected');

        }
    });

}

function renderButtons(buttons) {
    for (var i = 0; i < buttons.length; i++) {
        $('#catLabel' + i).each(
                    function () {
                        $(this).html(buttons[i]);
                        $(this).attr("i", i);
                        $(this).click(
                            function () {
                                assign(this, $(this).attr("i"));
                            });
                    }
                );
        $('#catButton' + i).each(
                function () {
                    $(this).attr("i", i);
                    $(this).click(
                        function () {
                            assign(this, $(this).attr("i"));
                        });
                });
    }
}

function getButtons(callback) {
    $.ajax({
        type: 'POST',
        url: "/Content/shared/dataRetrieveJSON.cshtml",
        data: { "procedure": "topCatJSON",
            "var0": 0,
            "var1": numTopCat,
            "var2": durTopCat,
            "var3": 'expenditure',
            "ct": 4
        },
        dataType: "json",
        success: function (retData) {
            callback(retData);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.responseText);
        }
    });
}


function selected(elem) {
    if (!(selectedElem === undefined) && shiftDown == true) {
        if (shiftSelectDir == 0) {
            if ($(selectedElem).parent().parent().nextAll().filter($(elem).parent().parent()).length > 0) {
                shiftSelectDir = 1;
                selected(elem);
            } else if ($(selectedElem).parent().parent().prevAll().filter($(elem).parent().parent()).length > 0) {
                shiftSelectDir = -1;
                selected(elem);
            }
        } else if (shiftSelectDir == 1) {
            selectedElem = $(selectedElem).parent().parent().next().children().children()[0];  //next, please
            $(selectedElem).toggleClass('transSelected'); //set selected attribute as appropriate
        } else if (shiftSelectDir == -1) {
            selectedElem = $(selectedElem).parent().parent().prev().children().children()[0];  //next, please
            $(selectedElem).toggleClass('transSelected'); //set selected attribute as appropriate
        }
        if ($(selectedElem).is(elem)) { // Done!
            shiftDown = false;
            shiftSelectDir = 0;
        } else {
            selected(elem); //recursive step
        }
    } else {
        selectedElem = elem;
        $(elem).toggleClass('transSelected');
    }
}


function addOverlayButton(par, index) {
    var btn = document.createElement('img');
    $(btn).attr('class', 'editButton');
    var position = 16 * index + 4;
    $(btn).css('right', position.toString() + 'px');
    $(btn).click(function (e) { e.stopPropagation(); });
    $(par).css('position', 'relative');
    return btn;
}

function save(tdef) {
    var v = $(tdef).find('input').val()
    var update = true;
    if (v == null || v == '') { v = $(tdef).attr('priorText'); update = false; }
    $(tdef).attr('priorText', v);
    out(tdef);
    var proc = "";

    switch ($(tdef).attr('id').substring(0, 11)) {
        case "AcctingDate":
            proc = "changeAcctingDate";
            break;
        case "Description":
            proc = "changeDescription";
            break;
        default:
            break;
    }

    if (update) {
        $.ajax({
            type: 'POST',
            url: '/Content/shared/dataRetrieveJSON.cshtml',
            data: { "procedure": proc,
                "var0": $(tdef).attr('id').substring(11),
                "var1": v,
                "ct": 2
            },
            dataType: 'html'
        });
    }
}
function out(tdef) {

    if ($(tdef).attr('priorText') !== 'undefined') { $(tdef).prepend($(tdef).attr('priorText')); $(tdef).removeAttr('priorText'); }
    $(tdef).css('color', "");
    $(tdef).find('input').remove();
    $(tdef).find('img[name!="editpencil"]').find('img[name!="split"]').remove();
    $(tdef).find('.editButton').hide();
}

function editInPlace(evt) {
    evt.stopPropagation();
    var par = this.parentElement;
    $(this).css('display', 'none');
    $(par).attr('priorText', par.innerText);
    $(par).contents().filter(function () { return this.nodeType === 3; }).remove();
    var sv = addOverlayButton(par, 0);
    $(sv).attr('src', '/Images/save.png');
    $(sv).click(function () { save(par); });
    $(par).append(sv);
    $(sv).show();
    var can = addOverlayButton(par, 1);
    $(can).attr('src', '/Images/delete.png');
    $(can).click(function () { out(par); })
    $(par).append(can);
    $(can).show();
    var ipt = document.createElement('input');
    $(ipt).attr('type', 'text');
    $(ipt).click(function (e) { e.stopPropagation(); });
    $(ipt).keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            $(sv).click();
        }
    })
    $(ipt).attr('value', $(par).attr('priorText'));

    $(par).append(ipt);
    $(ipt).focus(function () { this.select(); });
    $(ipt).focus();
}


function lineCount() { return $("#splitDetailTable tr:not(.deletedSplitLine)").length - 1; } //Number of Rows minus header row
function usedLineCount() {
    var amtCt = lineCount() - $("#splitDetailTable tr:not(.deletedSplitLine)").find(":input").filter("[type='text']").filter("[value='0.00']").length;
    var catCt = lineCount() - $("#splitDetailTable tr:not(.deletedSplitLine) :selected").filter("[value='0']").length;
    return amtCt < catCt ? amtCt : catCt;

}

function transTable(transaction) {
    var t = document.createElement('table');
    var tb = document.createElement('tbody');
    var tr = document.createElement('tr');
    var acctId = parseInt(transaction.accountId);
    var tds = [0, 0, 0, 0, 0];
    var td;

    tds[0] = document.createElement('td');
    td = tds[0];

    var edd = addOverlayButton(td, 0);
    $(edd).attr('src', "/Images/edit.png");
    $(edd).attr('name', 'editpencil');
    $(edd).addClass('indelible');
    $(td).attr('id', 'AcctingDate' + transaction.transactionId.toString());
    td.innerHTML = transaction.accountingDate;
    $(td).attr('class', 'transDate');
    $(edd).click(editInPlace);
    $(td).append(edd);
    $(td).hover(function () { $(edd).fadeIn(); }, function () { out(tds[0]); });
    $(tr).append(td);

    tds[1] = document.createElement('td');
    td = tds[1];
    td.innerHTML = transaction.description;

    $(td).attr('class', 'transDescription');
    $(td).attr('id', 'Description' + transaction.transactionId.toString());
    $(td).attr('title', transaction.bankOrigDescription);

    var ed = addOverlayButton(td, 0);
    $(ed).attr('src', "/Images/edit.png");
    $(ed).attr('name', 'editpencil');
    $(ed).addClass('indelible');
    $(ed).click(editInPlace);
    $(td).append(ed);
    $(td).hover(function () { $(ed).fadeIn(); }, function () { out(tds[1]); });

    $(tr).append(td);

    tds[2] = document.createElement('td');
    td = tds[2];

    td.innerHTML = transaction.amount;
    $(td).attr('class', 'transAmount');
    $(td).attr('id', 'amount' + transaction.transactionId.toString());
    $(tr).append(td);

    $(tr).addClass(accountDisplay[acctId - 1]);
    $(tr).addClass('transRowOne');
    $(tb).append(tr);

    var tr = document.createElement('tr');

    tds[3] = document.createElement('td');
    td = tds[3];

    td.innerHTML = '&nbsp;';
    $(tr).append(td);

    tds[4] = document.createElement('td');
    td = tds[4];

    $(td).attr('class', 'transCatName');
    td.innerHTML = transaction.categoryName;
    $(td).attr('colspan', '2');
    $(td).attr('id', 'Category' + transaction.transactionId.toString());
    var edsplit = addOverlayButton(td, 0);
    $(edsplit).attr('src', "/Images/split.png");
    $(edsplit).attr('name', 'split');
    $(edsplit).addClass('indelible');
    $(edsplit).click(split);
    $(td).append(edsplit);
    $(td).hover(function () { $(edsplit).fadeIn(); }, function () { out(tds[4]); });

    $(tr).append(td);

    $(tr).addClass(accountDisplay[acctId - 1]);
    $(tr).addClass('transRowTwo');
    $(tb).append(tr);
    $(t).append(tb);
    $(t).attr('id', transaction.transactionId);
    $(t).attr('class', 'transactionDetail');
    $(t).click(function () { selected(t) });
    return t;
}

function renderTrans(data) {
    var tb = document.createElement('tbody');
    if (data === null) { $("#loadingDiv").toggle(false); $("#transactionsDiv").toggle(false); $("#noRecordsDiv").toggle(true); }
    $.each(data, function () {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        $(td).append(transTable(this.transaction));
        $(td).attr('class', 'transaction');
        $(tr).append(td);
        $(tb).append(tr);
    });
    $("#transactions").append(tb);
    $("#transactionsDiv").toggle(true);
    $('#buttonPanel').show();
}

function fetchError(obj, disp, err) {
    $("#loadingDiv").text(disp);

}

function fetchData(callback) {
    $("#noRecordsDiv").toggle(false);
    $("#loadingDiv").toggle(true);
    $('#transactionsDiv').html('<table id="transactions"></table>');

    $.ajax({
        type: 'POST',
        url: "/Content/shared/dataRetrieveJSON.cshtml",

        data: { "procedure": "transactionsJSON",
            "var0": 0,
            "var1": includeAll,
            "var2": accountFilter,
            "var3": currentSort.sortField,
            "var4": currentSort.sortDirection,
            "var5": searchTerm,
            "ct": 6
        },
        dataType: "json",
        success: function (retData) {
            callback(retData);
        },
        err: fetchError,
        complete: function (j, t) { $("#loadingDiv").toggle(false); }
    });



}
