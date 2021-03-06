﻿

enum Sort { none, asc, desc };
interface ISortData {
    place: number;      // исходный номер строки в таблице
    pqr: number;        // посчитанный pqr
    $r: JQuery;         // ссыль на строку
}

function run() {

    let Url_rx = {
        v_global_products: /[a-z]+\/main\/globalreport\/marketing\/by_products\/\d+\/?$/i,  // Аналитика - Маркетинг - Продукция
        comp_manage_equipment: /\/[a-z]+\/window\/management_units\/equipment\/(?:buy|repair)\/?$/i,       // управление оборудованием купить/ ремонт
        unit_supply_create: /\/[a-z]+\/unit\/supply\/create\/\d+\/step2\/?$/i,      // заказ товара в маг, или склад. в общем стандартный заказ товара
        unit_equipment: /\/[a-z]+\/window\/unit\/equipment\/\d+\/?$/ig,             // оборудование
    };


    let $ = jQuery;
    let realm = getRealm();
    if (realm == null)
        throw new Error("realm not found");

    // если много страниц то установим макс число на страницу и перезагрузимся
    let $pages = $('ul.pager_list li');
    if ($pages.length > 2) {
        let $pager = $('ul.pager_options li').last();
        let num = $pager.text().trim();
        let pagerUrl = $pager.find('a').attr('href').replace(num, "10000");
        //debugger;
        $.get(pagerUrl, (data, status, jqXHR) => location.reload());

        return;
    }

    // проверим где мы и вызовем верную функцию
    let path = document.location.pathname;
    if (Url_rx.unit_supply_create.test(path))
        workSupply();

    if (Url_rx.unit_equipment.test(path))
        workEquipment();

    if (Url_rx.comp_manage_equipment.test(path))
        workGroupEquipment();

    if (Url_rx.v_global_products.test(path))
        workProduct();



    function workProduct() {

        let $pqr = $(
            `<div id="pqr" class="ordertool" style="cursor: pointer;">
                <table class="ordercont">
                <tbody>
                    <tr>
	                    <td class="title-ordertool">PQR</td>
	                    <td class="arrows">
                            <a id="pqrasc" href="#"><img src="/img/asc.gif" alt="^" width="9" height="6" border="0"></a>
                            <a id="pqrdesc" href="#"><img src="/img/desc.gif" alt="v" width="9" height="6" border="0"></a>
                        </td>
                    </tr>
                </tbody>
                </table>
                <span id="sort" class="subvalue">none</span>
            </div>`
        );

        $('table.grid th').eq(4).after($pqr.wrapAll("<th></th>").closest("th"));

        let $rows = closestByTagName($('table.grid').find('img[src="/img/supplier_add.gif"]'), "tr");

        // спарсим ряды в объект который будем сортировать. сразу и pqr посчитаем
        let priceSel = ($r: JQuery) => $r.find("td:nth-child(5)");
        let qualSel = ($r: JQuery) => $r.find("td:nth-child(4)");
        let order: ISortData[] = parseRows($rows, priceSel, qualSel);

        // пропихнем везде ячейку со значением pqr
        for (let i = 0; i < order.length; i++)
            priceSel(order[i].$r).after(buildHtmlTD(order[i].place, order[i].pqr));

        $pqr.on("click", (event) => {
            onClick($pqr, event, sort_table);
            return false;
        });

        function sort_table(type: Sort) {

            let $start = $("table.grid tr").first();
            order = sortData(order, type);

            let odd = false;
            for (let i = order.length - 1; i >= 0; i--) {
                let $r0 = order[i].$r;
                $r0.removeClass('even odd').addClass(odd ? 'odd' : 'even');
                $start.after($r0);

                odd = odd ? false : true;
            }
        }
    }

    function workEquipment() {

        let $pqr = $(
             `<div id="pqr" class="ordertool style="cursor: pointer;">
                <table class="ordercont" >
                <tbody>
                    <tr>
                        <td class="title-ordertool"> PQR </td>
                        <td class="arrows">
                            <a id="pqrasc" href="#"><img src="/img/asc.gif" alt= "^" width= "9" height= "6" border= "0"></a>
                            <a id="pqrdesc" href="#"><img src="/img/desc.gif" alt= "v" width= "9" height= "6" border= "0"></a>
                        </td>
                    </tr>
                </tbody>
                </table>
                <span id="sort" class="add_info">none</span>
            </div>`
        );

        // завернем в хедер.
        $('#mainTable th').eq(3).after($pqr.wrapAll("<th rowspan=2></th>").closest("th"));

        let $rows = $('#mainTable').find('tr[id^=r]');

        // спарсим ряды в объект который будем сортировать. сразу и pqr посчитаем
        let priceSel = ($r: JQuery) => $r.find("td:nth-child(8)");
        let qualSel = ($r: JQuery) => $r.find("td:nth-child(9)");
        let order: ISortData[] = parseRows($rows, priceSel, qualSel);

        // пропихнем везде ячейку со значением pqr
        for (let i = 0; i < order.length; i++)
            qualSel(order[i].$r).after(buildHtmlTD(order[i].place, order[i].pqr));

        $pqr.on("click", (event) => {
            onClick($pqr, event, sort_table);
            return false;
        });

        function sort_table(type: Sort) {
            let $start = $("#table_header");
            order = sortData(order, type);

            let odd = false;
            for (let i = order.length - 1; i >= 0; i--) {
                let $r0 = order[i].$r;
                $r0.removeClass('even odd').addClass(odd ? 'odd' : 'even');
                $start.after($r0);

                odd = odd ? false : true;
            }
        }
    }

    function workGroupEquipment() {

        let $pqr = $(
            `<div id="pqr" class="ordertool" style="cursor: pointer;">
                <table class="ordercont">
                <tbody>
                    <tr>
                        <td class="title-ordertool" > PQR </td>
                        <td class="arrows">
                            <a id="pqrasc"  href="#"><img src="/img/asc.gif" alt= "^" width= "9" height= "6" border= "0" ></a>
                            <a id="pqrdesc"  href="#"><img src="/img/desc.gif" alt="v" width="9" height="6" border="0"></a>
                        </td>
                    </tr>
                </tbody>
                </table>
                <span id="sort" class="add_info">none</span>
            </div>`
        );

        let $grid = $("form[name='supplyEquipmentForm'] table.list");
        //let $thPrice = $grid.find("th:contains('Цена')");
        //let $thQual = $grid.find("th:contains('Качество')");

        // завернем в хедер.
        $grid.find("th").eq(4).after($pqr.wrapAll("<th></th>").closest("th"));

        let $rows = $grid.find("tr").has("img[src*='unit_types']");

        // спарсим ряды в объект который будем сортировать. сразу и pqr посчитаем
        let priceSel = ($r: JQuery) => $r.find("td:nth-child(5)");
        let qualSel = ($r: JQuery) => $r.find("td:nth-child(6)");
        let order: ISortData[] = parseRows($rows, priceSel, qualSel);

        // пропихнем везде ячейку со значением pqr
        for (let i = 0; i < order.length; i++)
            qualSel(order[i].$r).after(buildHtmlTD(order[i].place, order[i].pqr));

        $pqr.on("click", (event) => {
            onClick($pqr, event, sort_table);
            return false;
        });

        function sort_table(type: Sort) {
            let $start = $grid.find("tbody tr").first();
            let sorted = sortData(order, type);

            let odd = false;
            for (let i = sorted.length - 1; i >= 0; i--) {
                let $r0 = sorted[i].$r;
                $r0.removeClass('even odd').addClass(odd ? 'odd' : 'even');
                $start.after($r0);

                odd = odd ? false : true;
            }
        }
    }

    function workSupply() {

        let $pqr = $(`     <div id="pqr" class="field_title" style="cursor: pointer;">PQR
                                <div>
                                <div class="asc" title="сортировка по возрастанию">
                                    <a id="pqrasc" href="#"><img src="/img/up_gr_sort.png"></a>
                                </div>
                                <div class="desc" title="сортировка по убыванию">
                                    <a id="pqrdesc" href="#"><img src="/img/down_gr_sort.png"></a>
                                </div>
                                <span id="sort" class="subvalue">none</span>
                                </div>
                            </div>`);

        // завернем в хедер.
        $("table.unit-list-2014 th").eq(4).after($pqr.wrapAll("<th></th>").closest("th"));

        let $rows = $("tr[id^=r]"); // все поставщики имеют id=r4534534 

        // спарсим ряды в объект который будем сортировать. сразу и pqr посчитаем
        let priceSel = ($r: JQuery) => $r.find("td:nth-child(6)");
        let qualSel = ($r: JQuery) => $r.find("td:nth-child(7)");
        let order: ISortData[] = parseRows($rows, priceSel, qualSel);

        // пропихнем везде ячейку со значением pqr
        for (let i = 0; i < order.length; i++)
            qualSel(order[i].$r).after(buildHtmlTD(order[i].place, order[i].pqr));

        $pqr.on("click", (event) => {
            onClick($pqr, event, sort_table);
            return false;
        });


        function sort_table(type: Sort) {

            let $start = $("table.unit-list-2014 tbody")
            order = sortData(order, type);

            // вставлять будем задом наперед. Просто начиная с шапки таблицы вставляем в самый верх
            // сначала идут последние постепенно дойдем до первых. Самый быстрый способ вышел
            for (let i = order.length-1; i >= 0; i--) {
                // если есть заказ, то после строки будет еще аппендикс. его тож надо сортирнуть
                let $r0 = order[i].$r;
                let $append0 = $r0.next('tr.ordered');

                if ($append0.length > 0)
                    $r0 = $r0.add($append0);

                $start.prepend($r0);
            }
        }
    }

    function onClick($pqr: JQuery, event: JQueryEventObject, sorter: (type: Sort) => void) {

        // если кликали на картинку то нам надо взять родительский <a> тег чтобы взять id
        let $el = $(event.target);
        if ($el.is("img"))
            $el = $el.parent(); //

        let type = Sort.none;

        // определим какой тим сортировки надо делать
        if ($el.is("#pqrasc")) type = Sort.asc;
        else if ($el.is("#pqrdesc")) type = Sort.desc;
        else {
            // если кликали не на стрелки, тада посмотрим какой щас тип сортировки
            if ($pqr.hasClass("asc")) type = Sort.desc;
            else if ($pqr.hasClass("desc")) type = Sort.none;
            else type = Sort.asc;
        }

        // выполним действия
        let $span = $pqr.find("#sort");
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

        sorter(type);
        return false;
    }
};

