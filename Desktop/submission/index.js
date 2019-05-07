// Preparations varibles, constants and functions
// to convert date object
var dateParse = d3.timeParse("%Y");
const GENRES = ['Action', 'Adventure', 'Board', 'Card', 'Educational', 'Fighting', 'Hunting', 'Music', 'Party', 'Platformer', 'Puzzle', 'RPG', 'Racing', 'Shooter', 'Simulation', 'Sports', 'Strategy'];
const PLATFORMS = ['Dreamcast', 'Game Boy (C/A)', 'GameCube', 'Mobile', 'DS/3DS/DSi', 'Nintendo 64', 'PC', 'PlayStation (1-4)', 'PSP/Vita', 'Wii (U)', 'Xbox (360, One)', 'iPad'];
var genre_selections = GENRES;
var platform_selections = PLATFORMS;
const TRANSITION_DURTAION = 500;
var LOW_OPACITY = 0.4;
var HIGH_OPACITY = 1;
const HEIGHT = 450;
const legendOffset = 450;

// Set up the dimensions of the file
// sizing information, including margins so there is space for labels, etc
var margin_scatter = { top: 50, right: 200, bottom: 50, left: 200 },
    width_scatter = 1400 - margin_scatter.left - margin_scatter.right,
    height_scatter = HEIGHT - margin_scatter.top - margin_scatter.bottom;

var svg_scatter = d3.select("#scatter_plot")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 1400 ${HEIGHT}`)
    .classed("svg-content", true)

// sizing information, including margins so there is space for labels, etc
var margin_genre = { top: 50, right: 200, bottom: 50, left: 70 },
    width_genre = 700 - margin_genre.left - margin_genre.right,
    height_genre = HEIGHT - margin_genre.top - margin_genre.bottom;
var svg_genre = d3.select("#genres_plot")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 700 ${HEIGHT}`)
    .classed("svg-content", true)

// sizing information, including margins so there is space for labels, etc
var margin_platform = { top: 50, right: 200, bottom: 50, left: 70 },
    width_platform = 700 - margin_platform.left - margin_platform.right,
    height_platform = HEIGHT - margin_platform.top - margin_platform.bottom;
