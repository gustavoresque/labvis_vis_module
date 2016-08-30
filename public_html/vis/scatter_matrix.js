/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var currentView = {
    draw: function (metadata, data) {
        var self = this;
        var parent = $("#content");



        var h = parent.height();
        var w = parent.width();

        var allclasses = metadata.splice(metadata.indexOf("class"), 1)[0].classes;


        var color = d3.scale.category20();

        var work_size = h > w ? w : h;

        console.log(work_size);
        var cell_size = (work_size / metadata.length);
        console.log(metadata.length);
        console.log("cell_size: " + cell_size);
        var left_align = 0;//(w / 2) - (work_size / 2);
        var top_align = 0;//(h / 2) - (work_size / 2);

        var canvas = d3.select("#content").append("svg")
                .attr("width", work_size)
                .attr("height", work_size)
                .style("margin-left", left_align)
                .style("margin-top", top_align)
                .append("g")
                .attr("transform", "translate(0,0) scale(1)");



        console.log(work_size, canvas);

        var xinit = 0, yinit = 0, tx, ty, sca, lasttx, lastty;

        canvas.call(d3.behavior.zoom()
                .scaleExtent([1, 100])
                .on("zoom", function () {

                    console.log(d3.event);

                    if (d3.event.sourceEvent.type === "mousemove") {

                        d3.event.translate[0] = tx + (d3.event.sourceEvent.x - xinit);
                        d3.event.translate[1] = ty + (d3.event.sourceEvent.y - yinit);
                        lasttx = d3.event.translate[0];
                        lastty = d3.event.translate[1];
                    } else if (d3.event.sourceEvent.type === "touchmove") {
//                        d3.event.preventDefault();
                        d3.event.translate[0] = tx + (d3.event.sourceEvent.touches[0].screenX - xinit);
                        d3.event.translate[1] = ty + (d3.event.sourceEvent.touches[0].screenY - yinit);
                        lasttx = d3.event.translate[0];
                        lastty = d3.event.translate[1];
                    } else if (d3.event.sourceEvent.type === "wheel") {
                        var scalechange = d3.event.scale - sca;
                        console.log(lasttx, lastty);
                        if (lasttx) {
                            d3.event.translate[0] = lasttx - ((d3.event.sourceEvent.x - left_align) * scalechange);
//                        console.log(d3.event.translate[0], d3.event.sourceEvent.x, d3.event.sourceEvent.y);
                            d3.event.translate[1] = lastty - ((d3.event.sourceEvent.y - top_align) * scalechange);
                        }

                        console.log(d3.event.translate[0], d3.event.translate[1]);
                    }

                    d3.event.translate[0] = Math.max(Math.min(d3.event.translate[0], 0), work_size - (work_size * d3.event.scale));
                    d3.event.translate[1] = Math.max(Math.min(d3.event.translate[1], 0), work_size - (work_size * d3.event.scale));
                    canvas.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");

//                    console.log((-1/d3.event.scale)*d3.event.translate[0], (-1/d3.event.scale)*d3.event.translate[1],(1/d3.event.scale)*work_size);
                    self.semanticZoom((-1 / d3.event.scale) * d3.event.translate[0],
                            (-1 / d3.event.scale) * d3.event.translate[1],
                            (1 / d3.event.scale) * work_size, {
                        allclasses: allclasses,
                        metadata: metadata,
                        data: data,
                        color: color,
                        colw: cell_size - 2
                    });
                })
                .on("zoomstart", function () {
                    if (d3.event.sourceEvent.type === "mousedown" || d3.event.sourceEvent.type === "touchstart") {
                        xinit = d3.event.sourceEvent.x || d3.event.sourceEvent.touches[0].screenX;
                        yinit = d3.event.sourceEvent.y || d3.event.sourceEvent.touches[0].screenY;
                        var str = canvas.attr("transform").slice(10);
                        tx = +str.slice(0, str.indexOf(","));
                        ty = +str.slice(str.indexOf(",") + 1, str.indexOf(")"));

                    } else if (d3.event.sourceEvent.type === "wheel") {
                        var str = canvas.attr("transform").slice(10);
                        sca = +str.slice(str.lastIndexOf("(") + 1, str.lastIndexOf(")"));
                    }
                })
                .on("zoomend", function () {
                    if (d3.event.sourceEvent) {
                        if (d3.event.sourceEvent.type === "mouseup" || d3.event.sourceEvent.type === "touchend") {
                            console.log("foi");
                            tx = d3.event.translate[0];
                            ty = d3.event.translate[1];
                            console.log("end: " + tx + " " + ty);
                        }
                    }
                }
                ));

        canvas.append("rect").attr("x", 0)
                .attr("y", 0)
                .attr("width", w)
                .attr("height", h)
                .style("fill", "white");

        for (var i = 0; i < metadata.length; i++) {
            for (var j = 0; j < metadata.length; j++) {
                canvas.append("g")
                        .attr("id", "cell_" + metadata[i].name + "_" + i + "_" + j)
                        .attr("transform", "translate(" + (cell_size * i) + "," + (cell_size * j) + ")");
            }
        }

        for (var i = 0; i < metadata.length; i++) {
            var colh = cell_size - 2;
            var colw = cell_size - 2;

            metadata[i].scale = d3.scale.linear()
                    .domain([metadata[i].min, metadata[i].max])
                    .range([0, colw]);

            var hist = self.makeClassifiedHist(data, metadata[i].name, 10);
            //var maxHist = Math.max.apply(null,hist);
            var binsize = colw / 10;

            var svg = d3.select("#cell_" + metadata[i].name + "_" + i + "_" + i);

            svg.append("rect").attr("x", 0)
                    .attr("y", 0)
                    .attr("width", colw)
                    .attr("height", colh)
                    .attr("fill", "none")
                    .style("stroke", "gray")
                    .style("stroke-width", 5 / metadata.length);

            svg.selectAll("g")
                    .data(hist)
                    .enter()
                    .append("g")
                    .attr("transform", function (v, j) {
                        return "translate(" + (j * binsize) + "," + ((1 - v.total_count) * colh) + ")";
                    })
                    .selectAll("rect")
                    .data(function (v) {
                        return v.classes;
                    })
                    .enter()
                    .append("rect")
                    .attr("width", binsize)
                    .attr("height", function (v, j) {
                        return v.value * colh;
                    })
                    .attr("y", function (v, j) {
                        return v.prev_sum * colh;
                    })
                    .style("fill", function (v) {
                        return color(v.class_name);
                    });
        }

        //self.drawCirclesOverview(svg, allclasses, metadata[0], metadata[1], data, colw, color, metadata.length);
        //console.log(colh, colw);
        for (var i = 0; i < metadata.length; i++) {
            for (var j = 0; j < metadata.length; j++) {
                if (i === j)
                    continue;

                if (i > j) {
                    var svg = d3.select("#cell_" + metadata[j].name + "_" + j + "_" + i);
                    self.drawCirclesOverview(svg, allclasses, metadata[i], metadata[j], data, colw, color, metadata.length, 5);
//                    self.drawCircles(svg, metadata[i], metadata[j], data, colw, color, metadata.length);
                } else {
                    var svg = d3.select("#cell_" + metadata[j].name + "_" + j + "_" + i);
                    self.drawLinesOverview(svg, allclasses, metadata[i], metadata[j], data, colw, color, metadata.length);
//                    self.drawLines(svg, metadata[i], metadata[j], data, colw, color, metadata.length);
                    
                }

            }
        }

    },
    sliceByAttr: function (arr, attr) {
        var outArr = [];
        for (var i = 0; i < arr.length; i++) {
            outArr.push(arr[i][attr]);
        }
        return outArr;
    },
    sliceByAttrByClass: function (arr, attr, classname) {
        var outArr = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].class === classname) {
                outArr.push(arr[i][attr]);
            }
        }
        return outArr;
    },
    filterCollumn: function (arr, collumnName) {
        var outArr = [];
        for (var i = 0; i < arr.length; i++) {
            var instance = {};
            for (var prop in arr[i]) {
                if (arr[i].hasOwnProperty(prop) && prop !== collumnName) {
                    instance[prop] = arr[i][prop];
                }
                outArr.push(instance);
            }
        }
        return outArr;
    },
    makeHist: function (arr, num_bins) {
        var max = Math.max.apply(null, arr);
        var min = Math.min.apply(null, arr);
        var step = (max - min) / num_bins;
        var hist = [];
        for (var i = 0; i < num_bins; i++) {
            hist.push(0);
        }
        for (var i = 0; i < arr.length; i++) {
            hist[Math.round(arr[i] / step)]++;
        }
        for (var i = 0; i < hist.length; i++) {
            hist[i] /= arr.length;
        }
        return hist;
    },
    makeClassifiedHist: function (data, attr, num_bins) {
        var self = this;
        var max = Math.max.apply(null, self.sliceByAttr(data, attr));
        var min = Math.min.apply(null, self.sliceByAttr(data, attr));
        var step = (max - min) / (num_bins - 1);
        var hist = [], sum = 0;
        for (var i = 0; i < num_bins; i++) {
            hist.push({total_count: 0});
        }
        for (var i = 0; i < data.length; i++) {
            var j = Math.floor((data[i][attr] - min) / step);
//            console.log(data[i][attr], step, j);
            hist[j].total_count++;
            if (hist[j][data[i].class]) {
                hist[j][data[i].class]++;
            } else {
                hist[j][data[i].class] = 1;
            }
        }
        for (var i = 0; i < hist.length; i++) {
            hist[i].total_count /= data.length;
            hist[i].classes = [];
            var prev_sum = 0;
            for (var c in hist[i]) {
                if (hist[i].hasOwnProperty(c) && c !== "total_count" && c !== "classes") {
                    hist[i].classes.push({class_name: c, value: hist[i][c] / data.length, prev_sum: prev_sum});
                    prev_sum += hist[i][c] / data.length;
                    delete hist[i][c];
                }
            }
        }

        return hist;
    },
    drawCircles: function (component, metadatai, metadataj, data, size, color, count) {
        component.append("rect").attr("x", 0)
                .attr("y", 0)
                .attr("width", size)
                .attr("height", size)
                .attr("fill", "none")
                .style("stroke", "gray")
                .style("stroke-width", 5 / count);

        component.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (v) {
                    return metadataj.scale(v[metadataj.name]);
                })
                .attr("cy", function (v) {
                    return metadatai.scale(v[metadatai.name]);
                })
                .attr("r", 6 / count)
                .style("fill", function (v) {
                    return color(v.class);
                })
                .style("fill-opacity", 0.2)
                .style("stroke", function (v) {
                    return color(v.class);
                })
                .style("stroke-opacity", 0.9)
                .style("stroke-width", 2 / count);
    },
    drawCirclesOverview: function (component, allClasses, metadatai, metadataj, data, size, color, count, details) {
        var self = this;
        component.append("rect").attr("x", 0)
                .attr("y", 0)
                .attr("width", size)
                .attr("height", size)
                .attr("fill", "none")
                .style("stroke", "gray")
                .style("stroke-width", 5 / count);

//        var details = 5;

        var step = (size + 1) / details;
        var resumedData = [];
        for (var i = 0; i < details; i++) {
            resumedData.push([]);
            for (var j = 0; j < details; j++) {
                resumedData[i].push({});
            }
        }

        var countClass = {};
        for (var i = 0; i < data.length; i++) {
            var pos = resumedData[Math.floor(metadataj.scale(data[i][metadataj.name]) / step)]
                    [Math.floor(metadatai.scale(data[i][metadatai.name]) / step)];
            if (pos[data[i].class]) {
                pos[data[i].class]++;
                countClass[data[i].class]++;
            } else {
                pos[data[i].class] = 1;
                if (countClass[data[i].class])
                    countClass[data[i].class]++;
                else
                    countClass[data[i].class] = 1;
            }
        }
        //        console.log(resumedData);
//        console.log(countClass);
        var newdata = [];
        //        console.log(color(data[0].class));
        for (var i = 0; i < details; i++) {
            for (var j = 0; j < details; j++) {
                var maxClass = "", maxCount = -1;
                for (var k in resumedData[i][j]) {
                    if (resumedData[i][j].hasOwnProperty(k)) {
                        if (resumedData[i][j][k] > maxCount) {
                            maxClass = k;
                            maxCount = resumedData[i][j][k];
                        }
                    }
                }
                if (maxClass !== "")
                    newdata.push({class: maxClass, x: i, y: j, weight: maxCount / countClass[maxClass]});
//                resumedData[i].push({});
            }
        }


        component.selectAll("rect")
                .data(newdata)
                .enter()
                .append("rect")
                .attr("x", function (v) {
                    return v.x * (size / details);
                })
                .attr("y", function (v) {
                    return v.y * (size / details);
                })
                .attr("width", size / details)
                .attr("height", size / details)
                .style("fill", function (v) {
                    return color(v.class);
                })
                .style("fill-opacity", function (v) {
                    return v.weight;
                });
    },
    drawLines: function (component, metadatai, metadataj, data, size, color, count) {
        component.append("rect").attr("x", 0)
                .attr("y", 0)
                .attr("width", size)
                .attr("height", size)
                .attr("fill", "none")
                .style("stroke", "gray")
                .style("stroke-width", 5 / count);

        component.selectAll("line")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", 0)
                .attr("x2", size)
                .attr("y2", function (v, k) {
                    return metadataj.scale(v[metadataj.name]);
                })
                .attr("y1", function (v, k) {
                    return metadatai.scale(v[metadatai.name]);
                })
                .style("stroke-width", 5 / count)
                .style("stroke", function (v) {
                    return color(v.class);
                })
                .style("fill-opacity", 0.6);
    },
    drawLinesOverview: function (component, allClasses, metadatai, metadataj, data, size, color, count) {
        var self = this;
        var classesmeta = [];
        for (var i = 0; i < allClasses.length; i++) {
            var arrauxi = self.sliceByAttrByClass(data, metadatai.name, allClasses[i]).sort();
            var arrauxj = self.sliceByAttrByClass(data, metadataj.name, allClasses[i]).sort();
            classesmeta.push({
                name: allClasses[i],
                mediani: arrauxi[Math.floor(arrauxi.length / 2)],
                q1i: arrauxi[Math.floor(arrauxi.length / 4)],
                q2i: arrauxi[Math.floor((3 * arrauxi.length) / 4)],
                maxi: arrauxi[arrauxi.length - 1],
                mini: arrauxi[0],
                medianj: arrauxj[Math.floor(arrauxj.length / 2)],
                q1j: arrauxj[Math.floor(arrauxj.length / 4)],
                q2j: arrauxj[Math.floor((3 * arrauxj.length) / 4)],
                maxj: arrauxj[arrauxj.length - 1],
                minj: arrauxj[0]
            });
            classesmeta[i].weight = 1 - (metadatai.scale(classesmeta[i].maxi) + metadataj.scale(classesmeta[i].maxj) -
                    metadatai.scale(classesmeta[i].mini) - metadataj.scale(classesmeta[i].minj)) / (size * 2);

        }

        classesmeta.sort(function (a, b) {
            return a.weight > b.weight ? 1 : a.weight < b.weight ? -1 : 0;
        });

        component.append("rect").attr("x", 0)
                .attr("y", 0)
                .attr("width", size)
                .attr("height", size)
                .attr("fill", "none")
                .style("stroke", "gray")
                .style("stroke-width", 5 / count);

        component.selectAll("path")
                .data(classesmeta)
                .enter()
                .append("path")
                .attr("d", function (v) {
                    return "M 0 " + metadatai.scale(v.maxi) + " L " + size + " " + metadataj.scale(v.maxj) +
                            " V " + metadataj.scale(v.minj) + " L 0 " + metadatai.scale(v.mini) + " Z";
                }).style("fill", function (v) {
            return color(v.name);
        })
                .style("fill-opacity", function (v) {
                    return v.weight;
                });


    },
    semanticZoom: function (x, y, w, opts) {
        var self = this;
        var x1 = Math.floor(x / opts.metadata.length),
                y1 = Math.floor(y / opts.metadata.length),
                x2 = Math.min(Math.ceil((x + w) / opts.metadata.length), opts.metadata.length),
                y2 = Math.min(Math.ceil((y + w) / opts.metadata.length), opts.metadata.length);

//        console.log(x1,x2,y1,y2);
//        console.log(Math.max((opts.metadata.length - (x2-x1)), 5));
        var details_level = x2 - x1 < 3 ? -1 : Math.max((opts.metadata.length - (x2 - x1)), 5);
        for (var i = 0; i < opts.metadata.length; i++) {
            for (var j = 0; j < opts.metadata.length; j++) {
                if (i !== j)
                    $("#cell_" + opts.metadata[j].name + "_" + j + "_" + i).empty();
            }
        }
        for (var i = Math.max(y1 - 1, 0); i < y2; i++) {
            for (var j = Math.max(x1 - 1, 0); j < x2; j++) {
                if (i > j) {
                    var svg = d3.select("#cell_" + opts.metadata[j].name + "_" + j + "_" + i);
                    if (details_level < 0) {
                        self.drawCircles(svg, opts.metadata[i], opts.metadata[j],
                                opts.data, opts.colw, opts.color, opts.metadata.length);
                    } else {
                        self.drawCirclesOverview(svg, opts.allclasses,
                                opts.metadata[i], opts.metadata[j],
                                opts.data,
                                opts.colw,
                                opts.color,
                                opts.metadata.length,
                                details_level);
                    }

                } else if (i < j) {
                    var svg = d3.select("#cell_" + opts.metadata[j].name + "_" + j + "_" + i);
                    if (details_level < 0) {
                        self.drawLines(svg, opts.metadata[i], opts.metadata[j],
                                opts.data, opts.colw, opts.color, opts.metadata.length);
                    } else {
                        self.drawLinesOverview(svg, opts.allclasses,
                                opts.metadata[i], opts.metadata[j],
                                opts.data,
                                opts.colw,
                                opts.color,
                                opts.metadata.length);

                    }
                }
            }
        }
        //        console.log(x/24, y/24, (x+w)/24, (y+w)/24);

    }
};