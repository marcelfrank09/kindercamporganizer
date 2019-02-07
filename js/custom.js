$('document').ready(function () {

    var $groupselect = $("#groupselect");
    var $addButton = $("#btnAdd");
    var $saveButton = $("#btnSave");
    var $editButton = $("#btnEdit");
    var $importButton = $("#btnImport");
    var $placeHereButton = $(".btnPlaceHere");
    var groupSelectIndex = 0;

    function init() {
        $groupselect.on("change", function (e) {
            groupSelectIndex = e.target.selectedIndex;
        });

        $("#search").keyup(function (e) {
            setTimeout(function () {
                for (var i = 1; i < 7; i++) {
                    var $inputs = $("#tb-group" + i).find("input");
                    if ($inputs) {
                        $inputs.each(function (i, input) {
                            var $input = $(input);
                            if (document.getElementById("search").value) {
                                if (!$input[0].value.includes(document.getElementById("search").value)) {
                                    $input.parent().hide();
                                } else {
                                    $input.parent().show();
                                }
                            } else {
                                $input.parent().show();
                            }
                        });
                    }
                }
            }, 500);
        });

        $addButton.on("click", addNewChild);
        $saveButton.on("click", saveCsvFile);
        $editButton.on("click", edit);
        $importButton.on("click", loadCsvFile);
        $placeHereButton.on("click", changeGroup);
    }

    function saveCsvFile() {
        var rows = [["Present", "Name", "Datum", "Group"]];
        var group = 1;
        $(".childs").each(function (i, e) {
            if ($(e)[0].children.length > 0) {
                $($(e)[0].children).each(function (i, e) {
                    var present = $(e).find(".inputGroupElements")[0].children[0];
                    var name = $(e).find(".inputGroupElements")[0].children[1];
                    var date = $(e).find(".inputGroupElements")[0].children[2];
                    if ($(present).find(".btn-dark").length > 0) {
                        present = false;
                    } else {
                        present = true;
                    }
                    var data = [present, name.value, date.value, "Gruppe " + group];
                    rows.push(data);
                })
            }
            group++;
        })


        var csvContent = "data:text/csv;charset=utf-8,";
        rows.forEach(function (rowArray) {
            var row = rowArray.join(",");
            csvContent += row + "\r\n";
        });

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "export_data.csv");
        document.body.appendChild(link); // Required for FF

        link.click();
    }

    function loadCsvFile() {
        $.ajax({
            type: "GET",
            url: "../data/import_data.csv",
            dataType: "text",
            success: function (data) {
                processCsvData(data);
            },
            error: function () {
                alert('error!');
            }
        });
    }

    function processCsvData(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [];

        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {

                var tarr = [];
                for (var j = 0; j < headers.length; j++) {
                    tarr.push(headers[j] + ":" + data[j]);
                }
                lines.push(tarr);
            }
        }
        $(lines).each(function (i, e) {
            var present = false;
            var name = "";
            var date = "";
            var group = "Gruppe 1";
            if (e.length > 4) {
                name = e[3].split(":")[1] + " " + e[4].split(":")[1];
                date = e[5].split(":")[1];
            } else {
                present = e[0].split(":")[1];
                name = e[1].split(":")[1];
                date = e[2].split(":")[1];
                group = e[3].split(":")[1];
            }

            addNewChild(e, name, date, group, present);
        })
    }

    function edit() {
        var readOnlyElements = getAllElementsWithAttribute("editableelement");
        if (readOnlyElements.length > 0) {
            if (readOnlyElements[0].getAttribute("readonly") != null) {
                $(readOnlyElements).each(function (i, e) {
                    e.removeAttribute("readonly");
                    $(".removeButton").show();
                    $(".changeButton").show();
                })
            } else {
                $(readOnlyElements).each(function (i, e) {
                    e.setAttribute("readonly", true);
                    $(".removeButton").hide();
                    $(".changeButton").hide();
                })
            }
        }
    }

    function changeGroup(e) {
        var tbody = $(e.currentTarget).parent().parent().find("tbody")[0];
        var trElement = $($(".inputGroupElements.choosed")[0]).parent().parent();
        var newId = trElement[0].getAttribute("id");
        newId = newId.replace(/.$/,tbody.getAttribute("id").charAt(tbody.getAttribute("id").length-1));
        trElement[0].setAttribute("id", newId);
        console.log(trElement[0].getAttribute("id"));
        tbody.appendChild(trElement[0]);
        $(".tabletoolbar").hide();
        $(".inputGroupElements.choosed").removeClass("choosed");
    }

    function createTableRow(id, name, date, present) {
        var trElement = document.createElement("tr");
        trElement.setAttribute("id", id);
        var tdElement = document.createElement("td");
        var inputGroupElement = document.createElement("div");
        inputGroupElement.classList.add("input-group");
        inputGroupElement.classList.add("mb-3");
        inputGroupElement.classList.add("inputGroupElements");
        var inputGroupPrependElement = document.createElement("div");
        inputGroupPrependElement.classList.add("input-group-prepend");
        var btnPresentElement = document.createElement("button");
        btnPresentElement.classList.add("btn");
        btnPresentElement.classList.add("btn-dark");
        btnPresentElement.setAttribute("id", "btnPresent");
        btnPresentElement.setAttribute("style", "width: 50px");
        $(btnPresentElement).on("click", function (e) {
            if (btnPresentElement.classList.contains("btn-dark")) {
                btnPresentElement.classList.remove("btn-dark");
                btnPresentElement.classList.add("btn-success");
            } else {
                btnPresentElement.classList.add("btn-dark");
                btnPresentElement.classList.remove("btn-success");
            }
        });
        var iconPresentElement = document.createElement("i");
        iconPresentElement.classList.add("fas");
        iconPresentElement.classList.add("fa-check");


        var inputGroupAppendElement = document.createElement("div");
        inputGroupAppendElement.classList.add("input-group-append");
        inputGroupAppendElement.classList.add("removeButton");
        inputGroupAppendElement.setAttribute("style", "display: none;");
        var btnRemoveElement = document.createElement("button");
        btnRemoveElement.classList.add("btn");
        btnRemoveElement.classList.add(present ? "btn-success" : "btn-dark");
        btnRemoveElement.setAttribute("id", "btnPresent");
        btnRemoveElement.setAttribute("style", "width: 50px");
        $(btnRemoveElement).on("click", function (e) {
            trElement.remove();
        });
        var iconRemoveElement = document.createElement("i");
        iconRemoveElement.classList.add("fas");
        iconRemoveElement.classList.add("fa-user-minus");


        var inputGroupAppendElement2 = document.createElement("div");
        inputGroupAppendElement2.classList.add("input-group-append");
        inputGroupAppendElement2.classList.add("changeButton");
        inputGroupAppendElement2.setAttribute("style", "display: none;");
        var btnChangeElement = document.createElement("button");
        btnChangeElement.classList.add("btn");
        btnChangeElement.classList.add(present ? "btn-success" : "btn-dark");
        btnChangeElement.setAttribute("id", "btnPresent");
        btnChangeElement.setAttribute("style", "width: 50px");
        $(btnChangeElement).on("click", function (e) {
            var $clickedInputGroup = $($(e.currentTarget).parent().parent())[0];
            var otherChild = $clickedInputGroup.classList.contains("choosed");
            if ($(".tabletoolbar").is(":visible")) {
                $(".tabletoolbar").hide();
                $(".inputGroupElements").removeClass("choosed");
            }
            if (!otherChild) {
                $(".tabletoolbar").show();
                inputGroupElement.classList.add("choosed");
            }
        });
        var iconChangeElement = document.createElement("i");
        iconChangeElement.classList.add("fas");
        iconChangeElement.classList.add("fa-exchange-alt");


        var inputNameElement = document.createElement("input");
        inputNameElement.classList.add("form-control");
        inputNameElement.setAttribute("type", "text");
        inputNameElement.setAttribute("value", name);
        inputNameElement.setAttribute("readonly", "true");
        inputNameElement.setAttribute("editableelement", "true");


        var inputDateElement = document.createElement("input");
        inputDateElement.classList.add("form-control");
        inputDateElement.setAttribute("type", "date");
        inputDateElement.setAttribute("value", date);
        inputDateElement.setAttribute("readonly", "true");
        inputDateElement.setAttribute("editableelement", "true");

        inputGroupPrependElement.appendChild(btnPresentElement);
        btnPresentElement.appendChild(iconPresentElement);
        inputGroupAppendElement.appendChild(btnRemoveElement);
        inputGroupAppendElement2.appendChild(btnChangeElement);
        btnRemoveElement.appendChild(iconRemoveElement);
        btnChangeElement.appendChild(iconChangeElement);
        inputGroupElement.appendChild(inputGroupPrependElement);
        inputGroupElement.appendChild(inputNameElement);
        inputGroupElement.appendChild(inputDateElement);
        inputGroupElement.appendChild(inputGroupAppendElement);
        inputGroupElement.appendChild(inputGroupAppendElement2);

        tdElement.appendChild(inputGroupElement);
        trElement.appendChild(tdElement);
        return trElement;
    }

    function addNewChild(e, name, date, group, present) {
        var name = name !== undefined ? name : document.getElementById("newChildName").value;
        var date = date !== undefined ? date : document.getElementById("newChildDate").value;
        var group = group ? group : $("#groupselect")[0][groupSelectIndex].text;
        console.log(present ? present : false);
        var present = present ? present : false;

        if (!name || !group | !date) {
            console.log("Name, Date and Group should not be empty!");
            return;
        }

        var trId = name.trim().replace(new RegExp(" ", 'g'), "-") + group.trim().replace(new RegExp(" ", 'g'), "-");
        var element = createTableRow(trId, name, date, present);

        if (document.getElementById(trId)) {
            window.alert("The child is already present!");
        } else {
            document.getElementById("tb-group" + (groupSelectIndex + 1)).appendChild(element);
            document.getElementById("newChildName").value = "";
        }

    }

    function getAllElementsWithAttribute(attribute) {
        var matchingElements = [];
        var allElements = document.getElementsByTagName('*');
        for (var i = 0, n = allElements.length; i < n; i++) {
            if (allElements[i].getAttribute(attribute) !== null) {
                // Element exists with attribute. Add to array.
                matchingElements.push(allElements[i]);
            }
        }
        return matchingElements;
    }

    init();
});

