/**
 * jqeury.datagrid.js
 *
 *
 */
(function ($) {
    var DATAGRID_INITIALIZE = 'initialize';
    var DATAGRID_RELOAD = 'reload';
    var DATAGRID_SORT = 'sort'

    var DATAGRID_DEBUG = '[jQuery.datagrid][task]';

    $.fn.datagrid = function (option) {
        var settings = $.extend({
            'url': '',
            'columns': [],
            'tableId': this.attr('id'),         // 데이터 그리드를 테이블의 id table id
            'paginationId': '#pagination',      // 페이징 영역 id pagination id
            'nodata': 'No data.',
            'useCustomHeader': false,           // 사용자가 미리 정의한 테이블 헤더 사용여부 do not draw table header; User defined thead section use.
            'usePaging': true,                  // 페이징 영역에 페이징을 그릴지 여부 use pagination
            'dataType': 'JSON',                 // 데이터의 타입 what is fetch data' type
            'page': 1,                          // 현재 페이지 current page
            'rows': 10,                         // 페이지에 보여줄 행의 수 show rows per page
            'pageCount': 5,                     // 페이징 영역에 표시할 페이지의 수 show page count in pagination
            'sidx': '',
            'sord': '',
            'action': DATAGRID_INITIALIZE,
            'afterDataBind':null,
            'debug': false
        }, option);

        var debugginLog = function (message) {
            if (settings['debug']) {
                console.log(message);
            }
        }

        var getTableColumnsCount = function () {
            debugginLog(DATAGRID_DEBUG + '[call function] : getTableColumnsCount');
            var columnCount = 0;
            //var nColumnCountTemp = 0;
            //$(tableId).children('thead').children('tr').each(function (index, item) {
            //    nColumnCountTemp = $(item).children('th').length;
            //    if (columnCount < nColumnCountTemp) { columnCount = nColumnCountTemp; }
            //});

            //if (columnCount == 0) {
            //    columnCount = $(tableId).children('tbody').children('tr').first().children('td').length;
            //}

            columnCount = settings['columns'].length;

            debugginLog('Header Count = ' + columnCount);

            return columnCount;
        }

        debugginLog(DATAGRID_DEBUG + '[settings][action] : ' + settings['action']);

        // #grid_custom
        //this.empty();
        if (this.children('caption').length == 0) { this.append('<caption></caption>'); }
        if (this.children('thead').length == 0) { this.append('<thead></thead>'); }
        if (this.children('tbody').length == 0) { this.append('<tbody></tbody>'); }
        if (this.children('tfoot').length == 0) { this.append('<tfoot></tfoot>'); }

        // #grid_paging
        var tableId = '';
        var paginationId = '';
        var dataType = 'JSON';
        var page = 1;
        var rows = 10;
        var useCustomHeader = false;
        var usePaging = false;
        var pageCount = 5;
        var headerCaption = [];
        var columnsDefinition = [];
        var url = '';
        if (settings && settings.hasOwnProperty('tableId')) {
            // tableId
            tableId = settings['tableId'];
        }

        if (settings && settings.hasOwnProperty('paginationId')) {
            // paginationId
            paginationId = settings['paginationId'];
        }

        if (settings && settings.hasOwnProperty('useCustomHeader')) {
            // useCustomHeader
            useCustomHeader = settings['useCustomHeader']
        }

        if (settings && settings.hasOwnProperty('usePaging') && settings['usePaging']) {
            // paging 정의
            usePaging = settings['usePaging'];
        }

        if (settings && settings.hasOwnProperty('dataType')) {
            // dataType
            dataType = settings['dataType'];
        }

        if (settings && settings.hasOwnProperty('page')) {
            // page
            page = settings['page'];
        }

        if (settings && settings.hasOwnProperty('rows')) {
            // rows
            rows = settings['rows'];
        }

        if (settings && settings.hasOwnProperty('pageCount')) {
            // pageCount
            pageCount = option['pageCount'];
        }

        if (settings && settings.hasOwnProperty('columns')) {
            columnsDefinition = settings['columns'];
        }

        if (settings && settings.hasOwnProperty('url')) {
            url = settings['url'];
        }

        var checkTableHeaderExsits = function () {
            return (
                $(tableId).children('thead').children('tr').length > 0 &&
                    (
                        $(tableId).children('thead').children('th').length > 0 ||
                        $(tableId).children('thead').children('td').length > 0)
                );
        };

        var chechIsSortColumn = function (colName) {
            if (colName && colName.length > 0 && columnsDefinition && columnsDefinition.length > 0) {
                for (var i = 0; i < columnsDefinition.length; i++) {
                    if (colName.toUpperCase() == columnsDefinition[i]['name'].toUpperCase()) { return true; }
                }
            }
            return false;
        };
        if (settings['action'] == DATAGRID_INITIALIZE) {
            // 액션 == 초기화;
            if (!useCustomHeader && columnsDefinition && !checkTableHeaderExsits()) {
                // 입력된 Header caption 이 존재하면 헤더를 추가한다.
                debugginLog(DATAGRID_DEBUG + '[task] : Add grid header');
                $(tableId).children('thead').empty();
                var tableHeaderRow = $('<tr></tr>');
                for (var i = 0; i < columnsDefinition.length; i++) {
                    var th = $('<th></th>');
                    var strHeaderCaption = columnsDefinition[i]['header'];
                    var th_class = columnsDefinition[i]['class'];
                    var th_width = columnsDefinition[i]['width'];
                    if (!strHeaderCaption || strHeaderCaption.length == 0) { strHeaderCaption = 'header' + (i + 1); }
                    if (th_class && th_class.length > 0) {
                        $(th).addClass(th_class);
                    }
                    if (!th_width || th_width.length <= 0) {
                        th_width = 'auto';
                    }

                    $(th).css({ 'width': th_width });

                    if (columnsDefinition[i].hasOwnProperty('hidden') && columnsDefinition[i]['hidden']) {
                        $(th).addClass('hidden');
                    }
                    if (columnsDefinition[i].hasOwnProperty('sortable') && columnsDefinition[i]['sortable']) {
                        $(th).attr({ 'aria-column-key': columnsDefinition[i]['name'] });
                    }

                    $(tableHeaderRow).append($(th).html(strHeaderCaption));
                }
                $(tableId).children('thead').append(tableHeaderRow);
            }
        }

        $(tableId).prop('disabled', true);
        $(tableId).addClass('disabled');
        // draw table
        debugginLog(DATAGRID_DEBUG + '[task] : fetch data.');
        if (url) {
            // fetch data

            $.get(
                url,
                {
                    'page': page,
                    'rows': rows,
                    'sidx': settings['sidx'],
                    'sord': settings['sord']
                },
                function (data) {
                    debugginLog(DATAGRID_DEBUG + '[task] : $.get(...);');
                    if (data['result'] && data['result'] == 'error') {
                        // Error : could not get data.
                    }
                    else {
                        $(tableId).children('tbody').empty();

                        if (data['Rows'] && data['Rows'].length > 0) {
                            // 조회된 결과가 있어야 한다.
                            debugginLog(DATAGRID_DEBUG + '[message] : draw table to use resultset.');
                            $.each(data['Rows'], function (index, item) {
                                var tr = $('<tr></tr>');

                                if (columnsDefinition && columnsDefinition.length > 0) {
                                    debugginLog(DATAGRID_DEBUG + '[message] : draw table\'s column to use resultset & settings.columns.');
                                    for (var i = 0; i < columnsDefinition.length; i++) {
                                        var td_val = item[columnsDefinition[i]['name']];
                                        var td_calss = columnsDefinition[i]['class'];

                                        if (columnsDefinition[i].hasOwnProperty('formatter') && columnsDefinition[i]['formatter']) {
                                            td_val = columnsDefinition[i]['formatter'](td_val);
                                        }

                                        var td = $('<td></td>').text(td_val);
                                        if (td_calss && td_calss.length > 0) {
                                            $(td).addClass(td_calss);
                                        }

                                        if (columnsDefinition[i].hasOwnProperty('sortable') && columnsDefinition[i]['sortable']) {
                                            td.attr({ 'aria-column-key': columnsDefinition[i]['name'] });
                                        }

                                        if (columnsDefinition[i].hasOwnProperty('hidden') && columnsDefinition[i]['hidden']) {
                                            $(td).addClass('hidden');
                                        }

                                        tr.append(td);
                                    }
                                }
                                else {
                                    debugginLog(DATAGRID_DEBUG + '[message] : draw table\'s column to use resultset & resultset\'s keys.');
                                    for (var k in item) {
                                        var td = $('<td></td>').text(item[k]);
                                        tr.append(td);
                                    }
                                }
                                $(tableId).children('tbody').append(tr);
                            });

                            if (settings['action'] == DATAGRID_INITIALIZE) {
                                // 테이블 헤더가 존재하지 않으면 헤더를 추가한다.
                                debugginLog(DATAGRID_DEBUG + '[task] : draw table\'s header to use resultset & settings.columns.');
                                if (!useCustomHeader && !checkTableHeaderExsits()) {
                                    if ($(tableId).children('thead').children('tr').length == 0 || $(tableId).children('thead').children('tr').children('th').length == 0) {
                                        $(tableId).children('thead').empty();

                                        var thead_tr = $('<tr></tr>');

                                        for (var k in item) {
                                            var tr_th = $('<th></th>').text(k);
                                            thead_tr.append(tr_th);
                                        }
                                        $(tableId).children('thead').append(thead_tr);
                                    }
                                }
                            }

                            $(tableId).children('thead').children('tr').children('th[aria-column-key]').each(function (index, item) {
                                debugginLog(DATAGRID_DEBUG + '[task] : add span tag that displays sort icon.');
                                if ($(item).children('span.sort-icon').length == 0) {
                                    // icon을 표시할 span 추가
                                    $(item).append($('<span></span>').addClass('sort-icon').attr({ 'aria-hidden': true }));
                                }
                            });

                            if (usePaging) {
                                // pagination
                                debugginLog(DATAGRID_DEBUG + '[task] : add pagination.');
                                $(paginationId).empty();
                                $(paginationId).addClass('text-center');
                                var startPage = 0;
                                startPage = (Math.floor(((page - 1) / pageCount)) * pageCount) + 1;

                                var paginationUL = $('<ul></ul>').addClass('pagination');
                                var total_record_count = data['Total'];
                                var total = data['Total'];
                                total = Math.floor(total_record_count / rows) + ((total_record_count % rows) > 0 ? 1 : 0);

                                var records = data['Records'];
                                var previousPage = 1;
                                var nextPage = 0;

                                // Previous
                                previousPage = startPage - 1;
                                if (previousPage <= 1) { previousPage = 1; }
                                var previousPageLI = $('<li></li>').append($('<a></a>').addClass('btn-page').attr({ 'aria-label': 'Previous', 'aria-goto-page': previousPage }).html('<span aria-hidden="true">&laquo;</span>'));
                                if (page == 1 || startPage == 1) {
                                    $(previousPageLI).addClass('disabled');
                                }
                                $(paginationUL).append(previousPageLI);

                                // pagination
                                for (var i = startPage; i < (startPage + pageCount) ; i++) {
                                    if (i == (total + 1)) { break; }
                                    var pageText = $('<a></a>').attr({ 'aria-label': i }).text(i);
                                    if (i != page) {
                                        $(pageText).addClass('btn-page');
                                    }
                                    var pageLI = $('<li></li>');
                                    if (i == page) { $(pageLI).addClass('active'); }
                                    $(pageLI).append(pageText);
                                    $(paginationUL).append(pageLI);
                                    nextPage++;
                                }
                                nextPage += startPage;
                                // Next
                                if (nextPage > total) { nextPage = total; }
                                var nextPageLI = $('<li></li>').append($('<a></a>').addClass('btn-page').attr({ 'aria-label': 'Next', 'aria-goto-page': nextPage }).html('<span aria-hidden="true">&raquo;</span>'));
                                if (page == total) {
                                    $(nextPageLI).addClass('disabled');
                                }

                                $(paginationUL).append(nextPageLI);

                                $(paginationUL).children('li').children('a').addClass('btn');

                                $(paginationId).append(paginationUL);

                                $('.btn-page').off('click');
                                $('.btn-page').on('click', function () {
                                    if ($(this).parent().hasClass('disabled')) { return false; }

                                    var gotoPage = $(this).attr('aria-label');
                                    if (gotoPage == 'Next' || gotoPage == 'Previous') {
                                        gotoPage = $(this).attr('aria-goto-page');
                                    }
                                    else {
                                        gotoPage = $(this).attr('aria-label');
                                    }

                                    $(tableId).datagrid(
                                       {
                                           'url': url,
                                           'columns': columnsDefinition,
                                           'tableId': tableId,
                                           'paginationId': paginationId,
                                           'useCustomHeader': useCustomHeader,
                                           'usePaging': usePaging,
                                           'page': gotoPage,
                                           'rows': rows,
                                           'pageCount': pageCount,
                                           'action': DATAGRID_RELOAD,
                                           'afterDataBind':settings['afterDataBind']
                                       });
                                });
                            } /* end if(usePaging) */
                        }
                        else {
                            // 조회결과가 없음.
                            debugginLog(DATAGRID_DEBUG + '[task] : no data.');
                            var td_nodata = $('<td />').attr('colspan', getTableColumnsCount()).addClass('text-center').html(settings['nodata']);
                            var tr_nodate = $('<tr></tr>').append(td_nodata);
                            $(tableId).children('tbody').append(tr_nodate);
                        }
                    }

                    // Enabled
                    $(tableId).removeClass('disabled');
                    $(tableId).prop('disabled', false);

                    if(settings['afterDataBind']){
                        settings['afterDataBind']();
                    }

                }, dataType); /* end $.get() */
        } /* end if (url)*/

        if (settings['action'] == 'initialize') {
            // 정렬 헤더 이벤트 추가
            $(tableId).children('thead').children('tr').children('th').each(function (index, item) {
                var colName = $(item).attr('aria-column-key');
                if (chechIsSortColumn(colName)) {
                    debugginLog(DATAGRID_DEBUG + '[task] : column name = [' + colName + ']add click event');
                    $(item).css({ 'cursor': 'pointer' });
                    $(item).off('click');
                    $(item).on('click', function (event) {
                        var sidx = $(this).attr('aria-column-key');
                        var sord = $(this).attr('aria-column-sord');

                        // 아이콘 제거
                        $(tableId).children('thead').children('tr').children('th').children('span.sort-icon').removeClass('glyphicon glyphicon-chevron-up glyphicon-chevron-down');
                        $(tableId).children('thead').children('tr').children('th').removeAttr('aria-column-sord');
                        //$(this).attr({ 'aria-column-sord': sord });
                        // 정렬
                        if (sord && sord == 'asc') {
                            sord = 'desc';
                        }
                        else {
                            sord = 'asc';
                        }

                        // icon
                        if (sord && sord.length > 0) {
                            $(tableId).children('thead').children('tr').children('th').attr({ 'aria-column-sord': '' });
                            $(tableId).children('thead').children('tr').children('th').children('span.sort-icon').each(function (index, item) {
                                $(this).removeClass('glyphicon glyphicon-chevron-down glyphicon-chevron-up');
                            });

                            $(this).attr({ 'aria-column-sord': sord });
                            switch (sord) {
                                case 'asc':
                                    $(this).children('span.sort-icon').addClass('glyphicon glyphicon-chevron-down').attr({ 'aria-hidden': true });
                                    break;
                                case 'desc':
                                    $(this).children('span.sort-icon').addClass('glyphicon glyphicon-chevron-up').attr({ 'aria-hidden': true });
                                    break;
                                default:
                                    $(this).children('span.sort-icon').removeClass('glyphicon glyphicon-chevron-down glyphicon-chevron-up');
                                    break;
                            }
                        }

                        // 정렬된 데이터 가져오기
                        $(tableId).datagrid(
                               {
                                   'url': url,
                                   'columns': columnsDefinition,
                                   'tableId': tableId,
                                   'paginationId': paginationId,
                                   'useCustomHeader': useCustomHeader,
                                   'usePaging': usePaging,
                                   'page': page,
                                   'rows': rows,
                                   'pageCount': pageCount,
                                   'sidx': sidx,
                                   'sord': sord,
                                   'action': DATAGRID_SORT,
                                   'afterDataBind':settings['afterDataBind']
                               });
                    });
                }
            });
        }

        return this;
    }
}(jQuery));