// ==UserScript==
// @name           Virtonomica: PQR+sort
// @namespace      virtonomica
// @author         ra81
// @description    Цена за единицу качества + сортировка
// @include        http*://virtonomic*.*/*/window/unit/supply/create/*/step2
// @include        http*://virtonomic*.*/*/window/unit/equipment/*
// @include        http*://virtonomic*.*/*/main/globalreport/marketing/by_products/*
// @require        https://code.jquery.com/jquery-3.1.1.min.js
// @version        1.1
// ==/UserScript== 
// 
// Набор вспомогательных функций для использования в других проектах. Универсальные
//   /// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />
//
//
/**
 * Выдергивает реалм из текущего href ссылки если это возможно.
 */
function getRealm() {
    // https://*virtonomic*.*/*/main/globalreport/marketing/by_trade_at_cities/*
    // https://*virtonomic*.*/*/window/globalreport/marketing/by_trade_at_cities/*
    var rx = new RegExp(/https:\/\/virtonomic[A-Za-z]+\.[a-zA-Z]+\/([a-zA-Z]+)\/.+/ig);
    var m = rx.exec(document.location.href);
    if (m == null)
        return null;
    return m[1];
}
/**
 * Парсит id компании со страницы
 */
function getCompanyId() {
    var str = matchedOrError($("a.dashboard").attr("href"), /\d+/);
    return numberfyOrError(str);
}
/**
 * Оцифровывает строку. Возвращает всегда либо число или Number.POSITIVE_INFINITY либо -1 если отпарсить не вышло.
 * @param variable любая строка.
 */
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
        // если str будет undef null или что то страшное, то String() превратит в строку после чего парсинг даст NaN
        // не будет эксепшнов
        var n = parseFloat(String(str).replace(/[\s\$\%\©]/g, ""));
        return isNaN(n) ? -1 : n;
    }
}
/**
 * Пробуем оцифровать данные но если они выходят как Number.POSITIVE_INFINITY или <= minVal, валит ошибку.
   смысл в быстром вываливании ошибки если парсинг текста должен дать число
 * @param value строка являющая собой число больше minVal
 * @param minVal ограничение снизу. Число.
 * @param infinity разрешена ли бесконечность
 */
function numberfyOrError(value, minVal, infinity) {
    if (minVal === void 0) { minVal = 0; }
    if (infinity === void 0) { infinity = false; }
    var n = numberfy(value);
    if (!infinity && (n === Number.POSITIVE_INFINITY || n === Number.NEGATIVE_INFINITY))
        throw new RangeError("Получили бесконечность, что запрещено.");
    if (n <= minVal)
        throw new RangeError("Число должно быть > " + minVal);
    return n;
}
/**
 * Ищет паттерн в строке. Предполагая что паттерн там обязательно есть 1 раз. Если
 * нет или случился больше раз, валим ошибку
 * @param str строка в которой ищем
 * @param rx паттерн который ищем
 */
function matchedOrError(str, rx) {
    var m = str.match(rx);
    if (m == null)
        throw new Error("\u041F\u0430\u0442\u0442\u0435\u0440\u043D " + rx + " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 " + str);
    if (m.length > 1)
        throw new Error("\u041F\u0430\u0442\u0442\u0435\u0440\u043D " + rx + " \u043D\u0430\u0439\u0434\u0435\u043D \u0432 " + str + " " + m.length + " \u0440\u0430\u0437 \u0432\u043C\u0435\u0441\u0442\u043E \u043E\u0436\u0438\u0434\u0430\u0435\u043C\u043E\u0433\u043E 1");
    return m[0];
}
/**
 * Проверяет что элемент есть в массиве.
 * @param item
 * @param arr массив НЕ null
 */
function isOneOf(item, arr) {
    return arr.indexOf(item) >= 0;
}
/**
 * Возвращает ближайшего родителя по имени Тэга
   работает как и closest. Если родитель не найден то не возвращает ничего для данного элемента
    то есть есть шанс что было 10 а родителей нашли 4 и их вернули.
 * @param items набор элементов JQuery
 * @param tagname имя тэга. tr, td, span и так далее
 */
function closestByTagName(items, tagname) {
    var tag = tagname.toUpperCase();
    var found = [];
    for (var i = 0; i < items.length; i++) {
        var node = items[i];
        while ((node = node.parentNode) && node.nodeName != tag) { }
        ;
        if (node)
            found.push(node);
    }
    return $(found);
}
/**
 * Для заданного элемента, находит все непосредственно расположенные в нем текстовые ноды и возвращает их текст.
   очень удобен для извлечения непосредственного текста из тэга БЕЗ текста дочерних нодов
 * @param item 1 объект типа JQuery
 */
