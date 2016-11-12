var searchTerm = '';
var includeAll = 0;
var accountFilter = 0;

function search(){
    searchTerm = $('#searcher').val() === undefined ? '' : $('#searcher').val();
    includeAll = $('input[type="checkbox"]').attr('checked') ===undefined ? 0 : 1;
    fetchData(renderTrans);
}

function clearSearch(){
    searchTerm = '';
    includeAll = 0;
    accountFilter = 0;
    $("select option").filter(function() {return $(this).text() == 'All Accounts';}).attr('selected', true);
    $('input[type="checkbox"]').removeAttr('checked');
    $('#searcher').val('');
    fetchData(renderTrans);
}

function accountChange(){
    accountFilter = parseInt($('#accountSearch option:selected').attr('accountId'));
}

$(document).ready(
    function () {
        $('#search').click(search);
        $('#clearSearch').click(clearSearch);
        $('#accountSearch').change(accountChange);
    }
);