function parseRows($rows: JQuery, priceSelector: ($r: JQuery) => JQuery, qualSelector: ($r: JQuery) => JQuery): ISortData[] {

    let res: ISortData[] = [];

    for (let i = 0; i < $rows.length; i++) {
        let $r = $rows.eq(i);

        let $price = priceSelector($r);
        let $qual = qualSelector($r);
        if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
            alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");

        // в принципе такое может быть что кача нет вообще для пустых складов. Поэтому надо учитывать
        let price = numberfyOrError($price.eq(0).text(), -2);
        let qual = numberfyOrError($qual.eq(0).text(), -2);

        let pqr = (price <= 0 || qual <= 0) ? 0 : (price / qual);
        //$qual.after(buildHtmlTD(i, pqr));

        res.push({ place: i, pqr: pqr, $r: $r });
    }

    return res;
}

function sortData(items: ISortData[], type: Sort): ISortData[] {
    switch (type) {
        case Sort.asc:
            items.sort((a, b) => {
                if (a.pqr > b.pqr)
                    return 1;

                if (a.pqr < b.pqr)
                    return -1;

                return 0;
            });
            break;

        case Sort.desc:
            items.sort((a, b) => {
                if (a.pqr > b.pqr)
                    return -1;

                if (a.pqr < b.pqr)
                    return 1;

                return 0;
            });
            break;

        case Sort.none:
            items.sort((a, b) => {
                if (a.place > b.place)
                    return 1;

                if (a.place < b.place)
                    return -1;

                return 0;
            });
    }

    return items;
}

