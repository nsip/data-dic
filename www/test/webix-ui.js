webix.ui({
    rows: [
        {
            view: "template",
            type: "header",
            template: "Data Dictionary"
        },
        {
            view: "form", elements: [
                { view: "text", label: "Looking for:", name: "name", placeholder: "Type here.." },
                { view: "combo", label: "Movie", name: "movie", options: ["a", "b"] },
                { view: "datepicker", label: "Date", name: "date", value: new Date(), stringResult: true },
                { view: "counter", label: "Seats", name: "seats", value: 1, min: 1 },
                {
                    margin: 20, cols: [
                        {},
                        { view: "button", value: "Cancel", width: 200 },
                        {
                            view: "button", type: "form", value: "Book Now", width: 200, align: "right", click: function () {
                                var values = this.getFormView().getValues();
                                webix.message(JSON.stringify(values));
                            }
                        }
                    ]
                }
            ]
        }
    ]
});