function getOnlyText(item) {
    // просто children() не отдает текстовые ноды.
    var $childrenNodes = item.contents();
    var res = [];
    for (var i = 0; i < $childrenNodes.length; i++) {
        var el = $childrenNodes.get(i);
        if (el.nodeType === 3)
            res.push($(el).text()); // так как в разных браузерах текст запрашивается по разному, 
    }
    return res;
}
/// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />
var Sort;
(function (Sort) {
    Sort[Sort["none"] = 0] = "none";
    Sort[Sort["asc"] = 1] = "asc";
    Sort[Sort["desc"] = 2] = "desc";
})(Sort || (Sort = {}));
;
function run() {
    var $ = jQuery;
    var realm = getRealm();
    if (realm == null)
        throw new Error("realm not found");
    // если много страниц то установим макс число на страницу и перезагрузимся
    var $pages = $('ul.pager_list li');
    if ($pages.length > 2) {
        var $pager = $('ul.pager_options li').last();
        var num = $pager.text().trim();
        var pagerUrl = $pager.find('a').attr('href').replace(num, "10000");
        //debugger;
        $.get(pagerUrl, function (data, status, jqXHR) { return location.reload(); });
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
        var $pqr = $("     <div id=\"pqr\" class=\"field_title\" style=\"cursor: pointer;\">PQR\n                                <div class=\"asc\" title=\"\u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u0430\u043D\u0438\u044E\">\n                                    <a id=\"pqrasc\" href=\"#\"><img src=\"/img/up_gr_sort.png\"></a>\n                                </div>\n                                <div class=\"desc\" title=\"\u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u0443\u0431\u044B\u0432\u0430\u043D\u0438\u044E\">\n                                    <a id=\"pqrdesc\" href=\"#\"><img src=\"/img/down_gr_sort.png\"></a>\n                                </div>\n                            </div>\n                            <span id=\"sort\" class=\"subvalue\">none</span>");
        var $headers = $("#supply_content th");
        $headers.eq(4).after($pqr.wrapAll("<th></th>").closest("th")); // завернем в хедер.
        var $rows = $("tr[id^=r]"); // все поставщики имеют id=r4534534 
        var order = [];
        $rows.each(function (i, e) {
            var $this = $(e);
            var $price = $this.find("td:nth-child(6)");
            var $qual = $this.find("td:nth-child(7)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");
            // в принципе такое может быть что кача нет вообще для пустых складов. Поэтому надо учитывать
            var price = numberfyOrError($price.eq(0).text(), -2);
            var qual = numberfyOrError($qual.eq(0).text(), -2);
            var pqr = (price <= 0 || qual <= 0) ? 0 : (price / qual);
            $qual.after(buildHtmlTD(i, pqr));
            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });
        $pqr.on("click", function (event) {
            // если кликали на картинку то нам надо взять родительский <a> тег чтобы взять id
            var $el = $(event.target);
            if ($el.is("img"))
                $el = $el.parent(); //
            var type = Sort.none;
            // определим какой тим сортировки надо делать
            if ($el.is("#pqrasc"))
                type = Sort.asc;
            else if ($el.is("#pqrdesc"))
                type = Sort.desc;
            else {
                // если кликали не на стрелки, тада посмотрим какой щас тип сортировки
                if ($pqr.hasClass("asc"))
                    type = Sort.desc;
                else if ($pqr.hasClass("desc"))
                    type = Sort.none;
                else
                    type = Sort.asc;
            }
            // выполним действия
            var $span = $("#sort");
            switch (type) {
                case Sort.none:
                    $pqr.removeClass("asc desc");
                    $span.text("none");
                    break;
                case Sort.asc:
                    $pqr.removeClass("desc");
                    $pqr.addClass("asc");
                    $span.text("asc");
                    break;
                case Sort.desc:
                    $pqr.removeClass("asc");
                    $pqr.addClass("desc");
                    $span.text("desc");
                    break;
            }
            sort_table(type);
            return false;
        });
        //$('#pqrasc').click(() => {
        //    sort_table('asc');
        //    return false;
        //});
        //$('#pqrdesc').click(() => {
        //    sort_table('desc');
        //    return false;
        //});
        // сразу вызываю сортировку
        //$('#pqrasc').trigger('click');
        function sort_table(type) {
            switch (type) {
                case Sort.asc:
                    order.sort(function (a, b) {
                        if (a.pqr > b.pqr)
                            return 1;
                        if (a.pqr < b.pqr)
                            return -1;
                        return 0;
                    });
                    break;
                case Sort.desc:
                    order.sort(function (a, b) {
                        if (a.pqr > b.pqr)
                            return -1;
                        if (a.pqr < b.pqr)
                            return 1;
                        return 0;
                    });
                    break;
                case Sort.none:
                    order.sort(function (a, b) {
                        if (a.place > b.place)
                            return 1;
                        if (a.place < b.place)
                            return -1;
                        return 0;
                    });
            }
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
    function buildHtmlTD(i, pqr) {
        return "<td id='pqr_" + i + "' class='pqr_data' style='color: blue; width: 70px; text-align: right;'>" + pqr.toFixed(2) + "</td>";
    }
}
;
$(document).ready(function () { return run(); });
//# sourceMappingURL=pqr.user.js.map