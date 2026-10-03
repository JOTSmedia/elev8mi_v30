# Earth texture credits

Surface and cloud maps are NASA Blue Marble satellite composites.
NASA Goddard Space Flight Center; imagery by Reto Stöckli, with enhancements
by Robert Simmon. These are historical composites, not live weather.

Source: https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/

Surface: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_8192.png
8192 × 4096 source, resized to a local 4096 × 2048 WebP.
Clouds: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_8192.tif
8192 × 4096 source, resized to a local 4096 × 2048 WebP.

The site projects these global maps onto the entire visible Earth, with a
separate raised cloud shell and a textured rotating atmospheric shell. The
original photograph supplies the space backdrop only once the maps are ready;
no static photographic Earth or atmospheric rim remains. Both WebGL and the
bounded 2D fallback project the complete rotating globe and outer atmosphere.
Cloud and haze advection use an independent weather clock. Axial
rotation takes 360 display seconds (6 minutes). The Earth display year is
7 / 0.4 = 17.5 seconds. The Moon/daylight display cycle takes 24 / 0.7 / 0.4 = 85.714 seconds.
Independent cloud/haze advection uses the presentation clock's rate.
Every fresh visit starts at night with the Moon above Earth; its illuminated
shape still uses the device date and time.
These are artistic display periods, not one common physical time scale.

Desktop and mobile WebGL textures use up to 4096 pixels,
and lower device limits are honored. The 2D fallback samples cached 512 × 256
maps and draws a smaller globe canvas to limit its CPU cost. Reduced motion
uses the original still photographs.

## Google Earth visual reference
https://blog.google/products-and-platforms/products/earth/stars-in-google-earth-mobile/
https://developers.google.com/maps/documentation/earth/see-clouds

Used as a visual reference for the spherical globe, atmospheric rim, stars and
independent cloud layer. Google Earth imagery is not redistributed in this
package. NASA maps and the site’s existing photographs supply the visual assets.
Atmospheric color follows the site’s cinematic lighting clock and camera depth;
it is not location-based live weather or the viewer’s real local sunrise time.
