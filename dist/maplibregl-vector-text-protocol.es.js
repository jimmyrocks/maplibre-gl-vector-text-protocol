function _mergeNamespaces(n, m) {
	m.forEach(function (e) {
		e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
			if (k !== 'default' && !(k in n)) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	});
	return Object.freeze(n);
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var d3Dsv = {exports: {}};

(function (module, exports) {
// https://d3js.org/d3-dsv/ Version 1.0.1. Copyright 2016 Mike Bostock.
(function (global, factory) {
  factory(exports) ;
}(commonjsGlobal, function (exports) {
  function objectConverter(columns) {
    return new Function("d", "return {" + columns.map(function(name, i) {
      return JSON.stringify(name) + ": d[" + i + "]";
    }).join(",") + "}");
  }

  function customConverter(columns, f) {
    var object = objectConverter(columns);
    return function(row, i) {
      return f(object(row), i, columns);
    };
  }

  // Compute unique columns in order of discovery.
  function inferColumns(rows) {
    var columnSet = Object.create(null),
        columns = [];

    rows.forEach(function(row) {
      for (var column in row) {
        if (!(column in columnSet)) {
          columns.push(columnSet[column] = column);
        }
      }
    });

    return columns;
  }

  function dsv(delimiter) {
    var reFormat = new RegExp("[\"" + delimiter + "\n]"),
        delimiterCode = delimiter.charCodeAt(0);

    function parse(text, f) {
      var convert, columns, rows = parseRows(text, function(row, i) {
        if (convert) return convert(row, i - 1);
        columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
      });
      rows.columns = columns;
      return rows;
    }

    function parseRows(text, f) {
      var EOL = {}, // sentinel value for end-of-line
          EOF = {}, // sentinel value for end-of-file
          rows = [], // output rows
          N = text.length,
          I = 0, // current character index
          n = 0, // the current line number
          t, // the current token
          eol; // is the current token followed by EOL?

      function token() {
        if (I >= N) return EOF; // special case: end of file
        if (eol) return eol = false, EOL; // special case: end of line

        // special case: quotes
        var j = I, c;
        if (text.charCodeAt(j) === 34) {
          var i = j;
          while (i++ < N) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) break;
              ++i;
            }
          }
          I = i + 2;
          c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) ++I;
          } else if (c === 10) {
            eol = true;
          }
          return text.slice(j + 1, i).replace(/""/g, "\"");
        }

        // common case: find next delimiter or newline
        while (I < N) {
          var k = 1;
          c = text.charCodeAt(I++);
          if (c === 10) eol = true; // \n
          else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \r|\r\n
          else if (c !== delimiterCode) continue;
          return text.slice(j, I - k);
        }

        // special case: last token before EOF
        return text.slice(j);
      }

      while ((t = token()) !== EOF) {
        var a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && (a = f(a, n++)) == null) continue;
        rows.push(a);
      }

      return rows;
    }

    function format(rows, columns) {
      if (columns == null) columns = inferColumns(rows);
      return [columns.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
        return columns.map(function(column) {
          return formatValue(row[column]);
        }).join(delimiter);
      })).join("\n");
    }

    function formatRows(rows) {
      return rows.map(formatRow).join("\n");
    }

    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }

    function formatValue(text) {
      return text == null ? ""
          : reFormat.test(text += "") ? "\"" + text.replace(/\"/g, "\"\"") + "\""
          : text;
    }

    return {
      parse: parse,
      parseRows: parseRows,
      format: format,
      formatRows: formatRows
    };
  }

  var csv = dsv(",");

  var csvParse = csv.parse;
  var csvParseRows = csv.parseRows;
  var csvFormat = csv.format;
  var csvFormatRows = csv.formatRows;

  var tsv = dsv("\t");

  var tsvParse = tsv.parse;
  var tsvParseRows = tsv.parseRows;
  var tsvFormat = tsv.format;
  var tsvFormatRows = tsv.formatRows;

  exports.dsvFormat = dsv;
  exports.csvParse = csvParse;
  exports.csvParseRows = csvParseRows;
  exports.csvFormat = csvFormat;
  exports.csvFormatRows = csvFormatRows;
  exports.tsvParse = tsvParse;
  exports.tsvParseRows = tsvParseRows;
  exports.tsvFormat = tsvFormat;
  exports.tsvFormatRows = tsvFormatRows;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
}(d3Dsv, d3Dsv.exports));

var sexagesimal$1 = {exports: {}};

sexagesimal$1.exports = element;
sexagesimal$1.exports.pair = pair;
sexagesimal$1.exports.format = format;
sexagesimal$1.exports.formatPair = formatPair;
sexagesimal$1.exports.coordToDMS = coordToDMS;


function element(input, dims) {
  var result = search(input, dims);
  return (result === null) ? null : result.val;
}


function formatPair(input) {
  return format(input.lat, 'lat') + ' ' + format(input.lon, 'lon');
}


// Is 0 North or South?
function format(input, dim) {
  var dms = coordToDMS(input, dim);
  return dms.whole + '° ' +
    (dms.minutes ? dms.minutes + '\' ' : '') +
    (dms.seconds ? dms.seconds + '" ' : '') + dms.dir;
}


function coordToDMS(input, dim) {
  var dirs = { lat: ['N', 'S'], lon: ['E', 'W'] }[dim] || '';
  var dir = dirs[input >= 0 ? 0 : 1];
  var abs = Math.abs(input);
  var whole = Math.floor(abs);
  var fraction = abs - whole;
  var fractionMinutes = fraction * 60;
  var minutes = Math.floor(fractionMinutes);
  var seconds = Math.floor((fractionMinutes - minutes) * 60);

  return {
    whole: whole,
    minutes: minutes,
    seconds: seconds,
    dir: dir
  };
}


function search(input, dims) {
  if (!dims) dims = 'NSEW';
  if (typeof input !== 'string') return null;

  input = input.toUpperCase();
  var regex = /^[\s\,]*([NSEW])?\s*([\-|\—|\―]?[0-9.]+)[°º˚]?\s*(?:([0-9.]+)['’′‘]\s*)?(?:([0-9.]+)(?:''|"|”|″)\s*)?([NSEW])?/;

  var m = input.match(regex);
  if (!m) return null;  // no match

  var matched = m[0];

  // extract dimension.. m[1] = leading, m[5] = trailing
  var dim;
  if (m[1] && m[5]) {                 // if matched both..
    dim = m[1];                       // keep leading
    matched = matched.slice(0, -1);   // remove trailing dimension from match
  } else {
    dim = m[1] || m[5];
  }

  // if unrecognized dimension
  if (dim && dims.indexOf(dim) === -1) return null;

  // extract DMS
  var deg = m[2] ? parseFloat(m[2]) : 0;
  var min = m[3] ? parseFloat(m[3]) / 60 : 0;
  var sec = m[4] ? parseFloat(m[4]) / 3600 : 0;
  var sign = (deg < 0) ? -1 : 1;
  if (dim === 'S' || dim === 'W') sign *= -1;

  return {
    val: (Math.abs(deg) + min + sec) * sign,
    dim: dim,
    matched: matched,
    remain: input.slice(matched.length)
  };
}


function pair(input, dims) {
  input = input.trim();
  var one = search(input, dims);
  if (!one) return null;

  input = one.remain.trim();
  var two = search(input, dims);
  if (!two || two.remain) return null;

  if (one.dim) {
    return swapdim(one.val, two.val, one.dim);
  } else {
    return [one.val, two.val];
  }
}


function swapdim(a, b, dim) {
  if (dim === 'N' || dim === 'S') return [a, b];
  if (dim === 'W' || dim === 'E') return [b, a];
}

var dsv = d3Dsv.exports,
    sexagesimal = sexagesimal$1.exports;

var latRegex = /(Lat)(itude)?/gi,
    lonRegex = /(L)(on|ng)(gitude)?/i;

function guessHeader(row, regexp) {
    var name, match, score;
    for (var f in row) {
        match = f.match(regexp);
        if (match && (!name || match[0].length / f.length > score)) {
            score = match[0].length / f.length;
            name = f;
        }
    }
    return name;
}

function guessLatHeader(row) { return guessHeader(row, latRegex); }
function guessLonHeader(row) { return guessHeader(row, lonRegex); }

function isLat(f) { return !!f.match(latRegex); }
function isLon(f) { return !!f.match(lonRegex); }

function keyCount(o) {
    return (typeof o == 'object') ? Object.keys(o).length : 0;
}

function autoDelimiter(x) {
    var delimiters = [',', ';', '\t', '|'];
    var results = [];

    delimiters.forEach(function (delimiter) {
        var res = dsv.dsvFormat(delimiter).parse(x);
        if (res.length >= 1) {
            var count = keyCount(res[0]);
            for (var i = 0; i < res.length; i++) {
                if (keyCount(res[i]) !== count) return;
            }
            results.push({
                delimiter: delimiter,
                arity: Object.keys(res[0]).length,
            });
        }
    });

    if (results.length) {
        return results.sort(function (a, b) {
            return b.arity - a.arity;
        })[0].delimiter;
    } else {
        return null;
    }
}

/**
 * Silly stopgap for dsv to d3-dsv upgrade
 *
 * @param {Array} x dsv output
 * @returns {Array} array without columns member
 */
function deleteColumns(x) {
    delete x.columns;
    return x;
}

function auto(x) {
    var delimiter = autoDelimiter(x);
    if (!delimiter) return null;
    return deleteColumns(dsv.dsvFormat(delimiter).parse(x));
}

function csv2geojson(x, options, callback) {

    if (!callback) {
        callback = options;
        options = {};
    }

    options.delimiter = options.delimiter || ',';

    var latfield = options.latfield || '',
        lonfield = options.lonfield || '',
        crs = options.crs || '';

    var features = [],
        featurecollection = {type: 'FeatureCollection', features: features};

    if (crs !== '') {
        featurecollection.crs = {type: 'name', properties: {name: crs}};
    }

    if (options.delimiter === 'auto' && typeof x == 'string') {
        options.delimiter = autoDelimiter(x);
        if (!options.delimiter) {
            callback({
                type: 'Error',
                message: 'Could not autodetect delimiter'
            });
            return;
        }
    }

    var numericFields = options.numericFields ? options.numericFields.split(',') : null;

    var parsed = (typeof x == 'string') ?
        dsv.dsvFormat(options.delimiter).parse(x, function (d) {
            if (numericFields) {
                for (var key in d) {
                    if (numericFields.includes(key)) {
                        d[key] = +d[key];
                    }
                }
            }
            return d;
        }) : x;

    if (!parsed.length) {
        callback(null, featurecollection);
        return;
    }

    var errors = [];
    var i;


    if (!latfield) latfield = guessLatHeader(parsed[0]);
    if (!lonfield) lonfield = guessLonHeader(parsed[0]);
    var noGeometry = (!latfield || !lonfield);

    if (noGeometry) {
        for (i = 0; i < parsed.length; i++) {
            features.push({
                type: 'Feature',
                properties: parsed[i],
                geometry: null
            });
        }
        callback(errors.length ? errors : null, featurecollection);
        return;
    }

    for (i = 0; i < parsed.length; i++) {
        if (parsed[i][lonfield] !== undefined &&
            parsed[i][latfield] !== undefined) {

            var lonk = parsed[i][lonfield],
                latk = parsed[i][latfield],
                lonf, latf,
                a;

            a = sexagesimal(lonk, 'EW');
            if (a) lonk = a;
            a = sexagesimal(latk, 'NS');
            if (a) latk = a;

            lonf = parseFloat(lonk);
            latf = parseFloat(latk);

            if (isNaN(lonf) ||
                isNaN(latf)) {
                errors.push({
                    message: 'A row contained an invalid value for latitude or longitude',
                    row: parsed[i],
                    index: i
                });
            } else {
                if (!options.includeLatLon) {
                    delete parsed[i][lonfield];
                    delete parsed[i][latfield];
                }

                features.push({
                    type: 'Feature',
                    properties: parsed[i],
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(lonf),
                            parseFloat(latf)
                        ]
                    }
                });
            }
        }
    }

    callback(errors.length ? errors : null, featurecollection);
}

function toLine(gj) {
    var features = gj.features;
    var line = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: []
        }
    };
    for (var i = 0; i < features.length; i++) {
        line.geometry.coordinates.push(features[i].geometry.coordinates);
    }
    line.properties = features.reduce(function (aggregatedProperties, newFeature) {
        for (var key in newFeature.properties) {
            if (!aggregatedProperties[key]) {
                aggregatedProperties[key] = [];
            }
            aggregatedProperties[key].push(newFeature.properties[key]);
        }
        return aggregatedProperties;
    }, {});
    return {
        type: 'FeatureCollection',
        features: [line]
    };
}

function toPolygon(gj) {
    var features = gj.features;
    var poly = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[]]
        }
    };
    for (var i = 0; i < features.length; i++) {
        poly.geometry.coordinates[0].push(features[i].geometry.coordinates);
    }
    poly.properties = features.reduce(function (aggregatedProperties, newFeature) {
        for (var key in newFeature.properties) {
            if (!aggregatedProperties[key]) {
                aggregatedProperties[key] = [];
            }
            aggregatedProperties[key].push(newFeature.properties[key]);
        }
        return aggregatedProperties;
    }, {});
    return {
        type: 'FeatureCollection',
        features: [poly]
    };
}

var csv2geojson_1 = {
    isLon: isLon,
    isLat: isLat,
    guessLatHeader: guessLatHeader,
    guessLonHeader: guessLonHeader,
    csv: dsv.csvParse,
    tsv: dsv.tsvParse,
    dsv: dsv,
    auto: auto,
    csv2geojson: csv2geojson,
    toLine: toLine,
    toPolygon: toPolygon
};

function identity(x) {
  return x;
}

function transform(transform) {
  if (transform == null) return identity;
  var x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(input, i) {
    if (!i) x0 = y0 = 0;
    var j = 2, n = input.length, output = new Array(n);
    output[0] = (x0 += input[0]) * kx + dx;
    output[1] = (y0 += input[1]) * ky + dy;
    while (j < n) output[j] = input[j], ++j;
    return output;
  };
}

function reverse(array, n) {
  var t, j = array.length, i = j - n;
  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
}

function topojsonFeature(topology, o) {
  if (typeof o === "string") o = topology.objects[o];
  return o.type === "GeometryCollection"
      ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature(topology, o); })}
      : feature(topology, o);
}

function feature(topology, o) {
  var id = o.id,
      bbox = o.bbox,
      properties = o.properties == null ? {} : o.properties,
      geometry = object(topology, o);
  return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
      : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
      : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
}

function object(topology, o) {
  var transformPoint = transform(topology.transform),
      arcs = topology.arcs;

  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k], k));
    }
    if (i < 0) reverse(points, n);
  }

  function point(p) {
    return transformPoint(p);
  }

  function line(arcs) {
    var points = [];
    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
    if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
    return points;
  }

  function ring(arcs) {
    var points = line(arcs);
    while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
    return points;
  }

  function polygon(arcs) {
    return arcs.map(ring);
  }

  function geometry(o) {
    var type = o.type, coordinates;
    switch (type) {
      case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
      case "Point": coordinates = point(o.coordinates); break;
      case "MultiPoint": coordinates = o.coordinates.map(point); break;
      case "LineString": coordinates = line(o.arcs); break;
      case "MultiLineString": coordinates = o.arcs.map(line); break;
      case "Polygon": coordinates = polygon(o.arcs); break;
      case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
      default: return null;
    }
    return {type: type, coordinates: coordinates};
  }

  return geometry(o);
}

var togeojson = {};

Object.defineProperty(togeojson, '__esModule', { value: true });

// cast array x into numbers
// get the content of a text node, if any
function nodeVal(x) {
  if (x && x.normalize) {
    x.normalize();
  }
  return (x && x.textContent) || "";
}

// one Y child of X, if any, otherwise null
function get1(x, y) {
  const n = x.getElementsByTagName(y);
  return n.length ? n[0] : null;
}

function getLineStyle(extensions) {
  const style = {};
  if (extensions) {
    const lineStyle = get1(extensions, "line");
    if (lineStyle) {
      const color = nodeVal(get1(lineStyle, "color")),
        opacity = parseFloat(nodeVal(get1(lineStyle, "opacity"))),
        width = parseFloat(nodeVal(get1(lineStyle, "width")));
      if (color) style.stroke = color;
      if (!isNaN(opacity)) style["stroke-opacity"] = opacity;
      // GPX width is in mm, convert to px with 96 px per inch
      if (!isNaN(width)) style["stroke-width"] = (width * 96) / 25.4;
    }
  }
  return style;
}

// get the contents of multiple text nodes, if present
function getMulti(x, ys) {
  const o = {};
  let n;
  let k;
  for (k = 0; k < ys.length; k++) {
    n = get1(x, ys[k]);
    if (n) o[ys[k]] = nodeVal(n);
  }
  return o;
}
function getProperties$1(node) {
  const prop = getMulti(node, [
    "name",
    "cmt",
    "desc",
    "type",
    "time",
    "keywords",
  ]);
  // Parse additional data from our Garmin extension(s)
  const extensions = node.getElementsByTagNameNS(
    "http://www.garmin.com/xmlschemas/GpxExtensions/v3",
    "*"
  );
  for (let i = 0; i < extensions.length; i++) {
    const extension = extensions[i];
    // Ignore nested extensions, like those on routepoints or trackpoints
    if (extension.parentNode.parentNode === node) {
      prop[extension.tagName.replace(":", "_")] = nodeVal(extension);
    }
  }
  const links = node.getElementsByTagName("link");
  if (links.length) prop.links = [];
  for (let i = 0; i < links.length; i++) {
    prop.links.push(
      Object.assign(
        { href: links[i].getAttribute("href") },
        getMulti(links[i], ["text", "type"])
      )
    );
  }
  return prop;
}

function coordPair$1(x) {
  const ll = [
    parseFloat(x.getAttribute("lon")),
    parseFloat(x.getAttribute("lat")),
  ];
  const ele = get1(x, "ele");
  // handle namespaced attribute in browser
  const heart = get1(x, "gpxtpx:hr") || get1(x, "hr");
  const time = get1(x, "time");
  let e;
  if (ele) {
    e = parseFloat(nodeVal(ele));
    if (!isNaN(e)) {
      ll.push(e);
    }
  }
  const result = {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    extendedValues: [],
  };

  if (heart) {
    result.extendedValues.push(["heart", parseFloat(nodeVal(heart))]);
  }

  const extensions = get1(x, "extensions");
  if (extensions !== null) {
    for (const name of ["speed", "course", "hAcc", "vAcc"]) {
      const v = parseFloat(nodeVal(get1(extensions, name)));
      if (!isNaN(v)) {
        result.extendedValues.push([name, v]);
      }
    }
  }
  return result;
}
function getRoute(node) {
  const line = getPoints$1(node, "rtept");
  if (!line) return;
  return {
    type: "Feature",
    properties: Object.assign(
      getProperties$1(node),
      getLineStyle(get1(node, "extensions")),
      { _gpxType: "rte" }
    ),
    geometry: {
      type: "LineString",
      coordinates: line.line,
    },
  };
}

function getPoints$1(node, pointname) {
  const pts = node.getElementsByTagName(pointname);
  if (pts.length < 2) return; // Invalid line in GeoJSON

  const line = [];
  const times = [];
  const extendedValues = {};
  for (let i = 0; i < pts.length; i++) {
    const c = coordPair$1(pts[i]);
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    for (let j = 0; j < c.extendedValues.length; j++) {
      const [name, val] = c.extendedValues[j];
      const plural = name === "heart" ? name : name + "s";
      if (!extendedValues[plural]) {
        extendedValues[plural] = Array(pts.length).fill(null);
      }
      extendedValues[plural][i] = val;
    }
  }
  return {
    line: line,
    times: times,
    extendedValues: extendedValues,
  };
}

function getTrack(node) {
  const segments = node.getElementsByTagName("trkseg");
  const track = [];
  const times = [];
  const extractedLines = [];

  for (let i = 0; i < segments.length; i++) {
    const line = getPoints$1(segments[i], "trkpt");
    if (line) {
      extractedLines.push(line);
      if (line.times && line.times.length) times.push(line.times);
    }
  }

  if (extractedLines.length === 0) return;

  const multi = extractedLines.length > 1;

  const properties = Object.assign(
    getProperties$1(node),
    getLineStyle(get1(node, "extensions")),
    { _gpxType: "trk" },
    times.length
      ? {
          coordinateProperties: {
            times: multi ? times : times[0],
          }
        }
      : {}
  );

  for (let i = 0; i < extractedLines.length; i++) {
    const line = extractedLines[i];
    track.push(line.line);
    for (const [name, val] of Object.entries(line.extendedValues)) {
      let props = properties;
      if (name === "heart") {
        if (!properties.coordinateProperties) {
          properties.coordinateProperties = {};
        }
        props = properties.coordinateProperties;
      }
      if (multi) {
        if (!props[name])
          props[name] = extractedLines.map((line) =>
            new Array(line.line.length).fill(null)
          );
        props[name][i] = val;
      } else {
        props[name] = val;
      }
    }
  }

  return {
    type: "Feature",
    properties: properties,
    geometry: multi
      ? {
        type: "MultiLineString",
        coordinates: track,
      }
      : {
        type: "LineString",
        coordinates: track[0],
      },
  };
}

