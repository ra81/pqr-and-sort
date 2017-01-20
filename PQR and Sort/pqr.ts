// ==UserScript==
// @name           Virtonomica: PQR+sort
// @namespace      virtonomica
// @author         ra81
// @description    Цена за единицу качества + сортировка
// @include        http*://virtonomic*.*/*/window/unit/supply/create/*/step2
// @include        http*://virtonomic*.*/*/window/unit/equipment/*
// @include        http*://virtonomic*.*/*/main/globalreport/marketing/by_products/*
// @version        1.1
// ==/UserScript==

function run() {

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
    let rxSupply = new RegExp(/.*\/unit\/supply\/create\/\d+\/step2\/?$/gi);
    let rxEquip = new RegExp(/.*\/unit\/equipment\/\d+\/?$/gi);
    let rxProducts = new RegExp(/.*\/main\/globalreport\/marketing\/by_products\/\d+\/?/gi);

    if (rxSupply.test(path))
        workSupply();

    if (rxEquip.test(path))
        workEquipment();

    if (rxProducts.test(path))
        workProduct();


    function workProduct() {

        let $headers = $('.grid th');
        $headers.eq(4).after(
            `<th><div class="ordertool">
                <table class="ordercont"><tbody>
                    <tr>
	                    <td class="title-ordertool">PQR</td>
	                    <td class="arrows">
                            <a id="pqrasc" href="#"><img src="/img/asc.gif" alt="^" width="9" height="6" border="0"></a>
                            <a id="pqrdesc" href="#"><img src="/img/desc.gif" alt="v" width="9" height="6" border="0"></a>
                        </td>
                    </tr>
                </tbody></table>
            </div></th>`
        );


        let $rows = $('.grid').find('img[src="/img/supplier_add.gif"]').closest('tr');
        let order: { place: number, pqr: number }[] = [];

        $rows.each((i, e) => {
            let $this = $(e);

            let $price = $this.find("td:nth-child(5)");
            let $qual = $this.find("td:nth-child(4)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");

            let price = $price.map((i, e) => numberfy($(e).text())).get(0) as any as number;
            let qual = $qual.map((i, e) => numberfy($(e).text())).get(0) as any as number;
            let pqr = (price / qual);
            $price.after(`<td align="right" class="nowrap" id='pqr_${i}' style='color: blue'>${pqr.toFixed(2)}</td>`);

            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });

        $('#pqrasc').click(() => {
            sort_table('asc');
            return false;
        });
        $('#pqrdesc').click(() => {
            sort_table('desc');
            return false;
        });

        // сразу вызываю сортировку
        //$('#pqrasc').trigger('click');

        function sort_table(type: string) {
            if (type === "asc")
                order.sort((a, b) => {
                    if (a.pqr > b.pqr)
                        return 1;

                    if (a.pqr < b.pqr)
                        return -1;

                    return 0;
                });

            if (type === "desc")
                order.sort((a, b) => {
                    if (a.pqr > b.pqr)
                        return -1;

                    if (a.pqr < b.pqr)
                        return 1;

                    return 0;
                });

            let odd = false;
            for (let i = 0; i < order.length - 1; i++) {
                let $r0 = $rows.find(`#pqr_${order[i].place}`).closest('tr');
                let $r1 = $rows.find(`#pqr_${order[i + 1].place}`).closest('tr');

                $r0.after($r1);
                $r0.removeClass('even odd').addClass(odd ? 'odd' : 'even');
                odd = odd ? false : true;
            }
        }
    }

    function workEquipment() {

        let $headers = $('#mainTable th');
        $headers.eq(3).after(
            `<th rowspan="2">
             <div class="ordertool">
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
            </div>
            </th>`
            );


        let $rows = $('#mainTable').find('td.choose').closest('tr');
        let order: { place: number, pqr: number }[] = [];

        $rows.each((i, e) => {
            let $this = $(e);

            let $price = $this.find("td:nth-child(8)");
            let $qual = $this.find("td:nth-child(9)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");

            let price = $price.map((i, e) => numberfy($(e).text())).get(0) as any as number;
            let qual = $qual.map((i, e) => numberfy($(e).text())).get(0) as any as number;

            let pqr = (price / qual);
            $qual.after(`<td class='digits' id='pqr_${i}' style='color: blue'>${pqr.toFixed(2)}</td>`);

            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });

        $('#pqrasc').click(() => {
            sort_table('asc');
            return false;
        });
        $('#pqrdesc').click(() => {
            sort_table('desc');
            return false;
        });

        // сразу вызываю сортировку
        //$('#pqrasc').trigger('click');

        function sort_table(type: string) {
            if (type === "asc")
                order.sort((a, b) => {
                    if (a.pqr > b.pqr)
                        return 1;

                    if (a.pqr < b.pqr)
                        return -1;

                    return 0;
                });

            if (type === "desc")
                order.sort((a, b) => {
                    if (a.pqr > b.pqr)
                        return -1;

                    if (a.pqr < b.pqr)
                        return 1;

                    return 0;
                });

            let odd = false;
            for (let i = 0; i < order.length - 1; i++) {
                let $r0 = $rows.find(`#pqr_${order[i].place}`).closest('tr');
                let $r1 = $rows.find(`#pqr_${order[i + 1].place}`).closest('tr');

                $r0.after($r1);
                $r0.removeClass('even odd').addClass(odd ? 'odd' : 'even');
                odd = odd ? false : true;
            }
        }
    }

    function workSupply() {

        let $headers = $("#supply_content th");
        $headers.eq(4).after(`
                          <th>
                            <div class="field_title">PQR
                                <div class="asc" title="сортировка по возрастанию">
                                    <a id="pqrasc" href="#"><img src="/img/up_gr_sort.png"></a>
                                </div>
                                <div class="desc" title="сортировка по убыванию">
                                    <a id="pqrdesc" href="#"><img src="/img/down_gr_sort.png"></a>
                                </div>
                            </div>
                          </th>`);


        let $rows = $('#supply_content td.brandname_img').closest('tr');
        let order: { place: number, pqr: number }[] = [];

        $rows.each((i, e) => {
            let $this = $(e);

            let $price = $this.find("td:nth-child(6)");
            let $qual = $this.find("td:nth-child(7)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");

            let price = $price.map((i, e) => numberfy($(e).text())).get(0) as any as number;
            let qual = $qual.map((i, e) => numberfy($(e).text())).get(0) as any as number;

            let pqr = (price / qual);
            $qual.after(`<td class='supply_data' id='pqr_${i}' style='color: blue'>${pqr.toFixed(2)}</td>`);

            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });

        $('#pqrasc').click(() => {
            sort_table('asc');
            return false;
        });
        $('#pqrdesc').click(() => {
            sort_table('desc');
            return false;
        });

        // сразу вызываю сортировку
        //$('#pqrasc').trigger('click');

        function sort_table(type: string) {
            if (type === "asc")
                order.sort((a, b) => {
                    if (a.pqr > b.pqr)
                        return 1;

                    if (a.pqr < b.pqr)
                        return -1;

                    return 0;
                });

            if (type === "desc")
                order.sort((a, b) => {
                    if (a.pqr > b.pqr)
                        return -1;

                    if (a.pqr < b.pqr)
                        return 1;

                    return 0;
                });

            for (let i = 0; i < order.length - 1; i++) {
                // если есть заказ, то после строки будет еще аппендикс. его тож надо сортирнуть
                let $r0 = $rows.find(`#pqr_${order[i].place}`).closest('tr');
                let $append0 = $r0.next('tr.ordered');

                let $r1 = $rows.find(`#pqr_${order[i + 1].place}`).closest('tr');
                let $append1 = $r1.next('tr.ordered');

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
};

function getRealm(): string | null {
    // https://*virtonomic*.*/*/main/globalreport/marketing/by_trade_at_cities/*
    // https://*virtonomic*.*/*/window/globalreport/marketing/by_trade_at_cities/*
    let rx = new RegExp(/https:\/\/virtonomic[A-Za-z]+\.[a-zA-Z]+\/([a-zA-Z]+)\/.+/ig);
    let m = rx.exec(document.location.href);
    if (m == null)
        return null;

    return m[1];
}

/**
 * Оцифровывает строку. Возвращает всегда либо Number.POSITIVE_INFINITY либо 0
 * @param variable любая строка.
 */
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
        let n = parseFloat(String(str).replace(/[\s\$\%\©]/g, ""));
        return isNaN(n) ? -1 : n;
    }
}
$(document).ready(() => run());
