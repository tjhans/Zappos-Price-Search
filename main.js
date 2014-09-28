//This file contains the funtions for collecting a set of items that are close to a target price.
//note using 52ddafbe3ee659bad97fcce7c53592916a6bfd73 key as provided in email.
var items = [];
var sets = [];
function SearchReceive(data) {
    document.getElementById("status").innerHTML = "Collecting Results."
    console.log(data);
    var a, b;
    var price, quantity;
    price = document.getElementById("price").value
    price = price.replace(",", "");
    price = price.replace("$", "");
    quantity = parseInt(document.getElementById("quantity").value)
    price = parseFloat(price) / (quantity - 1);
    var bottomprice = data.results[data.results.length - 1].price;
    bottomprice = bottomprice.replace(",", "");
    bottomprice = bottomprice.replace("$", "");
    if (parseFloat(bottomprice) < price) {
        items = items.concat(data.results);
    }
    var page = (parseInt(data.currentPage) + 10).toString();
    a = parseInt(page);
    b = parseInt(data.pageCount);
    if (a <= b) {
        CallSearch(data.term, page);
    }
    else {
        BuildSets();
    }
}

function BuildSets() {
    sets = [];
    document.getElementById("status").innerHTML = "Generating Sets.";
    var set = [parseFloat("0")];
    var price, quantity;
    price = document.getElementById("price").value
    price = price.replace(",", "");
    price = price.replace("$", "");
    quantity = parseInt(document.getElementById("quantity").value)
    price = parseFloat(price);
    FindSets(0, 1, set, quantity, price);
    ShowSets();
}

function FindSets(resultindex, setslot, currentset, size, money) {
    //arguements passed:where we are in the results, where we are in the set, how big the set needs to get, money we have left
    var cost;
    if (resultindex >= items.length || sets.length > 10000)
        return;
    if (setslot > size) {
        sets[sets.length] = currentset;
        return;
    }
    //check if item[resultindex] fits
    cost = items[resultindex].price;
    cost = cost.replace(",", "");
    cost = cost.replace("$", "");
    if (cost < money) {
        //    if it does push it to currentset and call again with setslot+1 and money down
        var clone = currentset.slice(0);
        var next;
        clone[0] = clone[0] + parseFloat(cost);
        clone = clone.concat(items[resultindex]);
        next = 1 + resultindex;
        FindSets(next, setslot + 1, clone, size, money - cost);
    }
    //advance the index and call again until we hit the end
    FindSets(1 + resultindex, setslot, currentset, size, money);
}

function ShowSets() {
    var next;
    var currentdiv;
    var newhead;
    document.getElementById("status").innerHTML = "Showing Results.";
    if (sets.length == 0) {
        document.getElementById("set0").innerHTML = "<h1>No Sets Found</h1>"
        return;
    }
    sets = sets.sort(function (a, b) { return b[0] - a[0] });
    currentdiv = document.getElementById("set0");
    currentdiv.innerHTML = "";
    for (i = 1; i < 5; i++) {
    currentdiv.appendChild(document.createElement("hr"));
        next = i;
        pricehead = document.createElement("h2")
        pricehead.innerHTML = "This set costs $" + sets[next][0] + '.';
        currentdiv.appendChild(pricehead);
        for (j = 1; j < sets[0].length; j++) {
            setitem = document.createElement("a");
            setitem.href = sets[next][j].productUrl;
            setitem.innerHTML = sets[next][j].productName + " - " + sets[next][j].price;
            itempic = document.createElement("img");
            itempic.src = sets[next][j].thumbnailImageUrl;
            currentdiv.appendChild(setitem);
            currentdiv.appendChild(itempic);
            currentdiv.appendChild(document.createElement("br"));
        }
    }
}

function requestjsonp(info, action) {
    var script = document.createElement("script");
    script.setAttribute("src", info + "&callback=" + action);
    document.getElementsByTagName("head")[0].appendChild(script);
}

function StartSearch() {
    items = [];
    term = document.getElementById("term").value;
    page = document.getElementById("page").value;
    requestjsonp("http://api.zappos.com/Search/term/" + term + "?sort={\"price\":\"desc\"}&limit=100&includes=[\"productRating\",\"currentPage\",\"pageCount\"]&page=" + page + "&key=52ddafbe3ee659bad97fcce7c53592916a6bfd73", "SearchReceive");
}

function CallSearch(term, page) {
    requestjsonp("http://api.zappos.com/Search/term/" + term + "?sort={\"price\":\"desc\"}&limit=100&includes=[\"productRating\",\"currentPage\",\"pageCount\"]&page=" + page + "&key=52ddafbe3ee659bad97fcce7c53592916a6bfd73", "SearchReceive");
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}