function getPoint(node) {
  return {
    type: "Feature",
    properties: Object.assign(getProperties$1(node), getMulti(node, ["sym"])),
    geometry: {
      type: "Point",
      coordinates: coordPair$1(node).coordinates,
    },
  };
}

function* gpxGen(doc) {
  const tracks = doc.getElementsByTagName("trk");
  const routes = doc.getElementsByTagName("rte");
  const waypoints = doc.getElementsByTagName("wpt");

  for (let i = 0; i < tracks.length; i++) {
    const feature = getTrack(tracks[i]);
    if (feature) yield feature;
  }
  for (let i = 0; i < routes.length; i++) {
    const feature = getRoute(routes[i]);
    if (feature) yield feature;
  }
  for (let i = 0; i < waypoints.length; i++) {
    yield getPoint(waypoints[i]);
  }
}

function gpx(doc) {
  return {
    type: "FeatureCollection",
    features: Array.from(gpxGen(doc)),
  };
}

const EXTENSIONS_NS = "http://www.garmin.com/xmlschemas/ActivityExtension/v2";

const TRACKPOINT_ATTRIBUTES = [
  ["heartRate", "heartRates"],
  ["Cadence", "cadences"],
  // Extended Trackpoint attributes
  ["Speed", "speeds"],
  ["Watts", "watts"],
];

const LAP_ATTRIBUTES = [
  ["TotalTimeSeconds", "totalTimeSeconds"],
  ["DistanceMeters", "distanceMeters"],
  ["MaximumSpeed", "maxSpeed"],
  ["AverageHeartRateBpm", "avgHeartRate"],
  ["MaximumHeartRateBpm", "maxHeartRate"],

  // Extended Lap attributes
  ["AvgSpeed", "avgSpeed"],
  ["AvgWatts", "avgWatts"],
  ["MaxWatts", "maxWatts"],
];

function fromEntries(arr) {
  const obj = {};
  for (const [key, value] of arr) {
    obj[key] = value;
  }
  return obj;
}

function getProperties(node, attributeNames) {
  const properties = [];

  for (const [tag, alias] of attributeNames) {
    let elem = get1(node, tag);
    if (!elem) {
      const elements = node.getElementsByTagNameNS(EXTENSIONS_NS, tag);
      if (elements.length) {
        elem = elements[0];
      }
    }
    const val = parseFloat(nodeVal(elem));
    if (!isNaN(val)) {
      properties.push([alias, val]);
    }
  }

  return properties;
}

function coordPair(x) {
  const lon = nodeVal(get1(x, "LongitudeDegrees"));
  const lat = nodeVal(get1(x, "LatitudeDegrees"));
  if (!lon.length || !lat.length) {
    return null;
  }
  const ll = [parseFloat(lon), parseFloat(lat)];
  const alt = get1(x, "AltitudeMeters");
  const heartRate = get1(x, "HeartRateBpm");
  const time = get1(x, "Time");
  let a;
  if (alt) {
    a = parseFloat(nodeVal(alt));
    if (!isNaN(a)) {
      ll.push(a);
    }
  }
  return {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null,
    extensions: getProperties(x, TRACKPOINT_ATTRIBUTES),
  };
}

function getPoints(node, pointname) {
  const pts = node.getElementsByTagName(pointname);
  const line = [];
  const times = [];
  const heartRates = [];
  if (pts.length < 2) return null; // Invalid line in GeoJSON
  const result = { extendedProperties: {} };
  for (let i = 0; i < pts.length; i++) {
    const c = coordPair(pts[i]);
    if (c === null) continue;
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    if (c.heartRate) heartRates.push(c.heartRate);
    for (const [alias, value] of c.extensions) {
      if (!result.extendedProperties[alias]) {
        result.extendedProperties[alias] = Array(pts.length).fill(null);
      }
      result.extendedProperties[alias][i] = value;
    }
  }
  return Object.assign(result, {
    line: line,
    times: times,
    heartRates: heartRates,
  });
}

function getLap(node) {
  const segments = node.getElementsByTagName("Track");
  const track = [];
  const times = [];
  const heartRates = [];
  const allExtendedProperties = [];
  let line;
  const properties = fromEntries(getProperties(node, LAP_ATTRIBUTES));

  const nameElement = get1(node, 'Name');
  if (nameElement) {
    properties.name = nodeVal(nameElement);
  }

  for (let i = 0; i < segments.length; i++) {
    line = getPoints(segments[i], "Trackpoint");
    if (line) {
      track.push(line.line);
      if (line.times.length) times.push(line.times);
      if (line.heartRates.length) heartRates.push(line.heartRates);
      allExtendedProperties.push(line.extendedProperties);
    }
  }
  for (let i = 0; i < allExtendedProperties.length; i++) {
    const extendedProperties = allExtendedProperties[i];
    for (const property in extendedProperties) {
      if (segments.length === 1) {
        properties[property] = line.extendedProperties[property];
      } else {
        if (!properties[property]) {
          properties[property] = track.map((track) =>
            Array(track.length).fill(null)
          );
        }
        properties[property][i] = extendedProperties[property];
      }
    }
  }
  if (track.length === 0) return;

  if (times.length || heartRates.length) {
    properties.coordinateProperties = Object.assign(
      times.length
        ? {
            times: track.length === 1 ? times[0] : times,
          }
        : {},
      heartRates.length
        ? {
            heart: track.length === 1 ? heartRates[0] : heartRates,
          }
        : {}
    );
  }

  return {
    type: "Feature",
    properties: properties,
    geometry: {
      type: track.length === 1 ? "LineString" : "MultiLineString",
      coordinates: track.length === 1 ? track[0] : track,
    },
  };
}

function* tcxGen(doc) {
  const laps = doc.getElementsByTagName("Lap");

  for (let i = 0; i < laps.length; i++) {
    const feature = getLap(laps[i]);
    if (feature) yield feature;
  }

  const courses = doc.getElementsByTagName("Courses");

  for (let i = 0; i < courses.length; i++) {
    const feature = getLap(courses[i]);
    if (feature) yield feature;
  }
}

function tcx(doc) {
  return {
    type: "FeatureCollection",
    features: Array.from(tcxGen(doc)),
  };
}

const removeSpace = /\s*/g;
const trimSpace = /^\s*|\s*$/g;
const splitSpace = /\s+/;

// generate a short, numeric hash of a string
function okhash(x) {
  if (!x || !x.length) return 0;
  let h = 0;
  for (let i = 0; i < x.length; i++) {
    h = ((h << 5) - h + x.charCodeAt(i)) | 0;
  }
  return h;
}

// get one coordinate from a coordinate array, if any
function coord1(v) {
  return v.replace(removeSpace, "").split(",").map(parseFloat);
}

// get all coordinates from a coordinate array as [[],[]]
function coord(v) {
  return v.replace(trimSpace, "").split(splitSpace).map(coord1);
}

function xml2str(node) {
  if (node.xml !== undefined) return node.xml;
  if (node.tagName) {
    let output = node.tagName;
    for (let i = 0; i < node.attributes.length; i++) {
      output += node.attributes[i].name + node.attributes[i].value;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      output += xml2str(node.childNodes[i]);
    }
    return output;
  }
  if (node.nodeName === "#text") {
    return (node.nodeValue || node.value || "").trim();
  }
  if (node.nodeName === "#cdata-section") {
    return node.nodeValue;
  }
  return "";
}

const geotypes = ["Polygon", "LineString", "Point", "Track", "gx:Track"];

function kmlColor(properties, elem, prefix) {
  let v = nodeVal(get1(elem, "color")) || "";
  const colorProp =
    prefix == "stroke" || prefix === "fill" ? prefix : prefix + "-color";
  if (v.substr(0, 1) === "#") {
    v = v.substr(1);
  }
  if (v.length === 6 || v.length === 3) {
    properties[colorProp] = v;
  } else if (v.length === 8) {
    properties[prefix + "-opacity"] = parseInt(v.substr(0, 2), 16) / 255;
    properties[colorProp] =
      "#" + v.substr(6, 2) + v.substr(4, 2) + v.substr(2, 2);
  }
}

function numericProperty(properties, elem, source, target) {
  const val = parseFloat(nodeVal(get1(elem, source)));
  if (!isNaN(val)) properties[target] = val;
}

function gxCoords(root) {
  let elems = root.getElementsByTagName("coord");
  const coords = [];
  const times = [];
  if (elems.length === 0) elems = root.getElementsByTagName("gx:coord");
  for (let i = 0; i < elems.length; i++) {
    coords.push(nodeVal(elems[i]).split(" ").map(parseFloat));
  }
  const timeElems = root.getElementsByTagName("when");
  for (let j = 0; j < timeElems.length; j++) times.push(nodeVal(timeElems[j]));
  return {
    coords: coords,
    times: times,
  };
}

function getGeometry(root) {
  let geomNode;
  let geomNodes;
  let i;
  let j;
  let k;
  const geoms = [];
  const coordTimes = [];
  if (get1(root, "MultiGeometry")) {
    return getGeometry(get1(root, "MultiGeometry"));
  }
  if (get1(root, "MultiTrack")) {
    return getGeometry(get1(root, "MultiTrack"));
  }
  if (get1(root, "gx:MultiTrack")) {
    return getGeometry(get1(root, "gx:MultiTrack"));
  }
  for (i = 0; i < geotypes.length; i++) {
    geomNodes = root.getElementsByTagName(geotypes[i]);
    if (geomNodes) {
      for (j = 0; j < geomNodes.length; j++) {
        geomNode = geomNodes[j];
        if (geotypes[i] === "Point") {
          geoms.push({
            type: "Point",
            coordinates: coord1(nodeVal(get1(geomNode, "coordinates"))),
          });
        } else if (geotypes[i] === "LineString") {
          geoms.push({
            type: "LineString",
            coordinates: coord(nodeVal(get1(geomNode, "coordinates"))),
          });
        } else if (geotypes[i] === "Polygon") {
          const rings = geomNode.getElementsByTagName("LinearRing"),
            coords = [];
          for (k = 0; k < rings.length; k++) {
            coords.push(coord(nodeVal(get1(rings[k], "coordinates"))));
          }
          geoms.push({
            type: "Polygon",
            coordinates: coords,
          });
        } else if (geotypes[i] === "Track" || geotypes[i] === "gx:Track") {
          const track = gxCoords(geomNode);
          geoms.push({
            type: "LineString",
            coordinates: track.coords,
          });
          if (track.times.length) coordTimes.push(track.times);
        }
      }
    }
  }
  return {
    geoms: geoms,
    coordTimes: coordTimes,
  };
}

function getPlacemark(root, styleIndex, styleMapIndex, styleByHash) {
  const geomsAndTimes = getGeometry(root);
  let i;
  const properties = {};
  const name = nodeVal(get1(root, "name"));
  const address = nodeVal(get1(root, "address"));
  let styleUrl = nodeVal(get1(root, "styleUrl"));
  const description = nodeVal(get1(root, "description"));
  const timeSpan = get1(root, "TimeSpan");
  const timeStamp = get1(root, "TimeStamp");
  const extendedData = get1(root, "ExtendedData");
  let iconStyle = get1(root, "IconStyle");
  let labelStyle = get1(root, "LabelStyle");
  let lineStyle = get1(root, "LineStyle");
  let polyStyle = get1(root, "PolyStyle");
  const visibility = get1(root, "visibility");

  if (name) properties.name = name;
  if (address) properties.address = address;
  if (styleUrl) {
    if (styleUrl[0] !== "#") {
      styleUrl = "#" + styleUrl;
    }

    properties.styleUrl = styleUrl;
    if (styleIndex[styleUrl]) {
      properties.styleHash = styleIndex[styleUrl];
    }
    if (styleMapIndex[styleUrl]) {
      properties.styleMapHash = styleMapIndex[styleUrl];
      properties.styleHash = styleIndex[styleMapIndex[styleUrl].normal];
    }
    // Try to populate the lineStyle or polyStyle since we got the style hash
    const style = styleByHash[properties.styleHash];
    if (style) {
      if (!iconStyle) iconStyle = get1(style, "IconStyle");
      if (!labelStyle) labelStyle = get1(style, "LabelStyle");
      if (!lineStyle) lineStyle = get1(style, "LineStyle");
      if (!polyStyle) polyStyle = get1(style, "PolyStyle");
    }
  }
  if (description) properties.description = description;
  if (timeSpan) {
    const begin = nodeVal(get1(timeSpan, "begin"));
    const end = nodeVal(get1(timeSpan, "end"));
    properties.timespan = { begin: begin, end: end };
  }
  if (timeStamp) {
    properties.timestamp = nodeVal(get1(timeStamp, "when"));
  }
  if (iconStyle) {
    kmlColor(properties, iconStyle, "icon");
    numericProperty(properties, iconStyle, "scale", "icon-scale");
    numericProperty(properties, iconStyle, "heading", "icon-heading");

    const hotspot = get1(iconStyle, "hotSpot");
    if (hotspot) {
      const left = parseFloat(hotspot.getAttribute("x"));
      const top = parseFloat(hotspot.getAttribute("y"));
      if (!isNaN(left) && !isNaN(top)) properties["icon-offset"] = [left, top];
    }
    const icon = get1(iconStyle, "Icon");
    if (icon) {
      const href = nodeVal(get1(icon, "href"));
      if (href) properties.icon = href;
    }
  }
  if (labelStyle) {
    kmlColor(properties, labelStyle, "label");
    numericProperty(properties, labelStyle, "scale", "label-scale");
  }
  if (lineStyle) {
    kmlColor(properties, lineStyle, "stroke");
    numericProperty(properties, lineStyle, "width", "stroke-width");
  }
  if (polyStyle) {
    kmlColor(properties, polyStyle, "fill");
    const fill = nodeVal(get1(polyStyle, "fill"));
    const outline = nodeVal(get1(polyStyle, "outline"));
    if (fill)
      properties["fill-opacity"] =
        fill === "1" ? properties["fill-opacity"] || 1 : 0;
    if (outline)
      properties["stroke-opacity"] =
        outline === "1" ? properties["stroke-opacity"] || 1 : 0;
  }
  if (extendedData) {
    const datas = extendedData.getElementsByTagName("Data"),
      simpleDatas = extendedData.getElementsByTagName("SimpleData");

    for (i = 0; i < datas.length; i++) {
      properties[datas[i].getAttribute("name")] = nodeVal(
        get1(datas[i], "value")
      );
    }
    for (i = 0; i < simpleDatas.length; i++) {
      properties[simpleDatas[i].getAttribute("name")] = nodeVal(simpleDatas[i]);
    }
  }
  if (visibility) {
    properties.visibility = nodeVal(visibility);
  }
  if (geomsAndTimes.coordTimes.length) {
    properties.coordinateProperties = {
      times: geomsAndTimes.coordTimes.length === 1
        ? geomsAndTimes.coordTimes[0]
        : geomsAndTimes.coordTimes
    };
  }
  const feature = {
    type: "Feature",
    geometry:
      geomsAndTimes.geoms.length === 0
        ? null
        : geomsAndTimes.geoms.length === 1
        ? geomsAndTimes.geoms[0]
        : {
            type: "GeometryCollection",
            geometries: geomsAndTimes.geoms,
          },
    properties: properties,
  };
  if (root.getAttribute("id")) feature.id = root.getAttribute("id");
  return feature;
}

function* kmlGen(doc) {
  // styleindex keeps track of hashed styles in order to match feature
  const styleIndex = {};
  const styleByHash = {};
  // stylemapindex keeps track of style maps to expose in properties
  const styleMapIndex = {};
  // atomic geospatial types supported by KML - MultiGeometry is
  // handled separately
  // all root placemarks in the file
  const placemarks = doc.getElementsByTagName("Placemark");
  const styles = doc.getElementsByTagName("Style");
  const styleMaps = doc.getElementsByTagName("StyleMap");

  for (let k = 0; k < styles.length; k++) {
    const hash = okhash(xml2str(styles[k])).toString(16);
    styleIndex["#" + styles[k].getAttribute("id")] = hash;
    styleByHash[hash] = styles[k];
  }
  for (let l = 0; l < styleMaps.length; l++) {
    styleIndex["#" + styleMaps[l].getAttribute("id")] = okhash(
      xml2str(styleMaps[l])
    ).toString(16);
    const pairs = styleMaps[l].getElementsByTagName("Pair");
    const pairsMap = {};
    for (let m = 0; m < pairs.length; m++) {
      pairsMap[nodeVal(get1(pairs[m], "key"))] = nodeVal(
        get1(pairs[m], "styleUrl")
      );
    }
    styleMapIndex["#" + styleMaps[l].getAttribute("id")] = pairsMap;
  }
  for (let j = 0; j < placemarks.length; j++) {
    const feature = getPlacemark(
      placemarks[j],
      styleIndex,
      styleMapIndex,
      styleByHash
    );
    if (feature) yield feature;
  }
}

function kml(doc) {
  return {
    type: "FeatureCollection",
    features: Array.from(kmlGen(doc)),
  };
}

var gpx_1 = togeojson.gpx = gpx;
var gpxGen_1 = togeojson.gpxGen = gpxGen;
var kml_1 = togeojson.kml = kml;
var kmlGen_1 = togeojson.kmlGen = kmlGen;
var tcx_1 = togeojson.tcx = tcx;
var tcxGen_1 = togeojson.tcxGen = tcxGen;

var toGeoJson = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	gpx: gpx_1,
	gpxGen: gpxGen_1,
	kml: kml_1,
	kmlGen: kmlGen_1,
	tcx: tcx_1,
	tcxGen: tcxGen_1,
	'default': togeojson
}, [togeojson]));

const supportedFormats = ['topojson', 'kml', 'gpx', 'tcx', 'csv', 'tsv'];
class Converter {
    constructor(format, data) {
        this.blankGeoJSON = () => ({
            'type': 'FeatureCollection',
            'features': []
        });
        this.loadXml = async () => {
            /*const formats:{[key: string]: (doc: Document) => FeatureCollection} = {
                'kml': kml,
                'gpx': gpx,
                //'tcx': tcx
            };*/
            const geojson = toGeoJson[this._format](new DOMParser().parseFromString(this._rawData, "text/xml"));
            return geojson;
        };
        this.loadCsv = async () => {
            let geojson = this.blankGeoJSON();
            let options = {};
            if (this._format === 'tsv') {
                options.delimiter = '\t';
            }
            geojson = await new Promise((res, rej) => {
                csv2geojson_1.csv2geojson(this._rawData, options, (err, data) => err ? rej(err) : res(data));
            });
            return geojson;
        };
        this.loadTopoJson = async () => {
            let topoJsonData = {};
            try {
                topoJsonData = JSON.parse(this._rawData);
            }
            catch (e) {
                throw "Invalid TopoJson";
            }
            // Convert the data (TODO: web worker?)
            let result = this.blankGeoJSON();
            if (topoJsonData.type === "Topology" && topoJsonData.objects !== undefined) {
                result = {
                    type: "FeatureCollection",
                    features: result.features = Object.keys(topoJsonData.objects).map(key => topojsonFeature(topoJsonData, key)).reduce((a, v) => [...a, ...v.features], [])
                };
            }
            return result;
        };
        this._rawData = data;
        this._format = format;
        const converters = {
            'topojson': this.loadTopoJson,
            'kml': this.loadXml,
            'gpx': this.loadXml,
            'tcx': this.loadXml,
            'csv': this.loadCsv,
            'tsv': this.loadCsv
        };
        this._conversionFn = converters[format];
    }
    async convert() {
        if (!this._conversionFn) {
            return new Promise((_, rej) => rej(`No converter exists for ${this._format}`));
        }
        else {
            return this._conversionFn();
        }
    }
}

var WorkerClass = null;

try {
    var WorkerThreads =
        typeof module !== 'undefined' && typeof module.require === 'function' && module.require('worker_threads') ||
        typeof __non_webpack_require__ === 'function' && __non_webpack_require__('worker_threads') ||
        typeof require === 'function' && require('worker_threads');
    WorkerClass = WorkerThreads.Worker;
} catch(e) {} // eslint-disable-line

