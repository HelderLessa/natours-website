export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaGVsZGVybGVzc2EiLCJhIjoiY2x0ajM0cDV2MG9idDJycGE5eTZlZWh2ZCJ9.qVOriKU-CnPnxMVm7BckXA';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/helderlessa/cltj3jpq4001y01ph2sef3e4n',
    scrollZoom: false,
    //   center: [-118.115312, 34.108909],
    //   zoom: 10,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
