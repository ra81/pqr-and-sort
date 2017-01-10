// ==UserScript==
// @name           Virtonomica: PQR+sort
// @namespace      virtonomica
// @author         ra81
// @description    Цена за единицу качества + сортировка
// @include        http*://virtonomic*.*/*/window/unit/supply/create/*/step2
// @include        http*://virtonomic*.*/*/window/unit/equipment/*
// @include        http*://virtonomic*.*/*/main/globalreport/marketing/by_products/*
// @version        1.0
// ==/UserScript==
function run() {
    var $ = jQuery;
    var realm = getRealm(window.location.pathname);
    // если много страниц то установим макс число на страницу и перезагрузимся
    var $pages = $('ul.pager_list li');
    if ($pages.length > 2) {
        var pagerUrl = $('ul.pager_options li').last().find('a').attr('href');
        //debugger;
        $.get(pagerUrl, function (data, status, jqXHR) {
            location.reload();
        });
        return;
    }
    // проверим где мы и вызовем верную функцию
    var path = document.location.pathname;
    var rxSupply = new RegExp(/.*\/unit\/supply\/create\/\d+\/step2\/?$/gi);
    var rxEquip = new RegExp(/.*\/unit\/equipment\/\d+\/?$/gi);
    var rxProducts = new RegExp(/.*\/main\/globalreport\/marketing\/by_products\/\d+\/?/gi);
    if (rxSupply.test(path))
        workSupply();
    if (rxEquip.test(path))
        workEquipment();
    if (rxProducts.test(path))
        workProduct();
    function workProduct() {
        var $headers = $('.grid th');
        $headers.eq(4).after("<th><div class=\"ordertool\">\n                <table class=\"ordercont\"><tbody>\n                    <tr>\n\t                    <td class=\"title-ordertool\">PQR</td>\n\t                    <td class=\"arrows\">\n                            <a id=\"pqrasc\" href=\"#\"><img src=\"/img/asc.gif\" alt=\"^\" width=\"9\" height=\"6\" border=\"0\"></a>\n                            <a id=\"pqrdesc\" href=\"#\"><img src=\"/img/desc.gif\" alt=\"v\" width=\"9\" height=\"6\" border=\"0\"></a>\n                        </td>\n                    </tr>\n                </tbody></table>\n            </div></th>");
        var $rows = $('.grid').find('img[src="/img/supplier_add.gif"]').closest('tr');
        var order = [];
        $rows.each(function (i, e) {
            var $this = $(e);
            var $price = $this.find("td:nth-child(5)");
            var $qual = $this.find("td:nth-child(4)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");
            var price = $price.map(function (i, e) { return numberfy($(e).text()); }).get(0);
            var qual = $qual.map(function (i, e) { return numberfy($(e).text()); }).get(0);
            var pqr = (price / qual);
            $price.after("<td align=\"right\" class=\"nowrap\" id='pqr_" + i + "' style='color: blue'>" + pqr.toFixed(2) + "</td>");
            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });
        $('#pqrasc').click(function () {
            sort_table('asc');
            return false;
        });
        $('#pqrdesc').click(function () {
            sort_table('desc');
            return false;
        });
        // сразу вызываю сортировку
        //$('#pqrasc').trigger('click');
        function sort_table(type) {
            if (type === "asc")
                order.sort(function (a, b) {
                    if (a.pqr > b.pqr)
                        return 1;
                    if (a.pqr < b.pqr)
                        return -1;
                    return 0;
                });
            if (type === "desc")
                order.sort(function (a, b) {
                    if (a.pqr > b.pqr)
                        return -1;
                    if (a.pqr < b.pqr)
                        return 1;
                    return 0;
                });
            var odd = false;
            for (var i = 0; i < order.length - 1; i++) {
                var $r0 = $rows.find("#pqr_" + order[i].place).closest('tr');
                var $r1 = $rows.find("#pqr_" + order[i + 1].place).closest('tr');
                $r0.after($r1);
                $r0.removeClass('even odd').addClass(odd ? 'odd' : 'even');
                odd = odd ? false : true;
            }
        }
    }
    function workEquipment() {
        var $headers = $('#mainTable th');
        $headers.eq(3).after("<th rowspan=\"2\">\n             <div class=\"ordertool\">\n                <table class=\"ordercont\" >\n                <tbody>\n                    <tr>\n                        <td class=\"title-ordertool\"> PQR </td>\n                        <td class=\"arrows\">\n                            <a id=\"pqrasc\" href=\"#\"><img src=\"/img/asc.gif\" alt= \"^\" width= \"9\" height= \"6\" border= \"0\"></a>\n                            <a id=\"pqrdesc\" href=\"#\"><img src=\"/img/desc.gif\" alt= \"v\" width= \"9\" height= \"6\" border= \"0\"></a>\n                        </td>\n                    </tr>\n                </tbody>\n                </table>\n            </div>\n            </th>");
        var $rows = $('#mainTable').find('td.choose').closest('tr');
        var order = [];
        $rows.each(function (i, e) {
            var $this = $(e);
            var $price = $this.find("td:nth-child(8)");
            var $qual = $this.find("td:nth-child(9)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");
            var price = $price.map(function (i, e) { return numberfy($(e).text()); }).get(0);
            var qual = $qual.map(function (i, e) { return numberfy($(e).text()); }).get(0);
            var pqr = (price / qual);
            $qual.after("<td class='digits' id='pqr_" + i + "' style='color: blue'>" + pqr.toFixed(2) + "</td>");
            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });
        $('#pqrasc').click(function () {
            sort_table('asc');
            return false;
        });
        $('#pqrdesc').click(function () {
            sort_table('desc');
            return false;
        });
        // сразу вызываю сортировку
        //$('#pqrasc').trigger('click');
        function sort_table(type) {
            if (type === "asc")
                order.sort(function (a, b) {
                    if (a.pqr > b.pqr)
                        return 1;
                    if (a.pqr < b.pqr)
                        return -1;
                    return 0;
                });
            if (type === "desc")
                order.sort(function (a, b) {
                    if (a.pqr > b.pqr)
                        return -1;
                    if (a.pqr < b.pqr)
                        return 1;
                    return 0;
                });
            var odd = false;
            for (var i = 0; i < order.length - 1; i++) {
                var $r0 = $rows.find("#pqr_" + order[i].place).closest('tr');
                var $r1 = $rows.find("#pqr_" + order[i + 1].place).closest('tr');
                $r0.after($r1);
                $r0.removeClass('even odd').addClass(odd ? 'odd' : 'even');
                odd = odd ? false : true;
            }
        }
    }
    function workSupply() {
        var $headers = $("#supply_content th");
        $headers.eq(4).after("\n                          <th>\n                            <div class=\"field_title\">PQR\n                                <div class=\"asc\" title=\"\u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u0430\u043D\u0438\u044E\">\n                                    <a id=\"pqrasc\" href=\"#\"><img src=\"/img/up_gr_sort.png\"></a>\n                                </div>\n                                <div class=\"desc\" title=\"\u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u0443\u0431\u044B\u0432\u0430\u043D\u0438\u044E\">\n                                    <a id=\"pqrdesc\" href=\"#\"><img src=\"/img/down_gr_sort.png\"></a>\n                                </div>\n                            </div>\n                          </th>");
        var $rows = $('#supply_content td.brandname_img').closest('tr');
        var order = [];
        $rows.each(function (i, e) {
            var $this = $(e);
            var $price = $this.find("td:nth-child(6)");
            var $qual = $this.find("td:nth-child(7)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");
            var price = $price.map(function (i, e) { return numberfy($(e).text()); }).get(0);
            var qual = $qual.map(function (i, e) { return numberfy($(e).text()); }).get(0);
            var pqr = (price / qual);
            $qual.after("<td class='supply_data' id='pqr_" + i + "' style='color: blue'>" + pqr.toFixed(2) + "</td>");
            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });
        $('#pqrasc').click(function () {
            sort_table('asc');
            return false;
        });
        $('#pqrdesc').click(function () {
            sort_table('desc');
            return false;
        });
        // сразу вызываю сортировку
        //$('#pqrasc').trigger('click');
        function sort_table(type) {
            if (type === "asc")
                order.sort(function (a, b) {
                    if (a.pqr > b.pqr)
                        return 1;
                    if (a.pqr < b.pqr)
                        return -1;
                    return 0;
                });
            if (type === "desc")
                order.sort(function (a, b) {
                    if (a.pqr > b.pqr)
                        return -1;
                    if (a.pqr < b.pqr)
                        return 1;
                    return 0;
                });
            for (var i = 0; i < order.length - 1; i++) {
                // если есть заказ, то после строки будет еще аппендикс. его тож надо сортирнуть
                var $r0 = $rows.find("#pqr_" + order[i].place).closest('tr');
                var $append0 = $r0.next('tr.ordered');
                var $r1 = $rows.find("#pqr_" + order[i + 1].place).closest('tr');
                var $append1 = $r1.next('tr.ordered');
                if ($append0.length > 0) {
                    if ($append1.length)
                        $append0.after($append1);
                    $append0.after($r1);
                }
                else {
                    if ($append1.length)
                        $r0.after($append1);
                    $r0.after($r1);
                }
            }
        }
    }
    function numberfy(str) {
        // возвращает либо число полученно из строки, либо БЕСКОНЕЧНОСТЬ, либо -1 если не получилось преобразовать.
        if (String(str) === 'Не огр.' ||
            String(str) === 'Unlim.' ||
            String(str) === 'Не обм.' ||
            String(str) === 'N’est pas limité' ||
            String(str) === 'No limitado' ||
            String(str) === '无限' ||
            String(str) === 'Nicht beschr.') {
            return Number.POSITIVE_INFINITY;
        }
        else {
            return parseFloat(str.replace(/[\s\$\%\©]/g, "")) || -1;
        }
    }
    ;
    function getRealm(pathname) {
        // https://*virtonomic*.*/*/main/globalreport/marketing/by_trade_at_cities/*
        // https://*virtonomic*.*/*/window/globalreport/marketing/by_trade_at_cities/*
        var rx = new RegExp(/\/?([a-zA-Z]+)\/.+/ig);
        var m = rx.exec(pathname);
        if (m == null)
            return null;
        return m[1];
    }
}
;
$(document).ready(function () { return run(); });
//// Хак, что бы получить полноценный доступ к DOM >:]
//var script = document.createElement("script");
//script.textContent = '(' + run.toString() + ')();';
//document.documentElement.appendChild(script); 
//# sourceMappingURL=pqr.js.map