function decodeBase64$1(base64, enableUnicode) {
    return Buffer.from(base64, 'base64').toString(enableUnicode ? 'utf16' : 'utf8');
}

function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64$1(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    return function WorkerFactory(options) {
        return new WorkerClass(body, Object.assign({}, options, { eval: true }));
    };
}

function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    if (enableUnicode) {
        var binaryView = new Uint8Array(binaryString.length);
        for (var i = 0, n = binaryString.length; i < n; ++i) {
            binaryView[i] = binaryString.charCodeAt(i);
        }
        return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
    }
    return binaryString;
}

function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    var blob = new Blob([body], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
        return new Worker(url, options);
    };
}

var kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

function isNodeJS() {
    return kIsNodeJS;
}

function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    if (isNodeJS()) {
        return createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg);
    }
    return createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg);
}

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewoJJ3VzZSBzdHJpY3QnOwoKCWZ1bmN0aW9uIF9tZXJnZU5hbWVzcGFjZXMobiwgbSkgewoJCW0uZm9yRWFjaChmdW5jdGlvbiAoZSkgewoJCQllICYmIHR5cGVvZiBlICE9PSAnc3RyaW5nJyAmJiAhQXJyYXkuaXNBcnJheShlKSAmJiBPYmplY3Qua2V5cyhlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7CgkJCQlpZiAoayAhPT0gJ2RlZmF1bHQnICYmICEoayBpbiBuKSkgewoJCQkJCXZhciBkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCBrKTsKCQkJCQlPYmplY3QuZGVmaW5lUHJvcGVydHkobiwgaywgZC5nZXQgPyBkIDogewoJCQkJCQllbnVtZXJhYmxlOiB0cnVlLAoJCQkJCQlnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGVba107IH0KCQkJCQl9KTsKCQkJCX0KCQkJfSk7CgkJfSk7CgkJcmV0dXJuIE9iamVjdC5mcmVlemUobik7Cgl9CgoJdmFyIGNvbW1vbmpzR2xvYmFsID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDoge307CgoJdmFyIGQzRHN2ID0ge2V4cG9ydHM6IHt9fTsKCgkoZnVuY3Rpb24gKG1vZHVsZSwgZXhwb3J0cykgewoJLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kc3YvIFZlcnNpb24gMS4wLjEuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay4KCShmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7CgkgIGZhY3RvcnkoZXhwb3J0cykgOwoJfShjb21tb25qc0dsb2JhbCwgZnVuY3Rpb24gKGV4cG9ydHMpIHsKCSAgZnVuY3Rpb24gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpIHsKCSAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCJkIiwgInJldHVybiB7IiArIGNvbHVtbnMubWFwKGZ1bmN0aW9uKG5hbWUsIGkpIHsKCSAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArICI6IGRbIiArIGkgKyAiXSI7CgkgICAgfSkuam9pbigiLCIpICsgIn0iKTsKCSAgfQoKCSAgZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHsKCSAgICB2YXIgb2JqZWN0ID0gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpOwoJICAgIHJldHVybiBmdW5jdGlvbihyb3csIGkpIHsKCSAgICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTsKCSAgICB9OwoJICB9CgoJICAvLyBDb21wdXRlIHVuaXF1ZSBjb2x1bW5zIGluIG9yZGVyIG9mIGRpc2NvdmVyeS4KCSAgZnVuY3Rpb24gaW5mZXJDb2x1bW5zKHJvd3MpIHsKCSAgICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSwKCSAgICAgICAgY29sdW1ucyA9IFtdOwoKCSAgICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KSB7CgkgICAgICBmb3IgKHZhciBjb2x1bW4gaW4gcm93KSB7CgkgICAgICAgIGlmICghKGNvbHVtbiBpbiBjb2x1bW5TZXQpKSB7CgkgICAgICAgICAgY29sdW1ucy5wdXNoKGNvbHVtblNldFtjb2x1bW5dID0gY29sdW1uKTsKCSAgICAgICAgfQoJICAgICAgfQoJICAgIH0pOwoKCSAgICByZXR1cm4gY29sdW1uczsKCSAgfQoKCSAgZnVuY3Rpb24gZHN2KGRlbGltaXRlcikgewoJICAgIHZhciByZUZvcm1hdCA9IG5ldyBSZWdFeHAoIltcIiIgKyBkZWxpbWl0ZXIgKyAiXG5dIiksCgkgICAgICAgIGRlbGltaXRlckNvZGUgPSBkZWxpbWl0ZXIuY2hhckNvZGVBdCgwKTsKCgkgICAgZnVuY3Rpb24gcGFyc2UodGV4dCwgZikgewoJICAgICAgdmFyIGNvbnZlcnQsIGNvbHVtbnMsIHJvd3MgPSBwYXJzZVJvd3ModGV4dCwgZnVuY3Rpb24ocm93LCBpKSB7CgkgICAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTsKCSAgICAgICAgY29sdW1ucyA9IHJvdywgY29udmVydCA9IGYgPyBjdXN0b21Db252ZXJ0ZXIocm93LCBmKSA6IG9iamVjdENvbnZlcnRlcihyb3cpOwoJICAgICAgfSk7CgkgICAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zOwoJICAgICAgcmV0dXJuIHJvd3M7CgkgICAgfQoKCSAgICBmdW5jdGlvbiBwYXJzZVJvd3ModGV4dCwgZikgewoJICAgICAgdmFyIEVPTCA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWxpbmUKCSAgICAgICAgICBFT0YgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1maWxlCgkgICAgICAgICAgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93cwoJICAgICAgICAgIE4gPSB0ZXh0Lmxlbmd0aCwKCSAgICAgICAgICBJID0gMCwgLy8gY3VycmVudCBjaGFyYWN0ZXIgaW5kZXgKCSAgICAgICAgICBuID0gMCwgLy8gdGhlIGN1cnJlbnQgbGluZSBudW1iZXIKCSAgICAgICAgICB0LCAvLyB0aGUgY3VycmVudCB0b2tlbgoJICAgICAgICAgIGVvbDsgLy8gaXMgdGhlIGN1cnJlbnQgdG9rZW4gZm9sbG93ZWQgYnkgRU9MPwoKCSAgICAgIGZ1bmN0aW9uIHRva2VuKCkgewoJICAgICAgICBpZiAoSSA+PSBOKSByZXR1cm4gRU9GOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBmaWxlCgkgICAgICAgIGlmIChlb2wpIHJldHVybiBlb2wgPSBmYWxzZSwgRU9MOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBsaW5lCgoJICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IHF1b3RlcwoJICAgICAgICB2YXIgaiA9IEksIGM7CgkgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaikgPT09IDM0KSB7CgkgICAgICAgICAgdmFyIGkgPSBqOwoJICAgICAgICAgIHdoaWxlIChpKysgPCBOKSB7CgkgICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkpID09PSAzNCkgewoJICAgICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrOwoJICAgICAgICAgICAgICArK2k7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgfQoJICAgICAgICAgIEkgPSBpICsgMjsKCSAgICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KGkgKyAxKTsKCSAgICAgICAgICBpZiAoYyA9PT0gMTMpIHsKCSAgICAgICAgICAgIGVvbCA9IHRydWU7CgkgICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAyKSA9PT0gMTApICsrSTsKCSAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDEwKSB7CgkgICAgICAgICAgICBlb2wgPSB0cnVlOwoJICAgICAgICAgIH0KCSAgICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqICsgMSwgaSkucmVwbGFjZSgvIiIvZywgIlwiIik7CgkgICAgICAgIH0KCgkgICAgICAgIC8vIGNvbW1vbiBjYXNlOiBmaW5kIG5leHQgZGVsaW1pdGVyIG9yIG5ld2xpbmUKCSAgICAgICAgd2hpbGUgKEkgPCBOKSB7CgkgICAgICAgICAgdmFyIGsgPSAxOwoJICAgICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoSSsrKTsKCSAgICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IC8vIFxuCgkgICAgICAgICAgZWxzZSBpZiAoYyA9PT0gMTMpIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gMTApICsrSSwgKytrOyB9IC8vIFxyfFxyXG4KCSAgICAgICAgICBlbHNlIGlmIChjICE9PSBkZWxpbWl0ZXJDb2RlKSBjb250aW51ZTsKCSAgICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqLCBJIC0gayk7CgkgICAgICAgIH0KCgkgICAgICAgIC8vIHNwZWNpYWwgY2FzZTogbGFzdCB0b2tlbiBiZWZvcmUgRU9GCgkgICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGopOwoJICAgICAgfQoKCSAgICAgIHdoaWxlICgodCA9IHRva2VuKCkpICE9PSBFT0YpIHsKCSAgICAgICAgdmFyIGEgPSBbXTsKCSAgICAgICAgd2hpbGUgKHQgIT09IEVPTCAmJiB0ICE9PSBFT0YpIHsKCSAgICAgICAgICBhLnB1c2godCk7CgkgICAgICAgICAgdCA9IHRva2VuKCk7CgkgICAgICAgIH0KCSAgICAgICAgaWYgKGYgJiYgKGEgPSBmKGEsIG4rKykpID09IG51bGwpIGNvbnRpbnVlOwoJICAgICAgICByb3dzLnB1c2goYSk7CgkgICAgICB9CgoJICAgICAgcmV0dXJuIHJvd3M7CgkgICAgfQoKCSAgICBmdW5jdGlvbiBmb3JtYXQocm93cywgY29sdW1ucykgewoJICAgICAgaWYgKGNvbHVtbnMgPT0gbnVsbCkgY29sdW1ucyA9IGluZmVyQ29sdW1ucyhyb3dzKTsKCSAgICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykgewoJICAgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7CgkgICAgICAgICAgcmV0dXJuIGZvcm1hdFZhbHVlKHJvd1tjb2x1bW5dKTsKCSAgICAgICAgfSkuam9pbihkZWxpbWl0ZXIpOwoJICAgICAgfSkpLmpvaW4oIlxuIik7CgkgICAgfQoKCSAgICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHsKCSAgICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oIlxuIik7CgkgICAgfQoKCSAgICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7CgkgICAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpOwoJICAgIH0KCgkgICAgZnVuY3Rpb24gZm9ybWF0VmFsdWUodGV4dCkgewoJICAgICAgcmV0dXJuIHRleHQgPT0gbnVsbCA/ICIiCgkgICAgICAgICAgOiByZUZvcm1hdC50ZXN0KHRleHQgKz0gIiIpID8gIlwiIiArIHRleHQucmVwbGFjZSgvXCIvZywgIlwiXCIiKSArICJcIiIKCSAgICAgICAgICA6IHRleHQ7CgkgICAgfQoKCSAgICByZXR1cm4gewoJICAgICAgcGFyc2U6IHBhcnNlLAoJICAgICAgcGFyc2VSb3dzOiBwYXJzZVJvd3MsCgkgICAgICBmb3JtYXQ6IGZvcm1hdCwKCSAgICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3MKCSAgICB9OwoJICB9CgoJICB2YXIgY3N2ID0gZHN2KCIsIik7CgoJICB2YXIgY3N2UGFyc2UgPSBjc3YucGFyc2U7CgkgIHZhciBjc3ZQYXJzZVJvd3MgPSBjc3YucGFyc2VSb3dzOwoJICB2YXIgY3N2Rm9ybWF0ID0gY3N2LmZvcm1hdDsKCSAgdmFyIGNzdkZvcm1hdFJvd3MgPSBjc3YuZm9ybWF0Um93czsKCgkgIHZhciB0c3YgPSBkc3YoIlx0Iik7CgoJICB2YXIgdHN2UGFyc2UgPSB0c3YucGFyc2U7CgkgIHZhciB0c3ZQYXJzZVJvd3MgPSB0c3YucGFyc2VSb3dzOwoJICB2YXIgdHN2Rm9ybWF0ID0gdHN2LmZvcm1hdDsKCSAgdmFyIHRzdkZvcm1hdFJvd3MgPSB0c3YuZm9ybWF0Um93czsKCgkgIGV4cG9ydHMuZHN2Rm9ybWF0ID0gZHN2OwoJICBleHBvcnRzLmNzdlBhcnNlID0gY3N2UGFyc2U7CgkgIGV4cG9ydHMuY3N2UGFyc2VSb3dzID0gY3N2UGFyc2VSb3dzOwoJICBleHBvcnRzLmNzdkZvcm1hdCA9IGNzdkZvcm1hdDsKCSAgZXhwb3J0cy5jc3ZGb3JtYXRSb3dzID0gY3N2Rm9ybWF0Um93czsKCSAgZXhwb3J0cy50c3ZQYXJzZSA9IHRzdlBhcnNlOwoJICBleHBvcnRzLnRzdlBhcnNlUm93cyA9IHRzdlBhcnNlUm93czsKCSAgZXhwb3J0cy50c3ZGb3JtYXQgPSB0c3ZGb3JtYXQ7CgkgIGV4cG9ydHMudHN2Rm9ybWF0Um93cyA9IHRzdkZvcm1hdFJvd3M7CgoJICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pOwoKCX0pKTsKCX0oZDNEc3YsIGQzRHN2LmV4cG9ydHMpKTsKCgl2YXIgc2V4YWdlc2ltYWwkMSA9IHtleHBvcnRzOiB7fX07CgoJc2V4YWdlc2ltYWwkMS5leHBvcnRzID0gZWxlbWVudDsKCXNleGFnZXNpbWFsJDEuZXhwb3J0cy5wYWlyID0gcGFpcjsKCXNleGFnZXNpbWFsJDEuZXhwb3J0cy5mb3JtYXQgPSBmb3JtYXQ7CglzZXhhZ2VzaW1hbCQxLmV4cG9ydHMuZm9ybWF0UGFpciA9IGZvcm1hdFBhaXI7CglzZXhhZ2VzaW1hbCQxLmV4cG9ydHMuY29vcmRUb0RNUyA9IGNvb3JkVG9ETVM7CgoKCWZ1bmN0aW9uIGVsZW1lbnQoaW5wdXQsIGRpbXMpIHsKCSAgdmFyIHJlc3VsdCA9IHNlYXJjaChpbnB1dCwgZGltcyk7CgkgIHJldHVybiAocmVzdWx0ID09PSBudWxsKSA/IG51bGwgOiByZXN1bHQudmFsOwoJfQoKCglmdW5jdGlvbiBmb3JtYXRQYWlyKGlucHV0KSB7CgkgIHJldHVybiBmb3JtYXQoaW5wdXQubGF0LCAnbGF0JykgKyAnICcgKyBmb3JtYXQoaW5wdXQubG9uLCAnbG9uJyk7Cgl9CgoKCS8vIElzIDAgTm9ydGggb3IgU291dGg/CglmdW5jdGlvbiBmb3JtYXQoaW5wdXQsIGRpbSkgewoJICB2YXIgZG1zID0gY29vcmRUb0RNUyhpbnB1dCwgZGltKTsKCSAgcmV0dXJuIGRtcy53aG9sZSArICfCsCAnICsKCSAgICAoZG1zLm1pbnV0ZXMgPyBkbXMubWludXRlcyArICdcJyAnIDogJycpICsKCSAgICAoZG1zLnNlY29uZHMgPyBkbXMuc2Vjb25kcyArICciICcgOiAnJykgKyBkbXMuZGlyOwoJfQoKCglmdW5jdGlvbiBjb29yZFRvRE1TKGlucHV0LCBkaW0pIHsKCSAgdmFyIGRpcnMgPSB7IGxhdDogWydOJywgJ1MnXSwgbG9uOiBbJ0UnLCAnVyddIH1bZGltXSB8fCAnJzsKCSAgdmFyIGRpciA9IGRpcnNbaW5wdXQgPj0gMCA/IDAgOiAxXTsKCSAgdmFyIGFicyA9IE1hdGguYWJzKGlucHV0KTsKCSAgdmFyIHdob2xlID0gTWF0aC5mbG9vcihhYnMpOwoJICB2YXIgZnJhY3Rpb24gPSBhYnMgLSB3aG9sZTsKCSAgdmFyIGZyYWN0aW9uTWludXRlcyA9IGZyYWN0aW9uICogNjA7CgkgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihmcmFjdGlvbk1pbnV0ZXMpOwoJICB2YXIgc2Vjb25kcyA9IE1hdGguZmxvb3IoKGZyYWN0aW9uTWludXRlcyAtIG1pbnV0ZXMpICogNjApOwoKCSAgcmV0dXJuIHsKCSAgICB3aG9sZTogd2hvbGUsCgkgICAgbWludXRlczogbWludXRlcywKCSAgICBzZWNvbmRzOiBzZWNvbmRzLAoJICAgIGRpcjogZGlyCgkgIH07Cgl9CgoKCWZ1bmN0aW9uIHNlYXJjaChpbnB1dCwgZGltcykgewoJICBpZiAoIWRpbXMpIGRpbXMgPSAnTlNFVyc7CgkgIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbDsKCgkgIGlucHV0ID0gaW5wdXQudG9VcHBlckNhc2UoKTsKCSAgdmFyIHJlZ2V4ID0gL15bXHNcLF0qKFtOU0VXXSk/XHMqKFtcLXxc4oCUfFzigJVdP1swLTkuXSspW8KwwrrLml0/XHMqKD86KFswLTkuXSspWyfigJnigLLigJhdXHMqKT8oPzooWzAtOS5dKykoPzonJ3wifOKAnXzigLMpXHMqKT8oW05TRVddKT8vOwoKCSAgdmFyIG0gPSBpbnB1dC5tYXRjaChyZWdleCk7CgkgIGlmICghbSkgcmV0dXJuIG51bGw7ICAvLyBubyBtYXRjaAoKCSAgdmFyIG1hdGNoZWQgPSBtWzBdOwoKCSAgLy8gZXh0cmFjdCBkaW1lbnNpb24uLiBtWzFdID0gbGVhZGluZywgbVs1XSA9IHRyYWlsaW5nCgkgIHZhciBkaW07CgkgIGlmIChtWzFdICYmIG1bNV0pIHsgICAgICAgICAgICAgICAgIC8vIGlmIG1hdGNoZWQgYm90aC4uCgkgICAgZGltID0gbVsxXTsgICAgICAgICAgICAgICAgICAgICAgIC8vIGtlZXAgbGVhZGluZwoJICAgIG1hdGNoZWQgPSBtYXRjaGVkLnNsaWNlKDAsIC0xKTsgICAvLyByZW1vdmUgdHJhaWxpbmcgZGltZW5zaW9uIGZyb20gbWF0Y2gKCSAgfSBlbHNlIHsKCSAgICBkaW0gPSBtWzFdIHx8IG1bNV07CgkgIH0KCgkgIC8vIGlmIHVucmVjb2duaXplZCBkaW1lbnNpb24KCSAgaWYgKGRpbSAmJiBkaW1zLmluZGV4T2YoZGltKSA9PT0gLTEpIHJldHVybiBudWxsOwoKCSAgLy8gZXh0cmFjdCBETVMKCSAgdmFyIGRlZyA9IG1bMl0gPyBwYXJzZUZsb2F0KG1bMl0pIDogMDsKCSAgdmFyIG1pbiA9IG1bM10gPyBwYXJzZUZsb2F0KG1bM10pIC8gNjAgOiAwOwoJICB2YXIgc2VjID0gbVs0XSA/IHBhcnNlRmxvYXQobVs0XSkgLyAzNjAwIDogMDsKCSAgdmFyIHNpZ24gPSAoZGVnIDwgMCkgPyAtMSA6IDE7CgkgIGlmIChkaW0gPT09ICdTJyB8fCBkaW0gPT09ICdXJykgc2lnbiAqPSAtMTsKCgkgIHJldHVybiB7CgkgICAgdmFsOiAoTWF0aC5hYnMoZGVnKSArIG1pbiArIHNlYykgKiBzaWduLAoJICAgIGRpbTogZGltLAoJICAgIG1hdGNoZWQ6IG1hdGNoZWQsCgkgICAgcmVtYWluOiBpbnB1dC5zbGljZShtYXRjaGVkLmxlbmd0aCkKCSAgfTsKCX0KCgoJZnVuY3Rpb24gcGFpcihpbnB1dCwgZGltcykgewoJICBpbnB1dCA9IGlucHV0LnRyaW0oKTsKCSAgdmFyIG9uZSA9IHNlYXJjaChpbnB1dCwgZGltcyk7CgkgIGlmICghb25lKSByZXR1cm4gbnVsbDsKCgkgIGlucHV0ID0gb25lLnJlbWFpbi50cmltKCk7CgkgIHZhciB0d28gPSBzZWFyY2goaW5wdXQsIGRpbXMpOwoJICBpZiAoIXR3byB8fCB0d28ucmVtYWluKSByZXR1cm4gbnVsbDsKCgkgIGlmIChvbmUuZGltKSB7CgkgICAgcmV0dXJuIHN3YXBkaW0ob25lLnZhbCwgdHdvLnZhbCwgb25lLmRpbSk7CgkgIH0gZWxzZSB7CgkgICAgcmV0dXJuIFtvbmUudmFsLCB0d28udmFsXTsKCSAgfQoJfQoKCglmdW5jdGlvbiBzd2FwZGltKGEsIGIsIGRpbSkgewoJICBpZiAoZGltID09PSAnTicgfHwgZGltID09PSAnUycpIHJldHVybiBbYSwgYl07CgkgIGlmIChkaW0gPT09ICdXJyB8fCBkaW0gPT09ICdFJykgcmV0dXJuIFtiLCBhXTsKCX0KCgl2YXIgZHN2ID0gZDNEc3YuZXhwb3J0cywKCSAgICBzZXhhZ2VzaW1hbCA9IHNleGFnZXNpbWFsJDEuZXhwb3J0czsKCgl2YXIgbGF0UmVnZXggPSAvKExhdCkoaXR1ZGUpPy9naSwKCSAgICBsb25SZWdleCA9IC8oTCkob258bmcpKGdpdHVkZSk/L2k7CgoJZnVuY3Rpb24gZ3Vlc3NIZWFkZXIocm93LCByZWdleHApIHsKCSAgICB2YXIgbmFtZSwgbWF0Y2gsIHNjb3JlOwoJICAgIGZvciAodmFyIGYgaW4gcm93KSB7CgkgICAgICAgIG1hdGNoID0gZi5tYXRjaChyZWdleHApOwoJICAgICAgICBpZiAobWF0Y2ggJiYgKCFuYW1lIHx8IG1hdGNoWzBdLmxlbmd0aCAvIGYubGVuZ3RoID4gc2NvcmUpKSB7CgkgICAgICAgICAgICBzY29yZSA9IG1hdGNoWzBdLmxlbmd0aCAvIGYubGVuZ3RoOwoJICAgICAgICAgICAgbmFtZSA9IGY7CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIG5hbWU7Cgl9CgoJZnVuY3Rpb24gZ3Vlc3NMYXRIZWFkZXIocm93KSB7IHJldHVybiBndWVzc0hlYWRlcihyb3csIGxhdFJlZ2V4KTsgfQoJZnVuY3Rpb24gZ3Vlc3NMb25IZWFkZXIocm93KSB7IHJldHVybiBndWVzc0hlYWRlcihyb3csIGxvblJlZ2V4KTsgfQoKCWZ1bmN0aW9uIGlzTGF0KGYpIHsgcmV0dXJuICEhZi5tYXRjaChsYXRSZWdleCk7IH0KCWZ1bmN0aW9uIGlzTG9uKGYpIHsgcmV0dXJuICEhZi5tYXRjaChsb25SZWdleCk7IH0KCglmdW5jdGlvbiBrZXlDb3VudChvKSB7CgkgICAgcmV0dXJuICh0eXBlb2YgbyA9PSAnb2JqZWN0JykgPyBPYmplY3Qua2V5cyhvKS5sZW5ndGggOiAwOwoJfQoKCWZ1bmN0aW9uIGF1dG9EZWxpbWl0ZXIoeCkgewoJICAgIHZhciBkZWxpbWl0ZXJzID0gWycsJywgJzsnLCAnXHQnLCAnfCddOwoJICAgIHZhciByZXN1bHRzID0gW107CgoJICAgIGRlbGltaXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoZGVsaW1pdGVyKSB7CgkgICAgICAgIHZhciByZXMgPSBkc3YuZHN2Rm9ybWF0KGRlbGltaXRlcikucGFyc2UoeCk7CgkgICAgICAgIGlmIChyZXMubGVuZ3RoID49IDEpIHsKCSAgICAgICAgICAgIHZhciBjb3VudCA9IGtleUNvdW50KHJlc1swXSk7CgkgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlcy5sZW5ndGg7IGkrKykgewoJICAgICAgICAgICAgICAgIGlmIChrZXlDb3VudChyZXNbaV0pICE9PSBjb3VudCkgcmV0dXJuOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsKCSAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IGRlbGltaXRlciwKCSAgICAgICAgICAgICAgICBhcml0eTogT2JqZWN0LmtleXMocmVzWzBdKS5sZW5ndGgsCgkgICAgICAgICAgICB9KTsKCSAgICAgICAgfQoJICAgIH0pOwoKCSAgICBpZiAocmVzdWx0cy5sZW5ndGgpIHsKCSAgICAgICAgcmV0dXJuIHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikgewoJICAgICAgICAgICAgcmV0dXJuIGIuYXJpdHkgLSBhLmFyaXR5OwoJICAgICAgICB9KVswXS5kZWxpbWl0ZXI7CgkgICAgfSBlbHNlIHsKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgfQoJfQoKCS8qKgoJICogU2lsbHkgc3RvcGdhcCBmb3IgZHN2IHRvIGQzLWRzdiB1cGdyYWRlCgkgKgoJICogQHBhcmFtIHtBcnJheX0geCBkc3Ygb3V0cHV0CgkgKiBAcmV0dXJucyB7QXJyYXl9IGFycmF5IHdpdGhvdXQgY29sdW1ucyBtZW1iZXIKCSAqLwoJZnVuY3Rpb24gZGVsZXRlQ29sdW1ucyh4KSB7CgkgICAgZGVsZXRlIHguY29sdW1uczsKCSAgICByZXR1cm4geDsKCX0KCglmdW5jdGlvbiBhdXRvKHgpIHsKCSAgICB2YXIgZGVsaW1pdGVyID0gYXV0b0RlbGltaXRlcih4KTsKCSAgICBpZiAoIWRlbGltaXRlcikgcmV0dXJuIG51bGw7CgkgICAgcmV0dXJuIGRlbGV0ZUNvbHVtbnMoZHN2LmRzdkZvcm1hdChkZWxpbWl0ZXIpLnBhcnNlKHgpKTsKCX0KCglmdW5jdGlvbiBjc3YyZ2VvanNvbih4LCBvcHRpb25zLCBjYWxsYmFjaykgewoKCSAgICBpZiAoIWNhbGxiYWNrKSB7CgkgICAgICAgIGNhbGxiYWNrID0gb3B0aW9uczsKCSAgICAgICAgb3B0aW9ucyA9IHt9OwoJICAgIH0KCgkgICAgb3B0aW9ucy5kZWxpbWl0ZXIgPSBvcHRpb25zLmRlbGltaXRlciB8fCAnLCc7CgoJICAgIHZhciBsYXRmaWVsZCA9IG9wdGlvbnMubGF0ZmllbGQgfHwgJycsCgkgICAgICAgIGxvbmZpZWxkID0gb3B0aW9ucy5sb25maWVsZCB8fCAnJywKCSAgICAgICAgY3JzID0gb3B0aW9ucy5jcnMgfHwgJyc7CgoJICAgIHZhciBmZWF0dXJlcyA9IFtdLAoJICAgICAgICBmZWF0dXJlY29sbGVjdGlvbiA9IHt0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLCBmZWF0dXJlczogZmVhdHVyZXN9OwoKCSAgICBpZiAoY3JzICE9PSAnJykgewoJICAgICAgICBmZWF0dXJlY29sbGVjdGlvbi5jcnMgPSB7dHlwZTogJ25hbWUnLCBwcm9wZXJ0aWVzOiB7bmFtZTogY3JzfX07CgkgICAgfQoKCSAgICBpZiAob3B0aW9ucy5kZWxpbWl0ZXIgPT09ICdhdXRvJyAmJiB0eXBlb2YgeCA9PSAnc3RyaW5nJykgewoJICAgICAgICBvcHRpb25zLmRlbGltaXRlciA9IGF1dG9EZWxpbWl0ZXIoeCk7CgkgICAgICAgIGlmICghb3B0aW9ucy5kZWxpbWl0ZXIpIHsKCSAgICAgICAgICAgIGNhbGxiYWNrKHsKCSAgICAgICAgICAgICAgICB0eXBlOiAnRXJyb3InLAoJICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdDb3VsZCBub3QgYXV0b2RldGVjdCBkZWxpbWl0ZXInCgkgICAgICAgICAgICB9KTsKCSAgICAgICAgICAgIHJldHVybjsKCSAgICAgICAgfQoJICAgIH0KCgkgICAgdmFyIG51bWVyaWNGaWVsZHMgPSBvcHRpb25zLm51bWVyaWNGaWVsZHMgPyBvcHRpb25zLm51bWVyaWNGaWVsZHMuc3BsaXQoJywnKSA6IG51bGw7CgoJICAgIHZhciBwYXJzZWQgPSAodHlwZW9mIHggPT0gJ3N0cmluZycpID8KCSAgICAgICAgZHN2LmRzdkZvcm1hdChvcHRpb25zLmRlbGltaXRlcikucGFyc2UoeCwgZnVuY3Rpb24gKGQpIHsKCSAgICAgICAgICAgIGlmIChudW1lcmljRmllbGRzKSB7CgkgICAgICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGQpIHsKCSAgICAgICAgICAgICAgICAgICAgaWYgKG51bWVyaWNGaWVsZHMuaW5jbHVkZXMoa2V5KSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgZFtrZXldID0gK2Rba2V5XTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIHJldHVybiBkOwoJICAgICAgICB9KSA6IHg7CgoJICAgIGlmICghcGFyc2VkLmxlbmd0aCkgewoJICAgICAgICBjYWxsYmFjayhudWxsLCBmZWF0dXJlY29sbGVjdGlvbik7CgkgICAgICAgIHJldHVybjsKCSAgICB9CgoJICAgIHZhciBlcnJvcnMgPSBbXTsKCSAgICB2YXIgaTsKCgoJICAgIGlmICghbGF0ZmllbGQpIGxhdGZpZWxkID0gZ3Vlc3NMYXRIZWFkZXIocGFyc2VkWzBdKTsKCSAgICBpZiAoIWxvbmZpZWxkKSBsb25maWVsZCA9IGd1ZXNzTG9uSGVhZGVyKHBhcnNlZFswXSk7CgkgICAgdmFyIG5vR2VvbWV0cnkgPSAoIWxhdGZpZWxkIHx8ICFsb25maWVsZCk7CgoJICAgIGlmIChub0dlb21ldHJ5KSB7CgkgICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXJzZWQubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgICAgIGZlYXR1cmVzLnB1c2goewoJICAgICAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJywKCSAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwYXJzZWRbaV0sCgkgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IG51bGwKCSAgICAgICAgICAgIH0pOwoJICAgICAgICB9CgkgICAgICAgIGNhbGxiYWNrKGVycm9ycy5sZW5ndGggPyBlcnJvcnMgOiBudWxsLCBmZWF0dXJlY29sbGVjdGlvbik7CgkgICAgICAgIHJldHVybjsKCSAgICB9CgoJICAgIGZvciAoaSA9IDA7IGkgPCBwYXJzZWQubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgaWYgKHBhcnNlZFtpXVtsb25maWVsZF0gIT09IHVuZGVmaW5lZCAmJgoJICAgICAgICAgICAgcGFyc2VkW2ldW2xhdGZpZWxkXSAhPT0gdW5kZWZpbmVkKSB7CgoJICAgICAgICAgICAgdmFyIGxvbmsgPSBwYXJzZWRbaV1bbG9uZmllbGRdLAoJICAgICAgICAgICAgICAgIGxhdGsgPSBwYXJzZWRbaV1bbGF0ZmllbGRdLAoJICAgICAgICAgICAgICAgIGxvbmYsIGxhdGYsCgkgICAgICAgICAgICAgICAgYTsKCgkgICAgICAgICAgICBhID0gc2V4YWdlc2ltYWwobG9uaywgJ0VXJyk7CgkgICAgICAgICAgICBpZiAoYSkgbG9uayA9IGE7CgkgICAgICAgICAgICBhID0gc2V4YWdlc2ltYWwobGF0aywgJ05TJyk7CgkgICAgICAgICAgICBpZiAoYSkgbGF0ayA9IGE7CgoJICAgICAgICAgICAgbG9uZiA9IHBhcnNlRmxvYXQobG9uayk7CgkgICAgICAgICAgICBsYXRmID0gcGFyc2VGbG9hdChsYXRrKTsKCgkgICAgICAgICAgICBpZiAoaXNOYU4obG9uZikgfHwKCSAgICAgICAgICAgICAgICBpc05hTihsYXRmKSkgewoJICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHsKCSAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Egcm93IGNvbnRhaW5lZCBhbiBpbnZhbGlkIHZhbHVlIGZvciBsYXRpdHVkZSBvciBsb25naXR1ZGUnLAoJICAgICAgICAgICAgICAgICAgICByb3c6IHBhcnNlZFtpXSwKCSAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGkKCSAgICAgICAgICAgICAgICB9KTsKCSAgICAgICAgICAgIH0gZWxzZSB7CgkgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmluY2x1ZGVMYXRMb24pIHsKCSAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHBhcnNlZFtpXVtsb25maWVsZF07CgkgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBwYXJzZWRbaV1bbGF0ZmllbGRdOwoJICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgZmVhdHVyZXMucHVzaCh7CgkgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJywKCSAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogcGFyc2VkW2ldLAoJICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeTogewoJICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvaW50JywKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbCgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChsb25mKSwKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KGxhdGYpCgkgICAgICAgICAgICAgICAgICAgICAgICBdCgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9KTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgIH0KCgkgICAgY2FsbGJhY2soZXJyb3JzLmxlbmd0aCA/IGVycm9ycyA6IG51bGwsIGZlYXR1cmVjb2xsZWN0aW9uKTsKCX0KCglmdW5jdGlvbiB0b0xpbmUoZ2opIHsKCSAgICB2YXIgZmVhdHVyZXMgPSBnai5mZWF0dXJlczsKCSAgICB2YXIgbGluZSA9IHsKCSAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICBnZW9tZXRyeTogewoJICAgICAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLAoJICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtdCgkgICAgICAgIH0KCSAgICB9OwoJICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgbGluZS5nZW9tZXRyeS5jb29yZGluYXRlcy5wdXNoKGZlYXR1cmVzW2ldLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTsKCSAgICB9CgkgICAgbGluZS5wcm9wZXJ0aWVzID0gZmVhdHVyZXMucmVkdWNlKGZ1bmN0aW9uIChhZ2dyZWdhdGVkUHJvcGVydGllcywgbmV3RmVhdHVyZSkgewoJICAgICAgICBmb3IgKHZhciBrZXkgaW4gbmV3RmVhdHVyZS5wcm9wZXJ0aWVzKSB7CgkgICAgICAgICAgICBpZiAoIWFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW2tleV0pIHsKCSAgICAgICAgICAgICAgICBhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldID0gW107CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldLnB1c2gobmV3RmVhdHVyZS5wcm9wZXJ0aWVzW2tleV0pOwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiBhZ2dyZWdhdGVkUHJvcGVydGllczsKCSAgICB9LCB7fSk7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywKCSAgICAgICAgZmVhdHVyZXM6IFtsaW5lXQoJICAgIH07Cgl9CgoJZnVuY3Rpb24gdG9Qb2x5Z29uKGdqKSB7CgkgICAgdmFyIGZlYXR1cmVzID0gZ2ouZmVhdHVyZXM7CgkgICAgdmFyIHBvbHkgPSB7CgkgICAgICAgIHR5cGU6ICdGZWF0dXJlJywKCSAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgIHR5cGU6ICdQb2x5Z29uJywKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbW11dCgkgICAgICAgIH0KCSAgICB9OwoJICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgcG9seS5nZW9tZXRyeS5jb29yZGluYXRlc1swXS5wdXNoKGZlYXR1cmVzW2ldLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTsKCSAgICB9CgkgICAgcG9seS5wcm9wZXJ0aWVzID0gZmVhdHVyZXMucmVkdWNlKGZ1bmN0aW9uIChhZ2dyZWdhdGVkUHJvcGVydGllcywgbmV3RmVhdHVyZSkgewoJICAgICAgICBmb3IgKHZhciBrZXkgaW4gbmV3RmVhdHVyZS5wcm9wZXJ0aWVzKSB7CgkgICAgICAgICAgICBpZiAoIWFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW2tleV0pIHsKCSAgICAgICAgICAgICAgICBhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldID0gW107CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldLnB1c2gobmV3RmVhdHVyZS5wcm9wZXJ0aWVzW2tleV0pOwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiBhZ2dyZWdhdGVkUHJvcGVydGllczsKCSAgICB9LCB7fSk7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywKCSAgICAgICAgZmVhdHVyZXM6IFtwb2x5XQoJICAgIH07Cgl9CgoJdmFyIGNzdjJnZW9qc29uXzEgPSB7CgkgICAgaXNMb246IGlzTG9uLAoJICAgIGlzTGF0OiBpc0xhdCwKCSAgICBndWVzc0xhdEhlYWRlcjogZ3Vlc3NMYXRIZWFkZXIsCgkgICAgZ3Vlc3NMb25IZWFkZXI6IGd1ZXNzTG9uSGVhZGVyLAoJICAgIGNzdjogZHN2LmNzdlBhcnNlLAoJICAgIHRzdjogZHN2LnRzdlBhcnNlLAoJICAgIGRzdjogZHN2LAoJICAgIGF1dG86IGF1dG8sCgkgICAgY3N2Mmdlb2pzb246IGNzdjJnZW9qc29uLAoJICAgIHRvTGluZTogdG9MaW5lLAoJICAgIHRvUG9seWdvbjogdG9Qb2x5Z29uCgl9OwoKCWZ1bmN0aW9uIGlkZW50aXR5KHgpIHsKCSAgcmV0dXJuIHg7Cgl9CgoJZnVuY3Rpb24gdHJhbnNmb3JtKHRyYW5zZm9ybSkgewoJICBpZiAodHJhbnNmb3JtID09IG51bGwpIHJldHVybiBpZGVudGl0eTsKCSAgdmFyIHgwLAoJICAgICAgeTAsCgkgICAgICBreCA9IHRyYW5zZm9ybS5zY2FsZVswXSwKCSAgICAgIGt5ID0gdHJhbnNmb3JtLnNjYWxlWzFdLAoJICAgICAgZHggPSB0cmFuc2Zvcm0udHJhbnNsYXRlWzBdLAoJICAgICAgZHkgPSB0cmFuc2Zvcm0udHJhbnNsYXRlWzFdOwoJICByZXR1cm4gZnVuY3Rpb24oaW5wdXQsIGkpIHsKCSAgICBpZiAoIWkpIHgwID0geTAgPSAwOwoJICAgIHZhciBqID0gMiwgbiA9IGlucHV0Lmxlbmd0aCwgb3V0cHV0ID0gbmV3IEFycmF5KG4pOwoJICAgIG91dHB1dFswXSA9ICh4MCArPSBpbnB1dFswXSkgKiBreCArIGR4OwoJICAgIG91dHB1dFsxXSA9ICh5MCArPSBpbnB1dFsxXSkgKiBreSArIGR5OwoJICAgIHdoaWxlIChqIDwgbikgb3V0cHV0W2pdID0gaW5wdXRbal0sICsrajsKCSAgICByZXR1cm4gb3V0cHV0OwoJICB9OwoJfQoKCWZ1bmN0aW9uIHJldmVyc2UoYXJyYXksIG4pIHsKCSAgdmFyIHQsIGogPSBhcnJheS5sZW5ndGgsIGkgPSBqIC0gbjsKCSAgd2hpbGUgKGkgPCAtLWopIHQgPSBhcnJheVtpXSwgYXJyYXlbaSsrXSA9IGFycmF5W2pdLCBhcnJheVtqXSA9IHQ7Cgl9CgoJZnVuY3Rpb24gdG9wb2pzb25GZWF0dXJlKHRvcG9sb2d5LCBvKSB7CgkgIGlmICh0eXBlb2YgbyA9PT0gInN0cmluZyIpIG8gPSB0b3BvbG9neS5vYmplY3RzW29dOwoJICByZXR1cm4gby50eXBlID09PSAiR2VvbWV0cnlDb2xsZWN0aW9uIgoJICAgICAgPyB7dHlwZTogIkZlYXR1cmVDb2xsZWN0aW9uIiwgZmVhdHVyZXM6IG8uZ2VvbWV0cmllcy5tYXAoZnVuY3Rpb24obykgeyByZXR1cm4gZmVhdHVyZSh0b3BvbG9neSwgbyk7IH0pfQoJICAgICAgOiBmZWF0dXJlKHRvcG9sb2d5LCBvKTsKCX0KCglmdW5jdGlvbiBmZWF0dXJlKHRvcG9sb2d5LCBvKSB7CgkgIHZhciBpZCA9IG8uaWQsCgkgICAgICBiYm94ID0gby5iYm94LAoJICAgICAgcHJvcGVydGllcyA9IG8ucHJvcGVydGllcyA9PSBudWxsID8ge30gOiBvLnByb3BlcnRpZXMsCgkgICAgICBnZW9tZXRyeSA9IG9iamVjdCh0b3BvbG9neSwgbyk7CgkgIHJldHVybiBpZCA9PSBudWxsICYmIGJib3ggPT0gbnVsbCA/IHt0eXBlOiAiRmVhdHVyZSIsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX0KCSAgICAgIDogYmJveCA9PSBudWxsID8ge3R5cGU6ICJGZWF0dXJlIiwgaWQ6IGlkLCBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLCBnZW9tZXRyeTogZ2VvbWV0cnl9CgkgICAgICA6IHt0eXBlOiAiRmVhdHVyZSIsIGlkOiBpZCwgYmJveDogYmJveCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fTsKCX0KCglmdW5jdGlvbiBvYmplY3QodG9wb2xvZ3ksIG8pIHsKCSAgdmFyIHRyYW5zZm9ybVBvaW50ID0gdHJhbnNmb3JtKHRvcG9sb2d5LnRyYW5zZm9ybSksCgkgICAgICBhcmNzID0gdG9wb2xvZ3kuYXJjczsKCgkgIGZ1bmN0aW9uIGFyYyhpLCBwb2ludHMpIHsKCSAgICBpZiAocG9pbnRzLmxlbmd0aCkgcG9pbnRzLnBvcCgpOwoJICAgIGZvciAodmFyIGEgPSBhcmNzW2kgPCAwID8gfmkgOiBpXSwgayA9IDAsIG4gPSBhLmxlbmd0aDsgayA8IG47ICsraykgewoJICAgICAgcG9pbnRzLnB1c2godHJhbnNmb3JtUG9pbnQoYVtrXSwgaykpOwoJICAgIH0KCSAgICBpZiAoaSA8IDApIHJldmVyc2UocG9pbnRzLCBuKTsKCSAgfQoKCSAgZnVuY3Rpb24gcG9pbnQocCkgewoJICAgIHJldHVybiB0cmFuc2Zvcm1Qb2ludChwKTsKCSAgfQoKCSAgZnVuY3Rpb24gbGluZShhcmNzKSB7CgkgICAgdmFyIHBvaW50cyA9IFtdOwoJICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJjcy5sZW5ndGg7IGkgPCBuOyArK2kpIGFyYyhhcmNzW2ldLCBwb2ludHMpOwoJICAgIGlmIChwb2ludHMubGVuZ3RoIDwgMikgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTsgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIHBlciB0aGUgc3BlY2lmaWNhdGlvbi4KCSAgICByZXR1cm4gcG9pbnRzOwoJICB9CgoJICBmdW5jdGlvbiByaW5nKGFyY3MpIHsKCSAgICB2YXIgcG9pbnRzID0gbGluZShhcmNzKTsKCSAgICB3aGlsZSAocG9pbnRzLmxlbmd0aCA8IDQpIHBvaW50cy5wdXNoKHBvaW50c1swXSk7IC8vIFRoaXMgbWF5IGhhcHBlbiBpZiBhbiBhcmMgaGFzIG9ubHkgdHdvIHBvaW50cy4KCSAgICByZXR1cm4gcG9pbnRzOwoJICB9CgoJICBmdW5jdGlvbiBwb2x5Z29uKGFyY3MpIHsKCSAgICByZXR1cm4gYXJjcy5tYXAocmluZyk7CgkgIH0KCgkgIGZ1bmN0aW9uIGdlb21ldHJ5KG8pIHsKCSAgICB2YXIgdHlwZSA9IG8udHlwZSwgY29vcmRpbmF0ZXM7CgkgICAgc3dpdGNoICh0eXBlKSB7CgkgICAgICBjYXNlICJHZW9tZXRyeUNvbGxlY3Rpb24iOiByZXR1cm4ge3R5cGU6IHR5cGUsIGdlb21ldHJpZXM6IG8uZ2VvbWV0cmllcy5tYXAoZ2VvbWV0cnkpfTsKCSAgICAgIGNhc2UgIlBvaW50IjogY29vcmRpbmF0ZXMgPSBwb2ludChvLmNvb3JkaW5hdGVzKTsgYnJlYWs7CgkgICAgICBjYXNlICJNdWx0aVBvaW50IjogY29vcmRpbmF0ZXMgPSBvLmNvb3JkaW5hdGVzLm1hcChwb2ludCk7IGJyZWFrOwoJICAgICAgY2FzZSAiTGluZVN0cmluZyI6IGNvb3JkaW5hdGVzID0gbGluZShvLmFyY3MpOyBicmVhazsKCSAgICAgIGNhc2UgIk11bHRpTGluZVN0cmluZyI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChsaW5lKTsgYnJlYWs7CgkgICAgICBjYXNlICJQb2x5Z29uIjogY29vcmRpbmF0ZXMgPSBwb2x5Z29uKG8uYXJjcyk7IGJyZWFrOwoJICAgICAgY2FzZSAiTXVsdGlQb2x5Z29uIjogY29vcmRpbmF0ZXMgPSBvLmFyY3MubWFwKHBvbHlnb24pOyBicmVhazsKCSAgICAgIGRlZmF1bHQ6IHJldHVybiBudWxsOwoJICAgIH0KCSAgICByZXR1cm4ge3R5cGU6IHR5cGUsIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc307CgkgIH0KCgkgIHJldHVybiBnZW9tZXRyeShvKTsKCX0KCgl2YXIgdG9nZW9qc29uID0ge307CgoJT2JqZWN0LmRlZmluZVByb3BlcnR5KHRvZ2VvanNvbiwgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pOwoKCS8vIGNhc3QgYXJyYXkgeCBpbnRvIG51bWJlcnMKCS8vIGdldCB0aGUgY29udGVudCBvZiBhIHRleHQgbm9kZSwgaWYgYW55CglmdW5jdGlvbiBub2RlVmFsKHgpIHsKCSAgaWYgKHggJiYgeC5ub3JtYWxpemUpIHsKCSAgICB4Lm5vcm1hbGl6ZSgpOwoJICB9CgkgIHJldHVybiAoeCAmJiB4LnRleHRDb250ZW50KSB8fCAiIjsKCX0KCgkvLyBvbmUgWSBjaGlsZCBvZiBYLCBpZiBhbnksIG90aGVyd2lzZSBudWxsCglmdW5jdGlvbiBnZXQxKHgsIHkpIHsKCSAgY29uc3QgbiA9IHguZ2V0RWxlbWVudHNCeVRhZ05hbWUoeSk7CgkgIHJldHVybiBuLmxlbmd0aCA/IG5bMF0gOiBudWxsOwoJfQoKCWZ1bmN0aW9uIGdldExpbmVTdHlsZShleHRlbnNpb25zKSB7CgkgIGNvbnN0IHN0eWxlID0ge307CgkgIGlmIChleHRlbnNpb25zKSB7CgkgICAgY29uc3QgbGluZVN0eWxlID0gZ2V0MShleHRlbnNpb25zLCAibGluZSIpOwoJICAgIGlmIChsaW5lU3R5bGUpIHsKCSAgICAgIGNvbnN0IGNvbG9yID0gbm9kZVZhbChnZXQxKGxpbmVTdHlsZSwgImNvbG9yIikpLAoJICAgICAgICBvcGFjaXR5ID0gcGFyc2VGbG9hdChub2RlVmFsKGdldDEobGluZVN0eWxlLCAib3BhY2l0eSIpKSksCgkgICAgICAgIHdpZHRoID0gcGFyc2VGbG9hdChub2RlVmFsKGdldDEobGluZVN0eWxlLCAid2lkdGgiKSkpOwoJICAgICAgaWYgKGNvbG9yKSBzdHlsZS5zdHJva2UgPSBjb2xvcjsKCSAgICAgIGlmICghaXNOYU4ob3BhY2l0eSkpIHN0eWxlWyJzdHJva2Utb3BhY2l0eSJdID0gb3BhY2l0eTsKCSAgICAgIC8vIEdQWCB3aWR0aCBpcyBpbiBtbSwgY29udmVydCB0byBweCB3aXRoIDk2IHB4IHBlciBpbmNoCgkgICAgICBpZiAoIWlzTmFOKHdpZHRoKSkgc3R5bGVbInN0cm9rZS13aWR0aCJdID0gKHdpZHRoICogOTYpIC8gMjUuNDsKCSAgICB9CgkgIH0KCSAgcmV0dXJuIHN0eWxlOwoJfQoKCS8vIGdldCB0aGUgY29udGVudHMgb2YgbXVsdGlwbGUgdGV4dCBub2RlcywgaWYgcHJlc2VudAoJZnVuY3Rpb24gZ2V0TXVsdGkoeCwgeXMpIHsKCSAgY29uc3QgbyA9IHt9OwoJICBsZXQgbjsKCSAgbGV0IGs7CgkgIGZvciAoayA9IDA7IGsgPCB5cy5sZW5ndGg7IGsrKykgewoJICAgIG4gPSBnZXQxKHgsIHlzW2tdKTsKCSAgICBpZiAobikgb1t5c1trXV0gPSBub2RlVmFsKG4pOwoJICB9CgkgIHJldHVybiBvOwoJfQoJZnVuY3Rpb24gZ2V0UHJvcGVydGllcyQxKG5vZGUpIHsKCSAgY29uc3QgcHJvcCA9IGdldE11bHRpKG5vZGUsIFsKCSAgICAibmFtZSIsCgkgICAgImNtdCIsCgkgICAgImRlc2MiLAoJICAgICJ0eXBlIiwKCSAgICAidGltZSIsCgkgICAgImtleXdvcmRzIiwKCSAgXSk7CgkgIC8vIFBhcnNlIGFkZGl0aW9uYWwgZGF0YSBmcm9tIG91ciBHYXJtaW4gZXh0ZW5zaW9uKHMpCgkgIGNvbnN0IGV4dGVuc2lvbnMgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lTlMoCgkgICAgImh0dHA6Ly93d3cuZ2FybWluLmNvbS94bWxzY2hlbWFzL0dweEV4dGVuc2lvbnMvdjMiLAoJICAgICIqIgoJICApOwoJICBmb3IgKGxldCBpID0gMDsgaSA8IGV4dGVuc2lvbnMubGVuZ3RoOyBpKyspIHsKCSAgICBjb25zdCBleHRlbnNpb24gPSBleHRlbnNpb25zW2ldOwoJICAgIC8vIElnbm9yZSBuZXN0ZWQgZXh0ZW5zaW9ucywgbGlrZSB0aG9zZSBvbiByb3V0ZXBvaW50cyBvciB0cmFja3BvaW50cwoJICAgIGlmIChleHRlbnNpb24ucGFyZW50Tm9kZS5wYXJlbnROb2RlID09PSBub2RlKSB7CgkgICAgICBwcm9wW2V4dGVuc2lvbi50YWdOYW1lLnJlcGxhY2UoIjoiLCAiXyIpXSA9IG5vZGVWYWwoZXh0ZW5zaW9uKTsKCSAgICB9CgkgIH0KCSAgY29uc3QgbGlua3MgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKCJsaW5rIik7CgkgIGlmIChsaW5rcy5sZW5ndGgpIHByb3AubGlua3MgPSBbXTsKCSAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7IGkrKykgewoJICAgIHByb3AubGlua3MucHVzaCgKCSAgICAgIE9iamVjdC5hc3NpZ24oCgkgICAgICAgIHsgaHJlZjogbGlua3NbaV0uZ2V0QXR0cmlidXRlKCJocmVmIikgfSwKCSAgICAgICAgZ2V0TXVsdGkobGlua3NbaV0sIFsidGV4dCIsICJ0eXBlIl0pCgkgICAgICApCgkgICAgKTsKCSAgfQoJICByZXR1cm4gcHJvcDsKCX0KCglmdW5jdGlvbiBjb29yZFBhaXIkMSh4KSB7CgkgIGNvbnN0IGxsID0gWwoJICAgIHBhcnNlRmxvYXQoeC5nZXRBdHRyaWJ1dGUoImxvbiIpKSwKCSAgICBwYXJzZUZsb2F0KHguZ2V0QXR0cmlidXRlKCJsYXQiKSksCgkgIF07CgkgIGNvbnN0IGVsZSA9IGdldDEoeCwgImVsZSIpOwoJICAvLyBoYW5kbGUgbmFtZXNwYWNlZCBhdHRyaWJ1dGUgaW4gYnJvd3NlcgoJICBjb25zdCBoZWFydCA9IGdldDEoeCwgImdweHRweDpociIpIHx8IGdldDEoeCwgImhyIik7CgkgIGNvbnN0IHRpbWUgPSBnZXQxKHgsICJ0aW1lIik7CgkgIGxldCBlOwoJICBpZiAoZWxlKSB7CgkgICAgZSA9IHBhcnNlRmxvYXQobm9kZVZhbChlbGUpKTsKCSAgICBpZiAoIWlzTmFOKGUpKSB7CgkgICAgICBsbC5wdXNoKGUpOwoJICAgIH0KCSAgfQoJICBjb25zdCByZXN1bHQgPSB7CgkgICAgY29vcmRpbmF0ZXM6IGxsLAoJICAgIHRpbWU6IHRpbWUgPyBub2RlVmFsKHRpbWUpIDogbnVsbCwKCSAgICBleHRlbmRlZFZhbHVlczogW10sCgkgIH07CgoJICBpZiAoaGVhcnQpIHsKCSAgICByZXN1bHQuZXh0ZW5kZWRWYWx1ZXMucHVzaChbImhlYXJ0IiwgcGFyc2VGbG9hdChub2RlVmFsKGhlYXJ0KSldKTsKCSAgfQoKCSAgY29uc3QgZXh0ZW5zaW9ucyA9IGdldDEoeCwgImV4dGVuc2lvbnMiKTsKCSAgaWYgKGV4dGVuc2lvbnMgIT09IG51bGwpIHsKCSAgICBmb3IgKGNvbnN0IG5hbWUgb2YgWyJzcGVlZCIsICJjb3Vyc2UiLCAiaEFjYyIsICJ2QWNjIl0pIHsKCSAgICAgIGNvbnN0IHYgPSBwYXJzZUZsb2F0KG5vZGVWYWwoZ2V0MShleHRlbnNpb25zLCBuYW1lKSkpOwoJICAgICAgaWYgKCFpc05hTih2KSkgewoJICAgICAgICByZXN1bHQuZXh0ZW5kZWRWYWx1ZXMucHVzaChbbmFtZSwgdl0pOwoJICAgICAgfQoJICAgIH0KCSAgfQoJICByZXR1cm4gcmVzdWx0OwoJfQoJZnVuY3Rpb24gZ2V0Um91dGUobm9kZSkgewoJICBjb25zdCBsaW5lID0gZ2V0UG9pbnRzJDEobm9kZSwgInJ0ZXB0Iik7CgkgIGlmICghbGluZSkgcmV0dXJuOwoJICByZXR1cm4gewoJICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICBwcm9wZXJ0aWVzOiBPYmplY3QuYXNzaWduKAoJICAgICAgZ2V0UHJvcGVydGllcyQxKG5vZGUpLAoJICAgICAgZ2V0TGluZVN0eWxlKGdldDEobm9kZSwgImV4dGVuc2lvbnMiKSksCgkgICAgICB7IF9ncHhUeXBlOiAicnRlIiB9CgkgICAgKSwKCSAgICBnZW9tZXRyeTogewoJICAgICAgdHlwZTogIkxpbmVTdHJpbmciLAoJICAgICAgY29vcmRpbmF0ZXM6IGxpbmUubGluZSwKCSAgICB9LAoJICB9OwoJfQoKCWZ1bmN0aW9uIGdldFBvaW50cyQxKG5vZGUsIHBvaW50bmFtZSkgewoJICBjb25zdCBwdHMgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKHBvaW50bmFtZSk7CgkgIGlmIChwdHMubGVuZ3RoIDwgMikgcmV0dXJuOyAvLyBJbnZhbGlkIGxpbmUgaW4gR2VvSlNPTgoKCSAgY29uc3QgbGluZSA9IFtdOwoJICBjb25zdCB0aW1lcyA9IFtdOwoJICBjb25zdCBleHRlbmRlZFZhbHVlcyA9IHt9OwoJICBmb3IgKGxldCBpID0gMDsgaSA8IHB0cy5sZW5ndGg7IGkrKykgewoJICAgIGNvbnN0IGMgPSBjb29yZFBhaXIkMShwdHNbaV0pOwoJICAgIGxpbmUucHVzaChjLmNvb3JkaW5hdGVzKTsKCSAgICBpZiAoYy50aW1lKSB0aW1lcy5wdXNoKGMudGltZSk7CgkgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjLmV4dGVuZGVkVmFsdWVzLmxlbmd0aDsgaisrKSB7CgkgICAgICBjb25zdCBbbmFtZSwgdmFsXSA9IGMuZXh0ZW5kZWRWYWx1ZXNbal07CgkgICAgICBjb25zdCBwbHVyYWwgPSBuYW1lID09PSAiaGVhcnQiID8gbmFtZSA6IG5hbWUgKyAicyI7CgkgICAgICBpZiAoIWV4dGVuZGVkVmFsdWVzW3BsdXJhbF0pIHsKCSAgICAgICAgZXh0ZW5kZWRWYWx1ZXNbcGx1cmFsXSA9IEFycmF5KHB0cy5sZW5ndGgpLmZpbGwobnVsbCk7CgkgICAgICB9CgkgICAgICBleHRlbmRlZFZhbHVlc1twbHVyYWxdW2ldID0gdmFsOwoJICAgIH0KCSAgfQoJICByZXR1cm4gewoJICAgIGxpbmU6IGxpbmUsCgkgICAgdGltZXM6IHRpbWVzLAoJICAgIGV4dGVuZGVkVmFsdWVzOiBleHRlbmRlZFZhbHVlcywKCSAgfTsKCX0KCglmdW5jdGlvbiBnZXRUcmFjayhub2RlKSB7CgkgIGNvbnN0IHNlZ21lbnRzID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZSgidHJrc2VnIik7CgkgIGNvbnN0IHRyYWNrID0gW107CgkgIGNvbnN0IHRpbWVzID0gW107CgkgIGNvbnN0IGV4dHJhY3RlZExpbmVzID0gW107CgoJICBmb3IgKGxldCBpID0gMDsgaSA8IHNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7CgkgICAgY29uc3QgbGluZSA9IGdldFBvaW50cyQxKHNlZ21lbnRzW2ldLCAidHJrcHQiKTsKCSAgICBpZiAobGluZSkgewoJICAgICAgZXh0cmFjdGVkTGluZXMucHVzaChsaW5lKTsKCSAgICAgIGlmIChsaW5lLnRpbWVzICYmIGxpbmUudGltZXMubGVuZ3RoKSB0aW1lcy5wdXNoKGxpbmUudGltZXMpOwoJICAgIH0KCSAgfQoKCSAgaWYgKGV4dHJhY3RlZExpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuOwoKCSAgY29uc3QgbXVsdGkgPSBleHRyYWN0ZWRMaW5lcy5sZW5ndGggPiAxOwoKCSAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oCgkgICAgZ2V0UHJvcGVydGllcyQxKG5vZGUpLAoJICAgIGdldExpbmVTdHlsZShnZXQxKG5vZGUsICJleHRlbnNpb25zIikpLAoJICAgIHsgX2dweFR5cGU6ICJ0cmsiIH0sCgkgICAgdGltZXMubGVuZ3RoCgkgICAgICA/IHsKCSAgICAgICAgICBjb29yZGluYXRlUHJvcGVydGllczogewoJICAgICAgICAgICAgdGltZXM6IG11bHRpID8gdGltZXMgOiB0aW1lc1swXSwKCSAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICAgIDoge30KCSAgKTsKCgkgIGZvciAobGV0IGkgPSAwOyBpIDwgZXh0cmFjdGVkTGluZXMubGVuZ3RoOyBpKyspIHsKCSAgICBjb25zdCBsaW5lID0gZXh0cmFjdGVkTGluZXNbaV07CgkgICAgdHJhY2sucHVzaChsaW5lLmxpbmUpOwoJICAgIGZvciAoY29uc3QgW25hbWUsIHZhbF0gb2YgT2JqZWN0LmVudHJpZXMobGluZS5leHRlbmRlZFZhbHVlcykpIHsKCSAgICAgIGxldCBwcm9wcyA9IHByb3BlcnRpZXM7CgkgICAgICBpZiAobmFtZSA9PT0gImhlYXJ0IikgewoJICAgICAgICBpZiAoIXByb3BlcnRpZXMuY29vcmRpbmF0ZVByb3BlcnRpZXMpIHsKCSAgICAgICAgICBwcm9wZXJ0aWVzLmNvb3JkaW5hdGVQcm9wZXJ0aWVzID0ge307CgkgICAgICAgIH0KCSAgICAgICAgcHJvcHMgPSBwcm9wZXJ0aWVzLmNvb3JkaW5hdGVQcm9wZXJ0aWVzOwoJICAgICAgfQoJICAgICAgaWYgKG11bHRpKSB7CgkgICAgICAgIGlmICghcHJvcHNbbmFtZV0pCgkgICAgICAgICAgcHJvcHNbbmFtZV0gPSBleHRyYWN0ZWRMaW5lcy5tYXAoKGxpbmUpID0+CgkgICAgICAgICAgICBuZXcgQXJyYXkobGluZS5saW5lLmxlbmd0aCkuZmlsbChudWxsKQoJICAgICAgICAgICk7CgkgICAgICAgIHByb3BzW25hbWVdW2ldID0gdmFsOwoJICAgICAgfSBlbHNlIHsKCSAgICAgICAgcHJvcHNbbmFtZV0gPSB2YWw7CgkgICAgICB9CgkgICAgfQoJICB9CgoJICByZXR1cm4gewoJICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLAoJICAgIGdlb21ldHJ5OiBtdWx0aQoJICAgICAgPyB7CgkgICAgICAgIHR5cGU6ICJNdWx0aUxpbmVTdHJpbmciLAoJICAgICAgICBjb29yZGluYXRlczogdHJhY2ssCgkgICAgICB9CgkgICAgICA6IHsKCSAgICAgICAgdHlwZTogIkxpbmVTdHJpbmciLAoJICAgICAgICBjb29yZGluYXRlczogdHJhY2tbMF0sCgkgICAgICB9LAoJICB9OwoJfQoKCWZ1bmN0aW9uIGdldFBvaW50KG5vZGUpIHsKCSAgcmV0dXJuIHsKCSAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgcHJvcGVydGllczogT2JqZWN0LmFzc2lnbihnZXRQcm9wZXJ0aWVzJDEobm9kZSksIGdldE11bHRpKG5vZGUsIFsic3ltIl0pKSwKCSAgICBnZW9tZXRyeTogewoJICAgICAgdHlwZTogIlBvaW50IiwKCSAgICAgIGNvb3JkaW5hdGVzOiBjb29yZFBhaXIkMShub2RlKS5jb29yZGluYXRlcywKCSAgICB9LAoJICB9OwoJfQoKCWZ1bmN0aW9uKiBncHhHZW4oZG9jKSB7CgkgIGNvbnN0IHRyYWNrcyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgidHJrIik7CgkgIGNvbnN0IHJvdXRlcyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgicnRlIik7CgkgIGNvbnN0IHdheXBvaW50cyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgid3B0Iik7CgoJICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYWNrcy5sZW5ndGg7IGkrKykgewoJICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRUcmFjayh0cmFja3NbaV0pOwoJICAgIGlmIChmZWF0dXJlKSB5aWVsZCBmZWF0dXJlOwoJICB9CgkgIGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7CgkgICAgY29uc3QgZmVhdHVyZSA9IGdldFJvdXRlKHJvdXRlc1tpXSk7CgkgICAgaWYgKGZlYXR1cmUpIHlpZWxkIGZlYXR1cmU7CgkgIH0KCSAgZm9yIChsZXQgaSA9IDA7IGkgPCB3YXlwb2ludHMubGVuZ3RoOyBpKyspIHsKCSAgICB5aWVsZCBnZXRQb2ludCh3YXlwb2ludHNbaV0pOwoJICB9Cgl9CgoJZnVuY3Rpb24gZ3B4KGRvYykgewoJICByZXR1cm4gewoJICAgIHR5cGU6ICJGZWF0dXJlQ29sbGVjdGlvbiIsCgkgICAgZmVhdHVyZXM6IEFycmF5LmZyb20oZ3B4R2VuKGRvYykpLAoJICB9OwoJfQoKCWNvbnN0IEVYVEVOU0lPTlNfTlMgPSAiaHR0cDovL3d3dy5nYXJtaW4uY29tL3htbHNjaGVtYXMvQWN0aXZpdHlFeHRlbnNpb24vdjIiOwoKCWNvbnN0IFRSQUNLUE9JTlRfQVRUUklCVVRFUyA9IFsKCSAgWyJoZWFydFJhdGUiLCAiaGVhcnRSYXRlcyJdLAoJICBbIkNhZGVuY2UiLCAiY2FkZW5jZXMiXSwKCSAgLy8gRXh0ZW5kZWQgVHJhY2twb2ludCBhdHRyaWJ1dGVzCgkgIFsiU3BlZWQiLCAic3BlZWRzIl0sCgkgIFsiV2F0dHMiLCAid2F0dHMiXSwKCV07CgoJY29uc3QgTEFQX0FUVFJJQlVURVMgPSBbCgkgIFsiVG90YWxUaW1lU2Vjb25kcyIsICJ0b3RhbFRpbWVTZWNvbmRzIl0sCgkgIFsiRGlzdGFuY2VNZXRlcnMiLCAiZGlzdGFuY2VNZXRlcnMiXSwKCSAgWyJNYXhpbXVtU3BlZWQiLCAibWF4U3BlZWQiXSwKCSAgWyJBdmVyYWdlSGVhcnRSYXRlQnBtIiwgImF2Z0hlYXJ0UmF0ZSJdLAoJICBbIk1heGltdW1IZWFydFJhdGVCcG0iLCAibWF4SGVhcnRSYXRlIl0sCgoJICAvLyBFeHRlbmRlZCBMYXAgYXR0cmlidXRlcwoJICBbIkF2Z1NwZWVkIiwgImF2Z1NwZWVkIl0sCgkgIFsiQXZnV2F0dHMiLCAiYXZnV2F0dHMiXSwKCSAgWyJNYXhXYXR0cyIsICJtYXhXYXR0cyJdLAoJXTsKCglmdW5jdGlvbiBmcm9tRW50cmllcyhhcnIpIHsKCSAgY29uc3Qgb2JqID0ge307CgkgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGFycikgewoJICAgIG9ialtrZXldID0gdmFsdWU7CgkgIH0KCSAgcmV0dXJuIG9iajsKCX0KCglmdW5jdGlvbiBnZXRQcm9wZXJ0aWVzKG5vZGUsIGF0dHJpYnV0ZU5hbWVzKSB7CgkgIGNvbnN0IHByb3BlcnRpZXMgPSBbXTsKCgkgIGZvciAoY29uc3QgW3RhZywgYWxpYXNdIG9mIGF0dHJpYnV0ZU5hbWVzKSB7CgkgICAgbGV0IGVsZW0gPSBnZXQxKG5vZGUsIHRhZyk7CgkgICAgaWYgKCFlbGVtKSB7CgkgICAgICBjb25zdCBlbGVtZW50cyA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWVOUyhFWFRFTlNJT05TX05TLCB0YWcpOwoJICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkgewoJICAgICAgICBlbGVtID0gZWxlbWVudHNbMF07CgkgICAgICB9CgkgICAgfQoJICAgIGNvbnN0IHZhbCA9IHBhcnNlRmxvYXQobm9kZVZhbChlbGVtKSk7CgkgICAgaWYgKCFpc05hTih2YWwpKSB7CgkgICAgICBwcm9wZXJ0aWVzLnB1c2goW2FsaWFzLCB2YWxdKTsKCSAgICB9CgkgIH0KCgkgIHJldHVybiBwcm9wZXJ0aWVzOwoJfQoKCWZ1bmN0aW9uIGNvb3JkUGFpcih4KSB7CgkgIGNvbnN0IGxvbiA9IG5vZGVWYWwoZ2V0MSh4LCAiTG9uZ2l0dWRlRGVncmVlcyIpKTsKCSAgY29uc3QgbGF0ID0gbm9kZVZhbChnZXQxKHgsICJMYXRpdHVkZURlZ3JlZXMiKSk7CgkgIGlmICghbG9uLmxlbmd0aCB8fCAhbGF0Lmxlbmd0aCkgewoJICAgIHJldHVybiBudWxsOwoJICB9CgkgIGNvbnN0IGxsID0gW3BhcnNlRmxvYXQobG9uKSwgcGFyc2VGbG9hdChsYXQpXTsKCSAgY29uc3QgYWx0ID0gZ2V0MSh4LCAiQWx0aXR1ZGVNZXRlcnMiKTsKCSAgY29uc3QgaGVhcnRSYXRlID0gZ2V0MSh4LCAiSGVhcnRSYXRlQnBtIik7CgkgIGNvbnN0IHRpbWUgPSBnZXQxKHgsICJUaW1lIik7CgkgIGxldCBhOwoJICBpZiAoYWx0KSB7CgkgICAgYSA9IHBhcnNlRmxvYXQobm9kZVZhbChhbHQpKTsKCSAgICBpZiAoIWlzTmFOKGEpKSB7CgkgICAgICBsbC5wdXNoKGEpOwoJICAgIH0KCSAgfQoJICByZXR1cm4gewoJICAgIGNvb3JkaW5hdGVzOiBsbCwKCSAgICB0aW1lOiB0aW1lID8gbm9kZVZhbCh0aW1lKSA6IG51bGwsCgkgICAgaGVhcnRSYXRlOiBoZWFydFJhdGUgPyBwYXJzZUZsb2F0KG5vZGVWYWwoaGVhcnRSYXRlKSkgOiBudWxsLAoJICAgIGV4dGVuc2lvbnM6IGdldFByb3BlcnRpZXMoeCwgVFJBQ0tQT0lOVF9BVFRSSUJVVEVTKSwKCSAgfTsKCX0KCglmdW5jdGlvbiBnZXRQb2ludHMobm9kZSwgcG9pbnRuYW1lKSB7CgkgIGNvbnN0IHB0cyA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUocG9pbnRuYW1lKTsKCSAgY29uc3QgbGluZSA9IFtdOwoJICBjb25zdCB0aW1lcyA9IFtdOwoJICBjb25zdCBoZWFydFJhdGVzID0gW107CgkgIGlmIChwdHMubGVuZ3RoIDwgMikgcmV0dXJuIG51bGw7IC8vIEludmFsaWQgbGluZSBpbiBHZW9KU09OCgkgIGNvbnN0IHJlc3VsdCA9IHsgZXh0ZW5kZWRQcm9wZXJ0aWVzOiB7fSB9OwoJICBmb3IgKGxldCBpID0gMDsgaSA8IHB0cy5sZW5ndGg7IGkrKykgewoJICAgIGNvbnN0IGMgPSBjb29yZFBhaXIocHRzW2ldKTsKCSAgICBpZiAoYyA9PT0gbnVsbCkgY29udGludWU7CgkgICAgbGluZS5wdXNoKGMuY29vcmRpbmF0ZXMpOwoJICAgIGlmIChjLnRpbWUpIHRpbWVzLnB1c2goYy50aW1lKTsKCSAgICBpZiAoYy5oZWFydFJhdGUpIGhlYXJ0UmF0ZXMucHVzaChjLmhlYXJ0UmF0ZSk7CgkgICAgZm9yIChjb25zdCBbYWxpYXMsIHZhbHVlXSBvZiBjLmV4dGVuc2lvbnMpIHsKCSAgICAgIGlmICghcmVzdWx0LmV4dGVuZGVkUHJvcGVydGllc1thbGlhc10pIHsKCSAgICAgICAgcmVzdWx0LmV4dGVuZGVkUHJvcGVydGllc1thbGlhc10gPSBBcnJheShwdHMubGVuZ3RoKS5maWxsKG51bGwpOwoJICAgICAgfQoJICAgICAgcmVzdWx0LmV4dGVuZGVkUHJvcGVydGllc1thbGlhc11baV0gPSB2YWx1ZTsKCSAgICB9CgkgIH0KCSAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocmVzdWx0LCB7CgkgICAgbGluZTogbGluZSwKCSAgICB0aW1lczogdGltZXMsCgkgICAgaGVhcnRSYXRlczogaGVhcnRSYXRlcywKCSAgfSk7Cgl9CgoJZnVuY3Rpb24gZ2V0TGFwKG5vZGUpIHsKCSAgY29uc3Qgc2VnbWVudHMgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKCJUcmFjayIpOwoJICBjb25zdCB0cmFjayA9IFtdOwoJICBjb25zdCB0aW1lcyA9IFtdOwoJICBjb25zdCBoZWFydFJhdGVzID0gW107CgkgIGNvbnN0IGFsbEV4dGVuZGVkUHJvcGVydGllcyA9IFtdOwoJICBsZXQgbGluZTsKCSAgY29uc3QgcHJvcGVydGllcyA9IGZyb21FbnRyaWVzKGdldFByb3BlcnRpZXMobm9kZSwgTEFQX0FUVFJJQlVURVMpKTsKCgkgIGNvbnN0IG5hbWVFbGVtZW50ID0gZ2V0MShub2RlLCAnTmFtZScpOwoJICBpZiAobmFtZUVsZW1lbnQpIHsKCSAgICBwcm9wZXJ0aWVzLm5hbWUgPSBub2RlVmFsKG5hbWVFbGVtZW50KTsKCSAgfQoKCSAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKykgewoJICAgIGxpbmUgPSBnZXRQb2ludHMoc2VnbWVudHNbaV0sICJUcmFja3BvaW50Iik7CgkgICAgaWYgKGxpbmUpIHsKCSAgICAgIHRyYWNrLnB1c2gobGluZS5saW5lKTsKCSAgICAgIGlmIChsaW5lLnRpbWVzLmxlbmd0aCkgdGltZXMucHVzaChsaW5lLnRpbWVzKTsKCSAgICAgIGlmIChsaW5lLmhlYXJ0UmF0ZXMubGVuZ3RoKSBoZWFydFJhdGVzLnB1c2gobGluZS5oZWFydFJhdGVzKTsKCSAgICAgIGFsbEV4dGVuZGVkUHJvcGVydGllcy5wdXNoKGxpbmUuZXh0ZW5kZWRQcm9wZXJ0aWVzKTsKCSAgICB9CgkgIH0KCSAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxFeHRlbmRlZFByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHsKCSAgICBjb25zdCBleHRlbmRlZFByb3BlcnRpZXMgPSBhbGxFeHRlbmRlZFByb3BlcnRpZXNbaV07CgkgICAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBleHRlbmRlZFByb3BlcnRpZXMpIHsKCSAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDEpIHsKCSAgICAgICAgcHJvcGVydGllc1twcm9wZXJ0eV0gPSBsaW5lLmV4dGVuZGVkUHJvcGVydGllc1twcm9wZXJ0eV07CgkgICAgICB9IGVsc2UgewoJICAgICAgICBpZiAoIXByb3BlcnRpZXNbcHJvcGVydHldKSB7CgkgICAgICAgICAgcHJvcGVydGllc1twcm9wZXJ0eV0gPSB0cmFjay5tYXAoKHRyYWNrKSA9PgoJICAgICAgICAgICAgQXJyYXkodHJhY2subGVuZ3RoKS5maWxsKG51bGwpCgkgICAgICAgICAgKTsKCSAgICAgICAgfQoJICAgICAgICBwcm9wZXJ0aWVzW3Byb3BlcnR5XVtpXSA9IGV4dGVuZGVkUHJvcGVydGllc1twcm9wZXJ0eV07CgkgICAgICB9CgkgICAgfQoJICB9CgkgIGlmICh0cmFjay5sZW5ndGggPT09IDApIHJldHVybjsKCgkgIGlmICh0aW1lcy5sZW5ndGggfHwgaGVhcnRSYXRlcy5sZW5ndGgpIHsKCSAgICBwcm9wZXJ0aWVzLmNvb3JkaW5hdGVQcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigKCSAgICAgIHRpbWVzLmxlbmd0aAoJICAgICAgICA/IHsKCSAgICAgICAgICAgIHRpbWVzOiB0cmFjay5sZW5ndGggPT09IDEgPyB0aW1lc1swXSA6IHRpbWVzLAoJICAgICAgICAgIH0KCSAgICAgICAgOiB7fSwKCSAgICAgIGhlYXJ0UmF0ZXMubGVuZ3RoCgkgICAgICAgID8gewoJICAgICAgICAgICAgaGVhcnQ6IHRyYWNrLmxlbmd0aCA9PT0gMSA/IGhlYXJ0UmF0ZXNbMF0gOiBoZWFydFJhdGVzLAoJICAgICAgICAgIH0KCSAgICAgICAgOiB7fQoJICAgICk7CgkgIH0KCgkgIHJldHVybiB7CgkgICAgdHlwZTogIkZlYXR1cmUiLAoJICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsCgkgICAgZ2VvbWV0cnk6IHsKCSAgICAgIHR5cGU6IHRyYWNrLmxlbmd0aCA9PT0gMSA/ICJMaW5lU3RyaW5nIiA6ICJNdWx0aUxpbmVTdHJpbmciLAoJICAgICAgY29vcmRpbmF0ZXM6IHRyYWNrLmxlbmd0aCA9PT0gMSA/IHRyYWNrWzBdIDogdHJhY2ssCgkgICAgfSwKCSAgfTsKCX0KCglmdW5jdGlvbiogdGN4R2VuKGRvYykgewoJICBjb25zdCBsYXBzID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCJMYXAiKTsKCgkgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFwcy5sZW5ndGg7IGkrKykgewoJICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRMYXAobGFwc1tpXSk7CgkgICAgaWYgKGZlYXR1cmUpIHlpZWxkIGZlYXR1cmU7CgkgIH0KCgkgIGNvbnN0IGNvdXJzZXMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIkNvdXJzZXMiKTsKCgkgIGZvciAobGV0IGkgPSAwOyBpIDwgY291cnNlcy5sZW5ndGg7IGkrKykgewoJICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRMYXAoY291cnNlc1tpXSk7CgkgICAgaWYgKGZlYXR1cmUpIHlpZWxkIGZlYXR1cmU7CgkgIH0KCX0KCglmdW5jdGlvbiB0Y3goZG9jKSB7CgkgIHJldHVybiB7CgkgICAgdHlwZTogIkZlYXR1cmVDb2xsZWN0aW9uIiwKCSAgICBmZWF0dXJlczogQXJyYXkuZnJvbSh0Y3hHZW4oZG9jKSksCgkgIH07Cgl9CgoJY29uc3QgcmVtb3ZlU3BhY2UgPSAvXHMqL2c7Cgljb25zdCB0cmltU3BhY2UgPSAvXlxzKnxccyokL2c7Cgljb25zdCBzcGxpdFNwYWNlID0gL1xzKy87CgoJLy8gZ2VuZXJhdGUgYSBzaG9ydCwgbnVtZXJpYyBoYXNoIG9mIGEgc3RyaW5nCglmdW5jdGlvbiBva2hhc2goeCkgewoJICBpZiAoIXggfHwgIXgubGVuZ3RoKSByZXR1cm4gMDsKCSAgbGV0IGggPSAwOwoJICBmb3IgKGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHsKCSAgICBoID0gKChoIDw8IDUpIC0gaCArIHguY2hhckNvZGVBdChpKSkgfCAwOwoJICB9CgkgIHJldHVybiBoOwoJfQoKCS8vIGdldCBvbmUgY29vcmRpbmF0ZSBmcm9tIGEgY29vcmRpbmF0ZSBhcnJheSwgaWYgYW55CglmdW5jdGlvbiBjb29yZDEodikgewoJICByZXR1cm4gdi5yZXBsYWNlKHJlbW92ZVNwYWNlLCAiIikuc3BsaXQoIiwiKS5tYXAocGFyc2VGbG9hdCk7Cgl9CgoJLy8gZ2V0IGFsbCBjb29yZGluYXRlcyBmcm9tIGEgY29vcmRpbmF0ZSBhcnJheSBhcyBbW10sW11dCglmdW5jdGlvbiBjb29yZCh2KSB7CgkgIHJldHVybiB2LnJlcGxhY2UodHJpbVNwYWNlLCAiIikuc3BsaXQoc3BsaXRTcGFjZSkubWFwKGNvb3JkMSk7Cgl9CgoJZnVuY3Rpb24geG1sMnN0cihub2RlKSB7CgkgIGlmIChub2RlLnhtbCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gbm9kZS54bWw7CgkgIGlmIChub2RlLnRhZ05hbWUpIHsKCSAgICBsZXQgb3V0cHV0ID0gbm9kZS50YWdOYW1lOwoJICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICBvdXRwdXQgKz0gbm9kZS5hdHRyaWJ1dGVzW2ldLm5hbWUgKyBub2RlLmF0dHJpYnV0ZXNbaV0udmFsdWU7CgkgICAgfQoJICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICBvdXRwdXQgKz0geG1sMnN0cihub2RlLmNoaWxkTm9kZXNbaV0pOwoJICAgIH0KCSAgICByZXR1cm4gb3V0cHV0OwoJICB9CgkgIGlmIChub2RlLm5vZGVOYW1lID09PSAiI3RleHQiKSB7CgkgICAgcmV0dXJuIChub2RlLm5vZGVWYWx1ZSB8fCBub2RlLnZhbHVlIHx8ICIiKS50cmltKCk7CgkgIH0KCSAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICIjY2RhdGEtc2VjdGlvbiIpIHsKCSAgICByZXR1cm4gbm9kZS5ub2RlVmFsdWU7CgkgIH0KCSAgcmV0dXJuICIiOwoJfQoKCWNvbnN0IGdlb3R5cGVzID0gWyJQb2x5Z29uIiwgIkxpbmVTdHJpbmciLCAiUG9pbnQiLCAiVHJhY2siLCAiZ3g6VHJhY2siXTsKCglmdW5jdGlvbiBrbWxDb2xvcihwcm9wZXJ0aWVzLCBlbGVtLCBwcmVmaXgpIHsKCSAgbGV0IHYgPSBub2RlVmFsKGdldDEoZWxlbSwgImNvbG9yIikpIHx8ICIiOwoJICBjb25zdCBjb2xvclByb3AgPQoJICAgIHByZWZpeCA9PSAic3Ryb2tlIiB8fCBwcmVmaXggPT09ICJmaWxsIiA/IHByZWZpeCA6IHByZWZpeCArICItY29sb3IiOwoJICBpZiAodi5zdWJzdHIoMCwgMSkgPT09ICIjIikgewoJICAgIHYgPSB2LnN1YnN0cigxKTsKCSAgfQoJICBpZiAodi5sZW5ndGggPT09IDYgfHwgdi5sZW5ndGggPT09IDMpIHsKCSAgICBwcm9wZXJ0aWVzW2NvbG9yUHJvcF0gPSB2OwoJICB9IGVsc2UgaWYgKHYubGVuZ3RoID09PSA4KSB7CgkgICAgcHJvcGVydGllc1twcmVmaXggKyAiLW9wYWNpdHkiXSA9IHBhcnNlSW50KHYuc3Vic3RyKDAsIDIpLCAxNikgLyAyNTU7CgkgICAgcHJvcGVydGllc1tjb2xvclByb3BdID0KCSAgICAgICIjIiArIHYuc3Vic3RyKDYsIDIpICsgdi5zdWJzdHIoNCwgMikgKyB2LnN1YnN0cigyLCAyKTsKCSAgfQoJfQoKCWZ1bmN0aW9uIG51bWVyaWNQcm9wZXJ0eShwcm9wZXJ0aWVzLCBlbGVtLCBzb3VyY2UsIHRhcmdldCkgewoJICBjb25zdCB2YWwgPSBwYXJzZUZsb2F0KG5vZGVWYWwoZ2V0MShlbGVtLCBzb3VyY2UpKSk7CgkgIGlmICghaXNOYU4odmFsKSkgcHJvcGVydGllc1t0YXJnZXRdID0gdmFsOwoJfQoKCWZ1bmN0aW9uIGd4Q29vcmRzKHJvb3QpIHsKCSAgbGV0IGVsZW1zID0gcm9vdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgiY29vcmQiKTsKCSAgY29uc3QgY29vcmRzID0gW107CgkgIGNvbnN0IHRpbWVzID0gW107CgkgIGlmIChlbGVtcy5sZW5ndGggPT09IDApIGVsZW1zID0gcm9vdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgiZ3g6Y29vcmQiKTsKCSAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtcy5sZW5ndGg7IGkrKykgewoJICAgIGNvb3Jkcy5wdXNoKG5vZGVWYWwoZWxlbXNbaV0pLnNwbGl0KCIgIikubWFwKHBhcnNlRmxvYXQpKTsKCSAgfQoJICBjb25zdCB0aW1lRWxlbXMgPSByb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKCJ3aGVuIik7CgkgIGZvciAobGV0IGogPSAwOyBqIDwgdGltZUVsZW1zLmxlbmd0aDsgaisrKSB0aW1lcy5wdXNoKG5vZGVWYWwodGltZUVsZW1zW2pdKSk7CgkgIHJldHVybiB7CgkgICAgY29vcmRzOiBjb29yZHMsCgkgICAgdGltZXM6IHRpbWVzLAoJICB9OwoJfQoKCWZ1bmN0aW9uIGdldEdlb21ldHJ5KHJvb3QpIHsKCSAgbGV0IGdlb21Ob2RlOwoJICBsZXQgZ2VvbU5vZGVzOwoJICBsZXQgaTsKCSAgbGV0IGo7CgkgIGxldCBrOwoJICBjb25zdCBnZW9tcyA9IFtdOwoJICBjb25zdCBjb29yZFRpbWVzID0gW107CgkgIGlmIChnZXQxKHJvb3QsICJNdWx0aUdlb21ldHJ5IikpIHsKCSAgICByZXR1cm4gZ2V0R2VvbWV0cnkoZ2V0MShyb290LCAiTXVsdGlHZW9tZXRyeSIpKTsKCSAgfQoJICBpZiAoZ2V0MShyb290LCAiTXVsdGlUcmFjayIpKSB7CgkgICAgcmV0dXJuIGdldEdlb21ldHJ5KGdldDEocm9vdCwgIk11bHRpVHJhY2siKSk7CgkgIH0KCSAgaWYgKGdldDEocm9vdCwgImd4Ok11bHRpVHJhY2siKSkgewoJICAgIHJldHVybiBnZXRHZW9tZXRyeShnZXQxKHJvb3QsICJneDpNdWx0aVRyYWNrIikpOwoJICB9CgkgIGZvciAoaSA9IDA7IGkgPCBnZW90eXBlcy5sZW5ndGg7IGkrKykgewoJICAgIGdlb21Ob2RlcyA9IHJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoZ2VvdHlwZXNbaV0pOwoJICAgIGlmIChnZW9tTm9kZXMpIHsKCSAgICAgIGZvciAoaiA9IDA7IGogPCBnZW9tTm9kZXMubGVuZ3RoOyBqKyspIHsKCSAgICAgICAgZ2VvbU5vZGUgPSBnZW9tTm9kZXNbal07CgkgICAgICAgIGlmIChnZW90eXBlc1tpXSA9PT0gIlBvaW50IikgewoJICAgICAgICAgIGdlb21zLnB1c2goewoJICAgICAgICAgICAgdHlwZTogIlBvaW50IiwKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZDEobm9kZVZhbChnZXQxKGdlb21Ob2RlLCAiY29vcmRpbmF0ZXMiKSkpLAoJICAgICAgICAgIH0pOwoJICAgICAgICB9IGVsc2UgaWYgKGdlb3R5cGVzW2ldID09PSAiTGluZVN0cmluZyIpIHsKCSAgICAgICAgICBnZW9tcy5wdXNoKHsKCSAgICAgICAgICAgIHR5cGU6ICJMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZChub2RlVmFsKGdldDEoZ2VvbU5vZGUsICJjb29yZGluYXRlcyIpKSksCgkgICAgICAgICAgfSk7CgkgICAgICAgIH0gZWxzZSBpZiAoZ2VvdHlwZXNbaV0gPT09ICJQb2x5Z29uIikgewoJICAgICAgICAgIGNvbnN0IHJpbmdzID0gZ2VvbU5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIkxpbmVhclJpbmciKSwKCSAgICAgICAgICAgIGNvb3JkcyA9IFtdOwoJICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByaW5ncy5sZW5ndGg7IGsrKykgewoJICAgICAgICAgICAgY29vcmRzLnB1c2goY29vcmQobm9kZVZhbChnZXQxKHJpbmdzW2tdLCAiY29vcmRpbmF0ZXMiKSkpKTsKCSAgICAgICAgICB9CgkgICAgICAgICAgZ2VvbXMucHVzaCh7CgkgICAgICAgICAgICB0eXBlOiAiUG9seWdvbiIsCgkgICAgICAgICAgICBjb29yZGluYXRlczogY29vcmRzLAoJICAgICAgICAgIH0pOwoJICAgICAgICB9IGVsc2UgaWYgKGdlb3R5cGVzW2ldID09PSAiVHJhY2siIHx8IGdlb3R5cGVzW2ldID09PSAiZ3g6VHJhY2siKSB7CgkgICAgICAgICAgY29uc3QgdHJhY2sgPSBneENvb3JkcyhnZW9tTm9kZSk7CgkgICAgICAgICAgZ2VvbXMucHVzaCh7CgkgICAgICAgICAgICB0eXBlOiAiTGluZVN0cmluZyIsCgkgICAgICAgICAgICBjb29yZGluYXRlczogdHJhY2suY29vcmRzLAoJICAgICAgICAgIH0pOwoJICAgICAgICAgIGlmICh0cmFjay50aW1lcy5sZW5ndGgpIGNvb3JkVGltZXMucHVzaCh0cmFjay50aW1lcyk7CgkgICAgICAgIH0KCSAgICAgIH0KCSAgICB9CgkgIH0KCSAgcmV0dXJuIHsKCSAgICBnZW9tczogZ2VvbXMsCgkgICAgY29vcmRUaW1lczogY29vcmRUaW1lcywKCSAgfTsKCX0KCglmdW5jdGlvbiBnZXRQbGFjZW1hcmsocm9vdCwgc3R5bGVJbmRleCwgc3R5bGVNYXBJbmRleCwgc3R5bGVCeUhhc2gpIHsKCSAgY29uc3QgZ2VvbXNBbmRUaW1lcyA9IGdldEdlb21ldHJ5KHJvb3QpOwoJICBsZXQgaTsKCSAgY29uc3QgcHJvcGVydGllcyA9IHt9OwoJICBjb25zdCBuYW1lID0gbm9kZVZhbChnZXQxKHJvb3QsICJuYW1lIikpOwoJICBjb25zdCBhZGRyZXNzID0gbm9kZVZhbChnZXQxKHJvb3QsICJhZGRyZXNzIikpOwoJICBsZXQgc3R5bGVVcmwgPSBub2RlVmFsKGdldDEocm9vdCwgInN0eWxlVXJsIikpOwoJICBjb25zdCBkZXNjcmlwdGlvbiA9IG5vZGVWYWwoZ2V0MShyb290LCAiZGVzY3JpcHRpb24iKSk7CgkgIGNvbnN0IHRpbWVTcGFuID0gZ2V0MShyb290LCAiVGltZVNwYW4iKTsKCSAgY29uc3QgdGltZVN0YW1wID0gZ2V0MShyb290LCAiVGltZVN0YW1wIik7CgkgIGNvbnN0IGV4dGVuZGVkRGF0YSA9IGdldDEocm9vdCwgIkV4dGVuZGVkRGF0YSIpOwoJICBsZXQgaWNvblN0eWxlID0gZ2V0MShyb290LCAiSWNvblN0eWxlIik7CgkgIGxldCBsYWJlbFN0eWxlID0gZ2V0MShyb290LCAiTGFiZWxTdHlsZSIpOwoJICBsZXQgbGluZVN0eWxlID0gZ2V0MShyb290LCAiTGluZVN0eWxlIik7CgkgIGxldCBwb2x5U3R5bGUgPSBnZXQxKHJvb3QsICJQb2x5U3R5bGUiKTsKCSAgY29uc3QgdmlzaWJpbGl0eSA9IGdldDEocm9vdCwgInZpc2liaWxpdHkiKTsKCgkgIGlmIChuYW1lKSBwcm9wZXJ0aWVzLm5hbWUgPSBuYW1lOwoJICBpZiAoYWRkcmVzcykgcHJvcGVydGllcy5hZGRyZXNzID0gYWRkcmVzczsKCSAgaWYgKHN0eWxlVXJsKSB7CgkgICAgaWYgKHN0eWxlVXJsWzBdICE9PSAiIyIpIHsKCSAgICAgIHN0eWxlVXJsID0gIiMiICsgc3R5bGVVcmw7CgkgICAgfQoKCSAgICBwcm9wZXJ0aWVzLnN0eWxlVXJsID0gc3R5bGVVcmw7CgkgICAgaWYgKHN0eWxlSW5kZXhbc3R5bGVVcmxdKSB7CgkgICAgICBwcm9wZXJ0aWVzLnN0eWxlSGFzaCA9IHN0eWxlSW5kZXhbc3R5bGVVcmxdOwoJICAgIH0KCSAgICBpZiAoc3R5bGVNYXBJbmRleFtzdHlsZVVybF0pIHsKCSAgICAgIHByb3BlcnRpZXMuc3R5bGVNYXBIYXNoID0gc3R5bGVNYXBJbmRleFtzdHlsZVVybF07CgkgICAgICBwcm9wZXJ0aWVzLnN0eWxlSGFzaCA9IHN0eWxlSW5kZXhbc3R5bGVNYXBJbmRleFtzdHlsZVVybF0ubm9ybWFsXTsKCSAgICB9CgkgICAgLy8gVHJ5IHRvIHBvcHVsYXRlIHRoZSBsaW5lU3R5bGUgb3IgcG9seVN0eWxlIHNpbmNlIHdlIGdvdCB0aGUgc3R5bGUgaGFzaAoJICAgIGNvbnN0IHN0eWxlID0gc3R5bGVCeUhhc2hbcHJvcGVydGllcy5zdHlsZUhhc2hdOwoJICAgIGlmIChzdHlsZSkgewoJICAgICAgaWYgKCFpY29uU3R5bGUpIGljb25TdHlsZSA9IGdldDEoc3R5bGUsICJJY29uU3R5bGUiKTsKCSAgICAgIGlmICghbGFiZWxTdHlsZSkgbGFiZWxTdHlsZSA9IGdldDEoc3R5bGUsICJMYWJlbFN0eWxlIik7CgkgICAgICBpZiAoIWxpbmVTdHlsZSkgbGluZVN0eWxlID0gZ2V0MShzdHlsZSwgIkxpbmVTdHlsZSIpOwoJICAgICAgaWYgKCFwb2x5U3R5bGUpIHBvbHlTdHlsZSA9IGdldDEoc3R5bGUsICJQb2x5U3R5bGUiKTsKCSAgICB9CgkgIH0KCSAgaWYgKGRlc2NyaXB0aW9uKSBwcm9wZXJ0aWVzLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247CgkgIGlmICh0aW1lU3BhbikgewoJICAgIGNvbnN0IGJlZ2luID0gbm9kZVZhbChnZXQxKHRpbWVTcGFuLCAiYmVnaW4iKSk7CgkgICAgY29uc3QgZW5kID0gbm9kZVZhbChnZXQxKHRpbWVTcGFuLCAiZW5kIikpOwoJICAgIHByb3BlcnRpZXMudGltZXNwYW4gPSB7IGJlZ2luOiBiZWdpbiwgZW5kOiBlbmQgfTsKCSAgfQoJICBpZiAodGltZVN0YW1wKSB7CgkgICAgcHJvcGVydGllcy50aW1lc3RhbXAgPSBub2RlVmFsKGdldDEodGltZVN0YW1wLCAid2hlbiIpKTsKCSAgfQoJICBpZiAoaWNvblN0eWxlKSB7CgkgICAga21sQ29sb3IocHJvcGVydGllcywgaWNvblN0eWxlLCAiaWNvbiIpOwoJICAgIG51bWVyaWNQcm9wZXJ0eShwcm9wZXJ0aWVzLCBpY29uU3R5bGUsICJzY2FsZSIsICJpY29uLXNjYWxlIik7CgkgICAgbnVtZXJpY1Byb3BlcnR5KHByb3BlcnRpZXMsIGljb25TdHlsZSwgImhlYWRpbmciLCAiaWNvbi1oZWFkaW5nIik7CgoJICAgIGNvbnN0IGhvdHNwb3QgPSBnZXQxKGljb25TdHlsZSwgImhvdFNwb3QiKTsKCSAgICBpZiAoaG90c3BvdCkgewoJICAgICAgY29uc3QgbGVmdCA9IHBhcnNlRmxvYXQoaG90c3BvdC5nZXRBdHRyaWJ1dGUoIngiKSk7CgkgICAgICBjb25zdCB0b3AgPSBwYXJzZUZsb2F0KGhvdHNwb3QuZ2V0QXR0cmlidXRlKCJ5IikpOwoJICAgICAgaWYgKCFpc05hTihsZWZ0KSAmJiAhaXNOYU4odG9wKSkgcHJvcGVydGllc1siaWNvbi1vZmZzZXQiXSA9IFtsZWZ0LCB0b3BdOwoJICAgIH0KCSAgICBjb25zdCBpY29uID0gZ2V0MShpY29uU3R5bGUsICJJY29uIik7CgkgICAgaWYgKGljb24pIHsKCSAgICAgIGNvbnN0IGhyZWYgPSBub2RlVmFsKGdldDEoaWNvbiwgImhyZWYiKSk7CgkgICAgICBpZiAoaHJlZikgcHJvcGVydGllcy5pY29uID0gaHJlZjsKCSAgICB9CgkgIH0KCSAgaWYgKGxhYmVsU3R5bGUpIHsKCSAgICBrbWxDb2xvcihwcm9wZXJ0aWVzLCBsYWJlbFN0eWxlLCAibGFiZWwiKTsKCSAgICBudW1lcmljUHJvcGVydHkocHJvcGVydGllcywgbGFiZWxTdHlsZSwgInNjYWxlIiwgImxhYmVsLXNjYWxlIik7CgkgIH0KCSAgaWYgKGxpbmVTdHlsZSkgewoJICAgIGttbENvbG9yKHByb3BlcnRpZXMsIGxpbmVTdHlsZSwgInN0cm9rZSIpOwoJICAgIG51bWVyaWNQcm9wZXJ0eShwcm9wZXJ0aWVzLCBsaW5lU3R5bGUsICJ3aWR0aCIsICJzdHJva2Utd2lkdGgiKTsKCSAgfQoJICBpZiAocG9seVN0eWxlKSB7CgkgICAga21sQ29sb3IocHJvcGVydGllcywgcG9seVN0eWxlLCAiZmlsbCIpOwoJICAgIGNvbnN0IGZpbGwgPSBub2RlVmFsKGdldDEocG9seVN0eWxlLCAiZmlsbCIpKTsKCSAgICBjb25zdCBvdXRsaW5lID0gbm9kZVZhbChnZXQxKHBvbHlTdHlsZSwgIm91dGxpbmUiKSk7CgkgICAgaWYgKGZpbGwpCgkgICAgICBwcm9wZXJ0aWVzWyJmaWxsLW9wYWNpdHkiXSA9CgkgICAgICAgIGZpbGwgPT09ICIxIiA/IHByb3BlcnRpZXNbImZpbGwtb3BhY2l0eSJdIHx8IDEgOiAwOwoJICAgIGlmIChvdXRsaW5lKQoJICAgICAgcHJvcGVydGllc1sic3Ryb2tlLW9wYWNpdHkiXSA9CgkgICAgICAgIG91dGxpbmUgPT09ICIxIiA/IHByb3BlcnRpZXNbInN0cm9rZS1vcGFjaXR5Il0gfHwgMSA6IDA7CgkgIH0KCSAgaWYgKGV4dGVuZGVkRGF0YSkgewoJICAgIGNvbnN0IGRhdGFzID0gZXh0ZW5kZWREYXRhLmdldEVsZW1lbnRzQnlUYWdOYW1lKCJEYXRhIiksCgkgICAgICBzaW1wbGVEYXRhcyA9IGV4dGVuZGVkRGF0YS5nZXRFbGVtZW50c0J5VGFnTmFtZSgiU2ltcGxlRGF0YSIpOwoKCSAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YXMubGVuZ3RoOyBpKyspIHsKCSAgICAgIHByb3BlcnRpZXNbZGF0YXNbaV0uZ2V0QXR0cmlidXRlKCJuYW1lIildID0gbm9kZVZhbCgKCSAgICAgICAgZ2V0MShkYXRhc1tpXSwgInZhbHVlIikKCSAgICAgICk7CgkgICAgfQoJICAgIGZvciAoaSA9IDA7IGkgPCBzaW1wbGVEYXRhcy5sZW5ndGg7IGkrKykgewoJICAgICAgcHJvcGVydGllc1tzaW1wbGVEYXRhc1tpXS5nZXRBdHRyaWJ1dGUoIm5hbWUiKV0gPSBub2RlVmFsKHNpbXBsZURhdGFzW2ldKTsKCSAgICB9CgkgIH0KCSAgaWYgKHZpc2liaWxpdHkpIHsKCSAgICBwcm9wZXJ0aWVzLnZpc2liaWxpdHkgPSBub2RlVmFsKHZpc2liaWxpdHkpOwoJICB9CgkgIGlmIChnZW9tc0FuZFRpbWVzLmNvb3JkVGltZXMubGVuZ3RoKSB7CgkgICAgcHJvcGVydGllcy5jb29yZGluYXRlUHJvcGVydGllcyA9IHsKCSAgICAgIHRpbWVzOiBnZW9tc0FuZFRpbWVzLmNvb3JkVGltZXMubGVuZ3RoID09PSAxCgkgICAgICAgID8gZ2VvbXNBbmRUaW1lcy5jb29yZFRpbWVzWzBdCgkgICAgICAgIDogZ2VvbXNBbmRUaW1lcy5jb29yZFRpbWVzCgkgICAgfTsKCSAgfQoJICBjb25zdCBmZWF0dXJlID0gewoJICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICBnZW9tZXRyeToKCSAgICAgIGdlb21zQW5kVGltZXMuZ2VvbXMubGVuZ3RoID09PSAwCgkgICAgICAgID8gbnVsbAoJICAgICAgICA6IGdlb21zQW5kVGltZXMuZ2VvbXMubGVuZ3RoID09PSAxCgkgICAgICAgID8gZ2VvbXNBbmRUaW1lcy5nZW9tc1swXQoJICAgICAgICA6IHsKCSAgICAgICAgICAgIHR5cGU6ICJHZW9tZXRyeUNvbGxlY3Rpb24iLAoJICAgICAgICAgICAgZ2VvbWV0cmllczogZ2VvbXNBbmRUaW1lcy5nZW9tcywKCSAgICAgICAgICB9LAoJICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsCgkgIH07CgkgIGlmIChyb290LmdldEF0dHJpYnV0ZSgiaWQiKSkgZmVhdHVyZS5pZCA9IHJvb3QuZ2V0QXR0cmlidXRlKCJpZCIpOwoJICByZXR1cm4gZmVhdHVyZTsKCX0KCglmdW5jdGlvbioga21sR2VuKGRvYykgewoJICAvLyBzdHlsZWluZGV4IGtlZXBzIHRyYWNrIG9mIGhhc2hlZCBzdHlsZXMgaW4gb3JkZXIgdG8gbWF0Y2ggZmVhdHVyZQoJICBjb25zdCBzdHlsZUluZGV4ID0ge307CgkgIGNvbnN0IHN0eWxlQnlIYXNoID0ge307CgkgIC8vIHN0eWxlbWFwaW5kZXgga2VlcHMgdHJhY2sgb2Ygc3R5bGUgbWFwcyB0byBleHBvc2UgaW4gcHJvcGVydGllcwoJICBjb25zdCBzdHlsZU1hcEluZGV4ID0ge307CgkgIC8vIGF0b21pYyBnZW9zcGF0aWFsIHR5cGVzIHN1cHBvcnRlZCBieSBLTUwgLSBNdWx0aUdlb21ldHJ5IGlzCgkgIC8vIGhhbmRsZWQgc2VwYXJhdGVseQoJICAvLyBhbGwgcm9vdCBwbGFjZW1hcmtzIGluIHRoZSBmaWxlCgkgIGNvbnN0IHBsYWNlbWFya3MgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIlBsYWNlbWFyayIpOwoJICBjb25zdCBzdHlsZXMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIlN0eWxlIik7CgkgIGNvbnN0IHN0eWxlTWFwcyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgiU3R5bGVNYXAiKTsKCgkgIGZvciAobGV0IGsgPSAwOyBrIDwgc3R5bGVzLmxlbmd0aDsgaysrKSB7CgkgICAgY29uc3QgaGFzaCA9IG9raGFzaCh4bWwyc3RyKHN0eWxlc1trXSkpLnRvU3RyaW5nKDE2KTsKCSAgICBzdHlsZUluZGV4WyIjIiArIHN0eWxlc1trXS5nZXRBdHRyaWJ1dGUoImlkIildID0gaGFzaDsKCSAgICBzdHlsZUJ5SGFzaFtoYXNoXSA9IHN0eWxlc1trXTsKCSAgfQoJICBmb3IgKGxldCBsID0gMDsgbCA8IHN0eWxlTWFwcy5sZW5ndGg7IGwrKykgewoJICAgIHN0eWxlSW5kZXhbIiMiICsgc3R5bGVNYXBzW2xdLmdldEF0dHJpYnV0ZSgiaWQiKV0gPSBva2hhc2goCgkgICAgICB4bWwyc3RyKHN0eWxlTWFwc1tsXSkKCSAgICApLnRvU3RyaW5nKDE2KTsKCSAgICBjb25zdCBwYWlycyA9IHN0eWxlTWFwc1tsXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgiUGFpciIpOwoJICAgIGNvbnN0IHBhaXJzTWFwID0ge307CgkgICAgZm9yIChsZXQgbSA9IDA7IG0gPCBwYWlycy5sZW5ndGg7IG0rKykgewoJICAgICAgcGFpcnNNYXBbbm9kZVZhbChnZXQxKHBhaXJzW21dLCAia2V5IikpXSA9IG5vZGVWYWwoCgkgICAgICAgIGdldDEocGFpcnNbbV0sICJzdHlsZVVybCIpCgkgICAgICApOwoJICAgIH0KCSAgICBzdHlsZU1hcEluZGV4WyIjIiArIHN0eWxlTWFwc1tsXS5nZXRBdHRyaWJ1dGUoImlkIildID0gcGFpcnNNYXA7CgkgIH0KCSAgZm9yIChsZXQgaiA9IDA7IGogPCBwbGFjZW1hcmtzLmxlbmd0aDsgaisrKSB7CgkgICAgY29uc3QgZmVhdHVyZSA9IGdldFBsYWNlbWFyaygKCSAgICAgIHBsYWNlbWFya3Nbal0sCgkgICAgICBzdHlsZUluZGV4LAoJICAgICAgc3R5bGVNYXBJbmRleCwKCSAgICAgIHN0eWxlQnlIYXNoCgkgICAgKTsKCSAgICBpZiAoZmVhdHVyZSkgeWllbGQgZmVhdHVyZTsKCSAgfQoJfQoKCWZ1bmN0aW9uIGttbChkb2MpIHsKCSAgcmV0dXJuIHsKCSAgICB0eXBlOiAiRmVhdHVyZUNvbGxlY3Rpb24iLAoJICAgIGZlYXR1cmVzOiBBcnJheS5mcm9tKGttbEdlbihkb2MpKSwKCSAgfTsKCX0KCgl2YXIgZ3B4XzEgPSB0b2dlb2pzb24uZ3B4ID0gZ3B4OwoJdmFyIGdweEdlbl8xID0gdG9nZW9qc29uLmdweEdlbiA9IGdweEdlbjsKCXZhciBrbWxfMSA9IHRvZ2VvanNvbi5rbWwgPSBrbWw7Cgl2YXIga21sR2VuXzEgPSB0b2dlb2pzb24ua21sR2VuID0ga21sR2VuOwoJdmFyIHRjeF8xID0gdG9nZW9qc29uLnRjeCA9IHRjeDsKCXZhciB0Y3hHZW5fMSA9IHRvZ2VvanNvbi50Y3hHZW4gPSB0Y3hHZW47CgoJdmFyIHRvR2VvSnNvbiA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKC8qI19fUFVSRV9fKi9fbWVyZ2VOYW1lc3BhY2VzKHsKCQlfX3Byb3RvX186IG51bGwsCgkJZ3B4OiBncHhfMSwKCQlncHhHZW46IGdweEdlbl8xLAoJCWttbDoga21sXzEsCgkJa21sR2VuOiBrbWxHZW5fMSwKCQl0Y3g6IHRjeF8xLAoJCXRjeEdlbjogdGN4R2VuXzEsCgkJJ2RlZmF1bHQnOiB0b2dlb2pzb24KCX0sIFt0b2dlb2pzb25dKSk7CgoJY2xhc3MgQ29udmVydGVyIHsNCgkgICAgY29uc3RydWN0b3IoZm9ybWF0LCBkYXRhKSB7DQoJICAgICAgICB0aGlzLmJsYW5rR2VvSlNPTiA9ICgpID0+ICh7DQoJICAgICAgICAgICAgJ3R5cGUnOiAnRmVhdHVyZUNvbGxlY3Rpb24nLA0KCSAgICAgICAgICAgICdmZWF0dXJlcyc6IFtdDQoJICAgICAgICB9KTsNCgkgICAgICAgIHRoaXMubG9hZFhtbCA9IGFzeW5jICgpID0+IHsNCgkgICAgICAgICAgICAvKmNvbnN0IGZvcm1hdHM6e1trZXk6IHN0cmluZ106IChkb2M6IERvY3VtZW50KSA9PiBGZWF0dXJlQ29sbGVjdGlvbn0gPSB7DQoJICAgICAgICAgICAgICAgICdrbWwnOiBrbWwsDQoJICAgICAgICAgICAgICAgICdncHgnOiBncHgsDQoJICAgICAgICAgICAgICAgIC8vJ3RjeCc6IHRjeA0KCSAgICAgICAgICAgIH07Ki8NCgkgICAgICAgICAgICBjb25zdCBnZW9qc29uID0gdG9HZW9Kc29uW3RoaXMuX2Zvcm1hdF0obmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyh0aGlzLl9yYXdEYXRhLCAidGV4dC94bWwiKSk7DQoJICAgICAgICAgICAgcmV0dXJuIGdlb2pzb247DQoJICAgICAgICB9Ow0KCSAgICAgICAgdGhpcy5sb2FkQ3N2ID0gYXN5bmMgKCkgPT4gew0KCSAgICAgICAgICAgIGxldCBnZW9qc29uID0gdGhpcy5ibGFua0dlb0pTT04oKTsNCgkgICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHt9Ow0KCSAgICAgICAgICAgIGlmICh0aGlzLl9mb3JtYXQgPT09ICd0c3YnKSB7DQoJICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVsaW1pdGVyID0gJ1x0JzsNCgkgICAgICAgICAgICB9DQoJICAgICAgICAgICAgZ2VvanNvbiA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4gew0KCSAgICAgICAgICAgICAgICBjc3YyZ2VvanNvbl8xLmNzdjJnZW9qc29uKHRoaXMuX3Jhd0RhdGEsIG9wdGlvbnMsIChlcnIsIGRhdGEpID0+IGVyciA/IHJlaihlcnIpIDogcmVzKGRhdGEpKTsNCgkgICAgICAgICAgICB9KTsNCgkgICAgICAgICAgICByZXR1cm4gZ2VvanNvbjsNCgkgICAgICAgIH07DQoJICAgICAgICB0aGlzLmxvYWRUb3BvSnNvbiA9IGFzeW5jICgpID0+IHsNCgkgICAgICAgICAgICBsZXQgdG9wb0pzb25EYXRhID0ge307DQoJICAgICAgICAgICAgdHJ5IHsNCgkgICAgICAgICAgICAgICAgdG9wb0pzb25EYXRhID0gSlNPTi5wYXJzZSh0aGlzLl9yYXdEYXRhKTsNCgkgICAgICAgICAgICB9DQoJICAgICAgICAgICAgY2F0Y2ggKGUpIHsNCgkgICAgICAgICAgICAgICAgdGhyb3cgIkludmFsaWQgVG9wb0pzb24iOw0KCSAgICAgICAgICAgIH0NCgkgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBkYXRhIChUT0RPOiB3ZWIgd29ya2VyPykNCgkgICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5ibGFua0dlb0pTT04oKTsNCgkgICAgICAgICAgICBpZiAodG9wb0pzb25EYXRhLnR5cGUgPT09ICJUb3BvbG9neSIgJiYgdG9wb0pzb25EYXRhLm9iamVjdHMgIT09IHVuZGVmaW5lZCkgew0KCSAgICAgICAgICAgICAgICByZXN1bHQgPSB7DQoJICAgICAgICAgICAgICAgICAgICB0eXBlOiAiRmVhdHVyZUNvbGxlY3Rpb24iLA0KCSAgICAgICAgICAgICAgICAgICAgZmVhdHVyZXM6IHJlc3VsdC5mZWF0dXJlcyA9IE9iamVjdC5rZXlzKHRvcG9Kc29uRGF0YS5vYmplY3RzKS5tYXAoa2V5ID0+IHRvcG9qc29uRmVhdHVyZSh0b3BvSnNvbkRhdGEsIGtleSkpLnJlZHVjZSgoYSwgdikgPT4gWy4uLmEsIC4uLnYuZmVhdHVyZXNdLCBbXSkNCgkgICAgICAgICAgICAgICAgfTsNCgkgICAgICAgICAgICB9DQoJICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDsNCgkgICAgICAgIH07DQoJICAgICAgICB0aGlzLl9yYXdEYXRhID0gZGF0YTsNCgkgICAgICAgIHRoaXMuX2Zvcm1hdCA9IGZvcm1hdDsNCgkgICAgICAgIGNvbnN0IGNvbnZlcnRlcnMgPSB7DQoJICAgICAgICAgICAgJ3RvcG9qc29uJzogdGhpcy5sb2FkVG9wb0pzb24sDQoJICAgICAgICAgICAgJ2ttbCc6IHRoaXMubG9hZFhtbCwNCgkgICAgICAgICAgICAnZ3B4JzogdGhpcy5sb2FkWG1sLA0KCSAgICAgICAgICAgICd0Y3gnOiB0aGlzLmxvYWRYbWwsDQoJICAgICAgICAgICAgJ2Nzdic6IHRoaXMubG9hZENzdiwNCgkgICAgICAgICAgICAndHN2JzogdGhpcy5sb2FkQ3N2DQoJICAgICAgICB9Ow0KCSAgICAgICAgdGhpcy5fY29udmVyc2lvbkZuID0gY29udmVydGVyc1tmb3JtYXRdOw0KCSAgICB9DQoJICAgIGFzeW5jIGNvbnZlcnQoKSB7DQoJICAgICAgICBpZiAoIXRoaXMuX2NvbnZlcnNpb25Gbikgew0KCSAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoXywgcmVqKSA9PiByZWooYE5vIGNvbnZlcnRlciBleGlzdHMgZm9yICR7dGhpcy5fZm9ybWF0fWApKTsNCgkgICAgICAgIH0NCgkgICAgICAgIGVsc2Ugew0KCSAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb252ZXJzaW9uRm4oKTsNCgkgICAgICAgIH0NCgkgICAgfQ0KCX0KCgljb25zdCBsaWJyYXJpZXMgPSB7DQoJICAgICdDb252ZXJ0ZXInOiBDb252ZXJ0ZXINCgl9Ow0KCWxldCBwcm9jZXNzOw0KCXNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGUgPT4gew0KCSAgICBjb25zdCBkYXRhID0gKGUuZGF0YSB8fCBlKTsNCgkgICAgLy8ge3R5cGU6ICdpbml0JywgYXJnczogJ1RoaXMgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgaW4gYSB3b3JrZXInfQ0KCSAgICBjb25zdCBjb21tYW5kcyA9IHsNCgkgICAgICAgICdpbml0JzogKG1zZykgPT4gew0KCSAgICAgICAgICAgIHByb2Nlc3MgPSBuZXcgbGlicmFyaWVzW21zZy5jb21tYW5kXShtc2cubWVzc2FnZVswXSwgbXNnLm1lc3NhZ2VbMV0pOw0KCSAgICAgICAgfSwNCgkgICAgICAgICdleGVjJzogZnVuY3Rpb24gKG1zZykgew0KCSAgICAgICAgICAgIGNvbnN0IHsgaWQsIGNvbW1hbmQsIG1lc3NhZ2UgfSA9IG1zZzsNCgkgICAgICAgICAgICBpZiAocHJvY2VzcyAmJiBwcm9jZXNzW2NvbW1hbmRdKSB7DQoJICAgICAgICAgICAgICAgIHByb2Nlc3NbY29tbWFuZF0NCgkgICAgICAgICAgICAgICAgICAgIC5hcHBseShwcm9jZXNzLCBtZXNzYWdlKQ0KCSAgICAgICAgICAgICAgICAgICAgLy8gU1VDQ0VTUw0KCSAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzID0+IHBvc3RNZXNzYWdlKHsNCgkgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyZXNwb25zZScsDQoJICAgICAgICAgICAgICAgICAgICBpZDogaWQsDQoJICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXMNCgkgICAgICAgICAgICAgICAgfSkpDQoJICAgICAgICAgICAgICAgICAgICAvLyBFcnJvcg0KCSAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGUgPT4gcG9zdE1lc3NhZ2Uoew0KCSAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJywNCgkgICAgICAgICAgICAgICAgICAgIGlkOiBpZCwNCgkgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlDQoJICAgICAgICAgICAgICAgIH0pKTsNCgkgICAgICAgICAgICB9DQoJICAgICAgICAgICAgZWxzZSB7DQoJICAgICAgICAgICAgICAgIC8vIEVycm9yDQoJICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGlkLCBjb21tYW5kLCBtZXNzYWdlLCBwcm9jZXNzKTsNCgkgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoew0KCSAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJywNCgkgICAgICAgICAgICAgICAgICAgIGlkOiBpZCwNCgkgICAgICAgICAgICAgICAgICAgIGVycm9yOiBuZXcgRXJyb3IoYGNvbW1hbmQgIiR7Y29tbWFuZH0iIG5vdCBmb3VuZGApDQoJICAgICAgICAgICAgICAgIH0pOw0KCSAgICAgICAgICAgIH0NCgkgICAgICAgIH0NCgkgICAgfTsNCgkgICAgaWYgKGNvbW1hbmRzW2RhdGEudHlwZV0pIHsNCgkgICAgICAgIGNvbW1hbmRzW2RhdGEudHlwZV0oZGF0YSk7DQoJICAgIH0NCgl9KTsKCn0pKCk7Cgo=', null, false);
/* eslint-enable */