var svg_platform = d3.select("#platforms_plot")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 700 ${HEIGHT}`)
    .classed("svg-content", true)

// to aggregate all data points of the same release date
const aggregate = (fields, data, main_fields) => {
    // get only the data that we need
    var parsedData = data.map(function (d) {
        var dataObject = {
            date: d['release_year']
        };
        main_fields.forEach(function (s) {
            dataObject[s] = 0;
        })
        fields.forEach(function (s) {
            dataObject[s] = +d[s];
        })
        return dataObject;
    });
    return parsedData;
    console.log(parsedData);
}
// stack object for genre
const genre_stack = d3.stack()
    .keys(GENRES)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

// stack object for platform
const platform_stack = d3.stack()
    .keys(PLATFORMS)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

// generate the scatter array for the scatter plot
const generate_scatter_array = () => {
    var scatter_data = [];
    platform_selections.forEach(platform => {
        genre_selections.forEach(genre => {
            let object = {
                'platform': platform,
                'genre': genre,
                'count': 0
            }
            scatter_data.push(object);
        })
    });
    return scatter_data;
}

// get max of the stack
function stackMax(layer) {
    return d3.max(layer, function (d) { return d[1]; });
}

var genre_dict = {};
GENRES.forEach(genre => {
    genre_dict[genre] = true;
});

var platform_dict = {};
PLATFORMS.forEach(platform => {
    platform_dict[platform] = true;
});

// axes for the lots
var x_genres = d3.scaleTime().range([0, width_genre]),
    y_genres = d3.scaleLinear().range([height_genre, 0]),
    x_platforms = d3.scaleTime().range([0, width_platform]),
    y_platforms = d3.scaleLinear().range([height_platform, 0]),
    x_scatter = d3.scaleBand().rangeRound([0, width_scatter]).padding(0.1),
    y_scatter = d3.scaleBand().rangeRound([0, height_scatter]).padding(0.1);

var x_axis_genres = d3.axisBottom(x_genres),
    y_axis_genres = d3.axisLeft(y_genres),
    x_axis_platforms = d3.axisBottom(x_platforms),
    y_axis_platforms = d3.axisLeft(y_platforms),
    x_axis_scatter = d3.axisBottom(x_scatter),
    y_axis_scatter = d3.axisLeft(y_scatter);

var genres_colors = GENRES.map(function (d, i) {
    return d3.interpolateWarm(i / GENRES.length);
});

// Define the div for the tooltip
var scatter_tooltip = d3.select("body").append("div")
    .attr("id", "scatter_tooltip")
    .style("opacity", 0);

var genres_colors_scale = d3.scaleOrdinal()
    .domain(GENRES)
    .range(genres_colors);

var platform_colors = PLATFORMS.map(function (d, i) {
    return d3.interpolateWarm(i / PLATFORMS.length);
});

var platform_colors_scale = d3.scaleOrdinal()
    .domain(PLATFORMS)
    .range(platform_colors);

d3.queue()
    .defer(d3.csv, "pre_processed.csv")
    .defer(d3.csv, "games_2.csv")
    .await(function (error, scatter_data, data) {
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
            return;
        }
        // ---------------------------------------------
        // ------------   SCATTER PLOT -----------------
        // ---------------------------------------------

        var max_count = 0;
        // preprocessing the data to get the right data format
        var scatter_data_processed = generate_scatter_array();
        scatter_data.forEach(function (d) {
            d['release_year'] = dateParse(d['release_year']);
            const p_index = platform_selections.indexOf(d.platform);
            const g_index = genre_selections.indexOf(d.genre);
            if (p_index !== -1 && g_index !== -1) {
                const data_index = p_index * genre_selections.length + g_index;
                scatter_data_processed[data_index].count = scatter_data_processed[data_index].count + 1;
                max_count = Math.max(max_count, scatter_data_processed[data_index].count);
            }
        });

        // define the domain
        x_scatter.domain(scatter_data.map(function (d) { return d.genre; }));
        y_scatter.domain(scatter_data.map(function (d) { return d.platform; }));

        // create the main plot
        var scatter_plot = svg_scatter.append("g")
            .attr("class", "main")
            .attr("transform", "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");

        circleLegend(d3.select('#scatter_plot'));

        // draw the axes
        scatter_plot.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin_scatter.left - 5)
            .attr("x", 0 - (HEIGHT / 2 - margin_scatter.bottom))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Platforms");

        scatter_plot.append("text")
            .attr("transform",
                "translate(" + (width_scatter / 2) + " ," +
                (height_genre + margin_genre.top) + ")")
            .style("text-anchor", "middle")
            .text("Genres")
            .style("font-size", "18px");

        scatter_plot.append("text")
            .attr("transform",
                "translate(" + (width_scatter / 2) + " ," +
                (-20) + ")")
            .style("text-anchor", "middle")
            .text("Number of Games per Platform & Genre")
            .style("font-size", "18px")
            .style('font-weight', 'bold');


        scatter_plot.append("g")
            .attr("transform", "translate(-26," + height_scatter + ")")
            .attr("class", "axis axis--x")
            .style("font-size", "14px")
            .call(x_axis_scatter)
            .selectAll("text")
            .attr("transform", "rotate(20)")
            .style("text-anchor", "start");

        scatter_plot.append("g")
            .attr("class", "axis axis--y")
            .style("font-size", "14px")
            .call(y_axis_scatter)

        scatter_plot.selectAll(".column")
            .data(scatter_data_processed)
            .enter().append("circle")
            .attr("class", "column")
            .attr("cx", function (d) { return x_scatter(d.genre); })
            .attr("cy", function (d) { return y_scatter(d.platform); })
            .attr('r', function (d) { return Math.sqrt(d.count / max_count) * 15; })
            .attr('fill', genres_colors[0])
            .attr('opacity', function (d) {
                if (genre_selections.indexOf(d.genre) === -1 && platform_selections.indexOf(d.platform) === -1) {
                    return 0.1;
                }
                else {
                    return 1;
                }
            })
            .attr("width", x_scatter.bandwidth())
            .attr("height", function (d) { return height_scatter - y_scatter(d.frequency); })
            .on("mouseover", function (d) {
                const circle = this;
                console.log(circle);
                scatter_tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                scatter_tooltip.html(d.count)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 10) + "px");
            })
            .on("mouseout", function (d) {
                scatter_tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        // ---------------------------------------------
        // ------------   GENRES PLOT- -----------------
        // ---------------------------------------------

        if (error) throw error;
        // Parse the data first
        data.forEach(function (d) {
            d[""] = +d[""]
            d.Action = +d.Action
            d.Adventure = +d.Adventure
            d.Board = +d.Board
            d.Card = +d.Card
            d.Dreamcast = +d.Dreamcast
            d.Educational = +d.Educational
            d.Fighting = +d.Fighting
            d['Game Boy (Color, Advance)'] = +d['Game Boy (Color, Advance)']
            d.GameCube = +d.GameCube
            d.Hunting = +d.Hunting
            d.Mobile = +d.Mobile
            d.Music = +d.Music
            d['Nintendo 64'] = +d['Nintendo 64']
            d['Nintendo (DS, 3DS, DSi)'] = +d['Nintendo (DS, 3DS, DSi)']
            d.PC = +d.PC
            d.Party = +d.Party
            d.Platformer = +d.Platformer
            d['PlayStation (1, 2 ,3, 4)'] = +d['PlayStation (1, 2 ,3, 4)']
            d['PlayStation (Portable, Vita)'] = +d['PlayStation (Portable, Vita)']
            d.Puzzle = +d.Puzzle
            d.RPG = +d.RPG
            d.Racing = +d.Racing
            d.Shooter = +d.Shooter
            d.Simulation = + d.Simulation
            d.Sports = +d.Sports
            d.Strategy = +d.Strategy
            d['Wii (U)'] = +d['Wii (U)']
            d['Xbox (360, One)'] = +d['Xbox (360, One)']
            d['iPad'] = +d['iPad']
            d['release_year'] = dateParse(d['release_year']);
        });

        // ---------------------------------------------
        // ------------   GENRES PLOT- -----------------
        // ---------------------------------------------

        var genre_data = aggregate(genre_selections, data, GENRES);
        var genre_layers = genre_stack(genre_data);
        x_genres.domain([genre_data[0].date, genre_data[genre_data.length - 1].date]);
        y_genres.domain([0, d3.max(genre_layers, stackMax)]);




        var genre_legend = d3.legendColor()
            .shapeWidth(30)
            .cells(GENRES.length)
            .orient("vertical")
            .scale(genres_colors_scale)

        var area_genre = d3.area()
            .x(function (d, i) { return x_genres(d.data.date) })
            .y0(function (d) { return y_genres(d[0]); })
            .y1(function (d) { return y_genres(d[1]); })
        // .curve(d3.curveMonotoneX);

        var genre_plot = svg_genre.append("g")
            .attr("id", "genre_plot")
            .attr("transform", "translate(" + margin_genre.left + "," + margin_genre.top + ")");

        genre_plot.append("text")

            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin_genre.left - 5)
            .attr("x", 0 - (HEIGHT / 2 - margin_genre.bottom))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Games")
            .style("font-size", "18px");

        genre_plot.append("text")
            .attr("transform",
                "translate(" + (width_genre / 2) + " ," +
                (height_genre + margin_genre.top) + ")")
            .style("text-anchor", "middle")
            .text("Years")
            .style("font-size", "18px");
        genre_plot.append("text")
            .attr("transform",
                "translate(" + (width_genre / 2) + " ," +
                -20 + ")")
            .style("text-anchor", "middle")
            .text("Genres by Years")
            .style("font-size", "18px")
            .style("font-weight", 'bold');

        genre_plot.append("g")
            .attr("transform", "translate(0," + height_genre + ")")
            .attr("class", "axis axis--x")
            .style("font-size", "14px")
            .call(x_axis_genres)
            .select(".domain")
            .remove();

        genre_plot.append("g")
            .attr("class", "axis axis--y")
            .style("font-size", "14px")
            .call(y_axis_genres);

        genre_plot.selectAll(".genre_path")
            .data(genre_layers)
            .enter().append("path")
            .attr("class", "genre_path")
            .attr("d", area_genre)
            .attr("id", function (d, i) {
                return (GENRES[i]);
            })
            .attr("fill", function (d, i) {
                return genres_colors[i];
            })
            .on("mouseout", function (d) {
                genre_plot.selectAll(".genre_path")
                    .transition("ease-in-out")
                    .duration(TRANSITION_DURTAION)
                    .attr("d", area_genre)
                    .style("opacity", 1)

                genre_plot.selectAll("circle")
                    .data([])
                    .exit().remove();
                genre_plot.selectAll("#scatter_tooltip")
                    .data([])
                    .exit().remove();
            })
            .on("mouseover", function (d, i) {
                var current_element = this;
                genre_plot.selectAll(".genre_path")
                    .transition("ease-in-out")
                    .duration(TRANSITION_DURTAION / 2)
                    .style("opacity", function (d, i) {
                        if (GENRES[i] === current_element.id) {
                            return 1;
                        }
                        else {
                            return LOW_OPACITY;
                        }
                    });
                genre_plot.selectAll(".genre_tooltip")
                    .data(genre_layers[i])
                    .enter().append("text")
                    .style("font-size", "8pt")
                    .attr("id", "scatter_tooltip")
                    .attr("x", function (d) { return x_genres(d.data.date) - 10; })
                    .attr("y", function (d) { return y_genres(d[1]) - 10; })
                    .html(function (d, i) { return genre_data[i][current_element.id] })

                genre_plot.selectAll(".genre_tooltip")
                    .data(genre_layers[i])
                    .enter().append("circle")
                    .attr("cx", function (d) { return x_genres(d.data.date); })
                    .attr("cy", function (d) { return y_genres(d[1]); })
                    .attr('fill', genres_colors[i])
                    .attr('r', 2)

            })


        var legendObject = genre_plot.append("g")
            .style("font-size", "10pt")
            .attr("class", "legend")
            .attr("transform", "translate(" + legendOffset.toString() + ",0)");

        genre_plot.select(".legend")
            .call(genre_legend);

        var genre_graph_legend = legendObject.selectAll('rect').data(genres_colors);
        genre_graph_legend.on("click", function () {
            item = this.nextSibling.innerHTML;
            genre_dict[item] = !genre_dict[item];
            genre_selections = []
            Object.keys(genre_dict).forEach(genre => {
                if (genre_dict[genre] === true) {
                    genre_selections.push(genre);
                }
            });
            const colorSwatch = d3.select(this);
            const label = d3.select(this.nextSibling);
            if (genre_dict[item] === false) {
                colorSwatch.style('opacity', LOW_OPACITY);
                label.style('opacity', LOW_OPACITY);
            } else {
                colorSwatch.style('opacity', HIGH_OPACITY);
                label.style('opacity', HIGH_OPACITY);
            }
            // recalculate the data
            genre_data = aggregate(genre_selections, data, GENRES);
            genre_layers = genre_stack(genre_data);
            y_genres.domain([0, d3.max(genre_layers, stackMax)]);
            genre_plot.select(".axis.axis--y").style("font-size", "14px").call(y_axis_genres);
            genre_plot.selectAll(".genre_path")
                .data(genre_layers)
                .transition()
                .duration(TRANSITION_DURTAION)
                .attr("d", area_genre)
                .attr("fill", function (d, i) {
                    return genres_colors[i];
                });

            scatter_plot.selectAll("circle")
                .transition()
                .duration(TRANSITION_DURTAION)
                .attr('opacity', function (d) {
                    if (genre_selections.indexOf(d.genre) === -1 || platform_selections.indexOf(d.platform) === -1) {
                        return 0.1;
                    }
                    else {
                        return 1;
                    }
                })
        });


        // ---------------------------------------------
        // ------------   PLATFORMS PLOT- -----------------
        // ---------------------------------------------

        var platform_data = aggregate(platform_selections, data, PLATFORMS);
        var platform_layers = platform_stack(platform_data);
        x_platforms.domain([platform_data[0].date, platform_data[platform_data.length - 1].date]);
        y_platforms.domain([0, d3.max(platform_layers, stackMax)]);
        var platform_legend = d3.legendColor()
            .shapeWidth(30)
            .cells(PLATFORMS.length)
            .orient("vertical")
            .scale(platform_colors_scale)

        var area_platform = d3.area()
            .x(function (d, i) { return x_platforms(d.data.date) })
            .y0(function (d) { return y_platforms(d[0]); })
            .y1(function (d) { return y_platforms(d[1]); })
        // .curve(d3.curveMonotoneX);

        var platform_plot = svg_platform.append("g")
            .attr("id", "platform_plot")
            .attr("transform", "translate(" + margin_genre.left + "," + margin_genre.top + ")");

        platform_plot.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin_genre.left - 5)
            .attr("x", 0 - (HEIGHT / 2 - margin_genre.bottom))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Games")
            .style("font-size", "18px");

        platform_plot.append("text")
            .attr("transform",
                "translate(" + (width_genre / 2) + " ," +
                (height_genre + margin_genre.top) + ")")
            .style("text-anchor", "middle")
            .text("Years")
            .style("font-size", "18px"); 2
        platform_plot.append("text")
            .attr("transform",
                "translate(" + (width_genre / 2) + " ," +
                -20 + ")")
            .style("text-anchor", "middle")
            .text("Platforms by Years")
            .style("font-size", "18px")
            .style("font-weight", 'bold');;


        platform_plot.append("g")
            .attr("transform", "translate(0," + height_platform + ")")
            .attr("class", "axis axis--x")
            .style("font-size", "14px")
            .call(x_axis_platforms)
            .select(".domain")
            .remove();

        platform_plot.append("g")
            .attr("class", "axis axis--y")
            .style("font-size", "14px")
            .call(y_axis_platforms);

        platform_plot.selectAll(".platform_path")
            .data(platform_layers)
            .enter().append("path")
            .attr("class", "platform_path")
            .attr("d", area_platform)
            .attr("id", function (d, i) {
                return (PLATFORMS[i]);
            })
            .attr("fill", function (d, i) {
                return platform_colors[i];
            })
            .on("mouseout", function (d) {
                platform_plot.selectAll(".platform_path")
                    .transition("ease-in-out")
                    .duration(TRANSITION_DURTAION)
                    .attr("d", area_platform)
                    .style("opacity", 1)

                platform_plot.selectAll("circle")
                    .data([])
                    .exit().remove();
                platform_plot.selectAll("#scatter_tooltip")
                    .data([])
                    .exit().remove();
            })
            .on("mouseover", function (d, i) {
                var current_element = this;
                platform_plot.selectAll(".platform_path")
                    .transition("ease-in-out")
                    .duration(TRANSITION_DURTAION / 2)
                    .style("opacity", function (d, i) {
                        if (PLATFORMS[i] === current_element.id) {
                            return 1;
                        }
                        else {
                            return LOW_OPACITY;
                        }
                    });
                platform_plot.selectAll(".platform_tooltip")
                    .data(platform_layers[i])
                    .enter().append("text")
                    .style("font-size", "8pt")
                    .attr("id", "scatter_tooltip")
                    .attr("x", function (d) { return x_platforms(d.data.date) - 10; })
                    .attr("y", function (d) { return y_platforms(d[1]) - 10; })
                    .html(function (d, i) { return platform_data[i][current_element.id] })

                platform_plot.selectAll(".platform_tooltip")
                    .data(platform_layers[i])
                    .enter().append("circle")
                    .attr("cx", function (d) { return x_platforms(d.data.date); })
                    .attr("cy", function (d) { return y_platforms(d[1]); })
                    .attr('fill', platform_colors[i])
                    .attr('r', 2)
            })

        var legendObject = platform_plot.append("g")
            .style("font-size", "10pt")
            .attr("class", "legend")
            .attr("transform", "translate(" + legendOffset.toString() + ",0)");

        platform_plot.select(".legend")
            .call(platform_legend);

        var platform_graph_legend = legendObject.selectAll('rect').data(platform_colors);
        platform_graph_legend.on("click", function () {
            item = this.nextSibling.innerHTML;
            platform_dict[item] = !platform_dict[item];
            platform_selections = []
            Object.keys(platform_dict).forEach(platform => {
                if (platform_dict[platform] === true) {
                    platform_selections.push(platform);
                }
            });
            const colorSwatch = d3.select(this);
            const label = d3.select(this.nextSibling);
            if (platform_dict[item] === false) {
                colorSwatch.style('opacity', LOW_OPACITY);
                label.style('opacity', LOW_OPACITY);
            } else {
                colorSwatch.style('opacity', HIGH_OPACITY);
                label.style('opacity', HIGH_OPACITY);
            }
            // recalculate the data
            platform_data = aggregate(platform_selections, data, PLATFORMS);
            platform_layers = platform_stack(platform_data);
            y_platforms.domain([0, d3.max(platform_layers, stackMax)]);
            platform_plot.select(".axis.axis--y").style("font-size", "14px").call(y_axis_platforms);
            platform_plot.selectAll(".platform_path")
                .data(platform_layers)
                .transition()
                .duration(TRANSITION_DURTAION)
                .attr("d", area_platform)
                .attr("fill", function (d, i) {
                    return platform_colors[i];
                });
            scatter_plot.selectAll("circle")
                .transition()
                .duration(TRANSITION_DURTAION)
                .attr('opacity', function (d) {
                    if (genre_selections.indexOf(d.genre) === -1 || platform_selections.indexOf(d.platform) === -1) {
                        return 0.1;
                    }
                    else {
                        return 1;
                    }
                })
        });

    });

// ---------------------------------------------
// ------------   HELPERS     ------------------
// ---------------------------------------------

function circleLegend(selection) {

    var linearScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, 20]);

    var sqrtScale = d3.scaleSqrt()
        .domain([0, 1391])
        .range([0, 15]);

    var myData = [200, 400, 600, 800, 1000, 1200, 1400];

    const s = selection.append('g')
        .attr('class', 'legend')
        .attr("transform", `translate(${width_scatter + margin_scatter.left + 20}, ${HEIGHT / 7})`)

    s.selectAll('circle')
        .data(myData)
        .enter()
        .append('circle')
        .attr('fill', genres_colors[0])
        .attr('r', function (d) {
            return sqrtScale(d);
        })
        .attr('cy', function (d) {
            return linearScale(d);
        });

    s.selectAll('text')
        .data(myData)
        .enter()
        .append('text')
        .text(d => d)
        .attr('x', function (d) {
            return 20;
        })
        .attr('y', function (d) {
            return linearScale(d) + 5;
        });


    //   }
    // }

}