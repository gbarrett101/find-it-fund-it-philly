mapboxgl.accessToken = "pk.eyJ1IjoiZ2JhcnJldHQxMjMiLCJhIjoiY2w5d3RzN21rMDN1cTN2cWszZGFjZnQ1byJ9.rJLdUzmU35K7oyFMdB0xuw";

async function createMap() {
  const greenIndex = await fetch("./data/index.geojson")
    .then((response) => response.json())
    .catch((error) => console.log(error));

// Index meta-data
compositeMetaData = {"Index Composite Score": {"field": "INDEX_",
                                   "description": "composite metric description"
                                  }
                       }

indexMetaData = {
" Minority":{"field":"I_PCTMIN",
            "description": "Index score for percent minority"},
"Low Income":{"field":"I_LOWINC",
            "description":'Index score for percent low income'},
"Under Age 5":{"field":"I_UNDER5",
            "description":'Index score for percent under age 5'},
"Over Age 64":{"field":"I_OVER64",
            "description":'Index score for percent over age 64'},
"No High School Education":{"field":"I_NOHS",
            "description":'Index score for percent of adults without a high school education'},
"Owner Occupied":{"field":"I_OWNER",
            "description":'Index score for percent owner occupied'},
"Traffic Amount":{"field":"I_TRAFFIC",
            "description":'Index score for traffic amount'},
"Ozone":{"field":"I_OZONE",
            "description":'Index score for ozone'},
"Particular matter":{"field":"I_PM25",
            "description":'Index score for particular matter 2.5'},
"Park Access":{"field":"I_PARKS",
            "description":'Index score for park access'},
"Tree Canopy":{"field":"I_CANOPY",
            "description":'Index score for tree canopy'},
"Playground Access":{"field":"I_PLAY",
            "description":'Index score for playground access'},
"Impervious Cover":{"field":"I_IMP",
            "description":'Index score for impervious cover'},
"Vacant Land":{"field":"I_VACANT",
            "description":'Index score for vacant land'},
}

cityAverageMockIndexData = Object.values(indexMetaData).map(()=>0.5)
cityAverageMockCompositeData = Object.values(compositeMetaData).map(()=>0.5)

indexField = Object.values(indexMetaData).map((metric)=>metric['field'])
indexLabels= Object.keys(indexMetaData)
indexDescriptions = Object.values(indexMetaData).map((metric)=>metric['description'])

compositeField = Object.values(compositeMetaData).map((metric)=>metric['field'])
compositeLabel = Object.keys(compositeMetaData)
compositeDescription = Object.values(compositeMetaData).map((metric)=>metric['description'])

const index = "./data/index.geojson";
function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

// chart settings 

compositeData = {
  labels: compositeLabel,
  datasets: [{
      label: "Selected Area", 
      data: [],
      backgroundColor: "#33A02C",
      color:"#33A02C",
    },
    {
      label: "City Average",
      data: cityAverageMockIndexData
    },
  ]
};

compositeConfig = {
  type: 'horizontalBar',
  data: compositeData,
  options: {
    title: {
      display: true,
      text: 'Green Equity Vulnerability Index',
    },
    tooltips:{
      callbacks:{
        footer: (tooltipItems)=>{ 
          return compositeMetaData[tooltipItems[0].label]["description"];
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
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
    }
  },
};



indexData = {
  labels: indexLabels,
  datasets: [{
      label: "Selected Area", 
      data: [],
      backgroundColor: "#33A02C",
      color:"#33A02C",
    },
    {
      label: "City Average",
      data: cityAverageMockIndexData
    },
  ]
};

indexConfig = {
  type: 'horizontalBar',
  data: indexData,
  options: {
    tooltips:{
      callbacks:{
        footer: (tooltipItems)=>{ 
          return indexMetaData[tooltipItems[0].label]["description"];
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins:{
      title:{
        display: true, 
        text: "Index Score"
      }
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
    }
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

function updateChart(chart, data){
    dataset = chart.data.datasets[0];
    dataset.data = data;
    chart.update();
  }

// Create charts

// temp data
const coordinates = [[-75.16402105283208, 39.933969532091965]]
let selectedPolygon = 10

const compositeElement = document.getElementById("composite");
compositeIndexChart = new Chart(compositeElement,compositeConfig)

const indexElement = document.getElementById("index");
indexChart = new Chart(indexElement,indexConfig)

mapboxgl.accessToken = mapboxgl.accessToken;
const map = new mapboxgl.Map({
  container: "map",
  style:  "mapbox://styles/gbarrett123/cl9wtvsla000114qhvtwye3e1",
  center: [-75.1652, 39.9526,],
  zoom: 12,
  pitch: 0
});
let hoveredId = null; // which block group is hovered
let selectedID = null; // which block group is selected
// once the basemap is loaded, begin to add data sources and layers
map.on("load", () => {

  map.addSource("greenIndex", {
    type: "geojson",
    data: greenIndex,
    'generateId': true, // ensure all features have unique id
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
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0.85
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
      'line-color': [
        'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#000000',
          '#ffffff'
        ],
      'line-width': [
        'case',
          ['boolean', ['feature-state', 'hover'], false],
          2,
          0.5
        ],
      'line-opacity': [
        'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          0
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
          setHoverState(hoveredId, false);
        }
      }
      hoveredId = e.features[0].id;
      setHoverState(hoveredId, true);
      };

      

      // set the cursor to pointer
    map.getCanvas().style.cursor = "pointer";
    const { INDEX_ } = e.features[0].properties;

    hoverPopup
      .setLngLat(e.lngLat)
      .setHTML(
        `<h4>Index Score: ${
          round(INDEX_)
        }</h4>`
      )
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
          setHoverState(hoveredId, false);
        }
        
        }
        hoveredId = null;
  });

  // handling for clicking on the map
  map.on('click', 'greenIndex', (e) => {
    // retrieve block group from click
    const blockGroup = e.features[0].properties;

    if (selectedID !== null) {
      setHoverState(selectedID, false);
    }

    selectedID = e.features[0].id;
    setHoverState(selectedID, true);

    console.log(turf.extent(greenIndex));
    // const bounds = turf.extent(e.features[0])
    const center = turf.center(e.features[0]);

    // map.fitBounds(bounds)
    map.flyTo({
      center: center.geometry.coordinates
      });
    // map.setZoom(15)


    // Update charts 
    // properties = info.object.properties
    compositeIndexData = compositeField.map((value)=>blockGroup[value])
    indexData = indexField.map((value)=>blockGroup[value])

    updateChart(compositeIndexChart,compositeIndexData);
    updateChart(indexChart, indexData);
    // const description = e.features[0].properties.description;
     

    });



  function setHoverState(id, bool) {
    map.setFeatureState(
      { source: 'greenIndex', id: id },
      { hover: bool }
      );

    map.setFeatureState(
      { source: 'greenIndexOutlines', id: id },
      { hover: bool }
    );
  }

});

// limit the search engine boundary extent to greater Boston
const phillyBounds = turf.extent(greenIndex);
 
// Initialize the geocoder aka the search engine
// const popupGeocoder = new MapboxGeocoder({
//   accessToken: mapboxgl.accessToken, // Set the access token
//   mapboxgl: mapboxgl, // Set the mapbox-gl instance
//   placeholder: "Find it popup", //placeholder text for the search bar
//   bbox: phillyBounds, //limit search results to Philadelphia bounds
// });

const mapGeocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  placeholder: "Find it map", //placeholder text for the search bar
  bbox: phillyBounds, //limit search results to Philadelphia bounds
});
 
// Add the geocoder to the map
// map.addControl(popupGeocoder);
map.addControl(mapGeocoder);
// map.removeControl(popupGeocoder)

// for some reason the geocoder does not yet work having two instances
// mapGeocoder.addTo("#addressSearch")
// mapGeocoder.addTo("#charts")





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
