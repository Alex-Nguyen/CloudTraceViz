const margin = {top: 10, right: 10, bottom: 30, left: 40},
    width = 200 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;
let xScale = d3.scale.linear().range([0, width]), // value -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(4);

// setup y
let yScale = d3.scale.linear().range([height, 0]), // value -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(4);


var parcoords = d3.parcoords()("#parcoor")
    .alpha(0.4)
    .mode("queue") // progressive rendering
    .height(360)
    .margin({
        top: 36,
        left: 0,
        right: 0,
        bottom: 16
    });

function drawScatterPlot(_data) {
    const excludeFields = ["id", "machineId", "timestamp", "outlier"];
    const _plotData = {};
    for (let [index, element] of _data.entries()) {
        for (let key in element) {
            if (!excludeFields.includes(key)) {
                if (!_plotData.hasOwnProperty(key)) {
                    _plotData[key] = [];
                    _plotData[key].push(element[key])
                } else {
                    _plotData[key].push(element[key])
                }

            }
        }
    }
    for (let k = 0; k < Object.keys(_plotData).length - 1; k++) {
        for (let k2 = k + 1; k2 < Object.keys(_plotData).length; k2++) {
            //Start generating scatter plots
            xScale.domain([d3.min(_plotData[Object.keys(_plotData)[k2]]), d3.max(_plotData[Object.keys(_plotData)[k2]])]);
            yScale.domain([d3.min(_plotData[Object.keys(_plotData)[k]]), d3.max(_plotData[Object.keys(_plotData)[k]])]);
            let svg = d3.select("#scatterplot").append("svg")
                .attr("id", () => {
                    return Object.keys(_plotData)[k] + Object.keys(_plotData)[k2]
                })
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label-warning")
                .attr("x", width / 2 - 10)
                .attr("y", 28)
                .style("text-anchor", "center")
                .text(Object.keys(_plotData)[k2]);

            // y-axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("class", "label-warning")
                .attr("transform", "rotate(-90)")
                .attr("y", -35)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(Object.keys(_plotData)[k]);

            svg.selectAll(".dot")
                .data(_data)
                .enter().append("circle")
                .attr("class", "dot")
                .style("fill", function (d) {
                    if (d.outlier === 2) {
                        return "red"
                    } else if (d.outlier === 1) {
                        return "blue"
                    } else {
                        return "rgba(0,0,0,0.1)"
                    }
                })
                .attr("r", 2)
                .attr("cx", function (d) {
                    return xScale(d[Object.keys(_plotData)[k2]]);
                })
                .attr("cy", function (d) {
                    return yScale(d[Object.keys(_plotData)[k]]);
                })


        }
    }
}

