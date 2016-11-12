var currentSort = { "sortField": "description", "sortDirection": "asc" };

function getSort(index) {
    var sortMap = {
        sortDate: "accountingDate",
        sortDesc: "description",
        sortCat: "categoryName",
        sortAmt: "abs(amount)"
    };
    return sortMap[index];

}

function changeSort(elem, callback) {
    $(elem).toggleClass('asc');
    $('.sortSelected').removeClass('sortSelected');
    $(elem).addClass('sortSelected');
    currentSort.sortDirection = $(elem).hasClass('asc') ? 'asc' : 'desc';
    currentSort.sortField=getSort($(elem).attr('id'));
    fetchData(renderTrans);
}