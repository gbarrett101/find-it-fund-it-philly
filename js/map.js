indexMetrics = {"Minority":"I_PCTMIN",
"Low Income":"I_LOWINC",
"Under Age 5":"I_UNDER5",
"Over Age 64":"I_OVER64",
"No High School Education":"I_NOHS",
"Owner Occupied":"I_OWNER",
"Traffic Amount":"I_TRAFFIC",
"Ozone":"I_OZONE",
"Particular matter":'I_PM25',
"Park access":"I_PARKS",
"Tree canopy":"I_CANOPY",
"Playground Access":"I_PLAY",
"Impervious Cover":"I_IMP",
"Vacant Land":'I_VACANT'}

indexLabels = Object.keys(indexMetrics)
indexValues = Object.values(indexMetrics)

const index = "./data/index.geojson";
function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}


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
    console.log(properties)
    chart.data.datasets.forEach((dataset) => {
      dataset.data = data
      chart.update();
    });
  }

overallIndexData = {
    labels: ["Overall Index Score"],
    datasets: [{
        label: "Score", 
        data: [],
        backgroundColor: "#33A02C",
        color:"#33A02C",
      }]
};

overallIndexConfig = {
  type: 'horizontalBar',
  data: overallIndexData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins:{
      title:{
        display: true, 
        text: "Overall Index Score"
      }
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
        label: "Index Score", 
        data: [],
        backgroundColor: "#33A02C",
        color:"#33A02C",
      }]
};

indexConfig = {
    type: 'horizontalBar',
    data: indexData,
    options: {
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

const overallIndexScore = document.getElementById("overallIndex");
overallIndexChart = new Chart(overallIndexScore,overallIndexConfig)

const indexScore = document.getElementById("index");
indexChart = new Chart(indexScore,indexConfig)

const deckgl = new deck.DeckGL({
    container: "map",
    // Set your Mapbox access token here
    mapboxApiAccessToken:
  "pk.eyJ1IjoiZ2JhcnJldHQxMjMiLCJhIjoiY2w5d3RzN21rMDN1cTN2cWszZGFjZnQ1byJ9.rJLdUzmU35K7oyFMdB0xuw",
    // Set your Mapbox style here
    mapStyle: "mapbox://styles/gbarrett123/cl9wtvsla000114qhvtwye3e1",
    initialViewState: {
      latitude: 39.9526,
      longitude: -75.1652,
      zoom: 12,
      bearing: 0,
      pitch: 0,
    },
    controller: true,

    layers: [
        new deck.GeoJsonLayer({
            id: "index",
            data: index,
            // Styles
            filled: true,
            stroke: false,
            // Function for fill color
            getFillColor: (d) => {
              // Colors range from full white [255,255,255] to dark green [51,160,44]
              const red = map_range(d.properties.INDEX_, 2, 7, 255, 51);
              const green = map_range(d.properties.INDEX_, 2, 7, 255, 160);
              const blue = map_range(d.properties.INDEX_, 2, 7, 255, 44);
              // logic
                // if Index_ isn't null
                  // return a green hue based on how large the index value is
                // otherwise return all 0s with full transparency
              return d.properties.INDEX_
                      ? [red, green, blue, 200]
                      : [0, 0, 0, 100];
              },
            getStrokeColor: [0, 0, 0, 255],
            getLineColor: [0, 0, 0, 255],
            LineWidthUnits: "meters",
            getLineWidth: 10,
            // Interactive props
            pickable: true,
            autoHighlight: true,
            highlightColor: [255, 255, 255, 200],
            onClick: (info) => {
                flyToClick(info.coordinate);
                overallIndexScore.style.opacity = 1;
                indexScore.style.opacity = 1;
                properties = info.object.properties
                overallIndexData = [properties.INDEX_] 
                indexData = indexValues.map((value)=>properties[value])
                updateChart(overallIndexChart,overallIndexData);
                updateChart(indexChart, indexData);
                console.log(properties)
            },
    
        }),
      ],
      
    getTooltip: ({ object }) => {
    return (
        object &&
        `Index Score: ${
        object.properties.INDEX_
            ? object.properties.INDEX_.toFixed(2)
            : "No Data"
        }`
    );
    },

    
});
  