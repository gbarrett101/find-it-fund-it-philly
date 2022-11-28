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

const compositeElement = document.getElementById("composite");
compositeIndexChart = new Chart(compositeElement,compositeConfig)

const indexElement = document.getElementById("index");
indexChart = new Chart(indexElement,indexConfig)

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

                // Update charts 
                properties = info.object.properties
                compositeIndexData = compositeField.map((value)=>properties[value])

                indexData = indexField.map((value)=>properties[value])

                updateChart(compositeIndexChart,compositeIndexData);
                updateChart(indexChart, indexData);
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
  