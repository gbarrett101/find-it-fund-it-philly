mapboxgl.accessToken =
  "pk.eyJ1IjoiZ2JhcnJldHQxMjMiLCJhIjoiY2w5d3RzN21rMDN1cTN2cWszZGFjZnQ1byJ9.rJLdUzmU35K7oyFMdB0xuw";

async function createMap() {
  const greenIndex = await fetch("./data/index.geojson")
    .then((response) => response.json())
    .catch((error) => console.log(error));

  // Index meta-data
  compositeMetaData = {
    "Index Composite Score": {
      field: "INDEX_",
      description: "Overall vulnerability score based on index",
    },
  };

  indexMetaData = {
    " Minority": {
      field: "I_PCTMIN",
      description: "Based on % minority population",
    },
    "Low Income": {
      field: "I_LOWINC",
      description: "Based on % population low income",
    },
    "Under Age 5": {
      field: "I_UNDER5",
      description: "Based on % population under the age of 5",
    },
    "Over Age 64": {
      field: "I_OVER64",
      description: "Based on % population over the age of 64",
    },
    "No High School Education": {
      field: "I_NOHS",
      description:
        "Based on % of adults without a high school education",
    },
    "Owner Occupied": {
      field: "I_OWNER",
      description: "Based on % owner occupied",
    },
    "Traffic Amount": {
      field: "I_TRAFFIC",
      description: "Traffic proximity and volume",
    },
    "Ozone": { field: "I_OZONE", description: "Ozone (level in air)" },
    "Particular matter": {
      field: "I_PM25",
      description: "Particulate matter (PM2.5) levels in air, micrograms \nper cubic meter (µg/m3) annual average",
    },
    "Park Access": {
      field: "I_PARKS",
      description: "Based on percent of block group within ½ mile walking \ndistance to a park",
    },
    "Tree Canopy": {
      field: "I_CANOPY",
      description: "Index score for tree canopy",
    },
    "Playground Access": {
      field: "I_PLAY",
      description: "Based on kernel density of playgrounds within ½ mile \n(averaged over block group)",
    },
    "Impervious Cover": {
      field: "I_IMP",
      description: "Index score for impervious cover",
    },
    "Vacant Land": {
      field: "I_VACANT",
      description: "kernel density of vacant lots within ½ mile \n(averaged over block group)",
    },
  };

  cityAverageMockIndexData = [0.61, 0.43, 0.20, 0.10, 0.26, 0.37, 0.06, 0.23, 0.44, 0.11, 0.54, 0.65, 0.59, 0.10]
  cityAverageMockCompositeData = [4.67]

  indexField = Object.values(indexMetaData).map((metric) => metric["field"]);
  indexLabels = Object.keys(indexMetaData);
  indexDescriptions = Object.values(indexMetaData).map(
    (metric) => metric["description"]
  );

  compositeField = Object.values(compositeMetaData).map(
    (metric) => metric["field"]
  );
  compositeLabel = Object.keys(compositeMetaData);
  compositeDescription = Object.values(compositeMetaData).map(
    (metric) => metric["description"]
  );

  const index = "./data/index.geojson";
  function map_range(value, low1, high1, low2, high2) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  // chart settings

  compositeData = {
    labels: compositeLabel,
    datasets: [
      {
        label: "Selected Area",
        data: [],
        backgroundColor: "#33A02C",
        color: "#33A02C",
      },
      {
        label: "City Average",
        data: cityAverageMockCompositeData,
      },
    ],
  };

  compositeConfig = {
    type: "horizontalBar",
    data: compositeData,
    options: {
      title: {
        display: true,
        text: "Green Equity Vulnerability Index",
      },
      tooltips: {
        callbacks: {
          footer: (tooltipItems) => {
            return compositeMetaData[tooltipItems[0].label]["description"];
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        xAxes: [
          {
            display: true,
            ticks: {
              min: 0,
              max: 10,
            },
          },
        ],
        yAxes: [
          {
            display: true,
          },
        ],
      },
    },
  };

  indexData = {
    labels: indexLabels,
    datasets: [
      {
        label: "Selected Area",
        data: [],
        backgroundColor: "#33A02C",
        color: "#33A02C",
      },
      {
        label: "City Average",
        data: cityAverageMockIndexData,
      },
    ],
  };

  indexConfig = {
    type: "horizontalBar",
    data: indexData,
    options: {
      tooltips: {
        callbacks: {
          footer: (tooltipItems) => {
            return indexMetaData[tooltipItems[0].label]["description"];
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Index Score",
        },
      },
      scales: {
        xAxes: [
          {
            display: true,
            ticks: {
              min: 0,
              max: 1,
            },
          },
        ],
        yAxes: [
          {
            display: true,
          },
        ],
      },
    },
  };

  // Helper functions

  function flyToClick(coords) {
    deckgl.setProps({
      initialViewState: {
        longitude: coords[0],
        latitude: coords[1],
        zoom: 12,
        transitionDuration: 500,
        transitionInterpolator: new deck.FlyToInterpolator(),
      },
    });
  }

  function updateChart(chart, data) {
    dataset = chart.data.datasets[0];
    dataset.data = data;
    chart.update();
  }

  // Create charts

  // temp data
  const coordinates = [[-75.16402105283208, 39.933969532091965]];
  let selectedPolygon = 10;

  const compositeElement = document.getElementById("composite");
  compositeIndexChart = new Chart(compositeElement, compositeConfig);

  const indexElement = document.getElementById("index");
  indexChart = new Chart(indexElement, indexConfig);

  mapboxgl.accessToken = mapboxgl.accessToken;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/gbarrett123/cl9wtvsla000114qhvtwye3e1",
    center: [-75.1652, 39.9526],
    zoom: 12,
    pitch: 0,
  });
  let hoveredId = null; // which block group is hovered
  let selectedID = null; // which block group is selected
  // once the basemap is loaded, begin to add data sources and layers
  map.on("load", () => {
    map.addSource("greenIndex", {
      type: "geojson",
      data: greenIndex,
      // generateId: true, // ensure all features have unique id
      promoteId: "ID"
    });

    const scaleType = {
      equal: "equalInterval",
      quantile: "quantile",
    };

    const scale = getMapScale(greenIndex, "INDEX_", scaleType.quantile);
    // add layer for philly data
    map.addLayer({
      id: "greenIndex",
      type: "fill",
      source: "greenIndex", // reference the data source
      layout: {},
      paint: {
        // style the layer based on index score property
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", "INDEX_"],
          // use our quantile scale function that we created above to automatically generate the color scale
          ...scale[0],
        ],
        //   change opacity based on zoom level
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0.85,
        ],
      },
    });

    map.addLayer({
      // this layer is just used to highlight which block group is selected
      id: "greenIndexOutlines",
      type: "line",
      source: "greenIndex", // reference the data source
      layout: {},
      paint: {
        // Boolean cases to
        "line-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#000000",
          "#ffffff",
        ],
        "line-width": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          2,
          0.5,
        ],
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0,
        ],
      },
    });

    // create legend
    const legend = document.getElementById("legend");

    //   create a title for the legend
    // const title = document.createElement("h2");
    // title.id = "legend-title";
    // title.textContent = "Green Equity Vulnerability";
    // legend.appendChild(title);

    //   create a child element for the legend explaining the metric
    const description = document.createElement("p");
    description.id = "legend-description";
    description.textContent = "Vulnerability Index";
    legend.appendChild(description);

    //   create a container for the actual legend items
    const ramp = document.createElement("div");
    ramp.className = "legend-items";

    // get the values and color for the legend from the same scale as the choropleth layer
    const [legendValues, legendColors] = [scale[1], scale[2]];

    //   create a legend item for each value and color
    legendValues.forEach((layer, i) => {
      const color = legendColors[i];
      const item = document.createElement("div");
      const key = document.createElement("div");
      key.className = "legend-key";
      key.style.backgroundColor = color;

      const value = document.createElement("div");
      value.innerHTML = `${round(layer)}`;
      item.appendChild(key);
      item.appendChild(value);
      ramp.appendChild(item);
    });
    //  add the legend items to the legend
    legend.appendChild(ramp);

    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // add a popup on hover over the population geojson
    map.on("mousemove", "greenIndex", (e) => {
      if (e.features.length > 0) {
        if (hoveredId !== null) {
          if (hoveredId !== selectedID) {
            map.setFeatureState({ source: "greenIndex", id: hoveredId }, { hover: false });;
          }
        }
        hoveredId = e.features[0].id;
        map.setFeatureState({ source: "greenIndex", id: hoveredId }, { hover: true });
      }

      // set the cursor to pointer
      map.getCanvas().style.cursor = "pointer";
      const { INDEX_ } = e.features[0].properties;

      hoverPopup
        .setLngLat(e.lngLat)
        .setHTML(`<h4>Index Score: ${round(INDEX_)}</h4>`)
        .addTo(map);
    });

    // When the mouse leaves the choropleth, remove the popup from the previous feature.
    map.on("mouseleave", "greenIndex", () => {
      // set the cursor to default
      map.getCanvas().style.cursor = "";
      hoverPopup.remove();

      if (hoveredId) {
        if (hoveredId !== selectedID) {
          // only deselect if the block group hovered is not the selected one
          map.setFeatureState({ source: "greenIndex", id: hoveredId }, { hover: false });
        }
      }
      hoveredId = null;
    });

    const handleClick = (e, poly) => {
        // retrieve block group from click
        const bounds = poly ? poly : e.features[0]
        const blockGroup = poly ? poly.properties : e.features[0].properties;

        if (selectedID !== null) {
          map.setFeatureState({ source: "greenIndex", id: selectedID }, { hover: false });
        }

        selectedID = bounds.properties.ID;
        map.setFeatureState({ source: "greenIndex", id: selectedID }, { hover: true });

        const center = turf.center(bounds);

        // map.fitBounds(bounds)
        map.flyTo({
          center: center.geometry.coordinates,
        });
        // map.setZoom(15)

        // Update charts
        // properties = info.object.properties
        compositeIndexData = compositeField.map((value) => blockGroup[value]);
        indexData = indexField.map((value) => blockGroup[value]);

        updateChart(compositeIndexChart, compositeIndexData);
        updateChart(indexChart, indexData);
       // const description = bounds.properties.description;

    }

    // handling for clicking on the map
    map.on("click", "greenIndex", (e) => handleClick(e));

    function setHoverState(id, bool) {
      map.setFeatureState({ source: "greenIndex", id: id }, { hover: bool });
    }

    // Geocoding Code pulled from Code pen

  // the mapbox forward geocoder api route
  const baseUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places";

  // the list of place types we'd like to search for using the geocoder
  // we .join() them to make a comma seperated list
  const placeTypes = [
    "address",
    "postcode",
    "place",
    "locality",
    "district",
  ].join(",");

  // DOM element references:
  // the html text input
  const input = document.getElementById("search");
  // our results list to append results to
  const resultsList = document.querySelector(".geocode-results-list");
  const resultsDataList = document.getElementById("results");
  // button to clear our search results
  const clearSearchBtn = document.getElementById("search-clear");
  // where we output our selected result
  const selectedResult = document.querySelector(".selected-result");

  // console.log(phillyBounds)
  // makes a mapbox geocoding API request
  // the async lets us `await` the result of a Promise rather than use Promise.then
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  async function geocodeSearch(searchText) {
    // we early return to avoid prematurely calling mapbox geocode API
    if (!searchText || searchText.length < 3) {
      return;
    }

    // encode the search text, this helps with special characters
    const searchTextEncoded = encodeURIComponent(searchText);

    // wrap the API call in a try/catch for error handling
    try {
      // use string interpolation to create our geocoding API url
      const url = `${baseUrl}/${searchTextEncoded}.json?bbox=${phillyBounds.join(
        ","
      )}&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (error) {
      return error;
    }
  }

  // handles the text input's input event
  function handleSearchInput(event) {
    if (event.target.value) {
      const results = geocodeSearch(event.target.value);
      handleResults(results);
    } else {
      clearResults();
    }
  }

  // const _ = require('lodash');

  // use lodash.debounce to avoid calling the API on every keystroke to reduce the number of API calls being made
  // see: https://docs-lodash.com/v4/debounce/
  // see: https://css-tricks.com/debouncing-throttling-explained-examples/
  const handleSearchInputDebounced = _.debounce(handleSearchInput, 350, {
    leading: true,
    trailing: false,
    maxWait: 500,
  });

  // wire up the text input search
  search.addEventListener("input", handleSearchInputDebounced);

  // clears our results from the results list element
  function clearResults() {
    document.getElementById("suggestedTitle").style.visibility = "hidden";
    resultsList.innerHTML = "";
  }

  // appends our results to the results list element
  // or logs an error if something went wrong.
  async function handleResults(results) {
    // since `results` is a promise, we need to handle it asyncronously here as well by awaiting it.
    const toAppend = await results;

    if (toAppend && toAppend.message) {
      // we likely have encountered an error here since our results object normally doesn't contain an error property.
      // we could do something like inform the user something went wrong and try a different search
      // or contact the website owner, etc.
      console.log("something went wrong: ", toAppend);
      // exit the function early to prevent any other code below from running
      return;
    }
    // make sure we actually have the `results.features` property so we don't get an error when trying to access it
    if (toAppend && toAppend.features) {
      // first clear the list of any previous results:
      clearResults();
      document.getElementById("suggestedTitle").style.visibility = "visible";

      // update the results list.
      // FYI this type of operation is much simpler to do with a templating library such as LitElement, React, Vue, etc.
      toAppend.features.forEach((result) => {
        const option = document.createElement("option");

        // option.setAttribute('value', result.place_name);
        // option.addEventListener("click", () => handleSearchResultClick(result));
        // resultsDataList.appendChild(option);

        const li = document.createElement("li");
        const btn = document.createElement("button");
        // btn.classList.add("btn")
        // btn.classList.add("btn-primary")
        btn.addEventListener("click", () => handleSearchResultClick(result));
        const text = document.createTextNode(result.place_name);
        btn.appendChild(text);
        li.appendChild(btn);
        resultsList.appendChild(li);
      });
    }
  }

  function findBlockGroup(coordinates) {

    const pt = turf.point(coordinates);

    for (let i = 0; i < greenIndex.features.length; i++) {
      const poly = greenIndex.features[i];
      if (turf.booleanPointInPolygon(pt, poly)){

        handleClick( {} , poly)

      }
    }
  }

  // displays the data of the selected search result
  function handleSearchResultClick(result) {
    $("#tourstep4").modal('hide');
    findBlockGroup(result.center);
  }

  // clears our UI when the "clear results" button is clicked
  clearSearchBtn.addEventListener("click", () => {
    clearResults();
    input.value = "";
    selectedResult.style.display = "none";
    selectedResult.innerHTML = "";
  });
  });

  // limit the search engine boundary extent to greater Boston
  // const phillyBounds = turf.extent(greenIndex);
  //hardcoded bounds in
  const phillyBounds = [
    -75.2803082839626, 39.867471862367, -74.9557485621339, 40.1379348409685,
  ];


  const mapGeocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    placeholder: "Find it", //placeholder text for the search bar
    bbox: phillyBounds, //limit search results to Philadelphia bounds
  });

  // Add the geocoder to the map
  // map.addControl(popupGeocoder);
  map.addControl(mapGeocoder);
  // map.removeControl(popupGeocoder)

  

  // Code from Class Workshop

  /**
   * AUTO GENERATE LEGEND
   * This section offers two methods to generate a legend: Quantile and Equal Interval
   * Quantile is often used for choropleth maps, while Equal Interval is often used for heatmaps.
   * Both methods are acceptable, but tell a different story.
   *
   * In this example, we will use Quantile to generate our legend, but you can easily switch to Equal Interval
   * by switching the getQuantileScale function to getEqualIntervalScale throughout the code.
   *
   * I encourage you to check both methods and see which one tells a better story for your data.
   *
   * CASE 1: QUANTILE SCALE:
   * Quantile slices the domain into intervals of (roughly) equal absolute frequency
   * (i.e. equal number of individuals for each color)
   */

  // number of bins for your legend
  const numberOfBins = 5;

  // styles for our choropleth map
  let colorRamp = {
    red: [
      "#f7f4f9",
      "#e7e1ef",
      "#d4b9da",
      "#c994c7",
      "#df65b0",
      "#e7298a",
      "#ce1256",
      "#980043",
      "#67001f",
    ],
    blue: [
      "#ffffd9",
      "#edf8b1",
      "#c7e9b4",
      "#7fcdbb",
      "#41b6c4",
      "#1d91c0",
      "#225ea8",
      "#253494",
      "#081d58",
    ],
    greyScale: [
      "#3F3F43",
      "#515155",
      "#646467",
      "#777779",
      "#8A8A8C",
      "#9C9C9E",
      "#AFAFB0",
      "#C2C2C2",
      "#D5D5D5",
      "#D5D5D5",
    ],
    green: [
      "#808080", // grey for no data
      "#edf8fb",
      "#b2e2e2",
      "#66c2a4",
      "#238b45",
    ],
    qualitative: [
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
      "#999999",
    ],
  };

  // select the color ramp to be used
  const selectedColorRamp = colorRamp.green;

  function getMapScale(jsonSource, prop, scaleType) {
    if (scaleType === "equalInterval") {
      return getEqualIntervalScale(jsonSource, prop);
    } else {
      return getQuantileScale(jsonSource, prop);
    }
  }

  function getQuantileScale(jsonSource, prop) {
    /**
     * @param {array} jsonSource - the data source
     * @param {string} prop - the property to be used for the scale
     */

    //sort the data in ascending order and assign to a data array
    const data = jsonSource.features
      .map((el) => el.properties[prop])
      .sort((a, b) => a - b);

    // create a quantile function based off the data array and assign to the colors array
    const color = d3.scaleQuantile().domain(data).range(selectedColorRamp);

    // get the quantile breaks of the data property
    const quantileBreaks = Math.floor(data.length / numberOfBins + 1);

    // get the min value of each group
    const groups = [];
    for (let i = 0; i < numberOfBins; i++) {
      // divide data into groups of equal size (quantileBreaks)
      groups.push(
        d3.min(data.slice(i * quantileBreaks, (i + 1) * quantileBreaks))
      );
    }
    // for each density break, get the color using our quantile function
    const colorBreaks = groups.map((d) => color(d));

    // combine density breaks and color breaks into an array of objects
    const colorScale = groups
      .map((d, i) => {
        return Object.values({
          density: d,
          color: colorBreaks[i],
        });
      })
      .flat();

    //return an array with the color scale, the groups, and the color breaks
    return [colorScale, groups, colorBreaks];
  }

  /**
   * CASE 2: EQUAL INTERVAL SCALE:
   * Equal interval slices the domain into intervals of (roughly) equal width
   * (i.e. equal range of values for each color)
   */

  function getEqualIntervalScale(jsonSource, prop) {
    /**
     * @param {array} jsonSource - the data source
     * @param {string} prop - the property to be used for the scale
     */

    //sort the data in ascending order and assign to a data array
    const data = jsonSource.features
      .map((el) => el.properties[prop])
      .sort((a, b) => a - b);

    // divide the range of the data into equal intervals
    const interval = (d3.max(data) - d3.min(data)) / numberOfBins;

    // get the value at each threshold (i.e. the min value of each interval)
    const groups = [];
    for (let i = 0; i < numberOfBins; i++) {
      groups.push(d3.min(data) + i * interval);
    }

    //   break down the color ramp to match the number of bins, from the middle out
    const halfRamp1 = [];
    const halfRamp2 = [];

    for (let i = 0; i < numberOfBins; i++) {
      if (i % 2 == 0) {
        halfRamp1.push(selectedColorRamp[i]);

        if (halfRamp1.length + halfRamp2.length == numberOfBins) {
          break;
        }
      } else {
        halfRamp2.push(selectedColorRamp[selectedColorRamp.length - i]);
        if (halfRamp1.length + halfRamp2.length == numberOfBins) {
          break;
        }
      }
    }

    // combine the two color ramps into one after reversing the second one
    const colorRamp = halfRamp1.concat(halfRamp2.reverse());

    // create a linear scale based off the data array and assign to the colors array
    const color = d3.scaleThreshold().domain(groups).range(colorRamp);

    // for each threshold, get the color
    const colorBreaks = groups.map((d) => {
      return color(d);
    });

    // combine values and color breaks into an array of objects
    const colorScale = groups
      .map((d, i) => {
        return Object.values({
          density: d,
          color: colorBreaks[i],
        });
      })
      .flat();

    // return an array with the color scale, the groups, and the color breaks
    return [colorScale, groups, colorBreaks];
  }

  /**
   * Utilities- This section contains functions that are used to check if the device is mobile
   * and to round any numbers to a legible number of significant digits
   */

  //   create a function to round the number to a significant digit
  function round(value) {
    if (value < 1) {
      return value.toFixed(2);
    }
    if (value < 10) {
      return Math.round(value * 10) / 10;
    }
    if (value < 100) {
      return Math.round(value);
    }
    if (value < 1000) {
      return Math.round(value / 10) * 10;
    }
    if (value >= 1000) {
      return Math.round(value / 1000) + "k";
    }
  }
}

createMap();
