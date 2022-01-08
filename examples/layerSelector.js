// Adapted from: https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/

export default function layerSelector (map, prefix) {
    // Enumerate ids of the layers
    const prefixRegexp = new RegExp(`^${prefix}`);
    const toggleableLayerIds = Object.keys(map.style._layers)
      .filter(name => name.match(prefixRegexp));

    toggleableLayerIds.forEach(layerId => {
        // Make the name nicer
        const layerName = layerId.replace(prefixRegexp, '');

        if (!document.getElementById(layerId)) {

            // Create a link.
            const link = document.createElement('a');
            link.id = layerId;
            link.href = '#';
            link.textContent = layerName,
            link.className = 'active';

            // Show or hide layer when the toggle is clicked.
            link.onclick = function (e) {
                const clickedLayer = this.id;
                e.preventDefault();
                e.stopPropagation();

                const visibility = map.getLayoutProperty(
                    clickedLayer,
                    'visibility'
                );

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility !== 'none') {
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    this.className = '';
                } else {
                    this.className = 'active';
                    map.setLayoutProperty(
                        clickedLayer,
                        'visibility',
                        'visible'
                    );
                }
            };

            const layers = document.getElementById('menu');
            layers.appendChild(link);
        }
    });
};