const rnd = () => Math.random().toString(36).substring(2);
class Actor {
    constructor(subClass, args) {
        const id = rnd();
        this.worker = new WorkerFactory();
        this.handlers = new Map();
        // Tell the worker to create the class
        this.worker.postMessage({
            type: 'init',
            id: id,
            command: subClass,
            message: args
        });
        // Listen for any messages back from the worker
        this.worker.onmessage = (event) => {
            const data = event.data;
            const handler = this.handlers.get(data.id);
            if (handler) {
                if (data.type === 'response') {
                    handler.res(data.message);
                }
                if (data.type === 'error') {
                    const error = data.error || new Error(`Unknown error with $this.subClass`);
                    handler.rej(error);
                }
            }
        };
    }
    exec(command, args = []) {
        return new Promise((res, rej) => {
            const id = rnd() + '-' + command;
            this.handlers.set(id, { 'res': res, 'rej': rej });
            // Tell the worker to run the command
            this.worker.postMessage({
                type: 'exec',
                id: id,
                command: command,
                message: args
            });
        });
    }
}

// https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151
const VectorTextProtocol = (requestParameters, callback) => {
    const prefix = requestParameters.url.split('://')[0];
    const url = requestParameters.url.replace(new RegExp(`^${prefix}://`), '');
    fetch(url)
        .then(response => {
        if (response.status == 200) {
            response.text().then(rawData => {
                let converter;
                let fn;
                if (['kml', 'tcx', 'gpx'].indexOf(prefix) >= 0) {
                    // XML requires the DOM, which isn't available to web workers
                    converter = new Converter(prefix, rawData);
                    fn = converter.convert();
                }
                else {
                    converter = new Actor('Converter', [prefix, rawData]);
                    fn = converter.exec('convert');
                }
                fn.then(data => {
                    callback(null, data, null, null);
                }).catch((e) => {
                    callback(e);
                });
            });
        }
        else {
            callback(new Error(`Data fetch error: ${response.statusText}`));
        }
    })
        .catch(e => {
        callback(new Error(e));
    });
    return { cancel: () => { } };
};
const addProtocols = (mapLibrary) => {
    supportedFormats.forEach(type => {
        mapLibrary.addProtocol(type, VectorTextProtocol);
    });
};

export { VectorTextProtocol, addProtocols };