function buildHtmlTD(i: number, pqr: number): string {
    return `<td id='pqr_${i}' class='pqr_data' style='color: blue; width: 70px; text-align: right;'>${pqr.toFixed(2)}</td>`;
}

function getRealm(): string | null {
    // https://*virtonomic*.*/*/main/globalreport/marketing/by_trade_at_cities/*
    // https://*virtonomic*.*/*/window/globalreport/marketing/by_trade_at_cities/*
    let rx = new RegExp(/https:\/\/virtonomic[A-Za-z]+\.[a-zA-Z]+\/([a-zA-Z]+)\/.+/ig);
    let m = rx.exec(document.location.href);
    if (m == null)
        return null;

    return m[1];
}
function closestByTagName(items: JQuery, tagname: string): JQuery {
    let tag = tagname.toUpperCase();

    let found: Node[] = [];
    for (let i = 0; i < items.length; i++) {
        let node: Node = items[i];
        while ((node = node.parentNode) && node.nodeName != tag) { };

        if (node)
            found.push(node);
    }

    return $(found);
}
function numberfy(str: string): number {
    // возвращает либо число полученно из строки, либо БЕСКОНЕЧНОСТЬ, либо -1 если не получилось преобразовать.

    if (String(str) === 'Не огр.' ||
        String(str) === 'Unlim.' ||
        String(str) === 'Не обм.' ||
        String(str) === 'N’est pas limité' ||
        String(str) === 'No limitado' ||
        String(str) === '无限' ||
        String(str) === 'Nicht beschr.') {
        return Number.POSITIVE_INFINITY;
    } else {
        // если str будет undef null или что то страшное, то String() превратит в строку после чего парсинг даст NaN
        // не будет эксепшнов
        let n = parseFloat(cleanStr(String(str)));
        return isNaN(n) ? -1 : n;
    }
}
function numberfyOrError(str: string, minVal: number = 0, infinity: boolean = false) {
    let n = numberfy(str);
    if (!infinity && (n === Number.POSITIVE_INFINITY || n === Number.NEGATIVE_INFINITY))
        throw new RangeError("Получили бесконечность, что запрещено.");

    if (n <= minVal) // TODO: как то блять неудобно что мин граница не разрешается. удобнее было бы если б она была разрешена
        throw new RangeError("Число должно быть > " + minVal);

    return n;
}
function cleanStr(str: string): string {
    return str.replace(/[\s\$\%\©]/g, "");
}


$(document).ready(() => run());