// create chart from loaded data
function parallelCoordinates(data) {
    data.forEach(function (d, i) {
        d.id = d.id || i;
    });
    const scagData = [];
    data.forEach((d, i) => {
        let point = [];
        point.push(d.utilCPU);
        point.push(d.utilMemory);
        point.push(d.UtilDisk);
        point.push(d.load1);
        point.push(d.load5);
        point.push(d.load15);
        point.data = i;
        scagData.push(point)
    });
    let options = {
        startBinGridSize: 5,
        minBins: 30,
        maxBins: 100,
        incrementA: 1,
        incrementB: 5,
        decrementA: 0.97,
        decrementB: 0,
        outlyingCoefficient: 1.5,
        distanceWeights: [1, 1, 1, 0.5, 0.5, 0.5]
    };
    let scag = scagnosticsnd(scagData, options);
    const outlier = [];
    const warning = [];
    scag.outlyingBins.forEach((bin, i) => {
        if (bin.length > 1) {
            bin.forEach(point => {
                outlier.push(point.data)
            })
        } else {
            bin.forEach(point => {
                warning.push(point.data)
            })
        }
    });
    let process_data = data.map((_d, i) => {
        if (outlier.indexOf(i) >= 0) {
            _d.outlier = 2;//Outlier
        } else if (warning.indexOf(i) >= 0) {
            _d.outlier = 1;//Warning
        } else {
            _d.outlier = 0;//Normal
        }
        return _d;
    });
    process_data.sort((a, b) => {
        return a.outlier - b.outlier;
    });

    drawScatterPlot(process_data);
    parcoords
        .data(process_data)
        .bundlingStrength(0.1) // set bundling strength
        .smoothness(0.1)
        // .bundleDimension("machineId")
        .showControlPoints(false)
        .hideAxis(["id","timestamp","machineId", "outlier","hour"])
        .render()
        .reorderable()
        .brushMode("1D-axes");

    parcoords.color(function (d) {
        if (d.outlier === 2) {
            return "rgba(255,0,0,1)"
        } else if (d.outlier === 1) {
            return "blue"
        } else {
            return "rgba(0,0,0,0.1)"
        }
    });

    // smoothness
    d3.select("#smoothness").on("change", function () {
        parcoords.smoothness(this.value).render();
    });

    // bundling strength slider
    d3.select("#bundling").on("change", function () {
        parcoords.bundlingStrength(this.value).render();
    });

    parcoords.on("brush", function (d) {
      //  updateTable(d)
    });
    createTable(data);

    function updateTable(_data) {
        d3.select('#mulTable>tbody').selectAll("tr").remove();

    }

    function createTable(_data) {
        $('#grid').innerHTML = null;
        // setting up grid
        let isHead = true;
        let table = document.createElement('table');
        table.id = 'mulTable'
        table.className = 'table table-striped table-hover dataTable';
        table.setAttribute('role', 'grid')
        let tblHead = document.createElement('thead');
        let tblBody = document.createElement('tbody');
        let tblHeadR = document.createElement('tr');
        tblHeadR.setAttribute('role', 'row')

        // iterate through data
        for (let [index, element] of _data.entries()) {
            if (index === 100) break;
            if (isHead) {
                for (let key in element) {
                    // grasp the key
                    let th = document.createElement('th');
                    th.innerHTML = key;
                    tblHeadR.appendChild(th);
                }
                isHead = false;
            }
            let trow = document.createElement('tr');
            for (let key in element) {
                // grasp the key
                let td = document.createElement('td');
                if (key === 'timestamp') {
                    td.innerHTML = element[key].toLocaleTimeString();
                } else {
                    td.innerHTML = element[key];

                }
                trow.appendChild(td);

            }
            trow.addEventListener('mouseover', function () {
                parcoords.highlight([data[index]])
            })
            trow.addEventListener('mouseleave', function () {
                parcoords.unhighlight();
            })
            tblBody.appendChild(trow);
        }
        ;
        tblHead.appendChild(tblHeadR);
        table.appendChild(tblHead);
        table.appendChild(tblBody);

        $('#grid').append(table);

    }

    $('#mulTable').DataTable({
        'paging': true,
        'lengthChange': true,
        'searching': false,
        'ordering': true,
        'info': true,
        'autoWidth': false
    });


};

// CSV Uploader
var uploader = document.getElementById("uploader");
var reader = new FileReader();
reader.onload = function (e) {
    let contents = e.target.result;
    let data = d3.csv.parse(contents);
    data = data.map(d => {
        d.utilCPU = parseFloat(d.utilCPU);
        d.utilMemory = parseFloat(d.utilMemory);
        d.UtilDisk = parseFloat(d.UtilDisk);
        d.load1 = parseFloat(d.load1);
        d.load5 = parseFloat(d.load5);
        d.load15 = parseFloat(d.load15);
        d.timestamp = new Date(d.timestamp * 1000);
        d.hour = d.timestamp.getHours();

        return d;
    });
    let sorted_data = data.sort((a, b) => {
        return a.timestamp - b.timestamp;
    });
    const l = sorted_data.length;
    let second_data = sorted_data.slice(l - 1000, l);
    parallelCoordinates(second_data);

    // remove button, since re-initializing doesn't work for now
    // uploader.parentNode.removeChild(uploader);
};

uploader.addEventListener("change", handleFiles, false);

function handleFiles() {
    var file = this.files[0];
    reader.readAsText(file);
};

