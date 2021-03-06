"use strict";

const d3 = require("d3");
const Color = require("color");
const _ = require("lodash");

import color from "../util/color.js";

var time = require("../util/time.js");

function create(container){
  // Clear element
  container.innerHTML = "";

  // Create svg canvas
  let svg = d3.select(container).append("svg");
  svg.attr("width", "100%")
   .attr("height", "100px")
   .attr("class", "appsummary");
}

function set_status(container, msg){
  // Select svg canvas
  let svg_elem = container.querySelector(".appsummary");
  let svg = d3.select(svg_elem);
  svg_elem.innerHTML = "";

  svg.append("text")
   .attr("x", "0px")
   .attr("y", "25px")
   .text(msg)
   .attr("font-family", "sans-serif")
   .attr("font-size", "25px")
   .attr("fill", "black");
}

function updateSummedEvents(container, summedEvents,
                            titleKeyFunc, colorKeyFunc) {
  let apps = _.map(summedEvents, (e) => { return {name: titleKeyFunc(e),
                                                  duration: e.duration,
                                                  colorKey: colorKeyFunc(e)}; });
  update(container, apps);
}

function update(container, apps) {
  // No apps, sets status to "No data"
  if (apps.length <= 0){
    set_status(container, "No data");
    return container;
  }

  let svg_elem = container.querySelector(".appsummary");
  let svg = d3.select(svg_elem);

  // Remove apps without a duration from list
  apps = apps.filter(function(app){
    return app.duration !== undefined;
  });

  var curr_y = 0;
  var longest_duration = apps[0].duration;
  _.each(apps, function(app, i) {
    // TODO: Expand on click and list titles

    // Variables
    var width = (app.duration/longest_duration)*80+"%";
    let barHeight = 50;
    let textSize = 15;
    var baseappcolor = color.getAppColor(app.colorKey || app.name);
    var appcolor = Color(baseappcolor).lighten(0.1).hex();
    var hovercolor = Color(baseappcolor).darken(0.1).hex();

    // The group representing an application in the barchart
    let eg = svg.append("g");
    eg.attr("id", "summary_app_"+i)
      .on("mouseover", function() { eg.select("rect").style("fill", hovercolor); })
      .on("mouseout", function() { eg.select("rect").style("fill", appcolor); });

    // Color box background
    eg.append("rect")
     .attr("x", 0)
     .attr("y", curr_y)
     .attr("rx", 5)
     .attr("ry", 5)
     .attr("width", width)
     .attr("height", barHeight)
     .style("fill", appcolor);

    // App name
    eg.append("text")
     .attr("x", 5)
     .attr("y", curr_y + 5 + textSize)
     .text(app.name)
     .attr("font-family", "sans-serif")
     .attr("font-size", textSize + "px")
     .attr("fill", "black");

    // Duration
    eg.append("text")
     .attr("x", 5)
     .attr("y", curr_y + 5 + textSize + 5 + textSize)
     .text(time.seconds_to_duration(app.duration))
     .attr("font-family", "sans-serif")
     .attr("font-size", textSize + "px")
     .attr("fill", "black");

    curr_y += barHeight + 5;

  });
  curr_y -= 5;

  svg.attr("height", curr_y);

  return container;
}

module.exports = {
  "create": create,
  "update": update,
  "updateSummedEvents": updateSummedEvents,
  "set_status": set_status,
};
