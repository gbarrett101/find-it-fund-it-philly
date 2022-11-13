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
   
const panel = document.getElementById("panel");
const panelChild = document.querySelector("#panel :nth-child(2)");

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
            const abs = Math.abs(d.properties.INDEX_);
            const color = map_range(abs, 0, 7, 0, 255); //lazy remap values to 0-255
            //logic:
                //If HSI_SCORE isn’t null:
                //if less than 0, return something in a blue-hue, otherwise red hue
                //if HSI_Score is null, return color with 0 alpha (transparent)
            return d.properties.INDEX_
                ? d.properties.INDEX_ < 0
                ? [60, 60, color, 0]
                : [color, 60, 72, color + 66]
                : [0, 0, 0, 0];
            },
            getStrokeColor: [0, 0, 0, 255],
            LineWidthUnits: "meters",
            getLineWidth: 35,
            // Interactive props
            pickable: true,
            autoHighlight: true,
            highlightColor: [255, 255, 255, 200],
            onClick: (info) => {
                flyToClick(info.coordinate);
            
                panelChild.innerHTML = 
                    `<strong>Census Tract #${
                        info.object.properties.TRACTCE10
                    }</strong>
                    <br></br>
                    Index SCORE: ${info.object.properties.INDEX_.toFixed(2 || "N/A")} 
                    <br></br>
                    Tree Canopy Score: ${info.object.properties.I_CANOPY.toFixed(2 || "N/A")}
                    <br></br>
                    Vacancy Score: ${info.object.properties.I_VACANT.toFixed(2 || "N/A")}
                    <br></br>
                    Coordinates:
                    ${info.coordinate[0].toFixed(3)},
                    ${info.coordinate[1].toFixed(3)}`;
                panel.style.opacity = 1;
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
  