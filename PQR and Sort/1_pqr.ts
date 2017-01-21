/// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />

enum Sort { none, asc, desc };

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

        let $pqr = $(`     <div id="pqr" class="field_title" style="cursor: pointer;">PQR
                                <div class="asc" title="сортировка по возрастанию">
                                    <a id="pqrasc" href="#"><img src="/img/up_gr_sort.png"></a>
                                </div>
                                <div class="desc" title="сортировка по убыванию">
                                    <a id="pqrdesc" href="#"><img src="/img/down_gr_sort.png"></a>
                                </div>
                            </div>
                            <span id="sort" class="subvalue">none</span>`);

        let $headers = $("#supply_content th");
        $headers.eq(4).after($pqr.wrapAll("<th></th>").closest("th"));  // завернем в хедер.

        let $rows = $("tr[id^=r]"); // все поставщики имеют id=r4534534 
        let order: { place: number, pqr: number }[] = [];

        $rows.each((i, e) => {
            let $this = $(e);

            let $price = $this.find("td:nth-child(6)");
            let $qual = $this.find("td:nth-child(7)");
            if ($price.length !== $qual.length || $price.length !== 1 || $qual.length !== 1)
                alert("Ошибка поиска цены и качества товара в pqr скрипте. Отключите его или исправьте.");

            // в принципе такое может быть что кача нет вообще для пустых складов. Поэтому надо учитывать
            let price = numberfyOrError($price.eq(0).text(), -2);
            let qual = numberfyOrError($qual.eq(0).text(), -2);

            let pqr = (price <= 0 || qual <= 0) ? 0 : (price / qual);
            $qual.after(buildHtmlTD(i, pqr));

            order[i] = { place: i, pqr: pqr };
            //txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
        });

        $pqr.on("click", (event) => {
            // если кликали на картинку то нам надо взять родительский <a> тег чтобы взять id
            let $el = $(event.target);
            if ($el.is("img"))
                $el = $el.parent(); //

            let type = Sort.none;

            // определим какой тим сортировки надо делать
            if ($el.is("#pqrasc"))       type = Sort.asc;
            else if ($el.is("#pqrdesc")) type = Sort.desc;
            else {
                // если кликали не на стрелки, тада посмотрим какой щас тип сортировки
                if ($pqr.hasClass("asc"))       type = Sort.desc;
                else if ($pqr.hasClass("desc")) type = Sort.none;
                else                            type = Sort.asc;
            }

            // выполним действия
            let $span = $("#sort");
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

        function sort_table(type: Sort) {

            switch (type) {
                case Sort.asc:
                    order.sort((a, b) => {
                        if (a.pqr > b.pqr)
                            return 1;

                        if (a.pqr < b.pqr)
                            return -1;

                        return 0;
                    });
                    break;

                case Sort.desc:
                    order.sort((a, b) => {
                        if (a.pqr > b.pqr)
                            return -1;

                        if (a.pqr < b.pqr)
                            return 1;

                        return 0;
                    });
                    break;

                case Sort.none:
                    order.sort((a, b) => {
                        if (a.place > b.place)
                            return 1;

                        if (a.place < b.place)
                            return -1;

                        return 0;
                    });
            }

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

    function buildHtmlTD(i: number, pqr: number): string {
        return `<td id='pqr_${i}' class='pqr_data' style='color: blue; width: 70px; text-align: right;'>${pqr.toFixed(2)}</td>`;
    }
};

$(document).ready(() => run());
