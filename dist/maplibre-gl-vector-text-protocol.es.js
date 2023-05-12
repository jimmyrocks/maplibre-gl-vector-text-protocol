function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
				var args = [null];
				args.push.apply(args, arguments);
				var Ctor = Function.bind.apply(f, args);
				return new Ctor();
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

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

function dsv$1(delimiter) {
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

var csv = dsv$1(",");

var csvParse = csv.parse;
var csvParseRows = csv.parseRows;
var csvFormat = csv.format;
var csvFormatRows = csv.formatRows;

var tsv = dsv$1("\t");

var tsvParse = tsv.parse;
var tsvParseRows = tsv.parseRows;
var tsvFormat = tsv.format;
var tsvFormatRows = tsv.formatRows;

var d3Dsv = /*#__PURE__*/Object.freeze({
	__proto__: null,
	dsvFormat: dsv$1,
	csvParse: csvParse,
	csvParseRows: csvParseRows,
	csvFormat: csvFormat,
	csvFormatRows: csvFormatRows,
	tsvParse: tsvParse,
	tsvParseRows: tsvParseRows,
	tsvFormat: tsvFormat,
	tsvFormatRows: tsvFormatRows
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(d3Dsv);

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

var sexagesimalExports = sexagesimal$1.exports;

var dsv = require$$0,
    sexagesimal = sexagesimalExports;

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

function $(element, tagName) {
    return Array.from(element.getElementsByTagName(tagName));
}
function normalizeId(id) {
    return id[0] === "#" ? id : `#${id}`;
}
function $ns(element, tagName, ns) {
    return Array.from(element.getElementsByTagNameNS(ns, tagName));
}
/**
 * get the content of a text node, if any
 */
function nodeVal(node) {
    node?.normalize();
    return (node && node.textContent) || "";
}
/**
 * Get one Y child of X, if any, otherwise null
 */
function get1(node, tagName, callback) {
    const n = node.getElementsByTagName(tagName);
    const result = n.length ? n[0] : null;
    if (result && callback)
        callback(result);
    return result;
}
function get(node, tagName, callback) {
    const properties = {};
    if (!node)
        return properties;
    const n = node.getElementsByTagName(tagName);
    const result = n.length ? n[0] : null;
    if (result && callback) {
        return callback(result, properties);
    }
    return properties;
}
function val1(node, tagName, callback) {
    const val = nodeVal(get1(node, tagName));
    if (val && callback)
        return callback(val) || {};
    return {};
}
function $num(node, tagName, callback) {
    const val = parseFloat(nodeVal(get1(node, tagName)));
    if (isNaN(val))
        return undefined;
    if (val && callback)
        return callback(val) || {};
    return {};
}
function num1(node, tagName, callback) {
    const val = parseFloat(nodeVal(get1(node, tagName)));
    if (isNaN(val))
        return undefined;
    if (val && callback)
        callback(val);
    return val;
}
function getMulti(node, propertyNames) {
    const properties = {};
    for (const property of propertyNames) {
        val1(node, property, (val) => {
            properties[property] = val;
        });
    }
    return properties;
}
function isElement(node) {
    return node?.nodeType === 1;
}

function getLineStyle(node) {
    return get(node, "line", (lineStyle) => {
        const val = Object.assign({}, val1(lineStyle, "color", (color) => {
            return { stroke: `#${color}` };
        }), $num(lineStyle, "opacity", (opacity) => {
            return { "stroke-opacity": opacity };
        }), $num(lineStyle, "width", (width) => {
            // GPX width is in mm, convert to px with 96 px per inch
            return { "stroke-width": (width * 96) / 25.4 };
        }));
        return val;
    });
}

function getExtensions(node) {
    let values = [];
    if (node === null)
        return values;
    for (const child of Array.from(node.childNodes)) {
        if (!isElement(child))
            continue;
        const name = abbreviateName(child.nodeName);
        if (name === "gpxtpx:TrackPointExtension") {
            // loop again for nested garmin extensions (eg. "gpxtpx:hr")
            values = values.concat(getExtensions(child));
        }
        else {
            // push custom extension (eg. "power")
            const val = nodeVal(child);
            values.push([name, parseNumeric(val)]);
        }
    }
    return values;
}
function abbreviateName(name) {
    return ["heart", "gpxtpx:hr", "hr"].includes(name) ? "heart" : name;
}
function parseNumeric(val) {
    const num = parseFloat(val);
    return isNaN(num) ? val : num;
}

function coordPair$1(node) {
    const ll = [
        parseFloat(node.getAttribute("lon") || ""),
        parseFloat(node.getAttribute("lat") || ""),
    ];
    if (isNaN(ll[0]) || isNaN(ll[1])) {
        return null;
    }
    num1(node, "ele", (val) => {
        ll.push(val);
    });
    const time = get1(node, "time");
    return {
        coordinates: ll,
        time: time ? nodeVal(time) : null,
        extendedValues: getExtensions(get1(node, "extensions")),
    };
}

function extractProperties(node) {
    const properties = getMulti(node, [
        "name",
        "cmt",
        "desc",
        "type",
        "time",
        "keywords",
    ]);
    const extensions = Array.from(node.getElementsByTagNameNS("http://www.garmin.com/xmlschemas/GpxExtensions/v3", "*"));
    for (const child of extensions) {
        if (child.parentNode?.parentNode === node) {
            properties[child.tagName.replace(":", "_")] = nodeVal(child);
        }
    }
    const links = $(node, "link");
    if (links.length) {
        properties.links = links.map((link) => Object.assign({ href: link.getAttribute("href") }, getMulti(link, ["text", "type"])));
    }
    return properties;
}

/**
 * Extract points from a trkseg or rte element.
 */
function getPoints$1(node, pointname) {
    const pts = $(node, pointname);
    const line = [];
    const times = [];
    const extendedValues = {};
    for (let i = 0; i < pts.length; i++) {
        const c = coordPair$1(pts[i]);
        if (!c) {
            continue;
        }
        line.push(c.coordinates);
        if (c.time)
            times.push(c.time);
        for (const [name, val] of c.extendedValues) {
            const plural = name === "heart" ? name : name.replace("gpxtpx:", "") + "s";
            if (!extendedValues[plural]) {
                extendedValues[plural] = Array(pts.length).fill(null);
            }
            extendedValues[plural][i] = val;
        }
    }
    if (line.length < 2)
        return; // Invalid line in GeoJSON
    return {
        line: line,
        times: times,
        extendedValues: extendedValues,
    };
}
/**
 * Extract a LineString geometry from a rte
 * element.
 */
function getRoute(node) {
    const line = getPoints$1(node, "rtept");
    if (!line)
        return;
    return {
        type: "Feature",
        properties: Object.assign({ _gpxType: "rte" }, extractProperties(node), getLineStyle(get1(node, "extensions"))),
        geometry: {
            type: "LineString",
            coordinates: line.line,
        },
    };
}
function getTrack(node) {
    const segments = $(node, "trkseg");
    const track = [];
    const times = [];
    const extractedLines = [];
    for (const segment of segments) {
        const line = getPoints$1(segment, "trkpt");
        if (line) {
            extractedLines.push(line);
            if (line.times && line.times.length)
                times.push(line.times);
        }
    }
    if (extractedLines.length === 0)
        return null;
    const multi = extractedLines.length > 1;
    const properties = Object.assign({ _gpxType: "trk" }, extractProperties(node), getLineStyle(get1(node, "extensions")), times.length
        ? {
            coordinateProperties: {
                times: multi ? times : times[0],
            },
        }
        : {});
    for (const line of extractedLines) {
        track.push(line.line);
        if (!properties.coordinateProperties) {
            properties.coordinateProperties = {};
        }
        const props = properties.coordinateProperties;
        const entries = Object.entries(line.extendedValues);
        for (let i = 0; i < entries.length; i++) {
            const [name, val] = entries[i];
            if (multi) {
                if (!props[name]) {
                    props[name] = extractedLines.map((line) => new Array(line.line.length).fill(null));
                }
                props[name][i] = val;
            }
            else {
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
/**
 * Extract a point, if possible, from a given node,
 * which is usually a wpt or trkpt
 */
function getPoint(node) {
    const properties = Object.assign(extractProperties(node), getMulti(node, ["sym"]));
    const pair = coordPair$1(node);
    if (!pair)
        return null;
    return {
        type: "Feature",
        properties,
        geometry: {
            type: "Point",
            coordinates: pair.coordinates,
        },
    };
}
/**
 * Convert GPX to GeoJSON incrementally, returning
 * a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
 * that yields output feature by feature.
 */
function* gpxGen(node) {
    for (const track of $(node, "trk")) {
        const feature = getTrack(track);
        if (feature)
            yield feature;
    }
    for (const route of $(node, "rte")) {
        const feature = getRoute(route);
        if (feature)
            yield feature;
    }
    for (const waypoint of $(node, "wpt")) {
        const point = getPoint(waypoint);
        if (point)
            yield point;
    }
}
/**
 *
 * Convert a GPX document to GeoJSON. The first argument, `doc`, must be a GPX
 * document as an XML DOM - not as a string. You can get this using jQuery's default
 * `.ajax` function or using a bare XMLHttpRequest with the `.response` property
 * holding an XML DOM.
 *
 * The output is a JavaScript object of GeoJSON data, same as `.kml` outputs, with the
 * addition of a `_gpxType` property on each `LineString` feature that indicates whether
 * the feature was encoded as a route (`rte`) or track (`trk`) in the GPX document.
 */
function gpx(node) {
    return {
        type: "FeatureCollection",
        features: Array.from(gpxGen(node)),
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
function coordPair(node) {
    const ll = [num1(node, "LongitudeDegrees"), num1(node, "LatitudeDegrees")];
    if (ll[0] === undefined ||
        isNaN(ll[0]) ||
        ll[1] === undefined ||
        isNaN(ll[1])) {
        return null;
    }
    const heartRate = get1(node, "HeartRateBpm");
    const time = nodeVal(get1(node, "Time"));
    get1(node, "AltitudeMeters", (alt) => {
        const a = parseFloat(nodeVal(alt));
        if (!isNaN(a)) {
            ll.push(a);
        }
    });
    return {
        coordinates: ll,
        time: time || null,
        heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null,
        extensions: getProperties(node, TRACKPOINT_ATTRIBUTES),
    };
}
function getPoints(node) {
    const pts = $(node, "Trackpoint");
    const line = [];
    const times = [];
    const heartRates = [];
    if (pts.length < 2)
        return null; // Invalid line in GeoJSON
    const extendedProperties = {};
    const result = { extendedProperties };
    for (let i = 0; i < pts.length; i++) {
        const c = coordPair(pts[i]);
        if (c === null)
            continue;
        line.push(c.coordinates);
        const { time, heartRate, extensions } = c;
        if (time)
            times.push(time);
        if (heartRate)
            heartRates.push(heartRate);
        for (const [alias, value] of extensions) {
            if (!extendedProperties[alias]) {
                extendedProperties[alias] = Array(pts.length).fill(null);
            }
            extendedProperties[alias][i] = value;
        }
    }
    if (line.length < 2)
        return null;
    return Object.assign(result, {
        line: line,
        times: times,
        heartRates: heartRates,
    });
}
function getLap(node) {
    const segments = $(node, "Track");
    const track = [];
    const times = [];
    const heartRates = [];
    const allExtendedProperties = [];
    let line;
    const properties = Object.assign(Object.fromEntries(getProperties(node, LAP_ATTRIBUTES)), get(node, "Name", (nameElement) => {
        return { name: nodeVal(nameElement) };
    }));
    for (const segment of segments) {
        line = getPoints(segment);
        if (line) {
            track.push(line.line);
            if (line.times.length)
                times.push(line.times);
            if (line.heartRates.length)
                heartRates.push(line.heartRates);
            allExtendedProperties.push(line.extendedProperties);
        }
    }
    for (let i = 0; i < allExtendedProperties.length; i++) {
        const extendedProperties = allExtendedProperties[i];
        for (const property in extendedProperties) {
            if (segments.length === 1) {
                if (line) {
                    properties[property] = line.extendedProperties[property];
                }
            }
            else {
                if (!properties[property]) {
                    properties[property] = track.map((track) => Array(track.length).fill(null));
                }
                properties[property][i] = extendedProperties[property];
            }
        }
    }
    if (track.length === 0)
        return null;
    if (times.length || heartRates.length) {
        properties.coordinateProperties = Object.assign(times.length
            ? {
                times: track.length === 1 ? times[0] : times,
            }
            : {}, heartRates.length
            ? {
                heart: track.length === 1 ? heartRates[0] : heartRates,
            }
            : {});
    }
    return {
        type: "Feature",
        properties: properties,
        geometry: track.length === 1
            ? {
                type: "LineString",
                coordinates: track[0],
            }
            : {
                type: "MultiLineString",
                coordinates: track,
            },
    };
}
/**
 * Incrementally convert a TCX document to GeoJSON. The
 * first argument, `doc`, must be a TCX
 * document as an XML DOM - not as a string.
 */
function* tcxGen(node) {
    for (const lap of $(node, "Lap")) {
        const feature = getLap(lap);
        if (feature)
            yield feature;
    }
    for (const course of $(node, "Courses")) {
        const feature = getLap(course);
        if (feature)
            yield feature;
    }
}
/**
 * Convert a TCX document to GeoJSON. The first argument, `doc`, must be a TCX
 * document as an XML DOM - not as a string.
 */
function tcx(node) {
    return {
        type: "FeatureCollection",
        features: Array.from(tcxGen(node)),
    };
}

function fixColor(v, prefix) {
    const properties = {};
    const colorProp = prefix == "stroke" || prefix === "fill" ? prefix : prefix + "-color";
    if (v[0] === "#") {
        v = v.substring(1);
    }
    if (v.length === 6 || v.length === 3) {
        properties[colorProp] = "#" + v;
    }
    else if (v.length === 8) {
        properties[prefix + "-opacity"] = parseInt(v.substring(0, 2), 16) / 255;
        properties[colorProp] =
            "#" + v.substring(6, 8) + v.substring(4, 6) + v.substring(2, 4);
    }
    return properties;
}

function numericProperty(node, source, target) {
    const properties = {};
    num1(node, source, (val) => {
        properties[target] = val;
    });
    return properties;
}
function getColor(node, output) {
    return get(node, "color", (elem) => fixColor(nodeVal(elem), output));
}
function extractIconHref(node) {
    return get(node, "Icon", (icon, properties) => {
        val1(icon, "href", (href) => {
            properties.icon = href;
        });
        return properties;
    });
}
function extractIcon(node) {
    return get(node, "IconStyle", (iconStyle) => {
        return Object.assign(getColor(iconStyle, "icon"), numericProperty(iconStyle, "scale", "icon-scale"), numericProperty(iconStyle, "heading", "icon-heading"), get(iconStyle, "hotSpot", (hotspot) => {
            const left = parseFloat(hotspot.getAttribute("x") || "");
            const top = parseFloat(hotspot.getAttribute("y") || "");
            const xunits = hotspot.getAttribute("xunits") || "";
            const yunits = hotspot.getAttribute("yunits") || "";
            if (!isNaN(left) && !isNaN(top))
                return {
                    "icon-offset": [left, top],
                    "icon-offset-units": [xunits, yunits],
                };
            return {};
        }), extractIconHref(iconStyle));
    });
}
function extractLabel(node) {
    return get(node, "LabelStyle", (labelStyle) => {
        return Object.assign(getColor(labelStyle, "label"), numericProperty(labelStyle, "scale", "label-scale"));
    });
}
function extractLine(node) {
    return get(node, "LineStyle", (lineStyle) => {
        return Object.assign(getColor(lineStyle, "stroke"), numericProperty(lineStyle, "width", "stroke-width"));
    });
}
function extractPoly(node) {
    return get(node, "PolyStyle", (polyStyle, properties) => {
        return Object.assign(properties, get(polyStyle, "color", (elem) => fixColor(nodeVal(elem), "fill")), val1(polyStyle, "fill", (fill) => {
            if (fill === "0")
                return { "fill-opacity": 0 };
        }), val1(polyStyle, "outline", (outline) => {
            if (outline === "0")
                return { "stroke-opacity": 0 };
        }));
    });
}
function extractStyle(node) {
    return Object.assign({}, extractPoly(node), extractLine(node), extractLabel(node), extractIcon(node));
}

const toNumber = (x) => Number(x);
const typeConverters = {
    string: (x) => x,
    int: toNumber,
    uint: toNumber,
    short: toNumber,
    ushort: toNumber,
    float: toNumber,
    double: toNumber,
    bool: (x) => Boolean(x),
};
function extractExtendedData(node, schema) {
    return get(node, "ExtendedData", (extendedData, properties) => {
        for (const data of $(extendedData, "Data")) {
            properties[data.getAttribute("name") || ""] = nodeVal(get1(data, "value"));
        }
        for (const simpleData of $(extendedData, "SimpleData")) {
            const name = simpleData.getAttribute("name") || "";
            const typeConverter = schema[name] || typeConverters.string;
            properties[name] = typeConverter(nodeVal(simpleData));
        }
        return properties;
    });
}
function getMaybeHTMLDescription(node) {
    const descriptionNode = get1(node, "description");
    for (const c of Array.from(descriptionNode?.childNodes || [])) {
        if (c.nodeType === 4) {
            return {
                description: {
                    "@type": "html",
                    value: nodeVal(c),
                },
            };
        }
    }
    return {};
}
function extractTimeSpan(node) {
    return get(node, "TimeSpan", (timeSpan) => {
        return {
            timespan: {
                begin: nodeVal(get1(timeSpan, "begin")),
                end: nodeVal(get1(timeSpan, "end")),
            },
        };
    });
}
function extractTimeStamp(node) {
    return get(node, "TimeStamp", (timeStamp) => {
        return { timestamp: nodeVal(get1(timeStamp, "when")) };
    });
}
function extractCascadedStyle(node, styleMap) {
    return val1(node, "styleUrl", (styleUrl) => {
        styleUrl = normalizeId(styleUrl);
        if (styleMap[styleUrl]) {
            return Object.assign({ styleUrl }, styleMap[styleUrl]);
        }
        // For backward-compatibility. Should we still include
        // styleUrl even if it's not resolved?
        return { styleUrl };
    });
}

const removeSpace = /\s*/g;
const trimSpace = /^\s*|\s*$/g;
const splitSpace = /\s+/;
/**
 * Get one coordinate from a coordinate array, if any
 */
function coord1(value) {
    return value
        .replace(removeSpace, "")
        .split(",")
        .map(parseFloat)
        .filter((num) => !isNaN(num))
        .slice(0, 3);
}
/**
 * Get all coordinates from a coordinate array as [[],[]]
 */
function coord(value) {
    return value
        .replace(trimSpace, "")
        .split(splitSpace)
        .map(coord1)
        .filter((coord) => {
        return coord.length >= 2;
    });
}
function gxCoords(node) {
    let elems = $(node, "coord");
    if (elems.length === 0) {
        elems = $ns(node, "coord", "*");
    }
    const coordinates = elems.map((elem) => {
        return nodeVal(elem).split(" ").map(parseFloat);
    });
    if (coordinates.length === 0) {
        return null;
    }
    return {
        geometry: coordinates.length > 2
            ? {
                type: "LineString",
                coordinates,
            }
            : {
                type: "Point",
                coordinates: coordinates[0],
            },
        times: $(node, "when").map((elem) => nodeVal(elem)),
    };
}
function fixRing(ring) {
    if (ring.length === 0)
        return ring;
    const first = ring[0];
    const last = ring[ring.length - 1];
    let equal = true;
    for (let i = 0; i < Math.max(first.length, last.length); i++) {
        if (first[i] !== last[i]) {
            equal = false;
            break;
        }
    }
    if (!equal) {
        return ring.concat([ring[0]]);
    }
    return ring;
}
function getCoordinates(node) {
    return nodeVal(get1(node, "coordinates"));
}
function getGeometry(node) {
    let geometries = [];
    let coordTimes = [];
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes.item(i);
        if (isElement(child)) {
            switch (child.tagName) {
                case "MultiGeometry":
                case "MultiTrack":
                case "gx:MultiTrack": {
                    const childGeometries = getGeometry(child);
                    geometries = geometries.concat(childGeometries.geometries);
                    coordTimes = coordTimes.concat(childGeometries.coordTimes);
                    break;
                }
                case "Point": {
                    const coordinates = coord1(getCoordinates(child));
                    if (coordinates.length >= 2) {
                        geometries.push({
                            type: "Point",
                            coordinates,
                        });
                    }
                    break;
                }
                case "LinearRing":
                case "LineString": {
                    const coordinates = coord(getCoordinates(child));
                    if (coordinates.length >= 2) {
                        geometries.push({
                            type: "LineString",
                            coordinates,
                        });
                    }
                    break;
                }
                case "Polygon": {
                    const coords = [];
                    for (const linearRing of $(child, "LinearRing")) {
                        const ring = fixRing(coord(getCoordinates(linearRing)));
                        if (ring.length >= 4) {
                            coords.push(ring);
                        }
                    }
                    if (coords.length) {
                        geometries.push({
                            type: "Polygon",
                            coordinates: coords,
                        });
                    }
                    break;
                }
                case "Track":
                case "gx:Track": {
                    const gx = gxCoords(child);
                    if (!gx)
                        break;
                    const { times, geometry } = gx;
                    geometries.push(geometry);
                    if (times.length)
                        coordTimes.push(times);
                    break;
                }
            }
        }
    }
    return {
        geometries,
        coordTimes,
    };
}

function geometryListToGeometry(geometries) {
    return geometries.length === 0
        ? null
        : geometries.length === 1
            ? geometries[0]
            : {
                type: "GeometryCollection",
                geometries,
            };
}
function getPlacemark(node, styleMap, schema) {
    const { coordTimes, geometries } = getGeometry(node);
    const feature = {
        type: "Feature",
        geometry: geometryListToGeometry(geometries),
        properties: Object.assign(getMulti(node, [
            "name",
            "address",
            "visibility",
            "open",
            "phoneNumber",
            "description",
        ]), getMaybeHTMLDescription(node), extractCascadedStyle(node, styleMap), extractStyle(node), extractExtendedData(node, schema), extractTimeSpan(node), extractTimeStamp(node), coordTimes.length
            ? {
                coordinateProperties: {
                    times: coordTimes.length === 1 ? coordTimes[0] : coordTimes,
                },
            }
            : {}),
    };
    if (feature.properties?.visibility !== undefined) {
        feature.properties.visibility = feature.properties.visibility !== "0";
    }
    const id = node.getAttribute("id");
    if (id !== null && id !== "")
        feature.id = id;
    return feature;
}

function getGroundOverlayBox(node) {
    const latLonQuad = get1(node, "gx:LatLonQuad");
    if (latLonQuad) {
        const ring = fixRing(coord(getCoordinates(node)));
        return {
            type: "Polygon",
            coordinates: [ring],
        };
    }
    return getLatLonBox(node);
}
const DEGREES_TO_RADIANS = Math.PI / 180;
function rotateBox(bbox, coordinates, rotation) {
    const center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
    return [
        coordinates[0].map((coordinate) => {
            const dy = coordinate[1] - center[1];
            const dx = coordinate[0] - center[0];
            const distance = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
            const angle = Math.atan2(dy, dx) - rotation * DEGREES_TO_RADIANS;
            return [
                center[0] + Math.cos(angle) * distance,
                center[1] + Math.sin(angle) * distance,
            ];
        }),
    ];
}
function getLatLonBox(node) {
    const latLonBox = get1(node, "LatLonBox");
    if (latLonBox) {
        const north = num1(latLonBox, "north");
        const west = num1(latLonBox, "west");
        const east = num1(latLonBox, "east");
        const south = num1(latLonBox, "south");
        const rotation = num1(latLonBox, "rotation");
        if (typeof north === "number" &&
            typeof south === "number" &&
            typeof west === "number" &&
            typeof east === "number") {
            const bbox = [west, south, east, north];
            let coordinates = [
                [
                    [west, north],
                    [east, north],
                    [east, south],
                    [west, south],
                    [west, north], // top left (again)
                ],
            ];
            if (typeof rotation === "number") {
                coordinates = rotateBox(bbox, coordinates, rotation);
            }
            return {
                type: "Polygon",
                coordinates,
            };
        }
    }
    return null;
}
function getGroundOverlay(node, styleMap, schema) {
    const geometry = getGroundOverlayBox(node);
    const feature = {
        type: "Feature",
        geometry,
        properties: Object.assign(
        /**
         * Related to
         * https://gist.github.com/tmcw/037a1cb6660d74a392e9da7446540f46
         */
        { "@geometry-type": "groundoverlay" }, getMulti(node, [
            "name",
            "address",
            "visibility",
            "open",
            "phoneNumber",
            "description",
        ]), getMaybeHTMLDescription(node), extractCascadedStyle(node, styleMap), extractStyle(node), extractIconHref(node), extractExtendedData(node, schema), extractTimeSpan(node), extractTimeStamp(node)),
    };
    if (feature.properties?.visibility !== undefined) {
        feature.properties.visibility = feature.properties.visibility !== "0";
    }
    const id = node.getAttribute("id");
    if (id !== null && id !== "")
        feature.id = id;
    return feature;
}

function getStyleId(style) {
    let id = style.getAttribute("id");
    const parentNode = style.parentNode;
    if (!id &&
        isElement(parentNode) &&
        parentNode.localName === "CascadingStyle") {
        id = parentNode.getAttribute("kml:id") || parentNode.getAttribute("id");
    }
    return normalizeId(id || "");
}
function buildStyleMap(node) {
    const styleMap = {};
    for (const style of $(node, "Style")) {
        styleMap[getStyleId(style)] = extractStyle(style);
    }
    for (const map of $(node, "StyleMap")) {
        const id = normalizeId(map.getAttribute("id") || "");
        val1(map, "styleUrl", (styleUrl) => {
            styleUrl = normalizeId(styleUrl);
            if (styleMap[styleUrl]) {
                styleMap[id] = styleMap[styleUrl];
            }
        });
    }
    return styleMap;
}
function buildSchema(node) {
    const schema = {};
    for (const field of $(node, "SimpleField")) {
        schema[field.getAttribute("name") || ""] =
            typeConverters[field.getAttribute("type") || ""] ||
                typeConverters["string"];
    }
    return schema;
}
const FOLDER_PROPS = [
    "name",
    "visibility",
    "open",
    "address",
    "description",
    "phoneNumber",
    "visibility",
];
function getFolder(node) {
    const meta = {};
    for (const child of Array.from(node.childNodes)) {
        if (isElement(child) && FOLDER_PROPS.includes(child.tagName)) {
            meta[child.tagName] = nodeVal(child);
        }
    }
    return {
        type: "folder",
        meta,
        children: [],
    };
}
/**
 * Yield a nested tree with KML folder structure
 *
 * This generates a tree with the given structure:
 *
 * ```js
 * {
 *   "type": "root",
 *   "children": [
 *     {
 *       "type": "folder",
 *       "meta": {
 *         "name": "Test"
 *       },
 *       "children": [
 *          // ...features and folders
 *       ]
 *     }
 *     // ...features
 *   ]
 * }
 * ```
 *
 * ### GroundOverlay
 *
 * GroundOverlay elements are converted into
 * `Feature` objects with `Polygon` geometries,
 * a property like:
 *
 * ```json
 * {
 *   "@geometry-type": "groundoverlay"
 * }
 * ```
 *
 * And the ground overlay's image URL in the `href`
 * property. Ground overlays will need to be displayed
 * with a separate method to other features, depending
 * on which map framework you're using.
 */
function kmlWithFolders(node) {
    const styleMap = buildStyleMap(node);
    const schema = buildSchema(node);
    const tree = { type: "root", children: [] };
    function traverse(node, pointer) {
        if (isElement(node)) {
            switch (node.tagName) {
                case "GroundOverlay": {
                    const placemark = getGroundOverlay(node, styleMap, schema);
                    if (placemark) {
                        pointer.children.push(placemark);
                    }
                    break;
                }
                case "Placemark": {
                    const placemark = getPlacemark(node, styleMap, schema);
                    if (placemark) {
                        pointer.children.push(placemark);
                    }
                    break;
                }
                case "Folder": {
                    const folder = getFolder(node);
                    pointer.children.push(folder);
                    pointer = folder;
                    break;
                }
            }
        }
        if (node.childNodes) {
            for (let i = 0; i < node.childNodes.length; i++) {
                traverse(node.childNodes[i], pointer);
            }
        }
    }
    traverse(node, tree);
    return tree;
}
/**
 * Convert KML to GeoJSON incrementally, returning
 * a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
 * that yields output feature by feature.
 */
function* kmlGen(node) {
    const styleMap = buildStyleMap(node);
    const schema = buildSchema(node);
    for (const placemark of $(node, "Placemark")) {
        const feature = getPlacemark(placemark, styleMap, schema);
        if (feature)
            yield feature;
    }
    for (const groundOverlay of $(node, "GroundOverlay")) {
        const feature = getGroundOverlay(groundOverlay, styleMap, schema);
        if (feature)
            yield feature;
    }
}
/**
 * Convert a KML document to GeoJSON. The first argument, `doc`, must be a KML
 * document as an XML DOM - not as a string. You can get this using jQuery's default
 * `.ajax` function or using a bare XMLHttpRequest with the `.response` property
 * holding an XML DOM.
 *
 * The output is a JavaScript object of GeoJSON data. You can convert it to a string
 * with [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
 * or use it directly in libraries.
 */
function kml(node) {
    return {
        type: "FeatureCollection",
        features: Array.from(kmlGen(node)),
    };
}

var toGeoJson = /*#__PURE__*/Object.freeze({
	__proto__: null,
	gpx: gpx,
	gpxGen: gpxGen,
	kml: kml,
	kmlGen: kmlGen,
	kmlWithFolders: kmlWithFolders,
	tcx: tcx,
	tcxGen: tcxGen
});

var utils = (() => {

    const purgeProps = (obj, blacklist) => {
        if (obj) {
            let rs = Object.assign({}, obj);
            if (blacklist) {
                for (let prop of blacklist) {
                    delete rs[prop];
                }
            }
            return rs;
        }
        return {};
    };

    const mergeProps = (obj1, obj2) => {
        obj1 = obj1? obj1 : {};
        obj2 = obj2? obj2 : {};
        return Object.assign(obj1, obj2);
    };

    const first = a => a[0];
    const last = a => a[a.length - 1];
    const coordsToKey = a => a.join(',');

    const addToMap = (m, k, v) => {
        let a = m[k];
        if (a) {
            a.push(v);
        } else {
            m[k] = [v];
        }
    };
    
    const removeFromMap = (m, k, v) => {
        let a = m[k];
        let idx = null;
        if (a && (idx = a.indexOf(v)) >= 0) {
            a.splice(idx, 1);
        }
    };
    
    const getFirstFromMap = (m, k) => {
        let a = m[k];
        if (a && a.length > 0) {
            return a[0];
        }
        return null;
    };

    // need 3+ different points to form a ring, here using > 3 is 'coz a the first and the last points are actually the same
    const isRing = a => a.length > 3 && coordsToKey(first(a)) === coordsToKey(last(a));

    const ringDirection = (a, xIdx, yIdx) => {
        xIdx = xIdx || 0, yIdx = yIdx || 1;
        // get the index of the point which has the maximum x value
        let m = a.reduce((maxxIdx, v, idx) => a[maxxIdx][xIdx] > v[xIdx] ? maxxIdx : idx, 0);
        // 'coz the first point is virtually the same one as the last point, 
        // we need to skip a.length - 1 for left when m = 0,
        // and skip 0 for right when m = a.length - 1;
        let l = m <= 0? a.length - 2 : m - 1, r = m >= a.length - 1? 1 : m + 1;
        let xa = a[l][xIdx], xb = a[m][xIdx], xc = a[r][xIdx];
        let ya = a[l][yIdx], yb = a[m][yIdx], yc = a[r][yIdx];
        let det = (xb - xa) * (yc - ya) - (xc - xa) * (yb - ya);
        return det < 0 ? 'clockwise' : 'counterclockwise';
    };

    const ptInsidePolygon = (pt, polygon, xIdx, yIdx) => {
        xIdx = xIdx || 0, yIdx = yIdx || 1;
        let result = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if ((polygon[i][xIdx] <= pt[xIdx] && pt[xIdx] < polygon[j][xIdx] ||
                polygon[j][xIdx] <= pt[xIdx] && pt[xIdx] < polygon[i][xIdx]) &&
                pt[yIdx] < (polygon[j][yIdx] - polygon[i][yIdx]) * (pt[xIdx] - polygon[i][xIdx]) / (polygon[j][xIdx] - polygon[i][xIdx]) + polygon[i][yIdx]) {
                    result = !result;
                }
                
        }
        return result;
    };

    const strToFloat = el => el instanceof Array? el.map(strToFloat) : parseFloat(el);
    
    class RefElements extends Map {
        constructor() {
            super();
            this.binders = [];
        }

        add(k, v) {
            if (!this.has(k)) {
                this.set(k, v);
            }
            // suppress duplcated key error
            // else
            // throw `Error: adding duplicated key '${k}' to RefElements`;
        }

        addBinder(binder) {
            this.binders.push(binder);
        }

        bindAll() {
            this.binders.forEach(binder => binder.bind());
        }
    }

    class LateBinder {
        constructor(container, valueFunc, ctx, args) {
            this.container = container;
            this.valueFunc = valueFunc;
            this.ctx = ctx;
            this.args = args;
        }

        bind() {
            let v = this.valueFunc.apply(this.ctx, this.args);
            if (this.container instanceof Array) {
                let idx = this.container.indexOf(this);
                if (idx >= 0) {
                    let args = [idx, 1];
                    if (v) {
                        args.push(v);
                    }
                    [].splice.apply(this.container, args);
                }
            } else if (typeof this.container === 'object') {
                let k = Object.keys(this.container).find(v => this.container[v] === this);
                if (k) {
                    if (v) {
                        this.container[k] = v;
                    } else {
                        delete this.container[k];
                    }
                }
            }
        }
    }

    class WayCollection extends Array {
        constructor() {
            super();
            this.firstMap = {};
            this.lastMap = {};
        }

        addWay(way) {
            way = way.toCoordsArray();
            if (way.length > 0) {
                this.push(way);
                addToMap(this.firstMap, coordsToKey(first(way)), way);
                addToMap(this.lastMap, coordsToKey(last(way)), way);
            }
        }

        toStrings() {
            let strings = [], way = null;
            while (way = this.shift()) {
                removeFromMap(this.firstMap, coordsToKey(first(way)), way);
                removeFromMap(this.lastMap, coordsToKey(last(way)), way);
                let current = way, next = null;
                do {
                    let key = coordsToKey(last(current)), shouldReverse = false;

                    next = getFirstFromMap(this.firstMap, key);                                        
                    if (!next) {
                        next = getFirstFromMap(this.lastMap, key);
                        shouldReverse = true;
                    }
                    
                    if (next) {
                        this.splice(this.indexOf(next), 1);
                        removeFromMap(this.firstMap, coordsToKey(first(next)), next);
                        removeFromMap(this.lastMap, coordsToKey(last(next)), next);
                        if (shouldReverse) {
                            // always reverse shorter one to save time
                            if (next.length > current.length) {
                                [current, next] = [next, current];
                            }
                            next.reverse();
                        }

                        current = current.concat(next.slice(1));
                    }
                } while (next);
                strings.push(strToFloat(current));
            }

            return strings;
        }

        toRings(direction) {
            let strings = this.toStrings();
            let rings = [], string = null;
            while (string = strings.shift()) {
                if (isRing(string)) {
                    if (ringDirection(string) !== direction) {
                        string.reverse();
                    }
                    rings.push(string);
                }    
            }
            return rings;
        }
    }

    return {purgeProps, mergeProps,
        first, last, coordsToKey,
        addToMap, removeFromMap, getFirstFromMap,
        isRing, ringDirection, ptInsidePolygon, strToFloat,
        RefElements, LateBinder, WayCollection};
})();

var building = {
};
var highway = {
	whitelist: [
		"services",
		"rest_area",
		"escape",
		"elevator"
	]
};
var natural = {
	blacklist: [
		"coastline",
		"cliff",
		"ridge",
		"arete",
		"tree_row"
	]
};
var landuse = {
};
var waterway = {
	whitelist: [
		"riverbank",
		"dock",
		"boatyard",
		"dam"
	]
};
var amenity = {
};
var leisure = {
};
var barrier = {
	whitelist: [
		"city_wall",
		"ditch",
		"hedge",
		"retaining_wall",
		"wall",
		"spikes"
	]
};
var railway = {
	whitelist: [
		"station",
		"turntable",
		"roundhouse",
		"platform"
	]
};
var area = {
};
var boundary = {
};
var man_made = {
	blacklist: [
		"cutline",
		"embankment",
		"pipeline"
	]
};
var power = {
	whitelist: [
		"plant",
		"substation",
		"generator",
		"transformer"
	]
};
var place = {
};
var shop = {
};
var aeroway = {
	blacklist: [
		"taxiway"
	]
};
var tourism = {
};
var historic = {
};
var public_transport = {
};
var office = {
};
var military = {
};
var ruins = {
};
var craft = {
};
var golf = {
};
var indoor = {
};
var require$$1 = {
	building: building,
	highway: highway,
	natural: natural,
	landuse: landuse,
	waterway: waterway,
	amenity: amenity,
	leisure: leisure,
	barrier: barrier,
	railway: railway,
	area: area,
	boundary: boundary,
	man_made: man_made,
	power: power,
	place: place,
	shop: shop,
	aeroway: aeroway,
	tourism: tourism,
	historic: historic,
	public_transport: public_transport,
	office: office,
	"building:part": {
},
	military: military,
	ruins: ruins,
	"area:highway": {
},
	craft: craft,
	golf: golf,
	indoor: indoor
};

var osmobjs = (() => {

    const {first, last, coordsToKey,
        addToMap, removeFromMap, getFirstFromMap, 
        isRing, ringDirection, ptInsidePolygon, strToFloat, 
        LateBinder, WayCollection} = utils,
        polygonTags = require$$1;

    class OsmObject {
        constructor(type, id, refElems) {
            this.type = type;
            this.id = id;
            this.refElems = refElems;
            this.tags = {};
            this.props = {id: this.getCompositeId()};
            this.refCount = 0;
            this.hasTag = false;
            if (refElems) {
                refElems.add(this.getCompositeId(), this);
            }
        }

        addTags(tags) {
            this.tags = Object.assign(this.tags, tags);
            this.hasTag = tags? true : false;
        }

        addTag(k, v) {
            this.tags[k] = v;
            this.hasTag = k? true : false;
        }

        addProp(k, v) {
            this.props[k] = v;
        }

        addProps(props) {
            this.props = Object.assign(this.props, props);    
        }

        getCompositeId() {
            return `${this.type}/${this.id}`;
        }

        getProps() {
            return Object.assign(this.props, this.tags);
        }        

        toFeatureArray() {
            return [];
        }
    }

    class Node extends OsmObject {
        constructor(id, refElems) {
            super('node', id, refElems);
            this.latLng = null;
        }

        setLatLng(latLng) {
            this.latLng = latLng;
        }

        toFeatureArray() {
            if (this.latLng) {
                return [{
                    type: 'Feature',
                    id: this.getCompositeId(),
                    properties: this.getProps(),
                    geometry: {
                        type: 'Point',
                        coordinates: strToFloat([this.latLng.lon, this.latLng.lat])
                    }
                }];
            }

            return [];
        }

        getLatLng() {
            return this.latLng;
        }
    }

    class Way extends OsmObject {
        constructor(id, refElems) {
            super('way', id, refElems);
            this.latLngArray = [];
            this.isPolygon = false;
        }

        addLatLng(latLng) {
            this.latLngArray.push(latLng);
        }

        setLatLngArray(latLngArray) {
            this.latLngArray = latLngArray;
        }

        addNodeRef(ref) {
            let binder = new LateBinder(this.latLngArray, function(id) {
                let node = this.refElems.get(`node/${id}`);
                if (node) {
                    node.refCount++;
                    return node.getLatLng();
                }
            }, this, [ref]);

            this.latLngArray.push(binder);
            this.refElems.addBinder(binder);
        }

        analyzeTag(k, v) {
            let o = polygonTags[k];
            if (o) {
                this.isPolygon = true;
                if (o.whitelist) {
                    this.isPolygon = o.whitelist.indexOf(v) >= 0? true : false;
                } else if(o.blacklist) {
                    this.isPolygon = o.blacklist.indexOf(v) >= 0? false : true;
                }
            }
        }

        addTags(tags) {
            super.addTags(tags);
            for (let [k, v] of Object.entries(tags)) {
                this.analyzeTag(k, v);
            }
        }

        addTag(k, v) {
            super.addTag(k, v);
            this.analyzeTag(k, v);
        }

        toCoordsArray() {
            return this.latLngArray.map(latLng => [latLng.lon, latLng.lat]);
        }

        toFeatureArray() {
            let coordsArray = this.toCoordsArray();
            if (coordsArray.length > 1) {
                coordsArray = strToFloat(coordsArray);
                let feature = {
                    type: 'Feature',
                    id: this.getCompositeId(),
                    properties: this.getProps(),
                    geometry: {
                        type: 'LineString',
                        coordinates: coordsArray
                    }
                };

                if (this.isPolygon && isRing(coordsArray)) {
                    if (ringDirection(coordsArray) !== 'counterclockwise') {
                        coordsArray.reverse();
                    }

                    feature.geometry = {
                        type: 'Polygon',
                        coordinates: [coordsArray]
                    };

                    return [feature];
                }

                return [feature];
            }

            return [];
        }
    }

    class Relation extends OsmObject {
        constructor(id, refElems) {
            super('relation', id, refElems);
            this.relations = [];
            this.nodes = [];
            this.bounds = null;
        }

        setBounds(bounds) {
            this.bounds = bounds;
        }

        addMember(member) {
            switch (member.type) {
                // super relation, need to do combination
                case 'relation':
                    let binder = new LateBinder(this.relations, function(id) {
                        let relation = this.refElems.get(`relation/${id}`);
                        if (relation) {
                            relation.refCount++;
                            return relation;
                        }
                    }, this, [member.ref]);
                    this.relations.push(binder);
                    this.refElems.addBinder(binder);
                    break;

                case 'way':
                    if (!member.role) {
                        member.role = '';
                    }
                    let ways = this[member.role];
                    if (!ways) {
                        ways = this[member.role] = [];
                    }
                    if (member.geometry) {
                        let way = new Way(member.ref, this.refElems);
                        way.setLatLngArray(member.geometry);
                        way.refCount++;
                        ways.push(way);
                    } else if (member.nodes) {
                        let way = new Way(member.ref, this.refElems);
                        for (let nid of member.nodes) {
                            way.addNodeRef(nid);
                        }
                        way.refCount++;
                        ways.push(way);
                    } else {
                        let binder = new LateBinder(ways, function(id) {
                            let way = this.refElems.get(`way/${id}`);
                            if (way) {
                                way.refCount++;
                                return way;
                            }
                        }, this, [member.ref]);
                        ways.push(binder);
                        this.refElems.addBinder(binder);
                    }
                    break;

                case 'node':
                    let node = null;
                    if (member.lat && member.lon) {
                        node = new Node(member.ref, this.refElems);
                        node.setLatLng({lon: member.lon, lat: member.lat});
                        if (member.tags) {
                            node.addTags(member.tags);
                        }
                        for (let [k, v] of Object.entries(member)) {
                            if (['id', 'type', 'lat', 'lon'].indexOf(k) < 0) {
                                node.addProp(k, v);
                            }
                        }

                        node.refCount++;
                        this.nodes.push(node);
                    } else {
                        let binder = new LateBinder(this.nodes, function(id) {
                            let node = this.refElems.get(`node/${id}`);
                            if (node) {
                                node.refCount++;
                                return node;
                            }
                        }, this, [member.ref]);
                        this.nodes.push(binder);
                        this.refElems.addBinder(binder);
                    }
                    break;
            }
        }

        toFeatureArray() {
            const constructStringGeometry = (ws) => {
                let strings = ws? ws.toStrings() : [];
                if (strings.length > 0) {
                    if (strings.length === 1) return {
                        type: 'LineString',
                        coordinates: strings[0]
                    }

                    return {
                        type: 'MultiLineString',
                        coordinates: strings
                    }
                }
                return null;
            };

            const constructPolygonGeometry = (ows, iws) => {
                let outerRings = ows? ows.toRings('counterclockwise') : [],
                    innerRings = iws? iws.toRings('clockwise') : [];
                                
                if (outerRings.length > 0) {
                    let compositPolyons = [];

                    let ring = null;
                    for (ring of outerRings)
                        compositPolyons.push([ring]);
                    
                    // link inner polygons to outer containers
                    while (ring = innerRings.shift()) {
                        for (let idx in outerRings) {
                            if (ptInsidePolygon(first(ring), outerRings[idx])) {
                                compositPolyons[idx].push(ring);
                                break;
                            }
                        }
                    }

                    // construct the Polygon/MultiPolygon geometry
                    if (compositPolyons.length === 1) {
                        return {
                            type: 'Polygon',
                            coordinates: compositPolyons[0]
                        };
                    }

                    return {
                        type: 'MultiPolygon',
                        coordinates: compositPolyons
                    }
                }

                return null;
            };

            let polygonFeatures = [], stringFeatures = [], pointFeatures = [];
            const waysFieldNames = ['outer', 'inner', ''];
            // need to do combination when there're nested relations
            for (let relation of this.relations) {
                if (relation) {
                    for (let fieldName of waysFieldNames) {
                        let ways = relation[fieldName];
                        if (ways) {
                            let thisWays = this[fieldName];
                            if (thisWays) {
                                [].splice.apply(thisWays, [thisWays.length, 0].concat(ways));
                            } else {
                                this[fieldName] = ways;
                            }
                        }
                    }
                }
            }

            for (let fieldName of waysFieldNames) {
                let ways = this[fieldName];
                if (ways) {
                    this[fieldName] = new WayCollection();
                    for (let way of ways) {
                        this[fieldName].addWay(way);
                    }
                }
            }

            let geometry = null;
            
            let feature = {
                type: 'Feature',
                id: this.getCompositeId(),
                bbox: this.bounds,
                properties: this.getProps()
            };

            if (!this.bounds) {
                delete feature.bbox;
            }

            if (this.outer) {
                geometry = constructPolygonGeometry(this.outer, this.inner);
                if (geometry) {
                    feature.geometry = geometry;
                    polygonFeatures.push(feature);
                }
            }
            else if (this['']) {
                geometry = constructStringGeometry(this['']);
                if (geometry) {
                    feature.geometry = geometry;
                    stringFeatures.push(feature);
                }
            }

            for (let node of this.nodes) {
                pointFeatures = pointFeatures.concat(node.toFeatureArray());
            }

            return polygonFeatures.concat(stringFeatures).concat(pointFeatures);
        }
    }

    return {Node, Way, Relation}; 
})();

var xmlparser = (() => {
    
    function conditioned(evt) {
        return evt.match(/^(.+?)\[(.+?)\]>$/g) != null;
    }

    function parseEvent(evt) {
        let match = /^(.+?)\[(.+?)\]>$/g.exec(evt);
        if (match) {
            return {evt: match[1] + '>', exp: match[2]};
        }
        return {evt: evt};
    }

    function genConditionFunc(cond) {
        let body = 'return ' + cond.replace(/(\$.+?)(?=[=!.])/g, 'node.$&') + ';';
        return new Function('node', body);
    }

    return class {
        constructor(opts) {
            if (opts) {
                this.queryParent = opts.queryParent? true : false;
                this.progressive = opts.progressive;
                if (this.queryParent) {
                    this.parentMap = new WeakMap();
                }
            }
            this.evtListeners = {};
        }

        parse(xml, parent, dir) {
            dir = dir? dir + '.' : '';
            let nodeRegEx = /<([^ >\/]+)(.*?)>/mg, nodeMatch = null, nodes = [];
            while (nodeMatch = nodeRegEx.exec(xml)) {
                let tag = nodeMatch[1], node = {$tag: tag}, fullTag = dir + tag; 

                let attrText = nodeMatch[2].trim(), closed = false;
                if (attrText.endsWith('/') || tag.startsWith('?') || tag.startsWith('!')) {
                    closed = true;
                }

                let attRegEx1 = /([^ ]+?)="(.+?)"/g, attRegEx2 = /([^ ]+?)='(.+?)'/g;
                let attMatch = null, hasAttrs = false;
                while (attMatch = attRegEx1.exec(attrText)) {
                    hasAttrs = true;
                    node[attMatch[1]] = attMatch[2];
                }
                if (!hasAttrs)
                    while (attMatch = attRegEx2.exec(attrText)) {
                        hasAttrs = true;
                        node[attMatch[1]] = attMatch[2];
                    }

                if (!hasAttrs && attrText !== '') {
                    node.text = attrText;
                }
                if (this.progressive) {
                    this.emit(`<${fullTag}>`, node, parent);
                }

                if (!closed) {
                    let innerRegEx = new RegExp(`([^]+?)<\/${tag}>`, 'g');
                    innerRegEx.lastIndex = nodeRegEx.lastIndex;
                    let innerMatch = innerRegEx.exec(xml);
                    if (innerMatch && innerMatch[1]) {
                        nodeRegEx.lastIndex = innerRegEx.lastIndex;
                        let innerNodes = this.parse(innerMatch[1], node, fullTag);
                        if (innerNodes.length > 0) {
                            node.$innerNodes = innerNodes;
                        } else {
                            node.$innerText = innerMatch[1];
                        }
                    }
                }
                if (this.queryParent && parent) {
                    this.parentMap.set(node, parent);
                }

                if (this.progressive) {
                    this.emit(`</${fullTag}>`, node, parent);
                }

                nodes.push(node);
            }

            return nodes;
        }

        getParent(node) {
            if (this.queryParent) {
                return this.parentMap.get(node);
            }
            return null;
        }

        $addListener(evt, func) {
            let funcs = this.evtListeners[evt];
            if (funcs) {
                funcs.push(func);
            } else {
                this.evtListeners[evt] = [func];
            }
        }

        // support javascript condition for the last tag
        addListener(evt, func) {
            if (conditioned(evt)) {
                // func.prototype = evt;
                evt = parseEvent(evt);    
                func.condition = genConditionFunc(evt.exp);
                evt = evt.evt;
            }
            this.$addListener(evt, func);
        }

        $removeListener(evt, func) {
            let funcs = this.evtListeners[evt];
            let idx = null;
            if (funcs && (idx = funcs.indexOf(func)) >= 0) {
                funcs.splice(idx, 1);
            }
        }

        removeListener(evt, func) {
            if (conditioned(evt)) {
                evt = parseEvent(evt);    
                evt = evt.evt;
            }
            this.$removeListener(evt, func);
        }

        emit(evt, ...args) {
            let funcs = this.evtListeners[evt];
            if (funcs) {
                for (let func of funcs) {
                    if (func.condition) {
                        if (func.condition.apply(null, args) === true) {
                            func.apply(null, args);
                        }
                    } else {
                        func.apply(null, args);
                    }
                }
            }
        }

        on(evt, func) {
            this.addListener(evt, func);
        }

        off(evt, func) {
            this.removeListener(evt, func);
        }
    };
})();

const {Node, Way, Relation} = osmobjs,
    {purgeProps, RefElements} = utils,
    XmlParser = xmlparser;

var lib = (osm, opts) => {
    let completeFeature = false, renderTagged = false, excludeWay = true;

    const parseOpts = opts => {
        if (opts) {
            completeFeature = opts.completeFeature || opts.allFeatures? true : false;
            renderTagged = opts.renderTagged? true : false;
            let wayOpt = opts.suppressWay || opts.excludeWay;
            if (wayOpt !== undefined && !wayOpt) {
                excludeWay = false;
            }
        }
    };

    parseOpts(opts);

    const detectFormat = osm => {
        if (osm.elements) {
            return 'json';
        }
        if (osm.indexOf('<osm') >= 0) {
            return 'xml';
        }
        if (osm.trim().startsWith('{')) {
            return 'json-raw';
        }
        return 'invalid';
    };

    let format = detectFormat(osm);

    let refElements = new RefElements(), featureArray = [];

    const analyzeFeaturesFromJson = osm => {
        for (let elem of osm.elements) {
            switch(elem.type) {
                case 'node':
                    let node = new Node(elem.id, refElements);
                    if (elem.tags) {
                        node.addTags(elem.tags);
                    }
                    node.addProps(purgeProps(elem, ['id', 'type', 'tags', 'lat', 'lon']));
                    node.setLatLng(elem);
                    break;

                case 'way':
                    let way = new Way(elem.id, refElements);
                    if (elem.tags) {
                        way.addTags(elem.tags);
                    }
                    way.addProps(purgeProps(elem, ['id', 'type', 'tags', 'nodes', 'geometry']));
                    if (elem.nodes) {
                        for (let n of elem.nodes) {
                            way.addNodeRef(n);
                        }
                    } else if (elem.geometry) {
                        way.setLatLngArray(elem.geometry);
                    }
                    break;

                case 'relation':
                    let relation = new Relation(elem.id, refElements);
                      if (elem.bounds) {
                        relation.setBounds([parseFloat(elem.bounds.minlon), parseFloat(elem.bounds.minlat), parseFloat(elem.bounds.maxlon), parseFloat(elem.bounds.maxlat)]);
                    }
                    if (elem.tags) {
                        relation.addTags(elem.tags);
                    }
                    relation.addProps(purgeProps(elem, ['id', 'type', 'tags', 'bounds', 'members']));
                    if (elem.members) {
                        for (let member of elem.members) {
                            relation.addMember(member);
                        }
                    }
                    break;
            }
        }
    };

    const analyzeFeaturesFromXml = osm => {
        const xmlParser = new XmlParser({progressive: true});

        xmlParser.on('</osm.node>', node => {
            let nd = new Node(node.id, refElements);
            for (let [k, v] of Object.entries(node))
                if (!k.startsWith('$') && ['id', 'lon', 'lat'].indexOf(k) < 0) {
                    nd.addProp(k, v);
                }
            nd.setLatLng(node);
            if (node.$innerNodes) {
                for (let ind of node.$innerNodes) {
                    if(ind.$tag === 'tag') {
                        nd.addTag(ind.k, ind.v);
                    }
                }
            }
        });

        xmlParser.on('</osm.way>', node => {
            let way = new Way(node.id, refElements);
            for (let [k, v] of Object.entries(node)) {
                if (!k.startsWith('$') && ['id'].indexOf(k) < 0) {
                    way.addProp(k, v);
                }
            }
            if (node.$innerNodes) {
                for (let ind of node.$innerNodes) {
                    if (ind.$tag === 'nd') {
                        if (ind.lon && ind.lat) {
                            way.addLatLng(ind);
                        } else if (ind.ref) {
                            way.addNodeRef(ind.ref);
                        }
                    } else if (ind.$tag === 'tag')
                        way.addTag(ind.k, ind.v);
                }
            }
        });

        xmlParser.on('<osm.relation>', node => {
            new Relation(node.id, refElements);
        });

        xmlParser.on('</osm.relation.member>', (node, parent) => {
            let relation = refElements.get(`relation/${parent.id}`);
            let member = {
                type: node.type,
                role: node.role? node.role : '',
                ref: node.ref
            };
            if (node.lat && node.lon) {
                member.lat = node.lat, member.lon = node.lon, member.tags = {};
                for (let [k, v] of Object.entries(node)) {
                    if (!k.startsWith('$') && ['type', 'lat', 'lon'].indexOf(k) < 0) {
                        member[k] = v;
                    }
                }
            }
            if (node.$innerNodes) {
                let geometry = [];
                let nodes = [];
                for (let ind of node.$innerNodes) {
                    if (ind.lat && ind.lon) {
                        geometry.push(ind);
                    } else {
                        nodes.push(ind.ref);
                    }
                }
                if (geometry.length > 0) {
                    member.geometry = geometry;
                } else if (nodes.length > 0) {
                    member.nodes = nodes;
                }
            }
            relation.addMember(member);
        });

        xmlParser.on('</osm.relation.bounds>', (node, parent) => {
            refElements.get(`relation/${parent.id}`).setBounds([parseFloat(node.minlon), parseFloat(node.minlat), parseFloat(node.maxlon), parseFloat(node.maxlat)]);
        });

        xmlParser.on('</osm.relation.tag>', (node, parent) => {
            refElements.get(`relation/${parent.id}`).addTag(node.k, node.v);
        });
        
        xmlParser.parse(osm);
    };

    if (format === 'json-raw') {
        osm = JSON.parse(osm);
        if (osm.elements) {
            format = 'json';
        } else {
            format = 'invalid';
        }
    }

    if (format === 'json') {
        analyzeFeaturesFromJson(osm);
    } else if (format === 'xml') {
        analyzeFeaturesFromXml(osm);
    }

    refElements.bindAll();

    for (let v of refElements.values()) {
        if (v.refCount <= 0 || (v.hasTag && renderTagged && !(v instanceof Way && excludeWay))) {
            let features = v.toFeatureArray();
            // return the first geometry of the first relation element
            if (v instanceof Relation && !completeFeature && features.length > 0) {
                return features[0].geometry;
            }
            featureArray = featureArray.concat(features);
        }
    }

    return {type: 'FeatureCollection', features: featureArray};
};

var osm2geojson = /*@__PURE__*/getDefaultExportFromCjs(lib);

const supportedFormats = ['topojson', 'osm', 'kml', 'gpx', 'tcx', 'csv', 'tsv'];
class Converter {
    constructor(format, data) {
        /**
         * Creates a blank GeoJSON feature collection.
         * @returns A new GeoJSON feature collection with no features.
         */
        this.blankGeoJSON = () => ({
            type: 'FeatureCollection',
            features: [],
        });
        this._rawData = data;
        this._format = format;
        const converters = {
            'topojson': this.loadTopoJson,
            'osm': this.loadOsm,
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
    /**
     * Load the XML data as GeoJSON
     * @returns A promise resolving to a GeoJSON FeatureCollection
     */
    async loadXml() {
        // Use the appropriate parser based on the format
        const geojson = toGeoJson[this._format](new DOMParser().parseFromString(this._rawData, "text/xml"));
        return geojson;
    }
    /**
     * Loads and parses CSV data into a GeoJSON FeatureCollection.
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    async loadCsv() {
        // Define options for the csv2geojson library
        let options = {}; // TODO allow CSV options
        if (this._format === 'tsv') {
            options.delimiter = '\t';
        }
        // Use the csv2geojson library to convert the CSV to GeoJSON
        const geojson = await new Promise((resolve, reject) => {
            csv2geojson_1.csv2geojson(this._rawData, options, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
        return geojson;
    }
    /**
     * Loads TopoJSON data and converts it into a GeoJSON FeatureCollection
     */
    async loadTopoJson() {
        let topoJsonData = {};
        try {
            topoJsonData = JSON.parse(this._rawData);
        }
        catch (e) {
            throw "Invalid TopoJson";
        }
        // Convert the data
        let result = this.blankGeoJSON();
        if (topoJsonData.type === "Topology" && topoJsonData.objects !== undefined) {
            result = {
                type: "FeatureCollection",
                features: result.features = Object.keys(topoJsonData.objects).map(key => topojsonFeature(topoJsonData, key)).reduce((a, v) => [...a, ...v.features], [])
            };
        }
        return result;
    }
    ;
    /**
     * Loads OSM data and converts it into a GeoJSON FeatureCollection
     */
    async loadOsm() {
        return osm2geojson(this._rawData);
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

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewoJJ3VzZSBzdHJpY3QnOwoKCWZ1bmN0aW9uIGdldERlZmF1bHRFeHBvcnRGcm9tQ2pzICh4KSB7CgkJcmV0dXJuIHggJiYgeC5fX2VzTW9kdWxlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnZGVmYXVsdCcpID8geFsnZGVmYXVsdCddIDogeDsKCX0KCglmdW5jdGlvbiBnZXRBdWdtZW50ZWROYW1lc3BhY2UobikgewoJICBpZiAobi5fX2VzTW9kdWxlKSByZXR1cm4gbjsKCSAgdmFyIGYgPSBuLmRlZmF1bHQ7CgkJaWYgKHR5cGVvZiBmID09ICJmdW5jdGlvbiIpIHsKCQkJdmFyIGEgPSBmdW5jdGlvbiBhICgpIHsKCQkJCWlmICh0aGlzIGluc3RhbmNlb2YgYSkgewoJCQkJCXZhciBhcmdzID0gW251bGxdOwoJCQkJCWFyZ3MucHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpOwoJCQkJCXZhciBDdG9yID0gRnVuY3Rpb24uYmluZC5hcHBseShmLCBhcmdzKTsKCQkJCQlyZXR1cm4gbmV3IEN0b3IoKTsKCQkJCX0KCQkJCXJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7CgkJCX07CgkJCWEucHJvdG90eXBlID0gZi5wcm90b3R5cGU7CgkgIH0gZWxzZSBhID0ge307CgkgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pOwoJCU9iamVjdC5rZXlzKG4pLmZvckVhY2goZnVuY3Rpb24gKGspIHsKCQkJdmFyIGQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG4sIGspOwoJCQlPYmplY3QuZGVmaW5lUHJvcGVydHkoYSwgaywgZC5nZXQgPyBkIDogewoJCQkJZW51bWVyYWJsZTogdHJ1ZSwKCQkJCWdldDogZnVuY3Rpb24gKCkgewoJCQkJCXJldHVybiBuW2tdOwoJCQkJfQoJCQl9KTsKCQl9KTsKCQlyZXR1cm4gYTsKCX0KCglmdW5jdGlvbiBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucykgewoJICByZXR1cm4gbmV3IEZ1bmN0aW9uKCJkIiwgInJldHVybiB7IiArIGNvbHVtbnMubWFwKGZ1bmN0aW9uKG5hbWUsIGkpIHsKCSAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobmFtZSkgKyAiOiBkWyIgKyBpICsgIl0iOwoJICB9KS5qb2luKCIsIikgKyAifSIpOwoJfQoKCWZ1bmN0aW9uIGN1c3RvbUNvbnZlcnRlcihjb2x1bW5zLCBmKSB7CgkgIHZhciBvYmplY3QgPSBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucyk7CgkgIHJldHVybiBmdW5jdGlvbihyb3csIGkpIHsKCSAgICByZXR1cm4gZihvYmplY3Qocm93KSwgaSwgY29sdW1ucyk7CgkgIH07Cgl9CgoJLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuCglmdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykgewoJICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSwKCSAgICAgIGNvbHVtbnMgPSBbXTsKCgkgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHsKCSAgICBmb3IgKHZhciBjb2x1bW4gaW4gcm93KSB7CgkgICAgICBpZiAoIShjb2x1bW4gaW4gY29sdW1uU2V0KSkgewoJICAgICAgICBjb2x1bW5zLnB1c2goY29sdW1uU2V0W2NvbHVtbl0gPSBjb2x1bW4pOwoJICAgICAgfQoJICAgIH0KCSAgfSk7CgoJICByZXR1cm4gY29sdW1uczsKCX0KCglmdW5jdGlvbiBkc3YkMShkZWxpbWl0ZXIpIHsKCSAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cCgiW1wiIiArIGRlbGltaXRlciArICJcbl0iKSwKCSAgICAgIGRlbGltaXRlckNvZGUgPSBkZWxpbWl0ZXIuY2hhckNvZGVBdCgwKTsKCgkgIGZ1bmN0aW9uIHBhcnNlKHRleHQsIGYpIHsKCSAgICB2YXIgY29udmVydCwgY29sdW1ucywgcm93cyA9IHBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHsKCSAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTsKCSAgICAgIGNvbHVtbnMgPSByb3csIGNvbnZlcnQgPSBmID8gY3VzdG9tQ29udmVydGVyKHJvdywgZikgOiBvYmplY3RDb252ZXJ0ZXIocm93KTsKCSAgICB9KTsKCSAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zOwoJICAgIHJldHVybiByb3dzOwoJICB9CgoJICBmdW5jdGlvbiBwYXJzZVJvd3ModGV4dCwgZikgewoJICAgIHZhciBFT0wgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1saW5lCgkgICAgICAgIEVPRiA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWZpbGUKCSAgICAgICAgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93cwoJICAgICAgICBOID0gdGV4dC5sZW5ndGgsCgkgICAgICAgIEkgPSAwLCAvLyBjdXJyZW50IGNoYXJhY3RlciBpbmRleAoJICAgICAgICBuID0gMCwgLy8gdGhlIGN1cnJlbnQgbGluZSBudW1iZXIKCSAgICAgICAgdCwgLy8gdGhlIGN1cnJlbnQgdG9rZW4KCSAgICAgICAgZW9sOyAvLyBpcyB0aGUgY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0w/CgoJICAgIGZ1bmN0aW9uIHRva2VuKCkgewoJICAgICAgaWYgKEkgPj0gTikgcmV0dXJuIEVPRjsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgZmlsZQoJICAgICAgaWYgKGVvbCkgcmV0dXJuIGVvbCA9IGZhbHNlLCBFT0w7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGxpbmUKCgkgICAgICAvLyBzcGVjaWFsIGNhc2U6IHF1b3RlcwoJICAgICAgdmFyIGogPSBJLCBjOwoJICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChqKSA9PT0gMzQpIHsKCSAgICAgICAgdmFyIGkgPSBqOwoJICAgICAgICB3aGlsZSAoaSsrIDwgTikgewoJICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSkgPT09IDM0KSB7CgkgICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrOwoJICAgICAgICAgICAgKytpOwoJICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgICAgICBJID0gaSArIDI7CgkgICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSArIDEpOwoJICAgICAgICBpZiAoYyA9PT0gMTMpIHsKCSAgICAgICAgICBlb2wgPSB0cnVlOwoJICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDIpID09PSAxMCkgKytJOwoJICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDEwKSB7CgkgICAgICAgICAgZW9sID0gdHJ1ZTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqICsgMSwgaSkucmVwbGFjZSgvIiIvZywgIlwiIik7CgkgICAgICB9CgoJICAgICAgLy8gY29tbW9uIGNhc2U6IGZpbmQgbmV4dCBkZWxpbWl0ZXIgb3IgbmV3bGluZQoJICAgICAgd2hpbGUgKEkgPCBOKSB7CgkgICAgICAgIHZhciBrID0gMTsKCSAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChJKyspOwoJICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IC8vIFxuCgkgICAgICAgIGVsc2UgaWYgKGMgPT09IDEzKSB7IGVvbCA9IHRydWU7IGlmICh0ZXh0LmNoYXJDb2RlQXQoSSkgPT09IDEwKSArK0ksICsrazsgfSAvLyBccnxcclxuCgkgICAgICAgIGVsc2UgaWYgKGMgIT09IGRlbGltaXRlckNvZGUpIGNvbnRpbnVlOwoJICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqLCBJIC0gayk7CgkgICAgICB9CgoJICAgICAgLy8gc3BlY2lhbCBjYXNlOiBsYXN0IHRva2VuIGJlZm9yZSBFT0YKCSAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGopOwoJICAgIH0KCgkgICAgd2hpbGUgKCh0ID0gdG9rZW4oKSkgIT09IEVPRikgewoJICAgICAgdmFyIGEgPSBbXTsKCSAgICAgIHdoaWxlICh0ICE9PSBFT0wgJiYgdCAhPT0gRU9GKSB7CgkgICAgICAgIGEucHVzaCh0KTsKCSAgICAgICAgdCA9IHRva2VuKCk7CgkgICAgICB9CgkgICAgICBpZiAoZiAmJiAoYSA9IGYoYSwgbisrKSkgPT0gbnVsbCkgY29udGludWU7CgkgICAgICByb3dzLnB1c2goYSk7CgkgICAgfQoKCSAgICByZXR1cm4gcm93czsKCSAgfQoKCSAgZnVuY3Rpb24gZm9ybWF0KHJvd3MsIGNvbHVtbnMpIHsKCSAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpOwoJICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykgewoJICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikgewoJICAgICAgICByZXR1cm4gZm9ybWF0VmFsdWUocm93W2NvbHVtbl0pOwoJICAgICAgfSkuam9pbihkZWxpbWl0ZXIpOwoJICAgIH0pKS5qb2luKCJcbiIpOwoJICB9CgoJICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHsKCSAgICByZXR1cm4gcm93cy5tYXAoZm9ybWF0Um93KS5qb2luKCJcbiIpOwoJICB9CgoJICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7CgkgICAgcmV0dXJuIHJvdy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKTsKCSAgfQoKCSAgZnVuY3Rpb24gZm9ybWF0VmFsdWUodGV4dCkgewoJICAgIHJldHVybiB0ZXh0ID09IG51bGwgPyAiIgoJICAgICAgICA6IHJlRm9ybWF0LnRlc3QodGV4dCArPSAiIikgPyAiXCIiICsgdGV4dC5yZXBsYWNlKC9cIi9nLCAiXCJcIiIpICsgIlwiIgoJICAgICAgICA6IHRleHQ7CgkgIH0KCgkgIHJldHVybiB7CgkgICAgcGFyc2U6IHBhcnNlLAoJICAgIHBhcnNlUm93czogcGFyc2VSb3dzLAoJICAgIGZvcm1hdDogZm9ybWF0LAoJICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3MKCSAgfTsKCX0KCgl2YXIgY3N2ID0gZHN2JDEoIiwiKTsKCgl2YXIgY3N2UGFyc2UgPSBjc3YucGFyc2U7Cgl2YXIgY3N2UGFyc2VSb3dzID0gY3N2LnBhcnNlUm93czsKCXZhciBjc3ZGb3JtYXQgPSBjc3YuZm9ybWF0OwoJdmFyIGNzdkZvcm1hdFJvd3MgPSBjc3YuZm9ybWF0Um93czsKCgl2YXIgdHN2ID0gZHN2JDEoIlx0Iik7CgoJdmFyIHRzdlBhcnNlID0gdHN2LnBhcnNlOwoJdmFyIHRzdlBhcnNlUm93cyA9IHRzdi5wYXJzZVJvd3M7Cgl2YXIgdHN2Rm9ybWF0ID0gdHN2LmZvcm1hdDsKCXZhciB0c3ZGb3JtYXRSb3dzID0gdHN2LmZvcm1hdFJvd3M7CgoJdmFyIGQzRHN2ID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoewoJCV9fcHJvdG9fXzogbnVsbCwKCQlkc3ZGb3JtYXQ6IGRzdiQxLAoJCWNzdlBhcnNlOiBjc3ZQYXJzZSwKCQljc3ZQYXJzZVJvd3M6IGNzdlBhcnNlUm93cywKCQljc3ZGb3JtYXQ6IGNzdkZvcm1hdCwKCQljc3ZGb3JtYXRSb3dzOiBjc3ZGb3JtYXRSb3dzLAoJCXRzdlBhcnNlOiB0c3ZQYXJzZSwKCQl0c3ZQYXJzZVJvd3M6IHRzdlBhcnNlUm93cywKCQl0c3ZGb3JtYXQ6IHRzdkZvcm1hdCwKCQl0c3ZGb3JtYXRSb3dzOiB0c3ZGb3JtYXRSb3dzCgl9KTsKCgl2YXIgcmVxdWlyZSQkMCA9IC8qQF9fUFVSRV9fKi9nZXRBdWdtZW50ZWROYW1lc3BhY2UoZDNEc3YpOwoKCXZhciBzZXhhZ2VzaW1hbCQxID0ge2V4cG9ydHM6IHt9fTsKCglzZXhhZ2VzaW1hbCQxLmV4cG9ydHMgPSBlbGVtZW50OwoJc2V4YWdlc2ltYWwkMS5leHBvcnRzLnBhaXIgPSBwYWlyOwoJc2V4YWdlc2ltYWwkMS5leHBvcnRzLmZvcm1hdCA9IGZvcm1hdDsKCXNleGFnZXNpbWFsJDEuZXhwb3J0cy5mb3JtYXRQYWlyID0gZm9ybWF0UGFpcjsKCXNleGFnZXNpbWFsJDEuZXhwb3J0cy5jb29yZFRvRE1TID0gY29vcmRUb0RNUzsKCgoJZnVuY3Rpb24gZWxlbWVudChpbnB1dCwgZGltcykgewoJICB2YXIgcmVzdWx0ID0gc2VhcmNoKGlucHV0LCBkaW1zKTsKCSAgcmV0dXJuIChyZXN1bHQgPT09IG51bGwpID8gbnVsbCA6IHJlc3VsdC52YWw7Cgl9CgoKCWZ1bmN0aW9uIGZvcm1hdFBhaXIoaW5wdXQpIHsKCSAgcmV0dXJuIGZvcm1hdChpbnB1dC5sYXQsICdsYXQnKSArICcgJyArIGZvcm1hdChpbnB1dC5sb24sICdsb24nKTsKCX0KCgoJLy8gSXMgMCBOb3J0aCBvciBTb3V0aD8KCWZ1bmN0aW9uIGZvcm1hdChpbnB1dCwgZGltKSB7CgkgIHZhciBkbXMgPSBjb29yZFRvRE1TKGlucHV0LCBkaW0pOwoJICByZXR1cm4gZG1zLndob2xlICsgJ8KwICcgKwoJICAgIChkbXMubWludXRlcyA/IGRtcy5taW51dGVzICsgJ1wnICcgOiAnJykgKwoJICAgIChkbXMuc2Vjb25kcyA/IGRtcy5zZWNvbmRzICsgJyIgJyA6ICcnKSArIGRtcy5kaXI7Cgl9CgoKCWZ1bmN0aW9uIGNvb3JkVG9ETVMoaW5wdXQsIGRpbSkgewoJICB2YXIgZGlycyA9IHsgbGF0OiBbJ04nLCAnUyddLCBsb246IFsnRScsICdXJ10gfVtkaW1dIHx8ICcnOwoJICB2YXIgZGlyID0gZGlyc1tpbnB1dCA+PSAwID8gMCA6IDFdOwoJICB2YXIgYWJzID0gTWF0aC5hYnMoaW5wdXQpOwoJICB2YXIgd2hvbGUgPSBNYXRoLmZsb29yKGFicyk7CgkgIHZhciBmcmFjdGlvbiA9IGFicyAtIHdob2xlOwoJICB2YXIgZnJhY3Rpb25NaW51dGVzID0gZnJhY3Rpb24gKiA2MDsKCSAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKGZyYWN0aW9uTWludXRlcyk7CgkgIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcigoZnJhY3Rpb25NaW51dGVzIC0gbWludXRlcykgKiA2MCk7CgoJICByZXR1cm4gewoJICAgIHdob2xlOiB3aG9sZSwKCSAgICBtaW51dGVzOiBtaW51dGVzLAoJICAgIHNlY29uZHM6IHNlY29uZHMsCgkgICAgZGlyOiBkaXIKCSAgfTsKCX0KCgoJZnVuY3Rpb24gc2VhcmNoKGlucHV0LCBkaW1zKSB7CgkgIGlmICghZGltcykgZGltcyA9ICdOU0VXJzsKCSAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsOwoKCSAgaW5wdXQgPSBpbnB1dC50b1VwcGVyQ2FzZSgpOwoJICB2YXIgcmVnZXggPSAvXltcc1wsXSooW05TRVddKT9ccyooW1wtfFzigJR8XOKAlV0/WzAtOS5dKylbwrDCusuaXT9ccyooPzooWzAtOS5dKylbJ+KAmeKAsuKAmF1ccyopPyg/OihbMC05Ll0rKSg/OicnfCJ84oCdfOKAsylccyopPyhbTlNFV10pPy87CgoJICB2YXIgbSA9IGlucHV0Lm1hdGNoKHJlZ2V4KTsKCSAgaWYgKCFtKSByZXR1cm4gbnVsbDsgIC8vIG5vIG1hdGNoCgoJICB2YXIgbWF0Y2hlZCA9IG1bMF07CgoJICAvLyBleHRyYWN0IGRpbWVuc2lvbi4uIG1bMV0gPSBsZWFkaW5nLCBtWzVdID0gdHJhaWxpbmcKCSAgdmFyIGRpbTsKCSAgaWYgKG1bMV0gJiYgbVs1XSkgeyAgICAgICAgICAgICAgICAgLy8gaWYgbWF0Y2hlZCBib3RoLi4KCSAgICBkaW0gPSBtWzFdOyAgICAgICAgICAgICAgICAgICAgICAgLy8ga2VlcCBsZWFkaW5nCgkgICAgbWF0Y2hlZCA9IG1hdGNoZWQuc2xpY2UoMCwgLTEpOyAgIC8vIHJlbW92ZSB0cmFpbGluZyBkaW1lbnNpb24gZnJvbSBtYXRjaAoJICB9IGVsc2UgewoJICAgIGRpbSA9IG1bMV0gfHwgbVs1XTsKCSAgfQoKCSAgLy8gaWYgdW5yZWNvZ25pemVkIGRpbWVuc2lvbgoJICBpZiAoZGltICYmIGRpbXMuaW5kZXhPZihkaW0pID09PSAtMSkgcmV0dXJuIG51bGw7CgoJICAvLyBleHRyYWN0IERNUwoJICB2YXIgZGVnID0gbVsyXSA/IHBhcnNlRmxvYXQobVsyXSkgOiAwOwoJICB2YXIgbWluID0gbVszXSA/IHBhcnNlRmxvYXQobVszXSkgLyA2MCA6IDA7CgkgIHZhciBzZWMgPSBtWzRdID8gcGFyc2VGbG9hdChtWzRdKSAvIDM2MDAgOiAwOwoJICB2YXIgc2lnbiA9IChkZWcgPCAwKSA/IC0xIDogMTsKCSAgaWYgKGRpbSA9PT0gJ1MnIHx8IGRpbSA9PT0gJ1cnKSBzaWduICo9IC0xOwoKCSAgcmV0dXJuIHsKCSAgICB2YWw6IChNYXRoLmFicyhkZWcpICsgbWluICsgc2VjKSAqIHNpZ24sCgkgICAgZGltOiBkaW0sCgkgICAgbWF0Y2hlZDogbWF0Y2hlZCwKCSAgICByZW1haW46IGlucHV0LnNsaWNlKG1hdGNoZWQubGVuZ3RoKQoJICB9OwoJfQoKCglmdW5jdGlvbiBwYWlyKGlucHV0LCBkaW1zKSB7CgkgIGlucHV0ID0gaW5wdXQudHJpbSgpOwoJICB2YXIgb25lID0gc2VhcmNoKGlucHV0LCBkaW1zKTsKCSAgaWYgKCFvbmUpIHJldHVybiBudWxsOwoKCSAgaW5wdXQgPSBvbmUucmVtYWluLnRyaW0oKTsKCSAgdmFyIHR3byA9IHNlYXJjaChpbnB1dCwgZGltcyk7CgkgIGlmICghdHdvIHx8IHR3by5yZW1haW4pIHJldHVybiBudWxsOwoKCSAgaWYgKG9uZS5kaW0pIHsKCSAgICByZXR1cm4gc3dhcGRpbShvbmUudmFsLCB0d28udmFsLCBvbmUuZGltKTsKCSAgfSBlbHNlIHsKCSAgICByZXR1cm4gW29uZS52YWwsIHR3by52YWxdOwoJICB9Cgl9CgoKCWZ1bmN0aW9uIHN3YXBkaW0oYSwgYiwgZGltKSB7CgkgIGlmIChkaW0gPT09ICdOJyB8fCBkaW0gPT09ICdTJykgcmV0dXJuIFthLCBiXTsKCSAgaWYgKGRpbSA9PT0gJ1cnIHx8IGRpbSA9PT0gJ0UnKSByZXR1cm4gW2IsIGFdOwoJfQoKCXZhciBzZXhhZ2VzaW1hbEV4cG9ydHMgPSBzZXhhZ2VzaW1hbCQxLmV4cG9ydHM7CgoJdmFyIGRzdiA9IHJlcXVpcmUkJDAsCgkgICAgc2V4YWdlc2ltYWwgPSBzZXhhZ2VzaW1hbEV4cG9ydHM7CgoJdmFyIGxhdFJlZ2V4ID0gLyhMYXQpKGl0dWRlKT8vZ2ksCgkgICAgbG9uUmVnZXggPSAvKEwpKG9ufG5nKShnaXR1ZGUpPy9pOwoKCWZ1bmN0aW9uIGd1ZXNzSGVhZGVyKHJvdywgcmVnZXhwKSB7CgkgICAgdmFyIG5hbWUsIG1hdGNoLCBzY29yZTsKCSAgICBmb3IgKHZhciBmIGluIHJvdykgewoJICAgICAgICBtYXRjaCA9IGYubWF0Y2gocmVnZXhwKTsKCSAgICAgICAgaWYgKG1hdGNoICYmICghbmFtZSB8fCBtYXRjaFswXS5sZW5ndGggLyBmLmxlbmd0aCA+IHNjb3JlKSkgewoJICAgICAgICAgICAgc2NvcmUgPSBtYXRjaFswXS5sZW5ndGggLyBmLmxlbmd0aDsKCSAgICAgICAgICAgIG5hbWUgPSBmOwoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiBuYW1lOwoJfQoKCWZ1bmN0aW9uIGd1ZXNzTGF0SGVhZGVyKHJvdykgeyByZXR1cm4gZ3Vlc3NIZWFkZXIocm93LCBsYXRSZWdleCk7IH0KCWZ1bmN0aW9uIGd1ZXNzTG9uSGVhZGVyKHJvdykgeyByZXR1cm4gZ3Vlc3NIZWFkZXIocm93LCBsb25SZWdleCk7IH0KCglmdW5jdGlvbiBpc0xhdChmKSB7IHJldHVybiAhIWYubWF0Y2gobGF0UmVnZXgpOyB9CglmdW5jdGlvbiBpc0xvbihmKSB7IHJldHVybiAhIWYubWF0Y2gobG9uUmVnZXgpOyB9CgoJZnVuY3Rpb24ga2V5Q291bnQobykgewoJICAgIHJldHVybiAodHlwZW9mIG8gPT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXMobykubGVuZ3RoIDogMDsKCX0KCglmdW5jdGlvbiBhdXRvRGVsaW1pdGVyKHgpIHsKCSAgICB2YXIgZGVsaW1pdGVycyA9IFsnLCcsICc7JywgJ1x0JywgJ3wnXTsKCSAgICB2YXIgcmVzdWx0cyA9IFtdOwoKCSAgICBkZWxpbWl0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGRlbGltaXRlcikgewoJICAgICAgICB2YXIgcmVzID0gZHN2LmRzdkZvcm1hdChkZWxpbWl0ZXIpLnBhcnNlKHgpOwoJICAgICAgICBpZiAocmVzLmxlbmd0aCA+PSAxKSB7CgkgICAgICAgICAgICB2YXIgY291bnQgPSBrZXlDb3VudChyZXNbMF0pOwoJICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgICAgICAgICBpZiAoa2V5Q291bnQocmVzW2ldKSAhPT0gY291bnQpIHJldHVybjsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7CgkgICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIsCgkgICAgICAgICAgICAgICAgYXJpdHk6IE9iamVjdC5rZXlzKHJlc1swXSkubGVuZ3RoLAoJICAgICAgICAgICAgfSk7CgkgICAgICAgIH0KCSAgICB9KTsKCgkgICAgaWYgKHJlc3VsdHMubGVuZ3RoKSB7CgkgICAgICAgIHJldHVybiByZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsKCSAgICAgICAgICAgIHJldHVybiBiLmFyaXR5IC0gYS5hcml0eTsKCSAgICAgICAgfSlbMF0uZGVsaW1pdGVyOwoJICAgIH0gZWxzZSB7CgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIH0KCX0KCgkvKioKCSAqIFNpbGx5IHN0b3BnYXAgZm9yIGRzdiB0byBkMy1kc3YgdXBncmFkZQoJICoKCSAqIEBwYXJhbSB7QXJyYXl9IHggZHN2IG91dHB1dAoJICogQHJldHVybnMge0FycmF5fSBhcnJheSB3aXRob3V0IGNvbHVtbnMgbWVtYmVyCgkgKi8KCWZ1bmN0aW9uIGRlbGV0ZUNvbHVtbnMoeCkgewoJICAgIGRlbGV0ZSB4LmNvbHVtbnM7CgkgICAgcmV0dXJuIHg7Cgl9CgoJZnVuY3Rpb24gYXV0byh4KSB7CgkgICAgdmFyIGRlbGltaXRlciA9IGF1dG9EZWxpbWl0ZXIoeCk7CgkgICAgaWYgKCFkZWxpbWl0ZXIpIHJldHVybiBudWxsOwoJICAgIHJldHVybiBkZWxldGVDb2x1bW5zKGRzdi5kc3ZGb3JtYXQoZGVsaW1pdGVyKS5wYXJzZSh4KSk7Cgl9CgoJZnVuY3Rpb24gY3N2Mmdlb2pzb24oeCwgb3B0aW9ucywgY2FsbGJhY2spIHsKCgkgICAgaWYgKCFjYWxsYmFjaykgewoJICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7CgkgICAgICAgIG9wdGlvbnMgPSB7fTsKCSAgICB9CgoJICAgIG9wdGlvbnMuZGVsaW1pdGVyID0gb3B0aW9ucy5kZWxpbWl0ZXIgfHwgJywnOwoKCSAgICB2YXIgbGF0ZmllbGQgPSBvcHRpb25zLmxhdGZpZWxkIHx8ICcnLAoJICAgICAgICBsb25maWVsZCA9IG9wdGlvbnMubG9uZmllbGQgfHwgJycsCgkgICAgICAgIGNycyA9IG9wdGlvbnMuY3JzIHx8ICcnOwoKCSAgICB2YXIgZmVhdHVyZXMgPSBbXSwKCSAgICAgICAgZmVhdHVyZWNvbGxlY3Rpb24gPSB7dHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywgZmVhdHVyZXM6IGZlYXR1cmVzfTsKCgkgICAgaWYgKGNycyAhPT0gJycpIHsKCSAgICAgICAgZmVhdHVyZWNvbGxlY3Rpb24uY3JzID0ge3R5cGU6ICduYW1lJywgcHJvcGVydGllczoge25hbWU6IGNyc319OwoJICAgIH0KCgkgICAgaWYgKG9wdGlvbnMuZGVsaW1pdGVyID09PSAnYXV0bycgJiYgdHlwZW9mIHggPT0gJ3N0cmluZycpIHsKCSAgICAgICAgb3B0aW9ucy5kZWxpbWl0ZXIgPSBhdXRvRGVsaW1pdGVyKHgpOwoJICAgICAgICBpZiAoIW9wdGlvbnMuZGVsaW1pdGVyKSB7CgkgICAgICAgICAgICBjYWxsYmFjayh7CgkgICAgICAgICAgICAgICAgdHlwZTogJ0Vycm9yJywKCSAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQ291bGQgbm90IGF1dG9kZXRlY3QgZGVsaW1pdGVyJwoJICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICByZXR1cm47CgkgICAgICAgIH0KCSAgICB9CgoJICAgIHZhciBudW1lcmljRmllbGRzID0gb3B0aW9ucy5udW1lcmljRmllbGRzID8gb3B0aW9ucy5udW1lcmljRmllbGRzLnNwbGl0KCcsJykgOiBudWxsOwoKCSAgICB2YXIgcGFyc2VkID0gKHR5cGVvZiB4ID09ICdzdHJpbmcnKSA/CgkgICAgICAgIGRzdi5kc3ZGb3JtYXQob3B0aW9ucy5kZWxpbWl0ZXIpLnBhcnNlKHgsIGZ1bmN0aW9uIChkKSB7CgkgICAgICAgICAgICBpZiAobnVtZXJpY0ZpZWxkcykgewoJICAgICAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChudW1lcmljRmllbGRzLmluY2x1ZGVzKGtleSkpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGRba2V5XSA9ICtkW2tleV07CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICByZXR1cm4gZDsKCSAgICAgICAgfSkgOiB4OwoKCSAgICBpZiAoIXBhcnNlZC5sZW5ndGgpIHsKCSAgICAgICAgY2FsbGJhY2sobnVsbCwgZmVhdHVyZWNvbGxlY3Rpb24pOwoJICAgICAgICByZXR1cm47CgkgICAgfQoKCSAgICB2YXIgZXJyb3JzID0gW107CgkgICAgdmFyIGk7CgoKCSAgICBpZiAoIWxhdGZpZWxkKSBsYXRmaWVsZCA9IGd1ZXNzTGF0SGVhZGVyKHBhcnNlZFswXSk7CgkgICAgaWYgKCFsb25maWVsZCkgbG9uZmllbGQgPSBndWVzc0xvbkhlYWRlcihwYXJzZWRbMF0pOwoJICAgIHZhciBub0dlb21ldHJ5ID0gKCFsYXRmaWVsZCB8fCAhbG9uZmllbGQpOwoKCSAgICBpZiAobm9HZW9tZXRyeSkgewoJICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFyc2VkLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgICAgICBmZWF0dXJlcy5wdXNoKHsKCSAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgICAgICAgICAgcHJvcGVydGllczogcGFyc2VkW2ldLAoJICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBudWxsCgkgICAgICAgICAgICB9KTsKCSAgICAgICAgfQoJICAgICAgICBjYWxsYmFjayhlcnJvcnMubGVuZ3RoID8gZXJyb3JzIDogbnVsbCwgZmVhdHVyZWNvbGxlY3Rpb24pOwoJICAgICAgICByZXR1cm47CgkgICAgfQoKCSAgICBmb3IgKGkgPSAwOyBpIDwgcGFyc2VkLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGlmIChwYXJzZWRbaV1bbG9uZmllbGRdICE9PSB1bmRlZmluZWQgJiYKCSAgICAgICAgICAgIHBhcnNlZFtpXVtsYXRmaWVsZF0gIT09IHVuZGVmaW5lZCkgewoKCSAgICAgICAgICAgIHZhciBsb25rID0gcGFyc2VkW2ldW2xvbmZpZWxkXSwKCSAgICAgICAgICAgICAgICBsYXRrID0gcGFyc2VkW2ldW2xhdGZpZWxkXSwKCSAgICAgICAgICAgICAgICBsb25mLCBsYXRmLAoJICAgICAgICAgICAgICAgIGE7CgoJICAgICAgICAgICAgYSA9IHNleGFnZXNpbWFsKGxvbmssICdFVycpOwoJICAgICAgICAgICAgaWYgKGEpIGxvbmsgPSBhOwoJICAgICAgICAgICAgYSA9IHNleGFnZXNpbWFsKGxhdGssICdOUycpOwoJICAgICAgICAgICAgaWYgKGEpIGxhdGsgPSBhOwoKCSAgICAgICAgICAgIGxvbmYgPSBwYXJzZUZsb2F0KGxvbmspOwoJICAgICAgICAgICAgbGF0ZiA9IHBhcnNlRmxvYXQobGF0ayk7CgoJICAgICAgICAgICAgaWYgKGlzTmFOKGxvbmYpIHx8CgkgICAgICAgICAgICAgICAgaXNOYU4obGF0ZikpIHsKCSAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7CgkgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBIHJvdyBjb250YWluZWQgYW4gaW52YWxpZCB2YWx1ZSBmb3IgbGF0aXR1ZGUgb3IgbG9uZ2l0dWRlJywKCSAgICAgICAgICAgICAgICAgICAgcm93OiBwYXJzZWRbaV0sCgkgICAgICAgICAgICAgICAgICAgIGluZGV4OiBpCgkgICAgICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlTGF0TG9uKSB7CgkgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBwYXJzZWRbaV1bbG9uZmllbGRdOwoJICAgICAgICAgICAgICAgICAgICBkZWxldGUgcGFyc2VkW2ldW2xhdGZpZWxkXTsKCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIGZlYXR1cmVzLnB1c2goewoJICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHBhcnNlZFtpXSwKCSAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogWwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQobG9uZiksCgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChsYXRmKQoJICAgICAgICAgICAgICAgICAgICAgICAgXQoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9CgoJICAgIGNhbGxiYWNrKGVycm9ycy5sZW5ndGggPyBlcnJvcnMgOiBudWxsLCBmZWF0dXJlY29sbGVjdGlvbik7Cgl9CgoJZnVuY3Rpb24gdG9MaW5lKGdqKSB7CgkgICAgdmFyIGZlYXR1cmVzID0gZ2ouZmVhdHVyZXM7CgkgICAgdmFyIGxpbmUgPSB7CgkgICAgICAgIHR5cGU6ICdGZWF0dXJlJywKCSAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJywKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXQoJICAgICAgICB9CgkgICAgfTsKCSAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGxpbmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMucHVzaChmZWF0dXJlc1tpXS5nZW9tZXRyeS5jb29yZGluYXRlcyk7CgkgICAgfQoJICAgIGxpbmUucHJvcGVydGllcyA9IGZlYXR1cmVzLnJlZHVjZShmdW5jdGlvbiAoYWdncmVnYXRlZFByb3BlcnRpZXMsIG5ld0ZlYXR1cmUpIHsKCSAgICAgICAgZm9yICh2YXIga2V5IGluIG5ld0ZlYXR1cmUucHJvcGVydGllcykgewoJICAgICAgICAgICAgaWYgKCFhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldKSB7CgkgICAgICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XSA9IFtdOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XS5wdXNoKG5ld0ZlYXR1cmUucHJvcGVydGllc1trZXldKTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gYWdncmVnYXRlZFByb3BlcnRpZXM7CgkgICAgfSwge30pOwoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsCgkgICAgICAgIGZlYXR1cmVzOiBbbGluZV0KCSAgICB9OwoJfQoKCWZ1bmN0aW9uIHRvUG9seWdvbihnaikgewoJICAgIHZhciBmZWF0dXJlcyA9IGdqLmZlYXR1cmVzOwoJICAgIHZhciBwb2x5ID0gewoJICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsCgkgICAgICAgICAgICBjb29yZGluYXRlczogW1tdXQoJICAgICAgICB9CgkgICAgfTsKCSAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIHBvbHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ucHVzaChmZWF0dXJlc1tpXS5nZW9tZXRyeS5jb29yZGluYXRlcyk7CgkgICAgfQoJICAgIHBvbHkucHJvcGVydGllcyA9IGZlYXR1cmVzLnJlZHVjZShmdW5jdGlvbiAoYWdncmVnYXRlZFByb3BlcnRpZXMsIG5ld0ZlYXR1cmUpIHsKCSAgICAgICAgZm9yICh2YXIga2V5IGluIG5ld0ZlYXR1cmUucHJvcGVydGllcykgewoJICAgICAgICAgICAgaWYgKCFhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldKSB7CgkgICAgICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XSA9IFtdOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XS5wdXNoKG5ld0ZlYXR1cmUucHJvcGVydGllc1trZXldKTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gYWdncmVnYXRlZFByb3BlcnRpZXM7CgkgICAgfSwge30pOwoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsCgkgICAgICAgIGZlYXR1cmVzOiBbcG9seV0KCSAgICB9OwoJfQoKCXZhciBjc3YyZ2VvanNvbl8xID0gewoJICAgIGlzTG9uOiBpc0xvbiwKCSAgICBpc0xhdDogaXNMYXQsCgkgICAgZ3Vlc3NMYXRIZWFkZXI6IGd1ZXNzTGF0SGVhZGVyLAoJICAgIGd1ZXNzTG9uSGVhZGVyOiBndWVzc0xvbkhlYWRlciwKCSAgICBjc3Y6IGRzdi5jc3ZQYXJzZSwKCSAgICB0c3Y6IGRzdi50c3ZQYXJzZSwKCSAgICBkc3Y6IGRzdiwKCSAgICBhdXRvOiBhdXRvLAoJICAgIGNzdjJnZW9qc29uOiBjc3YyZ2VvanNvbiwKCSAgICB0b0xpbmU6IHRvTGluZSwKCSAgICB0b1BvbHlnb246IHRvUG9seWdvbgoJfTsKCglmdW5jdGlvbiBpZGVudGl0eSh4KSB7CgkgIHJldHVybiB4OwoJfQoKCWZ1bmN0aW9uIHRyYW5zZm9ybSh0cmFuc2Zvcm0pIHsKCSAgaWYgKHRyYW5zZm9ybSA9PSBudWxsKSByZXR1cm4gaWRlbnRpdHk7CgkgIHZhciB4MCwKCSAgICAgIHkwLAoJICAgICAga3ggPSB0cmFuc2Zvcm0uc2NhbGVbMF0sCgkgICAgICBreSA9IHRyYW5zZm9ybS5zY2FsZVsxXSwKCSAgICAgIGR4ID0gdHJhbnNmb3JtLnRyYW5zbGF0ZVswXSwKCSAgICAgIGR5ID0gdHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTsKCSAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCBpKSB7CgkgICAgaWYgKCFpKSB4MCA9IHkwID0gMDsKCSAgICB2YXIgaiA9IDIsIG4gPSBpbnB1dC5sZW5ndGgsIG91dHB1dCA9IG5ldyBBcnJheShuKTsKCSAgICBvdXRwdXRbMF0gPSAoeDAgKz0gaW5wdXRbMF0pICoga3ggKyBkeDsKCSAgICBvdXRwdXRbMV0gPSAoeTAgKz0gaW5wdXRbMV0pICoga3kgKyBkeTsKCSAgICB3aGlsZSAoaiA8IG4pIG91dHB1dFtqXSA9IGlucHV0W2pdLCArK2o7CgkgICAgcmV0dXJuIG91dHB1dDsKCSAgfTsKCX0KCglmdW5jdGlvbiByZXZlcnNlKGFycmF5LCBuKSB7CgkgIHZhciB0LCBqID0gYXJyYXkubGVuZ3RoLCBpID0gaiAtIG47CgkgIHdoaWxlIChpIDwgLS1qKSB0ID0gYXJyYXlbaV0sIGFycmF5W2krK10gPSBhcnJheVtqXSwgYXJyYXlbal0gPSB0OwoJfQoKCWZ1bmN0aW9uIHRvcG9qc29uRmVhdHVyZSh0b3BvbG9neSwgbykgewoJICBpZiAodHlwZW9mIG8gPT09ICJzdHJpbmciKSBvID0gdG9wb2xvZ3kub2JqZWN0c1tvXTsKCSAgcmV0dXJuIG8udHlwZSA9PT0gIkdlb21ldHJ5Q29sbGVjdGlvbiIKCSAgICAgID8ge3R5cGU6ICJGZWF0dXJlQ29sbGVjdGlvbiIsIGZlYXR1cmVzOiBvLmdlb21ldHJpZXMubWFwKGZ1bmN0aW9uKG8pIHsgcmV0dXJuIGZlYXR1cmUodG9wb2xvZ3ksIG8pOyB9KX0KCSAgICAgIDogZmVhdHVyZSh0b3BvbG9neSwgbyk7Cgl9CgoJZnVuY3Rpb24gZmVhdHVyZSh0b3BvbG9neSwgbykgewoJICB2YXIgaWQgPSBvLmlkLAoJICAgICAgYmJveCA9IG8uYmJveCwKCSAgICAgIHByb3BlcnRpZXMgPSBvLnByb3BlcnRpZXMgPT0gbnVsbCA/IHt9IDogby5wcm9wZXJ0aWVzLAoJICAgICAgZ2VvbWV0cnkgPSBvYmplY3QodG9wb2xvZ3ksIG8pOwoJICByZXR1cm4gaWQgPT0gbnVsbCAmJiBiYm94ID09IG51bGwgPyB7dHlwZTogIkZlYXR1cmUiLCBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLCBnZW9tZXRyeTogZ2VvbWV0cnl9CgkgICAgICA6IGJib3ggPT0gbnVsbCA/IHt0eXBlOiAiRmVhdHVyZSIsIGlkOiBpZCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fQoJICAgICAgOiB7dHlwZTogIkZlYXR1cmUiLCBpZDogaWQsIGJib3g6IGJib3gsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX07Cgl9CgoJZnVuY3Rpb24gb2JqZWN0KHRvcG9sb2d5LCBvKSB7CgkgIHZhciB0cmFuc2Zvcm1Qb2ludCA9IHRyYW5zZm9ybSh0b3BvbG9neS50cmFuc2Zvcm0pLAoJICAgICAgYXJjcyA9IHRvcG9sb2d5LmFyY3M7CgoJICBmdW5jdGlvbiBhcmMoaSwgcG9pbnRzKSB7CgkgICAgaWYgKHBvaW50cy5sZW5ndGgpIHBvaW50cy5wb3AoKTsKCSAgICBmb3IgKHZhciBhID0gYXJjc1tpIDwgMCA/IH5pIDogaV0sIGsgPSAwLCBuID0gYS5sZW5ndGg7IGsgPCBuOyArK2spIHsKCSAgICAgIHBvaW50cy5wdXNoKHRyYW5zZm9ybVBvaW50KGFba10sIGspKTsKCSAgICB9CgkgICAgaWYgKGkgPCAwKSByZXZlcnNlKHBvaW50cywgbik7CgkgIH0KCgkgIGZ1bmN0aW9uIHBvaW50KHApIHsKCSAgICByZXR1cm4gdHJhbnNmb3JtUG9pbnQocCk7CgkgIH0KCgkgIGZ1bmN0aW9uIGxpbmUoYXJjcykgewoJICAgIHZhciBwb2ludHMgPSBbXTsKCSAgICBmb3IgKHZhciBpID0gMCwgbiA9IGFyY3MubGVuZ3RoOyBpIDwgbjsgKytpKSBhcmMoYXJjc1tpXSwgcG9pbnRzKTsKCSAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDIpIHBvaW50cy5wdXNoKHBvaW50c1swXSk7IC8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBwZXIgdGhlIHNwZWNpZmljYXRpb24uCgkgICAgcmV0dXJuIHBvaW50czsKCSAgfQoKCSAgZnVuY3Rpb24gcmluZyhhcmNzKSB7CgkgICAgdmFyIHBvaW50cyA9IGxpbmUoYXJjcyk7CgkgICAgd2hpbGUgKHBvaW50cy5sZW5ndGggPCA0KSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIG1heSBoYXBwZW4gaWYgYW4gYXJjIGhhcyBvbmx5IHR3byBwb2ludHMuCgkgICAgcmV0dXJuIHBvaW50czsKCSAgfQoKCSAgZnVuY3Rpb24gcG9seWdvbihhcmNzKSB7CgkgICAgcmV0dXJuIGFyY3MubWFwKHJpbmcpOwoJICB9CgoJICBmdW5jdGlvbiBnZW9tZXRyeShvKSB7CgkgICAgdmFyIHR5cGUgPSBvLnR5cGUsIGNvb3JkaW5hdGVzOwoJICAgIHN3aXRjaCAodHlwZSkgewoJICAgICAgY2FzZSAiR2VvbWV0cnlDb2xsZWN0aW9uIjogcmV0dXJuIHt0eXBlOiB0eXBlLCBnZW9tZXRyaWVzOiBvLmdlb21ldHJpZXMubWFwKGdlb21ldHJ5KX07CgkgICAgICBjYXNlICJQb2ludCI6IGNvb3JkaW5hdGVzID0gcG9pbnQoby5jb29yZGluYXRlcyk7IGJyZWFrOwoJICAgICAgY2FzZSAiTXVsdGlQb2ludCI6IGNvb3JkaW5hdGVzID0gby5jb29yZGluYXRlcy5tYXAocG9pbnQpOyBicmVhazsKCSAgICAgIGNhc2UgIkxpbmVTdHJpbmciOiBjb29yZGluYXRlcyA9IGxpbmUoby5hcmNzKTsgYnJlYWs7CgkgICAgICBjYXNlICJNdWx0aUxpbmVTdHJpbmciOiBjb29yZGluYXRlcyA9IG8uYXJjcy5tYXAobGluZSk7IGJyZWFrOwoJICAgICAgY2FzZSAiUG9seWdvbiI6IGNvb3JkaW5hdGVzID0gcG9seWdvbihvLmFyY3MpOyBicmVhazsKCSAgICAgIGNhc2UgIk11bHRpUG9seWdvbiI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChwb2x5Z29uKTsgYnJlYWs7CgkgICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDsKCSAgICB9CgkgICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9OwoJICB9CgoJICByZXR1cm4gZ2VvbWV0cnkobyk7Cgl9CgoJZnVuY3Rpb24gJChlbGVtZW50LCB0YWdOYW1lKSB7CgkgICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKSk7Cgl9CglmdW5jdGlvbiBub3JtYWxpemVJZChpZCkgewoJICAgIHJldHVybiBpZFswXSA9PT0gIiMiID8gaWQgOiBgIyR7aWR9YDsKCX0KCWZ1bmN0aW9uICRucyhlbGVtZW50LCB0YWdOYW1lLCBucykgewoJICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWVOUyhucywgdGFnTmFtZSkpOwoJfQoJLyoqCgkgKiBnZXQgdGhlIGNvbnRlbnQgb2YgYSB0ZXh0IG5vZGUsIGlmIGFueQoJICovCglmdW5jdGlvbiBub2RlVmFsKG5vZGUpIHsKCSAgICBub2RlPy5ub3JtYWxpemUoKTsKCSAgICByZXR1cm4gKG5vZGUgJiYgbm9kZS50ZXh0Q29udGVudCkgfHwgIiI7Cgl9CgkvKioKCSAqIEdldCBvbmUgWSBjaGlsZCBvZiBYLCBpZiBhbnksIG90aGVyd2lzZSBudWxsCgkgKi8KCWZ1bmN0aW9uIGdldDEobm9kZSwgdGFnTmFtZSwgY2FsbGJhY2spIHsKCSAgICBjb25zdCBuID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKTsKCSAgICBjb25zdCByZXN1bHQgPSBuLmxlbmd0aCA/IG5bMF0gOiBudWxsOwoJICAgIGlmIChyZXN1bHQgJiYgY2FsbGJhY2spCgkgICAgICAgIGNhbGxiYWNrKHJlc3VsdCk7CgkgICAgcmV0dXJuIHJlc3VsdDsKCX0KCWZ1bmN0aW9uIGdldChub2RlLCB0YWdOYW1lLCBjYWxsYmFjaykgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fTsKCSAgICBpZiAoIW5vZGUpCgkgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJICAgIGNvbnN0IG4gPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpOwoJICAgIGNvbnN0IHJlc3VsdCA9IG4ubGVuZ3RoID8gblswXSA6IG51bGw7CgkgICAgaWYgKHJlc3VsdCAmJiBjYWxsYmFjaykgewoJICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzdWx0LCBwcm9wZXJ0aWVzKTsKCSAgICB9CgkgICAgcmV0dXJuIHByb3BlcnRpZXM7Cgl9CglmdW5jdGlvbiB2YWwxKG5vZGUsIHRhZ05hbWUsIGNhbGxiYWNrKSB7CgkgICAgY29uc3QgdmFsID0gbm9kZVZhbChnZXQxKG5vZGUsIHRhZ05hbWUpKTsKCSAgICBpZiAodmFsICYmIGNhbGxiYWNrKQoJICAgICAgICByZXR1cm4gY2FsbGJhY2sodmFsKSB8fCB7fTsKCSAgICByZXR1cm4ge307Cgl9CglmdW5jdGlvbiAkbnVtKG5vZGUsIHRhZ05hbWUsIGNhbGxiYWNrKSB7CgkgICAgY29uc3QgdmFsID0gcGFyc2VGbG9hdChub2RlVmFsKGdldDEobm9kZSwgdGFnTmFtZSkpKTsKCSAgICBpZiAoaXNOYU4odmFsKSkKCSAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsKCSAgICBpZiAodmFsICYmIGNhbGxiYWNrKQoJICAgICAgICByZXR1cm4gY2FsbGJhY2sodmFsKSB8fCB7fTsKCSAgICByZXR1cm4ge307Cgl9CglmdW5jdGlvbiBudW0xKG5vZGUsIHRhZ05hbWUsIGNhbGxiYWNrKSB7CgkgICAgY29uc3QgdmFsID0gcGFyc2VGbG9hdChub2RlVmFsKGdldDEobm9kZSwgdGFnTmFtZSkpKTsKCSAgICBpZiAoaXNOYU4odmFsKSkKCSAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsKCSAgICBpZiAodmFsICYmIGNhbGxiYWNrKQoJICAgICAgICBjYWxsYmFjayh2YWwpOwoJICAgIHJldHVybiB2YWw7Cgl9CglmdW5jdGlvbiBnZXRNdWx0aShub2RlLCBwcm9wZXJ0eU5hbWVzKSB7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IHt9OwoJICAgIGZvciAoY29uc3QgcHJvcGVydHkgb2YgcHJvcGVydHlOYW1lcykgewoJICAgICAgICB2YWwxKG5vZGUsIHByb3BlcnR5LCAodmFsKSA9PiB7CgkgICAgICAgICAgICBwcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHZhbDsKCSAgICAgICAgfSk7CgkgICAgfQoJICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJfQoJZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHsKCSAgICByZXR1cm4gbm9kZT8ubm9kZVR5cGUgPT09IDE7Cgl9CgoJZnVuY3Rpb24gZ2V0TGluZVN0eWxlKG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJsaW5lIiwgKGxpbmVTdHlsZSkgPT4gewoJICAgICAgICBjb25zdCB2YWwgPSBPYmplY3QuYXNzaWduKHt9LCB2YWwxKGxpbmVTdHlsZSwgImNvbG9yIiwgKGNvbG9yKSA9PiB7CgkgICAgICAgICAgICByZXR1cm4geyBzdHJva2U6IGAjJHtjb2xvcn1gIH07CgkgICAgICAgIH0pLCAkbnVtKGxpbmVTdHlsZSwgIm9wYWNpdHkiLCAob3BhY2l0eSkgPT4gewoJICAgICAgICAgICAgcmV0dXJuIHsgInN0cm9rZS1vcGFjaXR5Ijogb3BhY2l0eSB9OwoJICAgICAgICB9KSwgJG51bShsaW5lU3R5bGUsICJ3aWR0aCIsICh3aWR0aCkgPT4gewoJICAgICAgICAgICAgLy8gR1BYIHdpZHRoIGlzIGluIG1tLCBjb252ZXJ0IHRvIHB4IHdpdGggOTYgcHggcGVyIGluY2gKCSAgICAgICAgICAgIHJldHVybiB7ICJzdHJva2Utd2lkdGgiOiAod2lkdGggKiA5NikgLyAyNS40IH07CgkgICAgICAgIH0pKTsKCSAgICAgICAgcmV0dXJuIHZhbDsKCSAgICB9KTsKCX0KCglmdW5jdGlvbiBnZXRFeHRlbnNpb25zKG5vZGUpIHsKCSAgICBsZXQgdmFsdWVzID0gW107CgkgICAgaWYgKG5vZGUgPT09IG51bGwpCgkgICAgICAgIHJldHVybiB2YWx1ZXM7CgkgICAgZm9yIChjb25zdCBjaGlsZCBvZiBBcnJheS5mcm9tKG5vZGUuY2hpbGROb2RlcykpIHsKCSAgICAgICAgaWYgKCFpc0VsZW1lbnQoY2hpbGQpKQoJICAgICAgICAgICAgY29udGludWU7CgkgICAgICAgIGNvbnN0IG5hbWUgPSBhYmJyZXZpYXRlTmFtZShjaGlsZC5ub2RlTmFtZSk7CgkgICAgICAgIGlmIChuYW1lID09PSAiZ3B4dHB4OlRyYWNrUG9pbnRFeHRlbnNpb24iKSB7CgkgICAgICAgICAgICAvLyBsb29wIGFnYWluIGZvciBuZXN0ZWQgZ2FybWluIGV4dGVuc2lvbnMgKGVnLiAiZ3B4dHB4OmhyIikKCSAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQoZ2V0RXh0ZW5zaW9ucyhjaGlsZCkpOwoJICAgICAgICB9CgkgICAgICAgIGVsc2UgewoJICAgICAgICAgICAgLy8gcHVzaCBjdXN0b20gZXh0ZW5zaW9uIChlZy4gInBvd2VyIikKCSAgICAgICAgICAgIGNvbnN0IHZhbCA9IG5vZGVWYWwoY2hpbGQpOwoJICAgICAgICAgICAgdmFsdWVzLnB1c2goW25hbWUsIHBhcnNlTnVtZXJpYyh2YWwpXSk7CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIHZhbHVlczsKCX0KCWZ1bmN0aW9uIGFiYnJldmlhdGVOYW1lKG5hbWUpIHsKCSAgICByZXR1cm4gWyJoZWFydCIsICJncHh0cHg6aHIiLCAiaHIiXS5pbmNsdWRlcyhuYW1lKSA/ICJoZWFydCIgOiBuYW1lOwoJfQoJZnVuY3Rpb24gcGFyc2VOdW1lcmljKHZhbCkgewoJICAgIGNvbnN0IG51bSA9IHBhcnNlRmxvYXQodmFsKTsKCSAgICByZXR1cm4gaXNOYU4obnVtKSA/IHZhbCA6IG51bTsKCX0KCglmdW5jdGlvbiBjb29yZFBhaXIkMShub2RlKSB7CgkgICAgY29uc3QgbGwgPSBbCgkgICAgICAgIHBhcnNlRmxvYXQobm9kZS5nZXRBdHRyaWJ1dGUoImxvbiIpIHx8ICIiKSwKCSAgICAgICAgcGFyc2VGbG9hdChub2RlLmdldEF0dHJpYnV0ZSgibGF0IikgfHwgIiIpLAoJICAgIF07CgkgICAgaWYgKGlzTmFOKGxsWzBdKSB8fCBpc05hTihsbFsxXSkpIHsKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgfQoJICAgIG51bTEobm9kZSwgImVsZSIsICh2YWwpID0+IHsKCSAgICAgICAgbGwucHVzaCh2YWwpOwoJICAgIH0pOwoJICAgIGNvbnN0IHRpbWUgPSBnZXQxKG5vZGUsICJ0aW1lIik7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgY29vcmRpbmF0ZXM6IGxsLAoJICAgICAgICB0aW1lOiB0aW1lID8gbm9kZVZhbCh0aW1lKSA6IG51bGwsCgkgICAgICAgIGV4dGVuZGVkVmFsdWVzOiBnZXRFeHRlbnNpb25zKGdldDEobm9kZSwgImV4dGVuc2lvbnMiKSksCgkgICAgfTsKCX0KCglmdW5jdGlvbiBleHRyYWN0UHJvcGVydGllcyhub2RlKSB7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IGdldE11bHRpKG5vZGUsIFsKCSAgICAgICAgIm5hbWUiLAoJICAgICAgICAiY210IiwKCSAgICAgICAgImRlc2MiLAoJICAgICAgICAidHlwZSIsCgkgICAgICAgICJ0aW1lIiwKCSAgICAgICAgImtleXdvcmRzIiwKCSAgICBdKTsKCSAgICBjb25zdCBleHRlbnNpb25zID0gQXJyYXkuZnJvbShub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lTlMoImh0dHA6Ly93d3cuZ2FybWluLmNvbS94bWxzY2hlbWFzL0dweEV4dGVuc2lvbnMvdjMiLCAiKiIpKTsKCSAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGV4dGVuc2lvbnMpIHsKCSAgICAgICAgaWYgKGNoaWxkLnBhcmVudE5vZGU/LnBhcmVudE5vZGUgPT09IG5vZGUpIHsKCSAgICAgICAgICAgIHByb3BlcnRpZXNbY2hpbGQudGFnTmFtZS5yZXBsYWNlKCI6IiwgIl8iKV0gPSBub2RlVmFsKGNoaWxkKTsKCSAgICAgICAgfQoJICAgIH0KCSAgICBjb25zdCBsaW5rcyA9ICQobm9kZSwgImxpbmsiKTsKCSAgICBpZiAobGlua3MubGVuZ3RoKSB7CgkgICAgICAgIHByb3BlcnRpZXMubGlua3MgPSBsaW5rcy5tYXAoKGxpbmspID0+IE9iamVjdC5hc3NpZ24oeyBocmVmOiBsaW5rLmdldEF0dHJpYnV0ZSgiaHJlZiIpIH0sIGdldE11bHRpKGxpbmssIFsidGV4dCIsICJ0eXBlIl0pKSk7CgkgICAgfQoJICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJfQoKCS8qKgoJICogRXh0cmFjdCBwb2ludHMgZnJvbSBhIHRya3NlZyBvciBydGUgZWxlbWVudC4KCSAqLwoJZnVuY3Rpb24gZ2V0UG9pbnRzJDEobm9kZSwgcG9pbnRuYW1lKSB7CgkgICAgY29uc3QgcHRzID0gJChub2RlLCBwb2ludG5hbWUpOwoJICAgIGNvbnN0IGxpbmUgPSBbXTsKCSAgICBjb25zdCB0aW1lcyA9IFtdOwoJICAgIGNvbnN0IGV4dGVuZGVkVmFsdWVzID0ge307CgkgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwdHMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgY29uc3QgYyA9IGNvb3JkUGFpciQxKHB0c1tpXSk7CgkgICAgICAgIGlmICghYykgewoJICAgICAgICAgICAgY29udGludWU7CgkgICAgICAgIH0KCSAgICAgICAgbGluZS5wdXNoKGMuY29vcmRpbmF0ZXMpOwoJICAgICAgICBpZiAoYy50aW1lKQoJICAgICAgICAgICAgdGltZXMucHVzaChjLnRpbWUpOwoJICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWxdIG9mIGMuZXh0ZW5kZWRWYWx1ZXMpIHsKCSAgICAgICAgICAgIGNvbnN0IHBsdXJhbCA9IG5hbWUgPT09ICJoZWFydCIgPyBuYW1lIDogbmFtZS5yZXBsYWNlKCJncHh0cHg6IiwgIiIpICsgInMiOwoJICAgICAgICAgICAgaWYgKCFleHRlbmRlZFZhbHVlc1twbHVyYWxdKSB7CgkgICAgICAgICAgICAgICAgZXh0ZW5kZWRWYWx1ZXNbcGx1cmFsXSA9IEFycmF5KHB0cy5sZW5ndGgpLmZpbGwobnVsbCk7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBleHRlbmRlZFZhbHVlc1twbHVyYWxdW2ldID0gdmFsOwoJICAgICAgICB9CgkgICAgfQoJICAgIGlmIChsaW5lLmxlbmd0aCA8IDIpCgkgICAgICAgIHJldHVybjsgLy8gSW52YWxpZCBsaW5lIGluIEdlb0pTT04KCSAgICByZXR1cm4gewoJICAgICAgICBsaW5lOiBsaW5lLAoJICAgICAgICB0aW1lczogdGltZXMsCgkgICAgICAgIGV4dGVuZGVkVmFsdWVzOiBleHRlbmRlZFZhbHVlcywKCSAgICB9OwoJfQoJLyoqCgkgKiBFeHRyYWN0IGEgTGluZVN0cmluZyBnZW9tZXRyeSBmcm9tIGEgcnRlCgkgKiBlbGVtZW50LgoJICovCglmdW5jdGlvbiBnZXRSb3V0ZShub2RlKSB7CgkgICAgY29uc3QgbGluZSA9IGdldFBvaW50cyQxKG5vZGUsICJydGVwdCIpOwoJICAgIGlmICghbGluZSkKCSAgICAgICAgcmV0dXJuOwoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICAgICAgcHJvcGVydGllczogT2JqZWN0LmFzc2lnbih7IF9ncHhUeXBlOiAicnRlIiB9LCBleHRyYWN0UHJvcGVydGllcyhub2RlKSwgZ2V0TGluZVN0eWxlKGdldDEobm9kZSwgImV4dGVuc2lvbnMiKSkpLAoJICAgICAgICBnZW9tZXRyeTogewoJICAgICAgICAgICAgdHlwZTogIkxpbmVTdHJpbmciLAoJICAgICAgICAgICAgY29vcmRpbmF0ZXM6IGxpbmUubGluZSwKCSAgICAgICAgfSwKCSAgICB9OwoJfQoJZnVuY3Rpb24gZ2V0VHJhY2sobm9kZSkgewoJICAgIGNvbnN0IHNlZ21lbnRzID0gJChub2RlLCAidHJrc2VnIik7CgkgICAgY29uc3QgdHJhY2sgPSBbXTsKCSAgICBjb25zdCB0aW1lcyA9IFtdOwoJICAgIGNvbnN0IGV4dHJhY3RlZExpbmVzID0gW107CgkgICAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7CgkgICAgICAgIGNvbnN0IGxpbmUgPSBnZXRQb2ludHMkMShzZWdtZW50LCAidHJrcHQiKTsKCSAgICAgICAgaWYgKGxpbmUpIHsKCSAgICAgICAgICAgIGV4dHJhY3RlZExpbmVzLnB1c2gobGluZSk7CgkgICAgICAgICAgICBpZiAobGluZS50aW1lcyAmJiBsaW5lLnRpbWVzLmxlbmd0aCkKCSAgICAgICAgICAgICAgICB0aW1lcy5wdXNoKGxpbmUudGltZXMpOwoJICAgICAgICB9CgkgICAgfQoJICAgIGlmIChleHRyYWN0ZWRMaW5lcy5sZW5ndGggPT09IDApCgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIGNvbnN0IG11bHRpID0gZXh0cmFjdGVkTGluZXMubGVuZ3RoID4gMTsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7IF9ncHhUeXBlOiAidHJrIiB9LCBleHRyYWN0UHJvcGVydGllcyhub2RlKSwgZ2V0TGluZVN0eWxlKGdldDEobm9kZSwgImV4dGVuc2lvbnMiKSksIHRpbWVzLmxlbmd0aAoJICAgICAgICA/IHsKCSAgICAgICAgICAgIGNvb3JkaW5hdGVQcm9wZXJ0aWVzOiB7CgkgICAgICAgICAgICAgICAgdGltZXM6IG11bHRpID8gdGltZXMgOiB0aW1lc1swXSwKCSAgICAgICAgICAgIH0sCgkgICAgICAgIH0KCSAgICAgICAgOiB7fSk7CgkgICAgZm9yIChjb25zdCBsaW5lIG9mIGV4dHJhY3RlZExpbmVzKSB7CgkgICAgICAgIHRyYWNrLnB1c2gobGluZS5saW5lKTsKCSAgICAgICAgaWYgKCFwcm9wZXJ0aWVzLmNvb3JkaW5hdGVQcm9wZXJ0aWVzKSB7CgkgICAgICAgICAgICBwcm9wZXJ0aWVzLmNvb3JkaW5hdGVQcm9wZXJ0aWVzID0ge307CgkgICAgICAgIH0KCSAgICAgICAgY29uc3QgcHJvcHMgPSBwcm9wZXJ0aWVzLmNvb3JkaW5hdGVQcm9wZXJ0aWVzOwoJICAgICAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMobGluZS5leHRlbmRlZFZhbHVlcyk7CgkgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykgewoJICAgICAgICAgICAgY29uc3QgW25hbWUsIHZhbF0gPSBlbnRyaWVzW2ldOwoJICAgICAgICAgICAgaWYgKG11bHRpKSB7CgkgICAgICAgICAgICAgICAgaWYgKCFwcm9wc1tuYW1lXSkgewoJICAgICAgICAgICAgICAgICAgICBwcm9wc1tuYW1lXSA9IGV4dHJhY3RlZExpbmVzLm1hcCgobGluZSkgPT4gbmV3IEFycmF5KGxpbmUubGluZS5sZW5ndGgpLmZpbGwobnVsbCkpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBwcm9wc1tuYW1lXVtpXSA9IHZhbDsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGVsc2UgewoJICAgICAgICAgICAgICAgIHByb3BzW25hbWVdID0gdmFsOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcywKCSAgICAgICAgZ2VvbWV0cnk6IG11bHRpCgkgICAgICAgICAgICA/IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiTXVsdGlMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlczogdHJhY2ssCgkgICAgICAgICAgICB9CgkgICAgICAgICAgICA6IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiTGluZVN0cmluZyIsCgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHRyYWNrWzBdLAoJICAgICAgICAgICAgfSwKCSAgICB9OwoJfQoJLyoqCgkgKiBFeHRyYWN0IGEgcG9pbnQsIGlmIHBvc3NpYmxlLCBmcm9tIGEgZ2l2ZW4gbm9kZSwKCSAqIHdoaWNoIGlzIHVzdWFsbHkgYSB3cHQgb3IgdHJrcHQKCSAqLwoJZnVuY3Rpb24gZ2V0UG9pbnQobm9kZSkgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKGV4dHJhY3RQcm9wZXJ0aWVzKG5vZGUpLCBnZXRNdWx0aShub2RlLCBbInN5bSJdKSk7CgkgICAgY29uc3QgcGFpciA9IGNvb3JkUGFpciQxKG5vZGUpOwoJICAgIGlmICghcGFpcikKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmUiLAoJICAgICAgICBwcm9wZXJ0aWVzLAoJICAgICAgICBnZW9tZXRyeTogewoJICAgICAgICAgICAgdHlwZTogIlBvaW50IiwKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBwYWlyLmNvb3JkaW5hdGVzLAoJICAgICAgICB9LAoJICAgIH07Cgl9CgkvKioKCSAqIENvbnZlcnQgR1BYIHRvIEdlb0pTT04gaW5jcmVtZW50YWxseSwgcmV0dXJuaW5nCgkgKiBhIFtHZW5lcmF0b3JdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvSXRlcmF0b3JzX2FuZF9HZW5lcmF0b3JzKQoJICogdGhhdCB5aWVsZHMgb3V0cHV0IGZlYXR1cmUgYnkgZmVhdHVyZS4KCSAqLwoJZnVuY3Rpb24qIGdweEdlbihub2RlKSB7CgkgICAgZm9yIChjb25zdCB0cmFjayBvZiAkKG5vZGUsICJ0cmsiKSkgewoJICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2V0VHJhY2sodHJhY2spOwoJICAgICAgICBpZiAoZmVhdHVyZSkKCSAgICAgICAgICAgIHlpZWxkIGZlYXR1cmU7CgkgICAgfQoJICAgIGZvciAoY29uc3Qgcm91dGUgb2YgJChub2RlLCAicnRlIikpIHsKCSAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdldFJvdXRlKHJvdXRlKTsKCSAgICAgICAgaWYgKGZlYXR1cmUpCgkgICAgICAgICAgICB5aWVsZCBmZWF0dXJlOwoJICAgIH0KCSAgICBmb3IgKGNvbnN0IHdheXBvaW50IG9mICQobm9kZSwgIndwdCIpKSB7CgkgICAgICAgIGNvbnN0IHBvaW50ID0gZ2V0UG9pbnQod2F5cG9pbnQpOwoJICAgICAgICBpZiAocG9pbnQpCgkgICAgICAgICAgICB5aWVsZCBwb2ludDsKCSAgICB9Cgl9CgkvKioKCSAqCgkgKiBDb252ZXJ0IGEgR1BYIGRvY3VtZW50IHRvIEdlb0pTT04uIFRoZSBmaXJzdCBhcmd1bWVudCwgYGRvY2AsIG11c3QgYmUgYSBHUFgKCSAqIGRvY3VtZW50IGFzIGFuIFhNTCBET00gLSBub3QgYXMgYSBzdHJpbmcuIFlvdSBjYW4gZ2V0IHRoaXMgdXNpbmcgalF1ZXJ5J3MgZGVmYXVsdAoJICogYC5hamF4YCBmdW5jdGlvbiBvciB1c2luZyBhIGJhcmUgWE1MSHR0cFJlcXVlc3Qgd2l0aCB0aGUgYC5yZXNwb25zZWAgcHJvcGVydHkKCSAqIGhvbGRpbmcgYW4gWE1MIERPTS4KCSAqCgkgKiBUaGUgb3V0cHV0IGlzIGEgSmF2YVNjcmlwdCBvYmplY3Qgb2YgR2VvSlNPTiBkYXRhLCBzYW1lIGFzIGAua21sYCBvdXRwdXRzLCB3aXRoIHRoZQoJICogYWRkaXRpb24gb2YgYSBgX2dweFR5cGVgIHByb3BlcnR5IG9uIGVhY2ggYExpbmVTdHJpbmdgIGZlYXR1cmUgdGhhdCBpbmRpY2F0ZXMgd2hldGhlcgoJICogdGhlIGZlYXR1cmUgd2FzIGVuY29kZWQgYXMgYSByb3V0ZSAoYHJ0ZWApIG9yIHRyYWNrIChgdHJrYCkgaW4gdGhlIEdQWCBkb2N1bWVudC4KCSAqLwoJZnVuY3Rpb24gZ3B4KG5vZGUpIHsKCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZUNvbGxlY3Rpb24iLAoJICAgICAgICBmZWF0dXJlczogQXJyYXkuZnJvbShncHhHZW4obm9kZSkpLAoJICAgIH07Cgl9CgoJY29uc3QgRVhURU5TSU9OU19OUyA9ICJodHRwOi8vd3d3Lmdhcm1pbi5jb20veG1sc2NoZW1hcy9BY3Rpdml0eUV4dGVuc2lvbi92MiI7Cgljb25zdCBUUkFDS1BPSU5UX0FUVFJJQlVURVMgPSBbCgkgICAgWyJoZWFydFJhdGUiLCAiaGVhcnRSYXRlcyJdLAoJICAgIFsiQ2FkZW5jZSIsICJjYWRlbmNlcyJdLAoJICAgIC8vIEV4dGVuZGVkIFRyYWNrcG9pbnQgYXR0cmlidXRlcwoJICAgIFsiU3BlZWQiLCAic3BlZWRzIl0sCgkgICAgWyJXYXR0cyIsICJ3YXR0cyJdLAoJXTsKCWNvbnN0IExBUF9BVFRSSUJVVEVTID0gWwoJICAgIFsiVG90YWxUaW1lU2Vjb25kcyIsICJ0b3RhbFRpbWVTZWNvbmRzIl0sCgkgICAgWyJEaXN0YW5jZU1ldGVycyIsICJkaXN0YW5jZU1ldGVycyJdLAoJICAgIFsiTWF4aW11bVNwZWVkIiwgIm1heFNwZWVkIl0sCgkgICAgWyJBdmVyYWdlSGVhcnRSYXRlQnBtIiwgImF2Z0hlYXJ0UmF0ZSJdLAoJICAgIFsiTWF4aW11bUhlYXJ0UmF0ZUJwbSIsICJtYXhIZWFydFJhdGUiXSwKCSAgICAvLyBFeHRlbmRlZCBMYXAgYXR0cmlidXRlcwoJICAgIFsiQXZnU3BlZWQiLCAiYXZnU3BlZWQiXSwKCSAgICBbIkF2Z1dhdHRzIiwgImF2Z1dhdHRzIl0sCgkgICAgWyJNYXhXYXR0cyIsICJtYXhXYXR0cyJdLAoJXTsKCWZ1bmN0aW9uIGdldFByb3BlcnRpZXMobm9kZSwgYXR0cmlidXRlTmFtZXMpIHsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0gW107CgkgICAgZm9yIChjb25zdCBbdGFnLCBhbGlhc10gb2YgYXR0cmlidXRlTmFtZXMpIHsKCSAgICAgICAgbGV0IGVsZW0gPSBnZXQxKG5vZGUsIHRhZyk7CgkgICAgICAgIGlmICghZWxlbSkgewoJICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lTlMoRVhURU5TSU9OU19OUywgdGFnKTsKCSAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHsKCSAgICAgICAgICAgICAgICBlbGVtID0gZWxlbWVudHNbMF07CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICAgICAgY29uc3QgdmFsID0gcGFyc2VGbG9hdChub2RlVmFsKGVsZW0pKTsKCSAgICAgICAgaWYgKCFpc05hTih2YWwpKSB7CgkgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2goW2FsaWFzLCB2YWxdKTsKCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4gcHJvcGVydGllczsKCX0KCWZ1bmN0aW9uIGNvb3JkUGFpcihub2RlKSB7CgkgICAgY29uc3QgbGwgPSBbbnVtMShub2RlLCAiTG9uZ2l0dWRlRGVncmVlcyIpLCBudW0xKG5vZGUsICJMYXRpdHVkZURlZ3JlZXMiKV07CgkgICAgaWYgKGxsWzBdID09PSB1bmRlZmluZWQgfHwKCSAgICAgICAgaXNOYU4obGxbMF0pIHx8CgkgICAgICAgIGxsWzFdID09PSB1bmRlZmluZWQgfHwKCSAgICAgICAgaXNOYU4obGxbMV0pKSB7CgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIH0KCSAgICBjb25zdCBoZWFydFJhdGUgPSBnZXQxKG5vZGUsICJIZWFydFJhdGVCcG0iKTsKCSAgICBjb25zdCB0aW1lID0gbm9kZVZhbChnZXQxKG5vZGUsICJUaW1lIikpOwoJICAgIGdldDEobm9kZSwgIkFsdGl0dWRlTWV0ZXJzIiwgKGFsdCkgPT4gewoJICAgICAgICBjb25zdCBhID0gcGFyc2VGbG9hdChub2RlVmFsKGFsdCkpOwoJICAgICAgICBpZiAoIWlzTmFOKGEpKSB7CgkgICAgICAgICAgICBsbC5wdXNoKGEpOwoJICAgICAgICB9CgkgICAgfSk7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgY29vcmRpbmF0ZXM6IGxsLAoJICAgICAgICB0aW1lOiB0aW1lIHx8IG51bGwsCgkgICAgICAgIGhlYXJ0UmF0ZTogaGVhcnRSYXRlID8gcGFyc2VGbG9hdChub2RlVmFsKGhlYXJ0UmF0ZSkpIDogbnVsbCwKCSAgICAgICAgZXh0ZW5zaW9uczogZ2V0UHJvcGVydGllcyhub2RlLCBUUkFDS1BPSU5UX0FUVFJJQlVURVMpLAoJICAgIH07Cgl9CglmdW5jdGlvbiBnZXRQb2ludHMobm9kZSkgewoJICAgIGNvbnN0IHB0cyA9ICQobm9kZSwgIlRyYWNrcG9pbnQiKTsKCSAgICBjb25zdCBsaW5lID0gW107CgkgICAgY29uc3QgdGltZXMgPSBbXTsKCSAgICBjb25zdCBoZWFydFJhdGVzID0gW107CgkgICAgaWYgKHB0cy5sZW5ndGggPCAyKQoJICAgICAgICByZXR1cm4gbnVsbDsgLy8gSW52YWxpZCBsaW5lIGluIEdlb0pTT04KCSAgICBjb25zdCBleHRlbmRlZFByb3BlcnRpZXMgPSB7fTsKCSAgICBjb25zdCByZXN1bHQgPSB7IGV4dGVuZGVkUHJvcGVydGllcyB9OwoJICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHRzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGNvbnN0IGMgPSBjb29yZFBhaXIocHRzW2ldKTsKCSAgICAgICAgaWYgKGMgPT09IG51bGwpCgkgICAgICAgICAgICBjb250aW51ZTsKCSAgICAgICAgbGluZS5wdXNoKGMuY29vcmRpbmF0ZXMpOwoJICAgICAgICBjb25zdCB7IHRpbWUsIGhlYXJ0UmF0ZSwgZXh0ZW5zaW9ucyB9ID0gYzsKCSAgICAgICAgaWYgKHRpbWUpCgkgICAgICAgICAgICB0aW1lcy5wdXNoKHRpbWUpOwoJICAgICAgICBpZiAoaGVhcnRSYXRlKQoJICAgICAgICAgICAgaGVhcnRSYXRlcy5wdXNoKGhlYXJ0UmF0ZSk7CgkgICAgICAgIGZvciAoY29uc3QgW2FsaWFzLCB2YWx1ZV0gb2YgZXh0ZW5zaW9ucykgewoJICAgICAgICAgICAgaWYgKCFleHRlbmRlZFByb3BlcnRpZXNbYWxpYXNdKSB7CgkgICAgICAgICAgICAgICAgZXh0ZW5kZWRQcm9wZXJ0aWVzW2FsaWFzXSA9IEFycmF5KHB0cy5sZW5ndGgpLmZpbGwobnVsbCk7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBleHRlbmRlZFByb3BlcnRpZXNbYWxpYXNdW2ldID0gdmFsdWU7CgkgICAgICAgIH0KCSAgICB9CgkgICAgaWYgKGxpbmUubGVuZ3RoIDwgMikKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocmVzdWx0LCB7CgkgICAgICAgIGxpbmU6IGxpbmUsCgkgICAgICAgIHRpbWVzOiB0aW1lcywKCSAgICAgICAgaGVhcnRSYXRlczogaGVhcnRSYXRlcywKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGdldExhcChub2RlKSB7CgkgICAgY29uc3Qgc2VnbWVudHMgPSAkKG5vZGUsICJUcmFjayIpOwoJICAgIGNvbnN0IHRyYWNrID0gW107CgkgICAgY29uc3QgdGltZXMgPSBbXTsKCSAgICBjb25zdCBoZWFydFJhdGVzID0gW107CgkgICAgY29uc3QgYWxsRXh0ZW5kZWRQcm9wZXJ0aWVzID0gW107CgkgICAgbGV0IGxpbmU7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmZyb21FbnRyaWVzKGdldFByb3BlcnRpZXMobm9kZSwgTEFQX0FUVFJJQlVURVMpKSwgZ2V0KG5vZGUsICJOYW1lIiwgKG5hbWVFbGVtZW50KSA9PiB7CgkgICAgICAgIHJldHVybiB7IG5hbWU6IG5vZGVWYWwobmFtZUVsZW1lbnQpIH07CgkgICAgfSkpOwoJICAgIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykgewoJICAgICAgICBsaW5lID0gZ2V0UG9pbnRzKHNlZ21lbnQpOwoJICAgICAgICBpZiAobGluZSkgewoJICAgICAgICAgICAgdHJhY2sucHVzaChsaW5lLmxpbmUpOwoJICAgICAgICAgICAgaWYgKGxpbmUudGltZXMubGVuZ3RoKQoJICAgICAgICAgICAgICAgIHRpbWVzLnB1c2gobGluZS50aW1lcyk7CgkgICAgICAgICAgICBpZiAobGluZS5oZWFydFJhdGVzLmxlbmd0aCkKCSAgICAgICAgICAgICAgICBoZWFydFJhdGVzLnB1c2gobGluZS5oZWFydFJhdGVzKTsKCSAgICAgICAgICAgIGFsbEV4dGVuZGVkUHJvcGVydGllcy5wdXNoKGxpbmUuZXh0ZW5kZWRQcm9wZXJ0aWVzKTsKCSAgICAgICAgfQoJICAgIH0KCSAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbEV4dGVuZGVkUHJvcGVydGllcy5sZW5ndGg7IGkrKykgewoJICAgICAgICBjb25zdCBleHRlbmRlZFByb3BlcnRpZXMgPSBhbGxFeHRlbmRlZFByb3BlcnRpZXNbaV07CgkgICAgICAgIGZvciAoY29uc3QgcHJvcGVydHkgaW4gZXh0ZW5kZWRQcm9wZXJ0aWVzKSB7CgkgICAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAxKSB7CgkgICAgICAgICAgICAgICAgaWYgKGxpbmUpIHsKCSAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc1twcm9wZXJ0eV0gPSBsaW5lLmV4dGVuZGVkUHJvcGVydGllc1twcm9wZXJ0eV07CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAgICAgaWYgKCFwcm9wZXJ0aWVzW3Byb3BlcnR5XSkgewoJICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRyYWNrLm1hcCgodHJhY2spID0+IEFycmF5KHRyYWNrLmxlbmd0aCkuZmlsbChudWxsKSk7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbcHJvcGVydHldW2ldID0gZXh0ZW5kZWRQcm9wZXJ0aWVzW3Byb3BlcnR5XTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgIH0KCSAgICBpZiAodHJhY2subGVuZ3RoID09PSAwKQoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICBpZiAodGltZXMubGVuZ3RoIHx8IGhlYXJ0UmF0ZXMubGVuZ3RoKSB7CgkgICAgICAgIHByb3BlcnRpZXMuY29vcmRpbmF0ZVByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHRpbWVzLmxlbmd0aAoJICAgICAgICAgICAgPyB7CgkgICAgICAgICAgICAgICAgdGltZXM6IHRyYWNrLmxlbmd0aCA9PT0gMSA/IHRpbWVzWzBdIDogdGltZXMsCgkgICAgICAgICAgICB9CgkgICAgICAgICAgICA6IHt9LCBoZWFydFJhdGVzLmxlbmd0aAoJICAgICAgICAgICAgPyB7CgkgICAgICAgICAgICAgICAgaGVhcnQ6IHRyYWNrLmxlbmd0aCA9PT0gMSA/IGhlYXJ0UmF0ZXNbMF0gOiBoZWFydFJhdGVzLAoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgOiB7fSk7CgkgICAgfQoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcywKCSAgICAgICAgZ2VvbWV0cnk6IHRyYWNrLmxlbmd0aCA9PT0gMQoJICAgICAgICAgICAgPyB7CgkgICAgICAgICAgICAgICAgdHlwZTogIkxpbmVTdHJpbmciLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiB0cmFja1swXSwKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIDogewoJICAgICAgICAgICAgICAgIHR5cGU6ICJNdWx0aUxpbmVTdHJpbmciLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiB0cmFjaywKCSAgICAgICAgICAgIH0sCgkgICAgfTsKCX0KCS8qKgoJICogSW5jcmVtZW50YWxseSBjb252ZXJ0IGEgVENYIGRvY3VtZW50IHRvIEdlb0pTT04uIFRoZQoJICogZmlyc3QgYXJndW1lbnQsIGBkb2NgLCBtdXN0IGJlIGEgVENYCgkgKiBkb2N1bWVudCBhcyBhbiBYTUwgRE9NIC0gbm90IGFzIGEgc3RyaW5nLgoJICovCglmdW5jdGlvbiogdGN4R2VuKG5vZGUpIHsKCSAgICBmb3IgKGNvbnN0IGxhcCBvZiAkKG5vZGUsICJMYXAiKSkgewoJICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2V0TGFwKGxhcCk7CgkgICAgICAgIGlmIChmZWF0dXJlKQoJICAgICAgICAgICAgeWllbGQgZmVhdHVyZTsKCSAgICB9CgkgICAgZm9yIChjb25zdCBjb3Vyc2Ugb2YgJChub2RlLCAiQ291cnNlcyIpKSB7CgkgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRMYXAoY291cnNlKTsKCSAgICAgICAgaWYgKGZlYXR1cmUpCgkgICAgICAgICAgICB5aWVsZCBmZWF0dXJlOwoJICAgIH0KCX0KCS8qKgoJICogQ29udmVydCBhIFRDWCBkb2N1bWVudCB0byBHZW9KU09OLiBUaGUgZmlyc3QgYXJndW1lbnQsIGBkb2NgLCBtdXN0IGJlIGEgVENYCgkgKiBkb2N1bWVudCBhcyBhbiBYTUwgRE9NIC0gbm90IGFzIGEgc3RyaW5nLgoJICovCglmdW5jdGlvbiB0Y3gobm9kZSkgewoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlQ29sbGVjdGlvbiIsCgkgICAgICAgIGZlYXR1cmVzOiBBcnJheS5mcm9tKHRjeEdlbihub2RlKSksCgkgICAgfTsKCX0KCglmdW5jdGlvbiBmaXhDb2xvcih2LCBwcmVmaXgpIHsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0ge307CgkgICAgY29uc3QgY29sb3JQcm9wID0gcHJlZml4ID09ICJzdHJva2UiIHx8IHByZWZpeCA9PT0gImZpbGwiID8gcHJlZml4IDogcHJlZml4ICsgIi1jb2xvciI7CgkgICAgaWYgKHZbMF0gPT09ICIjIikgewoJICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7CgkgICAgfQoJICAgIGlmICh2Lmxlbmd0aCA9PT0gNiB8fCB2Lmxlbmd0aCA9PT0gMykgewoJICAgICAgICBwcm9wZXJ0aWVzW2NvbG9yUHJvcF0gPSAiIyIgKyB2OwoJICAgIH0KCSAgICBlbHNlIGlmICh2Lmxlbmd0aCA9PT0gOCkgewoJICAgICAgICBwcm9wZXJ0aWVzW3ByZWZpeCArICItb3BhY2l0eSJdID0gcGFyc2VJbnQodi5zdWJzdHJpbmcoMCwgMiksIDE2KSAvIDI1NTsKCSAgICAgICAgcHJvcGVydGllc1tjb2xvclByb3BdID0KCSAgICAgICAgICAgICIjIiArIHYuc3Vic3RyaW5nKDYsIDgpICsgdi5zdWJzdHJpbmcoNCwgNikgKyB2LnN1YnN0cmluZygyLCA0KTsKCSAgICB9CgkgICAgcmV0dXJuIHByb3BlcnRpZXM7Cgl9CgoJZnVuY3Rpb24gbnVtZXJpY1Byb3BlcnR5KG5vZGUsIHNvdXJjZSwgdGFyZ2V0KSB7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IHt9OwoJICAgIG51bTEobm9kZSwgc291cmNlLCAodmFsKSA9PiB7CgkgICAgICAgIHByb3BlcnRpZXNbdGFyZ2V0XSA9IHZhbDsKCSAgICB9KTsKCSAgICByZXR1cm4gcHJvcGVydGllczsKCX0KCWZ1bmN0aW9uIGdldENvbG9yKG5vZGUsIG91dHB1dCkgewoJICAgIHJldHVybiBnZXQobm9kZSwgImNvbG9yIiwgKGVsZW0pID0+IGZpeENvbG9yKG5vZGVWYWwoZWxlbSksIG91dHB1dCkpOwoJfQoJZnVuY3Rpb24gZXh0cmFjdEljb25IcmVmKG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJJY29uIiwgKGljb24sIHByb3BlcnRpZXMpID0+IHsKCSAgICAgICAgdmFsMShpY29uLCAiaHJlZiIsIChocmVmKSA9PiB7CgkgICAgICAgICAgICBwcm9wZXJ0aWVzLmljb24gPSBocmVmOwoJICAgICAgICB9KTsKCSAgICAgICAgcmV0dXJuIHByb3BlcnRpZXM7CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0SWNvbihub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiSWNvblN0eWxlIiwgKGljb25TdHlsZSkgPT4gewoJICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihnZXRDb2xvcihpY29uU3R5bGUsICJpY29uIiksIG51bWVyaWNQcm9wZXJ0eShpY29uU3R5bGUsICJzY2FsZSIsICJpY29uLXNjYWxlIiksIG51bWVyaWNQcm9wZXJ0eShpY29uU3R5bGUsICJoZWFkaW5nIiwgImljb24taGVhZGluZyIpLCBnZXQoaWNvblN0eWxlLCAiaG90U3BvdCIsIChob3RzcG90KSA9PiB7CgkgICAgICAgICAgICBjb25zdCBsZWZ0ID0gcGFyc2VGbG9hdChob3RzcG90LmdldEF0dHJpYnV0ZSgieCIpIHx8ICIiKTsKCSAgICAgICAgICAgIGNvbnN0IHRvcCA9IHBhcnNlRmxvYXQoaG90c3BvdC5nZXRBdHRyaWJ1dGUoInkiKSB8fCAiIik7CgkgICAgICAgICAgICBjb25zdCB4dW5pdHMgPSBob3RzcG90LmdldEF0dHJpYnV0ZSgieHVuaXRzIikgfHwgIiI7CgkgICAgICAgICAgICBjb25zdCB5dW5pdHMgPSBob3RzcG90LmdldEF0dHJpYnV0ZSgieXVuaXRzIikgfHwgIiI7CgkgICAgICAgICAgICBpZiAoIWlzTmFOKGxlZnQpICYmICFpc05hTih0b3ApKQoJICAgICAgICAgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICAgICAgICAgICJpY29uLW9mZnNldCI6IFtsZWZ0LCB0b3BdLAoJICAgICAgICAgICAgICAgICAgICAiaWNvbi1vZmZzZXQtdW5pdHMiOiBbeHVuaXRzLCB5dW5pdHNdLAoJICAgICAgICAgICAgICAgIH07CgkgICAgICAgICAgICByZXR1cm4ge307CgkgICAgICAgIH0pLCBleHRyYWN0SWNvbkhyZWYoaWNvblN0eWxlKSk7CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0TGFiZWwobm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIkxhYmVsU3R5bGUiLCAobGFiZWxTdHlsZSkgPT4gewoJICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihnZXRDb2xvcihsYWJlbFN0eWxlLCAibGFiZWwiKSwgbnVtZXJpY1Byb3BlcnR5KGxhYmVsU3R5bGUsICJzY2FsZSIsICJsYWJlbC1zY2FsZSIpKTsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RMaW5lKG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJMaW5lU3R5bGUiLCAobGluZVN0eWxlKSA9PiB7CgkgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGdldENvbG9yKGxpbmVTdHlsZSwgInN0cm9rZSIpLCBudW1lcmljUHJvcGVydHkobGluZVN0eWxlLCAid2lkdGgiLCAic3Ryb2tlLXdpZHRoIikpOwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZXh0cmFjdFBvbHkobm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIlBvbHlTdHlsZSIsIChwb2x5U3R5bGUsIHByb3BlcnRpZXMpID0+IHsKCSAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocHJvcGVydGllcywgZ2V0KHBvbHlTdHlsZSwgImNvbG9yIiwgKGVsZW0pID0+IGZpeENvbG9yKG5vZGVWYWwoZWxlbSksICJmaWxsIikpLCB2YWwxKHBvbHlTdHlsZSwgImZpbGwiLCAoZmlsbCkgPT4gewoJICAgICAgICAgICAgaWYgKGZpbGwgPT09ICIwIikKCSAgICAgICAgICAgICAgICByZXR1cm4geyAiZmlsbC1vcGFjaXR5IjogMCB9OwoJICAgICAgICB9KSwgdmFsMShwb2x5U3R5bGUsICJvdXRsaW5lIiwgKG91dGxpbmUpID0+IHsKCSAgICAgICAgICAgIGlmIChvdXRsaW5lID09PSAiMCIpCgkgICAgICAgICAgICAgICAgcmV0dXJuIHsgInN0cm9rZS1vcGFjaXR5IjogMCB9OwoJICAgICAgICB9KSk7CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0U3R5bGUobm9kZSkgewoJICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBleHRyYWN0UG9seShub2RlKSwgZXh0cmFjdExpbmUobm9kZSksIGV4dHJhY3RMYWJlbChub2RlKSwgZXh0cmFjdEljb24obm9kZSkpOwoJfQoKCWNvbnN0IHRvTnVtYmVyID0gKHgpID0+IE51bWJlcih4KTsKCWNvbnN0IHR5cGVDb252ZXJ0ZXJzID0gewoJICAgIHN0cmluZzogKHgpID0+IHgsCgkgICAgaW50OiB0b051bWJlciwKCSAgICB1aW50OiB0b051bWJlciwKCSAgICBzaG9ydDogdG9OdW1iZXIsCgkgICAgdXNob3J0OiB0b051bWJlciwKCSAgICBmbG9hdDogdG9OdW1iZXIsCgkgICAgZG91YmxlOiB0b051bWJlciwKCSAgICBib29sOiAoeCkgPT4gQm9vbGVhbih4KSwKCX07CglmdW5jdGlvbiBleHRyYWN0RXh0ZW5kZWREYXRhKG5vZGUsIHNjaGVtYSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIkV4dGVuZGVkRGF0YSIsIChleHRlbmRlZERhdGEsIHByb3BlcnRpZXMpID0+IHsKCSAgICAgICAgZm9yIChjb25zdCBkYXRhIG9mICQoZXh0ZW5kZWREYXRhLCAiRGF0YSIpKSB7CgkgICAgICAgICAgICBwcm9wZXJ0aWVzW2RhdGEuZ2V0QXR0cmlidXRlKCJuYW1lIikgfHwgIiJdID0gbm9kZVZhbChnZXQxKGRhdGEsICJ2YWx1ZSIpKTsKCSAgICAgICAgfQoJICAgICAgICBmb3IgKGNvbnN0IHNpbXBsZURhdGEgb2YgJChleHRlbmRlZERhdGEsICJTaW1wbGVEYXRhIikpIHsKCSAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBzaW1wbGVEYXRhLmdldEF0dHJpYnV0ZSgibmFtZSIpIHx8ICIiOwoJICAgICAgICAgICAgY29uc3QgdHlwZUNvbnZlcnRlciA9IHNjaGVtYVtuYW1lXSB8fCB0eXBlQ29udmVydGVycy5zdHJpbmc7CgkgICAgICAgICAgICBwcm9wZXJ0aWVzW25hbWVdID0gdHlwZUNvbnZlcnRlcihub2RlVmFsKHNpbXBsZURhdGEpKTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gcHJvcGVydGllczsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGdldE1heWJlSFRNTERlc2NyaXB0aW9uKG5vZGUpIHsKCSAgICBjb25zdCBkZXNjcmlwdGlvbk5vZGUgPSBnZXQxKG5vZGUsICJkZXNjcmlwdGlvbiIpOwoJICAgIGZvciAoY29uc3QgYyBvZiBBcnJheS5mcm9tKGRlc2NyaXB0aW9uTm9kZT8uY2hpbGROb2RlcyB8fCBbXSkpIHsKCSAgICAgICAgaWYgKGMubm9kZVR5cGUgPT09IDQpIHsKCSAgICAgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHsKCSAgICAgICAgICAgICAgICAgICAgIkB0eXBlIjogImh0bWwiLAoJICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbm9kZVZhbChjKSwKCSAgICAgICAgICAgICAgICB9LAoJICAgICAgICAgICAgfTsKCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4ge307Cgl9CglmdW5jdGlvbiBleHRyYWN0VGltZVNwYW4obm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIlRpbWVTcGFuIiwgKHRpbWVTcGFuKSA9PiB7CgkgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICB0aW1lc3BhbjogewoJICAgICAgICAgICAgICAgIGJlZ2luOiBub2RlVmFsKGdldDEodGltZVNwYW4sICJiZWdpbiIpKSwKCSAgICAgICAgICAgICAgICBlbmQ6IG5vZGVWYWwoZ2V0MSh0aW1lU3BhbiwgImVuZCIpKSwKCSAgICAgICAgICAgIH0sCgkgICAgICAgIH07CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0VGltZVN0YW1wKG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJUaW1lU3RhbXAiLCAodGltZVN0YW1wKSA9PiB7CgkgICAgICAgIHJldHVybiB7IHRpbWVzdGFtcDogbm9kZVZhbChnZXQxKHRpbWVTdGFtcCwgIndoZW4iKSkgfTsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RDYXNjYWRlZFN0eWxlKG5vZGUsIHN0eWxlTWFwKSB7CgkgICAgcmV0dXJuIHZhbDEobm9kZSwgInN0eWxlVXJsIiwgKHN0eWxlVXJsKSA9PiB7CgkgICAgICAgIHN0eWxlVXJsID0gbm9ybWFsaXplSWQoc3R5bGVVcmwpOwoJICAgICAgICBpZiAoc3R5bGVNYXBbc3R5bGVVcmxdKSB7CgkgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7IHN0eWxlVXJsIH0sIHN0eWxlTWFwW3N0eWxlVXJsXSk7CgkgICAgICAgIH0KCSAgICAgICAgLy8gRm9yIGJhY2t3YXJkLWNvbXBhdGliaWxpdHkuIFNob3VsZCB3ZSBzdGlsbCBpbmNsdWRlCgkgICAgICAgIC8vIHN0eWxlVXJsIGV2ZW4gaWYgaXQncyBub3QgcmVzb2x2ZWQ/CgkgICAgICAgIHJldHVybiB7IHN0eWxlVXJsIH07CgkgICAgfSk7Cgl9CgoJY29uc3QgcmVtb3ZlU3BhY2UgPSAvXHMqL2c7Cgljb25zdCB0cmltU3BhY2UgPSAvXlxzKnxccyokL2c7Cgljb25zdCBzcGxpdFNwYWNlID0gL1xzKy87CgkvKioKCSAqIEdldCBvbmUgY29vcmRpbmF0ZSBmcm9tIGEgY29vcmRpbmF0ZSBhcnJheSwgaWYgYW55CgkgKi8KCWZ1bmN0aW9uIGNvb3JkMSh2YWx1ZSkgewoJICAgIHJldHVybiB2YWx1ZQoJICAgICAgICAucmVwbGFjZShyZW1vdmVTcGFjZSwgIiIpCgkgICAgICAgIC5zcGxpdCgiLCIpCgkgICAgICAgIC5tYXAocGFyc2VGbG9hdCkKCSAgICAgICAgLmZpbHRlcigobnVtKSA9PiAhaXNOYU4obnVtKSkKCSAgICAgICAgLnNsaWNlKDAsIDMpOwoJfQoJLyoqCgkgKiBHZXQgYWxsIGNvb3JkaW5hdGVzIGZyb20gYSBjb29yZGluYXRlIGFycmF5IGFzIFtbXSxbXV0KCSAqLwoJZnVuY3Rpb24gY29vcmQodmFsdWUpIHsKCSAgICByZXR1cm4gdmFsdWUKCSAgICAgICAgLnJlcGxhY2UodHJpbVNwYWNlLCAiIikKCSAgICAgICAgLnNwbGl0KHNwbGl0U3BhY2UpCgkgICAgICAgIC5tYXAoY29vcmQxKQoJICAgICAgICAuZmlsdGVyKChjb29yZCkgPT4gewoJICAgICAgICByZXR1cm4gY29vcmQubGVuZ3RoID49IDI7CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBneENvb3Jkcyhub2RlKSB7CgkgICAgbGV0IGVsZW1zID0gJChub2RlLCAiY29vcmQiKTsKCSAgICBpZiAoZWxlbXMubGVuZ3RoID09PSAwKSB7CgkgICAgICAgIGVsZW1zID0gJG5zKG5vZGUsICJjb29yZCIsICIqIik7CgkgICAgfQoJICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gZWxlbXMubWFwKChlbGVtKSA9PiB7CgkgICAgICAgIHJldHVybiBub2RlVmFsKGVsZW0pLnNwbGl0KCIgIikubWFwKHBhcnNlRmxvYXQpOwoJICAgIH0pOwoJICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPT09IDApIHsKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgfQoJICAgIHJldHVybiB7CgkgICAgICAgIGdlb21ldHJ5OiBjb29yZGluYXRlcy5sZW5ndGggPiAyCgkgICAgICAgICAgICA/IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiTGluZVN0cmluZyIsCgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMsCgkgICAgICAgICAgICB9CgkgICAgICAgICAgICA6IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiUG9pbnQiLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1swXSwKCSAgICAgICAgICAgIH0sCgkgICAgICAgIHRpbWVzOiAkKG5vZGUsICJ3aGVuIikubWFwKChlbGVtKSA9PiBub2RlVmFsKGVsZW0pKSwKCSAgICB9OwoJfQoJZnVuY3Rpb24gZml4UmluZyhyaW5nKSB7CgkgICAgaWYgKHJpbmcubGVuZ3RoID09PSAwKQoJICAgICAgICByZXR1cm4gcmluZzsKCSAgICBjb25zdCBmaXJzdCA9IHJpbmdbMF07CgkgICAgY29uc3QgbGFzdCA9IHJpbmdbcmluZy5sZW5ndGggLSAxXTsKCSAgICBsZXQgZXF1YWwgPSB0cnVlOwoJICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5tYXgoZmlyc3QubGVuZ3RoLCBsYXN0Lmxlbmd0aCk7IGkrKykgewoJICAgICAgICBpZiAoZmlyc3RbaV0gIT09IGxhc3RbaV0pIHsKCSAgICAgICAgICAgIGVxdWFsID0gZmFsc2U7CgkgICAgICAgICAgICBicmVhazsKCSAgICAgICAgfQoJICAgIH0KCSAgICBpZiAoIWVxdWFsKSB7CgkgICAgICAgIHJldHVybiByaW5nLmNvbmNhdChbcmluZ1swXV0pOwoJICAgIH0KCSAgICByZXR1cm4gcmluZzsKCX0KCWZ1bmN0aW9uIGdldENvb3JkaW5hdGVzKG5vZGUpIHsKCSAgICByZXR1cm4gbm9kZVZhbChnZXQxKG5vZGUsICJjb29yZGluYXRlcyIpKTsKCX0KCWZ1bmN0aW9uIGdldEdlb21ldHJ5KG5vZGUpIHsKCSAgICBsZXQgZ2VvbWV0cmllcyA9IFtdOwoJICAgIGxldCBjb29yZFRpbWVzID0gW107CgkgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkTm9kZXMuaXRlbShpKTsKCSAgICAgICAgaWYgKGlzRWxlbWVudChjaGlsZCkpIHsKCSAgICAgICAgICAgIHN3aXRjaCAoY2hpbGQudGFnTmFtZSkgewoJICAgICAgICAgICAgICAgIGNhc2UgIk11bHRpR2VvbWV0cnkiOgoJICAgICAgICAgICAgICAgIGNhc2UgIk11bHRpVHJhY2siOgoJICAgICAgICAgICAgICAgIGNhc2UgImd4Ok11bHRpVHJhY2siOiB7CgkgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkR2VvbWV0cmllcyA9IGdldEdlb21ldHJ5KGNoaWxkKTsKCSAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cmllcyA9IGdlb21ldHJpZXMuY29uY2F0KGNoaWxkR2VvbWV0cmllcy5nZW9tZXRyaWVzKTsKCSAgICAgICAgICAgICAgICAgICAgY29vcmRUaW1lcyA9IGNvb3JkVGltZXMuY29uY2F0KGNoaWxkR2VvbWV0cmllcy5jb29yZFRpbWVzKTsKCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGNhc2UgIlBvaW50IjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IGNvb3JkMShnZXRDb29yZGluYXRlcyhjaGlsZCkpOwoJICAgICAgICAgICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID49IDIpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJpZXMucHVzaCh7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogIlBvaW50IiwKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlcywKCSAgICAgICAgICAgICAgICAgICAgICAgIH0pOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBjYXNlICJMaW5lYXJSaW5nIjoKCSAgICAgICAgICAgICAgICBjYXNlICJMaW5lU3RyaW5nIjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IGNvb3JkKGdldENvb3JkaW5hdGVzKGNoaWxkKSk7CgkgICAgICAgICAgICAgICAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMikgewoJICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cmllcy5wdXNoKHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAiTGluZVN0cmluZyIsCgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMsCgkgICAgICAgICAgICAgICAgICAgICAgICB9KTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgY2FzZSAiUG9seWdvbiI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gW107CgkgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbGluZWFyUmluZyBvZiAkKGNoaWxkLCAiTGluZWFyUmluZyIpKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaW5nID0gZml4UmluZyhjb29yZChnZXRDb29yZGluYXRlcyhsaW5lYXJSaW5nKSkpOwoJICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJpbmcubGVuZ3RoID49IDQpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMucHVzaChyaW5nKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBpZiAoY29vcmRzLmxlbmd0aCkgewoJICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cmllcy5wdXNoKHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAiUG9seWdvbiIsCgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkcywKCSAgICAgICAgICAgICAgICAgICAgICAgIH0pOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBjYXNlICJUcmFjayI6CgkgICAgICAgICAgICAgICAgY2FzZSAiZ3g6VHJhY2siOiB7CgkgICAgICAgICAgICAgICAgICAgIGNvbnN0IGd4ID0gZ3hDb29yZHMoY2hpbGQpOwoJICAgICAgICAgICAgICAgICAgICBpZiAoIWd4KQoJICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgdGltZXMsIGdlb21ldHJ5IH0gPSBneDsKCSAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cmllcy5wdXNoKGdlb21ldHJ5KTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVzLmxlbmd0aCkKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkVGltZXMucHVzaCh0aW1lcyk7CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4gewoJICAgICAgICBnZW9tZXRyaWVzLAoJICAgICAgICBjb29yZFRpbWVzLAoJICAgIH07Cgl9CgoJZnVuY3Rpb24gZ2VvbWV0cnlMaXN0VG9HZW9tZXRyeShnZW9tZXRyaWVzKSB7CgkgICAgcmV0dXJuIGdlb21ldHJpZXMubGVuZ3RoID09PSAwCgkgICAgICAgID8gbnVsbAoJICAgICAgICA6IGdlb21ldHJpZXMubGVuZ3RoID09PSAxCgkgICAgICAgICAgICA/IGdlb21ldHJpZXNbMF0KCSAgICAgICAgICAgIDogewoJICAgICAgICAgICAgICAgIHR5cGU6ICJHZW9tZXRyeUNvbGxlY3Rpb24iLAoJICAgICAgICAgICAgICAgIGdlb21ldHJpZXMsCgkgICAgICAgICAgICB9OwoJfQoJZnVuY3Rpb24gZ2V0UGxhY2VtYXJrKG5vZGUsIHN0eWxlTWFwLCBzY2hlbWEpIHsKCSAgICBjb25zdCB7IGNvb3JkVGltZXMsIGdlb21ldHJpZXMgfSA9IGdldEdlb21ldHJ5KG5vZGUpOwoJICAgIGNvbnN0IGZlYXR1cmUgPSB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICAgICAgZ2VvbWV0cnk6IGdlb21ldHJ5TGlzdFRvR2VvbWV0cnkoZ2VvbWV0cmllcyksCgkgICAgICAgIHByb3BlcnRpZXM6IE9iamVjdC5hc3NpZ24oZ2V0TXVsdGkobm9kZSwgWwoJICAgICAgICAgICAgIm5hbWUiLAoJICAgICAgICAgICAgImFkZHJlc3MiLAoJICAgICAgICAgICAgInZpc2liaWxpdHkiLAoJICAgICAgICAgICAgIm9wZW4iLAoJICAgICAgICAgICAgInBob25lTnVtYmVyIiwKCSAgICAgICAgICAgICJkZXNjcmlwdGlvbiIsCgkgICAgICAgIF0pLCBnZXRNYXliZUhUTUxEZXNjcmlwdGlvbihub2RlKSwgZXh0cmFjdENhc2NhZGVkU3R5bGUobm9kZSwgc3R5bGVNYXApLCBleHRyYWN0U3R5bGUobm9kZSksIGV4dHJhY3RFeHRlbmRlZERhdGEobm9kZSwgc2NoZW1hKSwgZXh0cmFjdFRpbWVTcGFuKG5vZGUpLCBleHRyYWN0VGltZVN0YW1wKG5vZGUpLCBjb29yZFRpbWVzLmxlbmd0aAoJICAgICAgICAgICAgPyB7CgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZVByb3BlcnRpZXM6IHsKCSAgICAgICAgICAgICAgICAgICAgdGltZXM6IGNvb3JkVGltZXMubGVuZ3RoID09PSAxID8gY29vcmRUaW1lc1swXSA6IGNvb3JkVGltZXMsCgkgICAgICAgICAgICAgICAgfSwKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIDoge30pLAoJICAgIH07CgkgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcz8udmlzaWJpbGl0eSAhPT0gdW5kZWZpbmVkKSB7CgkgICAgICAgIGZlYXR1cmUucHJvcGVydGllcy52aXNpYmlsaXR5ID0gZmVhdHVyZS5wcm9wZXJ0aWVzLnZpc2liaWxpdHkgIT09ICIwIjsKCSAgICB9CgkgICAgY29uc3QgaWQgPSBub2RlLmdldEF0dHJpYnV0ZSgiaWQiKTsKCSAgICBpZiAoaWQgIT09IG51bGwgJiYgaWQgIT09ICIiKQoJICAgICAgICBmZWF0dXJlLmlkID0gaWQ7CgkgICAgcmV0dXJuIGZlYXR1cmU7Cgl9CgoJZnVuY3Rpb24gZ2V0R3JvdW5kT3ZlcmxheUJveChub2RlKSB7CgkgICAgY29uc3QgbGF0TG9uUXVhZCA9IGdldDEobm9kZSwgImd4OkxhdExvblF1YWQiKTsKCSAgICBpZiAobGF0TG9uUXVhZCkgewoJICAgICAgICBjb25zdCByaW5nID0gZml4UmluZyhjb29yZChnZXRDb29yZGluYXRlcyhub2RlKSkpOwoJICAgICAgICByZXR1cm4gewoJICAgICAgICAgICAgdHlwZTogIlBvbHlnb24iLAoJICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtyaW5nXSwKCSAgICAgICAgfTsKCSAgICB9CgkgICAgcmV0dXJuIGdldExhdExvbkJveChub2RlKTsKCX0KCWNvbnN0IERFR1JFRVNfVE9fUkFESUFOUyA9IE1hdGguUEkgLyAxODA7CglmdW5jdGlvbiByb3RhdGVCb3goYmJveCwgY29vcmRpbmF0ZXMsIHJvdGF0aW9uKSB7CgkgICAgY29uc3QgY2VudGVyID0gWyhiYm94WzBdICsgYmJveFsyXSkgLyAyLCAoYmJveFsxXSArIGJib3hbM10pIC8gMl07CgkgICAgcmV0dXJuIFsKCSAgICAgICAgY29vcmRpbmF0ZXNbMF0ubWFwKChjb29yZGluYXRlKSA9PiB7CgkgICAgICAgICAgICBjb25zdCBkeSA9IGNvb3JkaW5hdGVbMV0gLSBjZW50ZXJbMV07CgkgICAgICAgICAgICBjb25zdCBkeCA9IGNvb3JkaW5hdGVbMF0gLSBjZW50ZXJbMF07CgkgICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhkeSwgMikgKyBNYXRoLnBvdyhkeCwgMikpOwoJICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCkgLSByb3RhdGlvbiAqIERFR1JFRVNfVE9fUkFESUFOUzsKCSAgICAgICAgICAgIHJldHVybiBbCgkgICAgICAgICAgICAgICAgY2VudGVyWzBdICsgTWF0aC5jb3MoYW5nbGUpICogZGlzdGFuY2UsCgkgICAgICAgICAgICAgICAgY2VudGVyWzFdICsgTWF0aC5zaW4oYW5nbGUpICogZGlzdGFuY2UsCgkgICAgICAgICAgICBdOwoJICAgICAgICB9KSwKCSAgICBdOwoJfQoJZnVuY3Rpb24gZ2V0TGF0TG9uQm94KG5vZGUpIHsKCSAgICBjb25zdCBsYXRMb25Cb3ggPSBnZXQxKG5vZGUsICJMYXRMb25Cb3giKTsKCSAgICBpZiAobGF0TG9uQm94KSB7CgkgICAgICAgIGNvbnN0IG5vcnRoID0gbnVtMShsYXRMb25Cb3gsICJub3J0aCIpOwoJICAgICAgICBjb25zdCB3ZXN0ID0gbnVtMShsYXRMb25Cb3gsICJ3ZXN0Iik7CgkgICAgICAgIGNvbnN0IGVhc3QgPSBudW0xKGxhdExvbkJveCwgImVhc3QiKTsKCSAgICAgICAgY29uc3Qgc291dGggPSBudW0xKGxhdExvbkJveCwgInNvdXRoIik7CgkgICAgICAgIGNvbnN0IHJvdGF0aW9uID0gbnVtMShsYXRMb25Cb3gsICJyb3RhdGlvbiIpOwoJICAgICAgICBpZiAodHlwZW9mIG5vcnRoID09PSAibnVtYmVyIiAmJgoJICAgICAgICAgICAgdHlwZW9mIHNvdXRoID09PSAibnVtYmVyIiAmJgoJICAgICAgICAgICAgdHlwZW9mIHdlc3QgPT09ICJudW1iZXIiICYmCgkgICAgICAgICAgICB0eXBlb2YgZWFzdCA9PT0gIm51bWJlciIpIHsKCSAgICAgICAgICAgIGNvbnN0IGJib3ggPSBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXTsKCSAgICAgICAgICAgIGxldCBjb29yZGluYXRlcyA9IFsKCSAgICAgICAgICAgICAgICBbCgkgICAgICAgICAgICAgICAgICAgIFt3ZXN0LCBub3J0aF0sCgkgICAgICAgICAgICAgICAgICAgIFtlYXN0LCBub3J0aF0sCgkgICAgICAgICAgICAgICAgICAgIFtlYXN0LCBzb3V0aF0sCgkgICAgICAgICAgICAgICAgICAgIFt3ZXN0LCBzb3V0aF0sCgkgICAgICAgICAgICAgICAgICAgIFt3ZXN0LCBub3J0aF0sIC8vIHRvcCBsZWZ0IChhZ2FpbikKCSAgICAgICAgICAgICAgICBdLAoJICAgICAgICAgICAgXTsKCSAgICAgICAgICAgIGlmICh0eXBlb2Ygcm90YXRpb24gPT09ICJudW1iZXIiKSB7CgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMgPSByb3RhdGVCb3goYmJveCwgY29vcmRpbmF0ZXMsIHJvdGF0aW9uKTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICAgICAgdHlwZTogIlBvbHlnb24iLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzLAoJICAgICAgICAgICAgfTsKCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4gbnVsbDsKCX0KCWZ1bmN0aW9uIGdldEdyb3VuZE92ZXJsYXkobm9kZSwgc3R5bGVNYXAsIHNjaGVtYSkgewoJICAgIGNvbnN0IGdlb21ldHJ5ID0gZ2V0R3JvdW5kT3ZlcmxheUJveChub2RlKTsKCSAgICBjb25zdCBmZWF0dXJlID0gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIGdlb21ldHJ5LAoJICAgICAgICBwcm9wZXJ0aWVzOiBPYmplY3QuYXNzaWduKAoJICAgICAgICAvKioKCSAgICAgICAgICogUmVsYXRlZCB0bwoJICAgICAgICAgKiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS90bWN3LzAzN2ExY2I2NjYwZDc0YTM5MmU5ZGE3NDQ2NTQwZjQ2CgkgICAgICAgICAqLwoJICAgICAgICB7ICJAZ2VvbWV0cnktdHlwZSI6ICJncm91bmRvdmVybGF5IiB9LCBnZXRNdWx0aShub2RlLCBbCgkgICAgICAgICAgICAibmFtZSIsCgkgICAgICAgICAgICAiYWRkcmVzcyIsCgkgICAgICAgICAgICAidmlzaWJpbGl0eSIsCgkgICAgICAgICAgICAib3BlbiIsCgkgICAgICAgICAgICAicGhvbmVOdW1iZXIiLAoJICAgICAgICAgICAgImRlc2NyaXB0aW9uIiwKCSAgICAgICAgXSksIGdldE1heWJlSFRNTERlc2NyaXB0aW9uKG5vZGUpLCBleHRyYWN0Q2FzY2FkZWRTdHlsZShub2RlLCBzdHlsZU1hcCksIGV4dHJhY3RTdHlsZShub2RlKSwgZXh0cmFjdEljb25IcmVmKG5vZGUpLCBleHRyYWN0RXh0ZW5kZWREYXRhKG5vZGUsIHNjaGVtYSksIGV4dHJhY3RUaW1lU3Bhbihub2RlKSwgZXh0cmFjdFRpbWVTdGFtcChub2RlKSksCgkgICAgfTsKCSAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzPy52aXNpYmlsaXR5ICE9PSB1bmRlZmluZWQpIHsKCSAgICAgICAgZmVhdHVyZS5wcm9wZXJ0aWVzLnZpc2liaWxpdHkgPSBmZWF0dXJlLnByb3BlcnRpZXMudmlzaWJpbGl0eSAhPT0gIjAiOwoJICAgIH0KCSAgICBjb25zdCBpZCA9IG5vZGUuZ2V0QXR0cmlidXRlKCJpZCIpOwoJICAgIGlmIChpZCAhPT0gbnVsbCAmJiBpZCAhPT0gIiIpCgkgICAgICAgIGZlYXR1cmUuaWQgPSBpZDsKCSAgICByZXR1cm4gZmVhdHVyZTsKCX0KCglmdW5jdGlvbiBnZXRTdHlsZUlkKHN0eWxlKSB7CgkgICAgbGV0IGlkID0gc3R5bGUuZ2V0QXR0cmlidXRlKCJpZCIpOwoJICAgIGNvbnN0IHBhcmVudE5vZGUgPSBzdHlsZS5wYXJlbnROb2RlOwoJICAgIGlmICghaWQgJiYKCSAgICAgICAgaXNFbGVtZW50KHBhcmVudE5vZGUpICYmCgkgICAgICAgIHBhcmVudE5vZGUubG9jYWxOYW1lID09PSAiQ2FzY2FkaW5nU3R5bGUiKSB7CgkgICAgICAgIGlkID0gcGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoImttbDppZCIpIHx8IHBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCJpZCIpOwoJICAgIH0KCSAgICByZXR1cm4gbm9ybWFsaXplSWQoaWQgfHwgIiIpOwoJfQoJZnVuY3Rpb24gYnVpbGRTdHlsZU1hcChub2RlKSB7CgkgICAgY29uc3Qgc3R5bGVNYXAgPSB7fTsKCSAgICBmb3IgKGNvbnN0IHN0eWxlIG9mICQobm9kZSwgIlN0eWxlIikpIHsKCSAgICAgICAgc3R5bGVNYXBbZ2V0U3R5bGVJZChzdHlsZSldID0gZXh0cmFjdFN0eWxlKHN0eWxlKTsKCSAgICB9CgkgICAgZm9yIChjb25zdCBtYXAgb2YgJChub2RlLCAiU3R5bGVNYXAiKSkgewoJICAgICAgICBjb25zdCBpZCA9IG5vcm1hbGl6ZUlkKG1hcC5nZXRBdHRyaWJ1dGUoImlkIikgfHwgIiIpOwoJICAgICAgICB2YWwxKG1hcCwgInN0eWxlVXJsIiwgKHN0eWxlVXJsKSA9PiB7CgkgICAgICAgICAgICBzdHlsZVVybCA9IG5vcm1hbGl6ZUlkKHN0eWxlVXJsKTsKCSAgICAgICAgICAgIGlmIChzdHlsZU1hcFtzdHlsZVVybF0pIHsKCSAgICAgICAgICAgICAgICBzdHlsZU1hcFtpZF0gPSBzdHlsZU1hcFtzdHlsZVVybF07CgkgICAgICAgICAgICB9CgkgICAgICAgIH0pOwoJICAgIH0KCSAgICByZXR1cm4gc3R5bGVNYXA7Cgl9CglmdW5jdGlvbiBidWlsZFNjaGVtYShub2RlKSB7CgkgICAgY29uc3Qgc2NoZW1hID0ge307CgkgICAgZm9yIChjb25zdCBmaWVsZCBvZiAkKG5vZGUsICJTaW1wbGVGaWVsZCIpKSB7CgkgICAgICAgIHNjaGVtYVtmaWVsZC5nZXRBdHRyaWJ1dGUoIm5hbWUiKSB8fCAiIl0gPQoJICAgICAgICAgICAgdHlwZUNvbnZlcnRlcnNbZmllbGQuZ2V0QXR0cmlidXRlKCJ0eXBlIikgfHwgIiJdIHx8CgkgICAgICAgICAgICAgICAgdHlwZUNvbnZlcnRlcnNbInN0cmluZyJdOwoJICAgIH0KCSAgICByZXR1cm4gc2NoZW1hOwoJfQoJY29uc3QgRk9MREVSX1BST1BTID0gWwoJICAgICJuYW1lIiwKCSAgICAidmlzaWJpbGl0eSIsCgkgICAgIm9wZW4iLAoJICAgICJhZGRyZXNzIiwKCSAgICAiZGVzY3JpcHRpb24iLAoJICAgICJwaG9uZU51bWJlciIsCgkgICAgInZpc2liaWxpdHkiLAoJXTsKCWZ1bmN0aW9uIGdldEZvbGRlcihub2RlKSB7CgkgICAgY29uc3QgbWV0YSA9IHt9OwoJICAgIGZvciAoY29uc3QgY2hpbGQgb2YgQXJyYXkuZnJvbShub2RlLmNoaWxkTm9kZXMpKSB7CgkgICAgICAgIGlmIChpc0VsZW1lbnQoY2hpbGQpICYmIEZPTERFUl9QUk9QUy5pbmNsdWRlcyhjaGlsZC50YWdOYW1lKSkgewoJICAgICAgICAgICAgbWV0YVtjaGlsZC50YWdOYW1lXSA9IG5vZGVWYWwoY2hpbGQpOwoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJmb2xkZXIiLAoJICAgICAgICBtZXRhLAoJICAgICAgICBjaGlsZHJlbjogW10sCgkgICAgfTsKCX0KCS8qKgoJICogWWllbGQgYSBuZXN0ZWQgdHJlZSB3aXRoIEtNTCBmb2xkZXIgc3RydWN0dXJlCgkgKgoJICogVGhpcyBnZW5lcmF0ZXMgYSB0cmVlIHdpdGggdGhlIGdpdmVuIHN0cnVjdHVyZToKCSAqCgkgKiBgYGBqcwoJICogewoJICogICAidHlwZSI6ICJyb290IiwKCSAqICAgImNoaWxkcmVuIjogWwoJICogICAgIHsKCSAqICAgICAgICJ0eXBlIjogImZvbGRlciIsCgkgKiAgICAgICAibWV0YSI6IHsKCSAqICAgICAgICAgIm5hbWUiOiAiVGVzdCIKCSAqICAgICAgIH0sCgkgKiAgICAgICAiY2hpbGRyZW4iOiBbCgkgKiAgICAgICAgICAvLyAuLi5mZWF0dXJlcyBhbmQgZm9sZGVycwoJICogICAgICAgXQoJICogICAgIH0KCSAqICAgICAvLyAuLi5mZWF0dXJlcwoJICogICBdCgkgKiB9CgkgKiBgYGAKCSAqCgkgKiAjIyMgR3JvdW5kT3ZlcmxheQoJICoKCSAqIEdyb3VuZE92ZXJsYXkgZWxlbWVudHMgYXJlIGNvbnZlcnRlZCBpbnRvCgkgKiBgRmVhdHVyZWAgb2JqZWN0cyB3aXRoIGBQb2x5Z29uYCBnZW9tZXRyaWVzLAoJICogYSBwcm9wZXJ0eSBsaWtlOgoJICoKCSAqIGBgYGpzb24KCSAqIHsKCSAqICAgIkBnZW9tZXRyeS10eXBlIjogImdyb3VuZG92ZXJsYXkiCgkgKiB9CgkgKiBgYGAKCSAqCgkgKiBBbmQgdGhlIGdyb3VuZCBvdmVybGF5J3MgaW1hZ2UgVVJMIGluIHRoZSBgaHJlZmAKCSAqIHByb3BlcnR5LiBHcm91bmQgb3ZlcmxheXMgd2lsbCBuZWVkIHRvIGJlIGRpc3BsYXllZAoJICogd2l0aCBhIHNlcGFyYXRlIG1ldGhvZCB0byBvdGhlciBmZWF0dXJlcywgZGVwZW5kaW5nCgkgKiBvbiB3aGljaCBtYXAgZnJhbWV3b3JrIHlvdSdyZSB1c2luZy4KCSAqLwoJZnVuY3Rpb24ga21sV2l0aEZvbGRlcnMobm9kZSkgewoJICAgIGNvbnN0IHN0eWxlTWFwID0gYnVpbGRTdHlsZU1hcChub2RlKTsKCSAgICBjb25zdCBzY2hlbWEgPSBidWlsZFNjaGVtYShub2RlKTsKCSAgICBjb25zdCB0cmVlID0geyB0eXBlOiAicm9vdCIsIGNoaWxkcmVuOiBbXSB9OwoJICAgIGZ1bmN0aW9uIHRyYXZlcnNlKG5vZGUsIHBvaW50ZXIpIHsKCSAgICAgICAgaWYgKGlzRWxlbWVudChub2RlKSkgewoJICAgICAgICAgICAgc3dpdGNoIChub2RlLnRhZ05hbWUpIHsKCSAgICAgICAgICAgICAgICBjYXNlICJHcm91bmRPdmVybGF5IjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGFjZW1hcmsgPSBnZXRHcm91bmRPdmVybGF5KG5vZGUsIHN0eWxlTWFwLCBzY2hlbWEpOwoJICAgICAgICAgICAgICAgICAgICBpZiAocGxhY2VtYXJrKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBwb2ludGVyLmNoaWxkcmVuLnB1c2gocGxhY2VtYXJrKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgY2FzZSAiUGxhY2VtYXJrIjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGFjZW1hcmsgPSBnZXRQbGFjZW1hcmsobm9kZSwgc3R5bGVNYXAsIHNjaGVtYSk7CgkgICAgICAgICAgICAgICAgICAgIGlmIChwbGFjZW1hcmspIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50ZXIuY2hpbGRyZW4ucHVzaChwbGFjZW1hcmspOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBjYXNlICJGb2xkZXIiOiB7CgkgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvbGRlciA9IGdldEZvbGRlcihub2RlKTsKCSAgICAgICAgICAgICAgICAgICAgcG9pbnRlci5jaGlsZHJlbi5wdXNoKGZvbGRlcik7CgkgICAgICAgICAgICAgICAgICAgIHBvaW50ZXIgPSBmb2xkZXI7CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgICAgICBpZiAobm9kZS5jaGlsZE5vZGVzKSB7CgkgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykgewoJICAgICAgICAgICAgICAgIHRyYXZlcnNlKG5vZGUuY2hpbGROb2Rlc1tpXSwgcG9pbnRlcik7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9CgkgICAgdHJhdmVyc2Uobm9kZSwgdHJlZSk7CgkgICAgcmV0dXJuIHRyZWU7Cgl9CgkvKioKCSAqIENvbnZlcnQgS01MIHRvIEdlb0pTT04gaW5jcmVtZW50YWxseSwgcmV0dXJuaW5nCgkgKiBhIFtHZW5lcmF0b3JdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvSXRlcmF0b3JzX2FuZF9HZW5lcmF0b3JzKQoJICogdGhhdCB5aWVsZHMgb3V0cHV0IGZlYXR1cmUgYnkgZmVhdHVyZS4KCSAqLwoJZnVuY3Rpb24qIGttbEdlbihub2RlKSB7CgkgICAgY29uc3Qgc3R5bGVNYXAgPSBidWlsZFN0eWxlTWFwKG5vZGUpOwoJICAgIGNvbnN0IHNjaGVtYSA9IGJ1aWxkU2NoZW1hKG5vZGUpOwoJICAgIGZvciAoY29uc3QgcGxhY2VtYXJrIG9mICQobm9kZSwgIlBsYWNlbWFyayIpKSB7CgkgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRQbGFjZW1hcmsocGxhY2VtYXJrLCBzdHlsZU1hcCwgc2NoZW1hKTsKCSAgICAgICAgaWYgKGZlYXR1cmUpCgkgICAgICAgICAgICB5aWVsZCBmZWF0dXJlOwoJICAgIH0KCSAgICBmb3IgKGNvbnN0IGdyb3VuZE92ZXJsYXkgb2YgJChub2RlLCAiR3JvdW5kT3ZlcmxheSIpKSB7CgkgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRHcm91bmRPdmVybGF5KGdyb3VuZE92ZXJsYXksIHN0eWxlTWFwLCBzY2hlbWEpOwoJICAgICAgICBpZiAoZmVhdHVyZSkKCSAgICAgICAgICAgIHlpZWxkIGZlYXR1cmU7CgkgICAgfQoJfQoJLyoqCgkgKiBDb252ZXJ0IGEgS01MIGRvY3VtZW50IHRvIEdlb0pTT04uIFRoZSBmaXJzdCBhcmd1bWVudCwgYGRvY2AsIG11c3QgYmUgYSBLTUwKCSAqIGRvY3VtZW50IGFzIGFuIFhNTCBET00gLSBub3QgYXMgYSBzdHJpbmcuIFlvdSBjYW4gZ2V0IHRoaXMgdXNpbmcgalF1ZXJ5J3MgZGVmYXVsdAoJICogYC5hamF4YCBmdW5jdGlvbiBvciB1c2luZyBhIGJhcmUgWE1MSHR0cFJlcXVlc3Qgd2l0aCB0aGUgYC5yZXNwb25zZWAgcHJvcGVydHkKCSAqIGhvbGRpbmcgYW4gWE1MIERPTS4KCSAqCgkgKiBUaGUgb3V0cHV0IGlzIGEgSmF2YVNjcmlwdCBvYmplY3Qgb2YgR2VvSlNPTiBkYXRhLiBZb3UgY2FuIGNvbnZlcnQgaXQgdG8gYSBzdHJpbmcKCSAqIHdpdGggW0pTT04uc3RyaW5naWZ5XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSkKCSAqIG9yIHVzZSBpdCBkaXJlY3RseSBpbiBsaWJyYXJpZXMuCgkgKi8KCWZ1bmN0aW9uIGttbChub2RlKSB7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmVDb2xsZWN0aW9uIiwKCSAgICAgICAgZmVhdHVyZXM6IEFycmF5LmZyb20oa21sR2VuKG5vZGUpKSwKCSAgICB9OwoJfQoKCXZhciB0b0dlb0pzb24gPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7CgkJX19wcm90b19fOiBudWxsLAoJCWdweDogZ3B4LAoJCWdweEdlbjogZ3B4R2VuLAoJCWttbDoga21sLAoJCWttbEdlbjoga21sR2VuLAoJCWttbFdpdGhGb2xkZXJzOiBrbWxXaXRoRm9sZGVycywKCQl0Y3g6IHRjeCwKCQl0Y3hHZW46IHRjeEdlbgoJfSk7CgoJdmFyIHV0aWxzID0gKCgpID0+IHsKCgkgICAgY29uc3QgcHVyZ2VQcm9wcyA9IChvYmosIGJsYWNrbGlzdCkgPT4gewoJICAgICAgICBpZiAob2JqKSB7CgkgICAgICAgICAgICBsZXQgcnMgPSBPYmplY3QuYXNzaWduKHt9LCBvYmopOwoJICAgICAgICAgICAgaWYgKGJsYWNrbGlzdCkgewoJICAgICAgICAgICAgICAgIGZvciAobGV0IHByb3Agb2YgYmxhY2tsaXN0KSB7CgkgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByc1twcm9wXTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICByZXR1cm4gcnM7CgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIHt9OwoJICAgIH07CgoJICAgIGNvbnN0IG1lcmdlUHJvcHMgPSAob2JqMSwgb2JqMikgPT4gewoJICAgICAgICBvYmoxID0gb2JqMT8gb2JqMSA6IHt9OwoJICAgICAgICBvYmoyID0gb2JqMj8gb2JqMiA6IHt9OwoJICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihvYmoxLCBvYmoyKTsKCSAgICB9OwoKCSAgICBjb25zdCBmaXJzdCA9IGEgPT4gYVswXTsKCSAgICBjb25zdCBsYXN0ID0gYSA9PiBhW2EubGVuZ3RoIC0gMV07CgkgICAgY29uc3QgY29vcmRzVG9LZXkgPSBhID0+IGEuam9pbignLCcpOwoKCSAgICBjb25zdCBhZGRUb01hcCA9IChtLCBrLCB2KSA9PiB7CgkgICAgICAgIGxldCBhID0gbVtrXTsKCSAgICAgICAgaWYgKGEpIHsKCSAgICAgICAgICAgIGEucHVzaCh2KTsKCSAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgIG1ba10gPSBbdl07CgkgICAgICAgIH0KCSAgICB9OwoJICAgIAoJICAgIGNvbnN0IHJlbW92ZUZyb21NYXAgPSAobSwgaywgdikgPT4gewoJICAgICAgICBsZXQgYSA9IG1ba107CgkgICAgICAgIGxldCBpZHggPSBudWxsOwoJICAgICAgICBpZiAoYSAmJiAoaWR4ID0gYS5pbmRleE9mKHYpKSA+PSAwKSB7CgkgICAgICAgICAgICBhLnNwbGljZShpZHgsIDEpOwoJICAgICAgICB9CgkgICAgfTsKCSAgICAKCSAgICBjb25zdCBnZXRGaXJzdEZyb21NYXAgPSAobSwgaykgPT4gewoJICAgICAgICBsZXQgYSA9IG1ba107CgkgICAgICAgIGlmIChhICYmIGEubGVuZ3RoID4gMCkgewoJICAgICAgICAgICAgcmV0dXJuIGFbMF07CgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgfTsKCgkgICAgLy8gbmVlZCAzKyBkaWZmZXJlbnQgcG9pbnRzIHRvIGZvcm0gYSByaW5nLCBoZXJlIHVzaW5nID4gMyBpcyAnY296IGEgdGhlIGZpcnN0IGFuZCB0aGUgbGFzdCBwb2ludHMgYXJlIGFjdHVhbGx5IHRoZSBzYW1lCgkgICAgY29uc3QgaXNSaW5nID0gYSA9PiBhLmxlbmd0aCA+IDMgJiYgY29vcmRzVG9LZXkoZmlyc3QoYSkpID09PSBjb29yZHNUb0tleShsYXN0KGEpKTsKCgkgICAgY29uc3QgcmluZ0RpcmVjdGlvbiA9IChhLCB4SWR4LCB5SWR4KSA9PiB7CgkgICAgICAgIHhJZHggPSB4SWR4IHx8IDAsIHlJZHggPSB5SWR4IHx8IDE7CgkgICAgICAgIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIHBvaW50IHdoaWNoIGhhcyB0aGUgbWF4aW11bSB4IHZhbHVlCgkgICAgICAgIGxldCBtID0gYS5yZWR1Y2UoKG1heHhJZHgsIHYsIGlkeCkgPT4gYVttYXh4SWR4XVt4SWR4XSA+IHZbeElkeF0gPyBtYXh4SWR4IDogaWR4LCAwKTsKCSAgICAgICAgLy8gJ2NveiB0aGUgZmlyc3QgcG9pbnQgaXMgdmlydHVhbGx5IHRoZSBzYW1lIG9uZSBhcyB0aGUgbGFzdCBwb2ludCwgCgkgICAgICAgIC8vIHdlIG5lZWQgdG8gc2tpcCBhLmxlbmd0aCAtIDEgZm9yIGxlZnQgd2hlbiBtID0gMCwKCSAgICAgICAgLy8gYW5kIHNraXAgMCBmb3IgcmlnaHQgd2hlbiBtID0gYS5sZW5ndGggLSAxOwoJICAgICAgICBsZXQgbCA9IG0gPD0gMD8gYS5sZW5ndGggLSAyIDogbSAtIDEsIHIgPSBtID49IGEubGVuZ3RoIC0gMT8gMSA6IG0gKyAxOwoJICAgICAgICBsZXQgeGEgPSBhW2xdW3hJZHhdLCB4YiA9IGFbbV1beElkeF0sIHhjID0gYVtyXVt4SWR4XTsKCSAgICAgICAgbGV0IHlhID0gYVtsXVt5SWR4XSwgeWIgPSBhW21dW3lJZHhdLCB5YyA9IGFbcl1beUlkeF07CgkgICAgICAgIGxldCBkZXQgPSAoeGIgLSB4YSkgKiAoeWMgLSB5YSkgLSAoeGMgLSB4YSkgKiAoeWIgLSB5YSk7CgkgICAgICAgIHJldHVybiBkZXQgPCAwID8gJ2Nsb2Nrd2lzZScgOiAnY291bnRlcmNsb2Nrd2lzZSc7CgkgICAgfTsKCgkgICAgY29uc3QgcHRJbnNpZGVQb2x5Z29uID0gKHB0LCBwb2x5Z29uLCB4SWR4LCB5SWR4KSA9PiB7CgkgICAgICAgIHhJZHggPSB4SWR4IHx8IDAsIHlJZHggPSB5SWR4IHx8IDE7CgkgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTsKCSAgICAgICAgZm9yIChsZXQgaSA9IDAsIGogPSBwb2x5Z29uLmxlbmd0aCAtIDE7IGkgPCBwb2x5Z29uLmxlbmd0aDsgaiA9IGkrKykgewoJICAgICAgICAgICAgaWYgKChwb2x5Z29uW2ldW3hJZHhdIDw9IHB0W3hJZHhdICYmIHB0W3hJZHhdIDwgcG9seWdvbltqXVt4SWR4XSB8fAoJICAgICAgICAgICAgICAgIHBvbHlnb25bal1beElkeF0gPD0gcHRbeElkeF0gJiYgcHRbeElkeF0gPCBwb2x5Z29uW2ldW3hJZHhdKSAmJgoJICAgICAgICAgICAgICAgIHB0W3lJZHhdIDwgKHBvbHlnb25bal1beUlkeF0gLSBwb2x5Z29uW2ldW3lJZHhdKSAqIChwdFt4SWR4XSAtIHBvbHlnb25baV1beElkeF0pIC8gKHBvbHlnb25bal1beElkeF0gLSBwb2x5Z29uW2ldW3hJZHhdKSArIHBvbHlnb25baV1beUlkeF0pIHsKCSAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gIXJlc3VsdDsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgCgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIHJlc3VsdDsKCSAgICB9OwoKCSAgICBjb25zdCBzdHJUb0Zsb2F0ID0gZWwgPT4gZWwgaW5zdGFuY2VvZiBBcnJheT8gZWwubWFwKHN0clRvRmxvYXQpIDogcGFyc2VGbG9hdChlbCk7CgkgICAgCgkgICAgY2xhc3MgUmVmRWxlbWVudHMgZXh0ZW5kcyBNYXAgewoJICAgICAgICBjb25zdHJ1Y3RvcigpIHsKCSAgICAgICAgICAgIHN1cGVyKCk7CgkgICAgICAgICAgICB0aGlzLmJpbmRlcnMgPSBbXTsKCSAgICAgICAgfQoKCSAgICAgICAgYWRkKGssIHYpIHsKCSAgICAgICAgICAgIGlmICghdGhpcy5oYXMoaykpIHsKCSAgICAgICAgICAgICAgICB0aGlzLnNldChrLCB2KTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIC8vIHN1cHByZXNzIGR1cGxjYXRlZCBrZXkgZXJyb3IKCSAgICAgICAgICAgIC8vIGVsc2UKCSAgICAgICAgICAgIC8vIHRocm93IGBFcnJvcjogYWRkaW5nIGR1cGxpY2F0ZWQga2V5ICcke2t9JyB0byBSZWZFbGVtZW50c2A7CgkgICAgICAgIH0KCgkgICAgICAgIGFkZEJpbmRlcihiaW5kZXIpIHsKCSAgICAgICAgICAgIHRoaXMuYmluZGVycy5wdXNoKGJpbmRlcik7CgkgICAgICAgIH0KCgkgICAgICAgIGJpbmRBbGwoKSB7CgkgICAgICAgICAgICB0aGlzLmJpbmRlcnMuZm9yRWFjaChiaW5kZXIgPT4gYmluZGVyLmJpbmQoKSk7CgkgICAgICAgIH0KCSAgICB9CgoJICAgIGNsYXNzIExhdGVCaW5kZXIgewoJICAgICAgICBjb25zdHJ1Y3Rvcihjb250YWluZXIsIHZhbHVlRnVuYywgY3R4LCBhcmdzKSB7CgkgICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjsKCSAgICAgICAgICAgIHRoaXMudmFsdWVGdW5jID0gdmFsdWVGdW5jOwoJICAgICAgICAgICAgdGhpcy5jdHggPSBjdHg7CgkgICAgICAgICAgICB0aGlzLmFyZ3MgPSBhcmdzOwoJICAgICAgICB9CgoJICAgICAgICBiaW5kKCkgewoJICAgICAgICAgICAgbGV0IHYgPSB0aGlzLnZhbHVlRnVuYy5hcHBseSh0aGlzLmN0eCwgdGhpcy5hcmdzKTsKCSAgICAgICAgICAgIGlmICh0aGlzLmNvbnRhaW5lciBpbnN0YW5jZW9mIEFycmF5KSB7CgkgICAgICAgICAgICAgICAgbGV0IGlkeCA9IHRoaXMuY29udGFpbmVyLmluZGV4T2YodGhpcyk7CgkgICAgICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7CgkgICAgICAgICAgICAgICAgICAgIGxldCBhcmdzID0gW2lkeCwgMV07CgkgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2godik7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgW10uc3BsaWNlLmFwcGx5KHRoaXMuY29udGFpbmVyLCBhcmdzKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNvbnRhaW5lciA9PT0gJ29iamVjdCcpIHsKCSAgICAgICAgICAgICAgICBsZXQgayA9IE9iamVjdC5rZXlzKHRoaXMuY29udGFpbmVyKS5maW5kKHYgPT4gdGhpcy5jb250YWluZXJbdl0gPT09IHRoaXMpOwoJICAgICAgICAgICAgICAgIGlmIChrKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lcltrXSA9IHY7CgkgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb250YWluZXJba107CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9CgoJICAgIGNsYXNzIFdheUNvbGxlY3Rpb24gZXh0ZW5kcyBBcnJheSB7CgkgICAgICAgIGNvbnN0cnVjdG9yKCkgewoJICAgICAgICAgICAgc3VwZXIoKTsKCSAgICAgICAgICAgIHRoaXMuZmlyc3RNYXAgPSB7fTsKCSAgICAgICAgICAgIHRoaXMubGFzdE1hcCA9IHt9OwoJICAgICAgICB9CgoJICAgICAgICBhZGRXYXkod2F5KSB7CgkgICAgICAgICAgICB3YXkgPSB3YXkudG9Db29yZHNBcnJheSgpOwoJICAgICAgICAgICAgaWYgKHdheS5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICAgICAgdGhpcy5wdXNoKHdheSk7CgkgICAgICAgICAgICAgICAgYWRkVG9NYXAodGhpcy5maXJzdE1hcCwgY29vcmRzVG9LZXkoZmlyc3Qod2F5KSksIHdheSk7CgkgICAgICAgICAgICAgICAgYWRkVG9NYXAodGhpcy5sYXN0TWFwLCBjb29yZHNUb0tleShsYXN0KHdheSkpLCB3YXkpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgoJICAgICAgICB0b1N0cmluZ3MoKSB7CgkgICAgICAgICAgICBsZXQgc3RyaW5ncyA9IFtdLCB3YXkgPSBudWxsOwoJICAgICAgICAgICAgd2hpbGUgKHdheSA9IHRoaXMuc2hpZnQoKSkgewoJICAgICAgICAgICAgICAgIHJlbW92ZUZyb21NYXAodGhpcy5maXJzdE1hcCwgY29vcmRzVG9LZXkoZmlyc3Qod2F5KSksIHdheSk7CgkgICAgICAgICAgICAgICAgcmVtb3ZlRnJvbU1hcCh0aGlzLmxhc3RNYXAsIGNvb3Jkc1RvS2V5KGxhc3Qod2F5KSksIHdheSk7CgkgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSB3YXksIG5leHQgPSBudWxsOwoJICAgICAgICAgICAgICAgIGRvIHsKCSAgICAgICAgICAgICAgICAgICAgbGV0IGtleSA9IGNvb3Jkc1RvS2V5KGxhc3QoY3VycmVudCkpLCBzaG91bGRSZXZlcnNlID0gZmFsc2U7CgoJICAgICAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Rmlyc3RGcm9tTWFwKHRoaXMuZmlyc3RNYXAsIGtleSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAoJICAgICAgICAgICAgICAgICAgICBpZiAoIW5leHQpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBnZXRGaXJzdEZyb21NYXAodGhpcy5sYXN0TWFwLCBrZXkpOwoJICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkUmV2ZXJzZSA9IHRydWU7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgCgkgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwbGljZSh0aGlzLmluZGV4T2YobmV4dCksIDEpOwoJICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRnJvbU1hcCh0aGlzLmZpcnN0TWFwLCBjb29yZHNUb0tleShmaXJzdChuZXh0KSksIG5leHQpOwoJICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRnJvbU1hcCh0aGlzLmxhc3RNYXAsIGNvb3Jkc1RvS2V5KGxhc3QobmV4dCkpLCBuZXh0KTsKCSAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaG91bGRSZXZlcnNlKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWx3YXlzIHJldmVyc2Ugc2hvcnRlciBvbmUgdG8gc2F2ZSB0aW1lCgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQubGVuZ3RoID4gY3VycmVudC5sZW5ndGgpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2N1cnJlbnQsIG5leHRdID0gW25leHQsIGN1cnJlbnRdOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0LnJldmVyc2UoKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5jb25jYXQobmV4dC5zbGljZSgxKSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9IHdoaWxlIChuZXh0KTsKCSAgICAgICAgICAgICAgICBzdHJpbmdzLnB1c2goc3RyVG9GbG9hdChjdXJyZW50KSk7CgkgICAgICAgICAgICB9CgoJICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3M7CgkgICAgICAgIH0KCgkgICAgICAgIHRvUmluZ3MoZGlyZWN0aW9uKSB7CgkgICAgICAgICAgICBsZXQgc3RyaW5ncyA9IHRoaXMudG9TdHJpbmdzKCk7CgkgICAgICAgICAgICBsZXQgcmluZ3MgPSBbXSwgc3RyaW5nID0gbnVsbDsKCSAgICAgICAgICAgIHdoaWxlIChzdHJpbmcgPSBzdHJpbmdzLnNoaWZ0KCkpIHsKCSAgICAgICAgICAgICAgICBpZiAoaXNSaW5nKHN0cmluZykpIHsKCSAgICAgICAgICAgICAgICAgICAgaWYgKHJpbmdEaXJlY3Rpb24oc3RyaW5nKSAhPT0gZGlyZWN0aW9uKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcucmV2ZXJzZSgpOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIHJpbmdzLnB1c2goc3RyaW5nKTsKCSAgICAgICAgICAgICAgICB9ICAgIAoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmV0dXJuIHJpbmdzOwoJICAgICAgICB9CgkgICAgfQoKCSAgICByZXR1cm4ge3B1cmdlUHJvcHMsIG1lcmdlUHJvcHMsCgkgICAgICAgIGZpcnN0LCBsYXN0LCBjb29yZHNUb0tleSwKCSAgICAgICAgYWRkVG9NYXAsIHJlbW92ZUZyb21NYXAsIGdldEZpcnN0RnJvbU1hcCwKCSAgICAgICAgaXNSaW5nLCByaW5nRGlyZWN0aW9uLCBwdEluc2lkZVBvbHlnb24sIHN0clRvRmxvYXQsCgkgICAgICAgIFJlZkVsZW1lbnRzLCBMYXRlQmluZGVyLCBXYXlDb2xsZWN0aW9ufTsKCX0pKCk7CgoJdmFyIGJ1aWxkaW5nID0gewoJfTsKCXZhciBoaWdod2F5ID0gewoJCXdoaXRlbGlzdDogWwoJCQkic2VydmljZXMiLAoJCQkicmVzdF9hcmVhIiwKCQkJImVzY2FwZSIsCgkJCSJlbGV2YXRvciIKCQldCgl9OwoJdmFyIG5hdHVyYWwgPSB7CgkJYmxhY2tsaXN0OiBbCgkJCSJjb2FzdGxpbmUiLAoJCQkiY2xpZmYiLAoJCQkicmlkZ2UiLAoJCQkiYXJldGUiLAoJCQkidHJlZV9yb3ciCgkJXQoJfTsKCXZhciBsYW5kdXNlID0gewoJfTsKCXZhciB3YXRlcndheSA9IHsKCQl3aGl0ZWxpc3Q6IFsKCQkJInJpdmVyYmFuayIsCgkJCSJkb2NrIiwKCQkJImJvYXR5YXJkIiwKCQkJImRhbSIKCQldCgl9OwoJdmFyIGFtZW5pdHkgPSB7Cgl9OwoJdmFyIGxlaXN1cmUgPSB7Cgl9OwoJdmFyIGJhcnJpZXIgPSB7CgkJd2hpdGVsaXN0OiBbCgkJCSJjaXR5X3dhbGwiLAoJCQkiZGl0Y2giLAoJCQkiaGVkZ2UiLAoJCQkicmV0YWluaW5nX3dhbGwiLAoJCQkid2FsbCIsCgkJCSJzcGlrZXMiCgkJXQoJfTsKCXZhciByYWlsd2F5ID0gewoJCXdoaXRlbGlzdDogWwoJCQkic3RhdGlvbiIsCgkJCSJ0dXJudGFibGUiLAoJCQkicm91bmRob3VzZSIsCgkJCSJwbGF0Zm9ybSIKCQldCgl9OwoJdmFyIGFyZWEgPSB7Cgl9OwoJdmFyIGJvdW5kYXJ5ID0gewoJfTsKCXZhciBtYW5fbWFkZSA9IHsKCQlibGFja2xpc3Q6IFsKCQkJImN1dGxpbmUiLAoJCQkiZW1iYW5rbWVudCIsCgkJCSJwaXBlbGluZSIKCQldCgl9OwoJdmFyIHBvd2VyID0gewoJCXdoaXRlbGlzdDogWwoJCQkicGxhbnQiLAoJCQkic3Vic3RhdGlvbiIsCgkJCSJnZW5lcmF0b3IiLAoJCQkidHJhbnNmb3JtZXIiCgkJXQoJfTsKCXZhciBwbGFjZSA9IHsKCX07Cgl2YXIgc2hvcCA9IHsKCX07Cgl2YXIgYWVyb3dheSA9IHsKCQlibGFja2xpc3Q6IFsKCQkJInRheGl3YXkiCgkJXQoJfTsKCXZhciB0b3VyaXNtID0gewoJfTsKCXZhciBoaXN0b3JpYyA9IHsKCX07Cgl2YXIgcHVibGljX3RyYW5zcG9ydCA9IHsKCX07Cgl2YXIgb2ZmaWNlID0gewoJfTsKCXZhciBtaWxpdGFyeSA9IHsKCX07Cgl2YXIgcnVpbnMgPSB7Cgl9OwoJdmFyIGNyYWZ0ID0gewoJfTsKCXZhciBnb2xmID0gewoJfTsKCXZhciBpbmRvb3IgPSB7Cgl9OwoJdmFyIHJlcXVpcmUkJDEgPSB7CgkJYnVpbGRpbmc6IGJ1aWxkaW5nLAoJCWhpZ2h3YXk6IGhpZ2h3YXksCgkJbmF0dXJhbDogbmF0dXJhbCwKCQlsYW5kdXNlOiBsYW5kdXNlLAoJCXdhdGVyd2F5OiB3YXRlcndheSwKCQlhbWVuaXR5OiBhbWVuaXR5LAoJCWxlaXN1cmU6IGxlaXN1cmUsCgkJYmFycmllcjogYmFycmllciwKCQlyYWlsd2F5OiByYWlsd2F5LAoJCWFyZWE6IGFyZWEsCgkJYm91bmRhcnk6IGJvdW5kYXJ5LAoJCW1hbl9tYWRlOiBtYW5fbWFkZSwKCQlwb3dlcjogcG93ZXIsCgkJcGxhY2U6IHBsYWNlLAoJCXNob3A6IHNob3AsCgkJYWVyb3dheTogYWVyb3dheSwKCQl0b3VyaXNtOiB0b3VyaXNtLAoJCWhpc3RvcmljOiBoaXN0b3JpYywKCQlwdWJsaWNfdHJhbnNwb3J0OiBwdWJsaWNfdHJhbnNwb3J0LAoJCW9mZmljZTogb2ZmaWNlLAoJCSJidWlsZGluZzpwYXJ0IjogewoJfSwKCQltaWxpdGFyeTogbWlsaXRhcnksCgkJcnVpbnM6IHJ1aW5zLAoJCSJhcmVhOmhpZ2h3YXkiOiB7Cgl9LAoJCWNyYWZ0OiBjcmFmdCwKCQlnb2xmOiBnb2xmLAoJCWluZG9vcjogaW5kb29yCgl9OwoKCXZhciBvc21vYmpzID0gKCgpID0+IHsKCgkgICAgY29uc3Qge2ZpcnN0LCBsYXN0LCBjb29yZHNUb0tleSwKCSAgICAgICAgYWRkVG9NYXAsIHJlbW92ZUZyb21NYXAsIGdldEZpcnN0RnJvbU1hcCwgCgkgICAgICAgIGlzUmluZywgcmluZ0RpcmVjdGlvbiwgcHRJbnNpZGVQb2x5Z29uLCBzdHJUb0Zsb2F0LCAKCSAgICAgICAgTGF0ZUJpbmRlciwgV2F5Q29sbGVjdGlvbn0gPSB1dGlscywKCSAgICAgICAgcG9seWdvblRhZ3MgPSByZXF1aXJlJCQxOwoKCSAgICBjbGFzcyBPc21PYmplY3QgewoJICAgICAgICBjb25zdHJ1Y3Rvcih0eXBlLCBpZCwgcmVmRWxlbXMpIHsKCSAgICAgICAgICAgIHRoaXMudHlwZSA9IHR5cGU7CgkgICAgICAgICAgICB0aGlzLmlkID0gaWQ7CgkgICAgICAgICAgICB0aGlzLnJlZkVsZW1zID0gcmVmRWxlbXM7CgkgICAgICAgICAgICB0aGlzLnRhZ3MgPSB7fTsKCSAgICAgICAgICAgIHRoaXMucHJvcHMgPSB7aWQ6IHRoaXMuZ2V0Q29tcG9zaXRlSWQoKX07CgkgICAgICAgICAgICB0aGlzLnJlZkNvdW50ID0gMDsKCSAgICAgICAgICAgIHRoaXMuaGFzVGFnID0gZmFsc2U7CgkgICAgICAgICAgICBpZiAocmVmRWxlbXMpIHsKCSAgICAgICAgICAgICAgICByZWZFbGVtcy5hZGQodGhpcy5nZXRDb21wb3NpdGVJZCgpLCB0aGlzKTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoKCSAgICAgICAgYWRkVGFncyh0YWdzKSB7CgkgICAgICAgICAgICB0aGlzLnRhZ3MgPSBPYmplY3QuYXNzaWduKHRoaXMudGFncywgdGFncyk7CgkgICAgICAgICAgICB0aGlzLmhhc1RhZyA9IHRhZ3M/IHRydWUgOiBmYWxzZTsKCSAgICAgICAgfQoKCSAgICAgICAgYWRkVGFnKGssIHYpIHsKCSAgICAgICAgICAgIHRoaXMudGFnc1trXSA9IHY7CgkgICAgICAgICAgICB0aGlzLmhhc1RhZyA9IGs/IHRydWUgOiBmYWxzZTsKCSAgICAgICAgfQoKCSAgICAgICAgYWRkUHJvcChrLCB2KSB7CgkgICAgICAgICAgICB0aGlzLnByb3BzW2tdID0gdjsKCSAgICAgICAgfQoKCSAgICAgICAgYWRkUHJvcHMocHJvcHMpIHsKCSAgICAgICAgICAgIHRoaXMucHJvcHMgPSBPYmplY3QuYXNzaWduKHRoaXMucHJvcHMsIHByb3BzKTsgICAgCgkgICAgICAgIH0KCgkgICAgICAgIGdldENvbXBvc2l0ZUlkKCkgewoJICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMudHlwZX0vJHt0aGlzLmlkfWA7CgkgICAgICAgIH0KCgkgICAgICAgIGdldFByb3BzKCkgewoJICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24odGhpcy5wcm9wcywgdGhpcy50YWdzKTsKCSAgICAgICAgfSAgICAgICAgCgoJICAgICAgICB0b0ZlYXR1cmVBcnJheSgpIHsKCSAgICAgICAgICAgIHJldHVybiBbXTsKCSAgICAgICAgfQoJICAgIH0KCgkgICAgY2xhc3MgTm9kZSBleHRlbmRzIE9zbU9iamVjdCB7CgkgICAgICAgIGNvbnN0cnVjdG9yKGlkLCByZWZFbGVtcykgewoJICAgICAgICAgICAgc3VwZXIoJ25vZGUnLCBpZCwgcmVmRWxlbXMpOwoJICAgICAgICAgICAgdGhpcy5sYXRMbmcgPSBudWxsOwoJICAgICAgICB9CgoJICAgICAgICBzZXRMYXRMbmcobGF0TG5nKSB7CgkgICAgICAgICAgICB0aGlzLmxhdExuZyA9IGxhdExuZzsKCSAgICAgICAgfQoKCSAgICAgICAgdG9GZWF0dXJlQXJyYXkoKSB7CgkgICAgICAgICAgICBpZiAodGhpcy5sYXRMbmcpIHsKCSAgICAgICAgICAgICAgICByZXR1cm4gW3sKCSAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5nZXRDb21wb3NpdGVJZCgpLAoJICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0aGlzLmdldFByb3BzKCksCgkgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLAoJICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHN0clRvRmxvYXQoW3RoaXMubGF0TG5nLmxvbiwgdGhpcy5sYXRMbmcubGF0XSkKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH1dOwoJICAgICAgICAgICAgfQoKCSAgICAgICAgICAgIHJldHVybiBbXTsKCSAgICAgICAgfQoKCSAgICAgICAgZ2V0TGF0TG5nKCkgewoJICAgICAgICAgICAgcmV0dXJuIHRoaXMubGF0TG5nOwoJICAgICAgICB9CgkgICAgfQoKCSAgICBjbGFzcyBXYXkgZXh0ZW5kcyBPc21PYmplY3QgewoJICAgICAgICBjb25zdHJ1Y3RvcihpZCwgcmVmRWxlbXMpIHsKCSAgICAgICAgICAgIHN1cGVyKCd3YXknLCBpZCwgcmVmRWxlbXMpOwoJICAgICAgICAgICAgdGhpcy5sYXRMbmdBcnJheSA9IFtdOwoJICAgICAgICAgICAgdGhpcy5pc1BvbHlnb24gPSBmYWxzZTsKCSAgICAgICAgfQoKCSAgICAgICAgYWRkTGF0TG5nKGxhdExuZykgewoJICAgICAgICAgICAgdGhpcy5sYXRMbmdBcnJheS5wdXNoKGxhdExuZyk7CgkgICAgICAgIH0KCgkgICAgICAgIHNldExhdExuZ0FycmF5KGxhdExuZ0FycmF5KSB7CgkgICAgICAgICAgICB0aGlzLmxhdExuZ0FycmF5ID0gbGF0TG5nQXJyYXk7CgkgICAgICAgIH0KCgkgICAgICAgIGFkZE5vZGVSZWYocmVmKSB7CgkgICAgICAgICAgICBsZXQgYmluZGVyID0gbmV3IExhdGVCaW5kZXIodGhpcy5sYXRMbmdBcnJheSwgZnVuY3Rpb24oaWQpIHsKCSAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IHRoaXMucmVmRWxlbXMuZ2V0KGBub2RlLyR7aWR9YCk7CgkgICAgICAgICAgICAgICAgaWYgKG5vZGUpIHsKCSAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWZDb3VudCsrOwoJICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5nZXRMYXRMbmcoKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9LCB0aGlzLCBbcmVmXSk7CgoJICAgICAgICAgICAgdGhpcy5sYXRMbmdBcnJheS5wdXNoKGJpbmRlcik7CgkgICAgICAgICAgICB0aGlzLnJlZkVsZW1zLmFkZEJpbmRlcihiaW5kZXIpOwoJICAgICAgICB9CgoJICAgICAgICBhbmFseXplVGFnKGssIHYpIHsKCSAgICAgICAgICAgIGxldCBvID0gcG9seWdvblRhZ3Nba107CgkgICAgICAgICAgICBpZiAobykgewoJICAgICAgICAgICAgICAgIHRoaXMuaXNQb2x5Z29uID0gdHJ1ZTsKCSAgICAgICAgICAgICAgICBpZiAoby53aGl0ZWxpc3QpIHsKCSAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1BvbHlnb24gPSBvLndoaXRlbGlzdC5pbmRleE9mKHYpID49IDA/IHRydWUgOiBmYWxzZTsKCSAgICAgICAgICAgICAgICB9IGVsc2UgaWYoby5ibGFja2xpc3QpIHsKCSAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1BvbHlnb24gPSBvLmJsYWNrbGlzdC5pbmRleE9mKHYpID49IDA/IGZhbHNlIDogdHJ1ZTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCgkgICAgICAgIGFkZFRhZ3ModGFncykgewoJICAgICAgICAgICAgc3VwZXIuYWRkVGFncyh0YWdzKTsKCSAgICAgICAgICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh0YWdzKSkgewoJICAgICAgICAgICAgICAgIHRoaXMuYW5hbHl6ZVRhZyhrLCB2KTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoKCSAgICAgICAgYWRkVGFnKGssIHYpIHsKCSAgICAgICAgICAgIHN1cGVyLmFkZFRhZyhrLCB2KTsKCSAgICAgICAgICAgIHRoaXMuYW5hbHl6ZVRhZyhrLCB2KTsKCSAgICAgICAgfQoKCSAgICAgICAgdG9Db29yZHNBcnJheSgpIHsKCSAgICAgICAgICAgIHJldHVybiB0aGlzLmxhdExuZ0FycmF5Lm1hcChsYXRMbmcgPT4gW2xhdExuZy5sb24sIGxhdExuZy5sYXRdKTsKCSAgICAgICAgfQoKCSAgICAgICAgdG9GZWF0dXJlQXJyYXkoKSB7CgkgICAgICAgICAgICBsZXQgY29vcmRzQXJyYXkgPSB0aGlzLnRvQ29vcmRzQXJyYXkoKTsKCSAgICAgICAgICAgIGlmIChjb29yZHNBcnJheS5sZW5ndGggPiAxKSB7CgkgICAgICAgICAgICAgICAgY29vcmRzQXJyYXkgPSBzdHJUb0Zsb2F0KGNvb3Jkc0FycmF5KTsKCSAgICAgICAgICAgICAgICBsZXQgZmVhdHVyZSA9IHsKCSAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5nZXRDb21wb3NpdGVJZCgpLAoJICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0aGlzLmdldFByb3BzKCksCgkgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogY29vcmRzQXJyYXkKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH07CgoJICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzUG9seWdvbiAmJiBpc1JpbmcoY29vcmRzQXJyYXkpKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChyaW5nRGlyZWN0aW9uKGNvb3Jkc0FycmF5KSAhPT0gJ2NvdW50ZXJjbG9ja3dpc2UnKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHNBcnJheS5yZXZlcnNlKCk7CgkgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkgPSB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW2Nvb3Jkc0FycmF5XQoJICAgICAgICAgICAgICAgICAgICB9OwoKCSAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtmZWF0dXJlXTsKCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIHJldHVybiBbZmVhdHVyZV07CgkgICAgICAgICAgICB9CgoJICAgICAgICAgICAgcmV0dXJuIFtdOwoJICAgICAgICB9CgkgICAgfQoKCSAgICBjbGFzcyBSZWxhdGlvbiBleHRlbmRzIE9zbU9iamVjdCB7CgkgICAgICAgIGNvbnN0cnVjdG9yKGlkLCByZWZFbGVtcykgewoJICAgICAgICAgICAgc3VwZXIoJ3JlbGF0aW9uJywgaWQsIHJlZkVsZW1zKTsKCSAgICAgICAgICAgIHRoaXMucmVsYXRpb25zID0gW107CgkgICAgICAgICAgICB0aGlzLm5vZGVzID0gW107CgkgICAgICAgICAgICB0aGlzLmJvdW5kcyA9IG51bGw7CgkgICAgICAgIH0KCgkgICAgICAgIHNldEJvdW5kcyhib3VuZHMpIHsKCSAgICAgICAgICAgIHRoaXMuYm91bmRzID0gYm91bmRzOwoJICAgICAgICB9CgoJICAgICAgICBhZGRNZW1iZXIobWVtYmVyKSB7CgkgICAgICAgICAgICBzd2l0Y2ggKG1lbWJlci50eXBlKSB7CgkgICAgICAgICAgICAgICAgLy8gc3VwZXIgcmVsYXRpb24sIG5lZWQgdG8gZG8gY29tYmluYXRpb24KCSAgICAgICAgICAgICAgICBjYXNlICdyZWxhdGlvbic6CgkgICAgICAgICAgICAgICAgICAgIGxldCBiaW5kZXIgPSBuZXcgTGF0ZUJpbmRlcih0aGlzLnJlbGF0aW9ucywgZnVuY3Rpb24oaWQpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWxhdGlvbiA9IHRoaXMucmVmRWxlbXMuZ2V0KGByZWxhdGlvbi8ke2lkfWApOwoJICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbGF0aW9uKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb24ucmVmQ291bnQrKzsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpb247CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMsIFttZW1iZXIucmVmXSk7CgkgICAgICAgICAgICAgICAgICAgIHRoaXMucmVsYXRpb25zLnB1c2goYmluZGVyKTsKCSAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZFbGVtcy5hZGRCaW5kZXIoYmluZGVyKTsKCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgoJICAgICAgICAgICAgICAgIGNhc2UgJ3dheSc6CgkgICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLnJvbGUpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlci5yb2xlID0gJyc7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgbGV0IHdheXMgPSB0aGlzW21lbWJlci5yb2xlXTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXlzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXlzID0gdGhpc1ttZW1iZXIucm9sZV0gPSBbXTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBpZiAobWVtYmVyLmdlb21ldHJ5KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBsZXQgd2F5ID0gbmV3IFdheShtZW1iZXIucmVmLCB0aGlzLnJlZkVsZW1zKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHdheS5zZXRMYXRMbmdBcnJheShtZW1iZXIuZ2VvbWV0cnkpOwoJICAgICAgICAgICAgICAgICAgICAgICAgd2F5LnJlZkNvdW50Kys7CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXlzLnB1c2god2F5KTsKCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXIubm9kZXMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3YXkgPSBuZXcgV2F5KG1lbWJlci5yZWYsIHRoaXMucmVmRWxlbXMpOwoJICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbmlkIG9mIG1lbWJlci5ub2RlcykgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdheS5hZGROb2RlUmVmKG5pZCk7CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXkucmVmQ291bnQrKzsKCSAgICAgICAgICAgICAgICAgICAgICAgIHdheXMucHVzaCh3YXkpOwoJICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJpbmRlciA9IG5ldyBMYXRlQmluZGVyKHdheXMsIGZ1bmN0aW9uKGlkKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHdheSA9IHRoaXMucmVmRWxlbXMuZ2V0KGB3YXkvJHtpZH1gKTsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod2F5KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdheS5yZWZDb3VudCsrOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2F5OwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMsIFttZW1iZXIucmVmXSk7CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXlzLnB1c2goYmluZGVyKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmRWxlbXMuYWRkQmluZGVyKGJpbmRlcik7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgoJICAgICAgICAgICAgICAgIGNhc2UgJ25vZGUnOgoJICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG51bGw7CgkgICAgICAgICAgICAgICAgICAgIGlmIChtZW1iZXIubGF0ICYmIG1lbWJlci5sb24pIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgPSBuZXcgTm9kZShtZW1iZXIucmVmLCB0aGlzLnJlZkVsZW1zKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0TGF0TG5nKHtsb246IG1lbWJlci5sb24sIGxhdDogbWVtYmVyLmxhdH0pOwoJICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lbWJlci50YWdzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5hZGRUYWdzKG1lbWJlci50YWdzKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhtZW1iZXIpKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFsnaWQnLCAndHlwZScsICdsYXQnLCAnbG9uJ10uaW5kZXhPZihrKSA8IDApIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5hZGRQcm9wKGssIHYpOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlZkNvdW50Kys7CgkgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7CgkgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYmluZGVyID0gbmV3IExhdGVCaW5kZXIodGhpcy5ub2RlcywgZnVuY3Rpb24oaWQpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IHRoaXMucmVmRWxlbXMuZ2V0KGBub2RlLyR7aWR9YCk7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWZDb3VudCsrOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLCBbbWVtYmVyLnJlZl0pOwoJICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKGJpbmRlcik7CgkgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZkVsZW1zLmFkZEJpbmRlcihiaW5kZXIpOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgoJICAgICAgICB0b0ZlYXR1cmVBcnJheSgpIHsKCSAgICAgICAgICAgIGNvbnN0IGNvbnN0cnVjdFN0cmluZ0dlb21ldHJ5ID0gKHdzKSA9PiB7CgkgICAgICAgICAgICAgICAgbGV0IHN0cmluZ3MgPSB3cz8gd3MudG9TdHJpbmdzKCkgOiBbXTsKCSAgICAgICAgICAgICAgICBpZiAoc3RyaW5ncy5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJywKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBzdHJpbmdzWzBdCgkgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTXVsdGlMaW5lU3RyaW5nJywKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBzdHJpbmdzCgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgICAgICAgICB9OwoKCSAgICAgICAgICAgIGNvbnN0IGNvbnN0cnVjdFBvbHlnb25HZW9tZXRyeSA9IChvd3MsIGl3cykgPT4gewoJICAgICAgICAgICAgICAgIGxldCBvdXRlclJpbmdzID0gb3dzPyBvd3MudG9SaW5ncygnY291bnRlcmNsb2Nrd2lzZScpIDogW10sCgkgICAgICAgICAgICAgICAgICAgIGlubmVyUmluZ3MgPSBpd3M/IGl3cy50b1JpbmdzKCdjbG9ja3dpc2UnKSA6IFtdOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKCSAgICAgICAgICAgICAgICBpZiAob3V0ZXJSaW5ncy5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICAgICAgICAgIGxldCBjb21wb3NpdFBvbHlvbnMgPSBbXTsKCgkgICAgICAgICAgICAgICAgICAgIGxldCByaW5nID0gbnVsbDsKCSAgICAgICAgICAgICAgICAgICAgZm9yIChyaW5nIG9mIG91dGVyUmluZ3MpCgkgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdFBvbHlvbnMucHVzaChbcmluZ10pOwoJICAgICAgICAgICAgICAgICAgICAKCSAgICAgICAgICAgICAgICAgICAgLy8gbGluayBpbm5lciBwb2x5Z29ucyB0byBvdXRlciBjb250YWluZXJzCgkgICAgICAgICAgICAgICAgICAgIHdoaWxlIChyaW5nID0gaW5uZXJSaW5ncy5zaGlmdCgpKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpZHggaW4gb3V0ZXJSaW5ncykgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwdEluc2lkZVBvbHlnb24oZmlyc3QocmluZyksIG91dGVyUmluZ3NbaWR4XSkpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRQb2x5b25zW2lkeF0ucHVzaChyaW5nKTsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgICAgICAvLyBjb25zdHJ1Y3QgdGhlIFBvbHlnb24vTXVsdGlQb2x5Z29uIGdlb21ldHJ5CgkgICAgICAgICAgICAgICAgICAgIGlmIChjb21wb3NpdFBvbHlvbnMubGVuZ3RoID09PSAxKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2x5Z29uJywKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogY29tcG9zaXRQb2x5b25zWzBdCgkgICAgICAgICAgICAgICAgICAgICAgICB9OwoJICAgICAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgICAgICByZXR1cm4gewoJICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ011bHRpUG9seWdvbicsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogY29tcG9zaXRQb2x5b25zCgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIHJldHVybiBudWxsOwoJICAgICAgICAgICAgfTsKCgkgICAgICAgICAgICBsZXQgcG9seWdvbkZlYXR1cmVzID0gW10sIHN0cmluZ0ZlYXR1cmVzID0gW10sIHBvaW50RmVhdHVyZXMgPSBbXTsKCSAgICAgICAgICAgIGNvbnN0IHdheXNGaWVsZE5hbWVzID0gWydvdXRlcicsICdpbm5lcicsICcnXTsKCSAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gY29tYmluYXRpb24gd2hlbiB0aGVyZSdyZSBuZXN0ZWQgcmVsYXRpb25zCgkgICAgICAgICAgICBmb3IgKGxldCByZWxhdGlvbiBvZiB0aGlzLnJlbGF0aW9ucykgewoJICAgICAgICAgICAgICAgIGlmIChyZWxhdGlvbikgewoJICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2Ygd2F5c0ZpZWxkTmFtZXMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3YXlzID0gcmVsYXRpb25bZmllbGROYW1lXTsKCSAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3YXlzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoaXNXYXlzID0gdGhpc1tmaWVsZE5hbWVdOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzV2F5cykgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXS5zcGxpY2UuYXBwbHkodGhpc1dheXMsIFt0aGlzV2F5cy5sZW5ndGgsIDBdLmNvbmNhdCh3YXlzKSk7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1tmaWVsZE5hbWVdID0gd2F5czsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgoJICAgICAgICAgICAgZm9yIChsZXQgZmllbGROYW1lIG9mIHdheXNGaWVsZE5hbWVzKSB7CgkgICAgICAgICAgICAgICAgbGV0IHdheXMgPSB0aGlzW2ZpZWxkTmFtZV07CgkgICAgICAgICAgICAgICAgaWYgKHdheXMpIHsKCSAgICAgICAgICAgICAgICAgICAgdGhpc1tmaWVsZE5hbWVdID0gbmV3IFdheUNvbGxlY3Rpb24oKTsKCSAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgd2F5IG9mIHdheXMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbZmllbGROYW1lXS5hZGRXYXkod2F5KTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCgkgICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBudWxsOwoJICAgICAgICAgICAgCgkgICAgICAgICAgICBsZXQgZmVhdHVyZSA9IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgICAgICAgICAgaWQ6IHRoaXMuZ2V0Q29tcG9zaXRlSWQoKSwKCSAgICAgICAgICAgICAgICBiYm94OiB0aGlzLmJvdW5kcywKCSAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0aGlzLmdldFByb3BzKCkKCSAgICAgICAgICAgIH07CgoJICAgICAgICAgICAgaWYgKCF0aGlzLmJvdW5kcykgewoJICAgICAgICAgICAgICAgIGRlbGV0ZSBmZWF0dXJlLmJib3g7CgkgICAgICAgICAgICB9CgoJICAgICAgICAgICAgaWYgKHRoaXMub3V0ZXIpIHsKCSAgICAgICAgICAgICAgICBnZW9tZXRyeSA9IGNvbnN0cnVjdFBvbHlnb25HZW9tZXRyeSh0aGlzLm91dGVyLCB0aGlzLmlubmVyKTsKCSAgICAgICAgICAgICAgICBpZiAoZ2VvbWV0cnkpIHsKCSAgICAgICAgICAgICAgICAgICAgZmVhdHVyZS5nZW9tZXRyeSA9IGdlb21ldHJ5OwoJICAgICAgICAgICAgICAgICAgICBwb2x5Z29uRmVhdHVyZXMucHVzaChmZWF0dXJlKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBlbHNlIGlmICh0aGlzWycnXSkgewoJICAgICAgICAgICAgICAgIGdlb21ldHJ5ID0gY29uc3RydWN0U3RyaW5nR2VvbWV0cnkodGhpc1snJ10pOwoJICAgICAgICAgICAgICAgIGlmIChnZW9tZXRyeSkgewoJICAgICAgICAgICAgICAgICAgICBmZWF0dXJlLmdlb21ldHJ5ID0gZ2VvbWV0cnk7CgkgICAgICAgICAgICAgICAgICAgIHN0cmluZ0ZlYXR1cmVzLnB1c2goZmVhdHVyZSk7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoKCSAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlcykgewoJICAgICAgICAgICAgICAgIHBvaW50RmVhdHVyZXMgPSBwb2ludEZlYXR1cmVzLmNvbmNhdChub2RlLnRvRmVhdHVyZUFycmF5KCkpOwoJICAgICAgICAgICAgfQoKCSAgICAgICAgICAgIHJldHVybiBwb2x5Z29uRmVhdHVyZXMuY29uY2F0KHN0cmluZ0ZlYXR1cmVzKS5jb25jYXQocG9pbnRGZWF0dXJlcyk7CgkgICAgICAgIH0KCSAgICB9CgoJICAgIHJldHVybiB7Tm9kZSwgV2F5LCBSZWxhdGlvbn07IAoJfSkoKTsKCgl2YXIgeG1scGFyc2VyID0gKCgpID0+IHsKCSAgICAKCSAgICBmdW5jdGlvbiBjb25kaXRpb25lZChldnQpIHsKCSAgICAgICAgcmV0dXJuIGV2dC5tYXRjaCgvXiguKz8pXFsoLis/KVxdPiQvZykgIT0gbnVsbDsKCSAgICB9CgoJICAgIGZ1bmN0aW9uIHBhcnNlRXZlbnQoZXZ0KSB7CgkgICAgICAgIGxldCBtYXRjaCA9IC9eKC4rPylcWyguKz8pXF0+JC9nLmV4ZWMoZXZ0KTsKCSAgICAgICAgaWYgKG1hdGNoKSB7CgkgICAgICAgICAgICByZXR1cm4ge2V2dDogbWF0Y2hbMV0gKyAnPicsIGV4cDogbWF0Y2hbMl19OwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiB7ZXZ0OiBldnR9OwoJICAgIH0KCgkgICAgZnVuY3Rpb24gZ2VuQ29uZGl0aW9uRnVuYyhjb25kKSB7CgkgICAgICAgIGxldCBib2R5ID0gJ3JldHVybiAnICsgY29uZC5yZXBsYWNlKC8oXCQuKz8pKD89Wz0hLl0pL2csICdub2RlLiQmJykgKyAnOyc7CgkgICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ25vZGUnLCBib2R5KTsKCSAgICB9CgoJICAgIHJldHVybiBjbGFzcyB7CgkgICAgICAgIGNvbnN0cnVjdG9yKG9wdHMpIHsKCSAgICAgICAgICAgIGlmIChvcHRzKSB7CgkgICAgICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmVudCA9IG9wdHMucXVlcnlQYXJlbnQ/IHRydWUgOiBmYWxzZTsKCSAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzaXZlID0gb3B0cy5wcm9ncmVzc2l2ZTsKCSAgICAgICAgICAgICAgICBpZiAodGhpcy5xdWVyeVBhcmVudCkgewoJICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudE1hcCA9IG5ldyBXZWFrTWFwKCk7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgdGhpcy5ldnRMaXN0ZW5lcnMgPSB7fTsKCSAgICAgICAgfQoKCSAgICAgICAgcGFyc2UoeG1sLCBwYXJlbnQsIGRpcikgewoJICAgICAgICAgICAgZGlyID0gZGlyPyBkaXIgKyAnLicgOiAnJzsKCSAgICAgICAgICAgIGxldCBub2RlUmVnRXggPSAvPChbXiA+XC9dKykoLio/KT4vbWcsIG5vZGVNYXRjaCA9IG51bGwsIG5vZGVzID0gW107CgkgICAgICAgICAgICB3aGlsZSAobm9kZU1hdGNoID0gbm9kZVJlZ0V4LmV4ZWMoeG1sKSkgewoJICAgICAgICAgICAgICAgIGxldCB0YWcgPSBub2RlTWF0Y2hbMV0sIG5vZGUgPSB7JHRhZzogdGFnfSwgZnVsbFRhZyA9IGRpciArIHRhZzsgCgoJICAgICAgICAgICAgICAgIGxldCBhdHRyVGV4dCA9IG5vZGVNYXRjaFsyXS50cmltKCksIGNsb3NlZCA9IGZhbHNlOwoJICAgICAgICAgICAgICAgIGlmIChhdHRyVGV4dC5lbmRzV2l0aCgnLycpIHx8IHRhZy5zdGFydHNXaXRoKCc/JykgfHwgdGFnLnN0YXJ0c1dpdGgoJyEnKSkgewoJICAgICAgICAgICAgICAgICAgICBjbG9zZWQgPSB0cnVlOwoJICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgbGV0IGF0dFJlZ0V4MSA9IC8oW14gXSs/KT0iKC4rPykiL2csIGF0dFJlZ0V4MiA9IC8oW14gXSs/KT0nKC4rPyknL2c7CgkgICAgICAgICAgICAgICAgbGV0IGF0dE1hdGNoID0gbnVsbCwgaGFzQXR0cnMgPSBmYWxzZTsKCSAgICAgICAgICAgICAgICB3aGlsZSAoYXR0TWF0Y2ggPSBhdHRSZWdFeDEuZXhlYyhhdHRyVGV4dCkpIHsKCSAgICAgICAgICAgICAgICAgICAgaGFzQXR0cnMgPSB0cnVlOwoJICAgICAgICAgICAgICAgICAgICBub2RlW2F0dE1hdGNoWzFdXSA9IGF0dE1hdGNoWzJdOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBpZiAoIWhhc0F0dHJzKQoJICAgICAgICAgICAgICAgICAgICB3aGlsZSAoYXR0TWF0Y2ggPSBhdHRSZWdFeDIuZXhlYyhhdHRyVGV4dCkpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGhhc0F0dHJzID0gdHJ1ZTsKCSAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVbYXR0TWF0Y2hbMV1dID0gYXR0TWF0Y2hbMl07CgkgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgaWYgKCFoYXNBdHRycyAmJiBhdHRyVGV4dCAhPT0gJycpIHsKCSAgICAgICAgICAgICAgICAgICAgbm9kZS50ZXh0ID0gYXR0clRleHQ7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb2dyZXNzaXZlKSB7CgkgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChgPCR7ZnVsbFRhZ30+YCwgbm9kZSwgcGFyZW50KTsKCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSB7CgkgICAgICAgICAgICAgICAgICAgIGxldCBpbm5lclJlZ0V4ID0gbmV3IFJlZ0V4cChgKFteXSs/KTxcLyR7dGFnfT5gLCAnZycpOwoJICAgICAgICAgICAgICAgICAgICBpbm5lclJlZ0V4Lmxhc3RJbmRleCA9IG5vZGVSZWdFeC5sYXN0SW5kZXg7CgkgICAgICAgICAgICAgICAgICAgIGxldCBpbm5lck1hdGNoID0gaW5uZXJSZWdFeC5leGVjKHhtbCk7CgkgICAgICAgICAgICAgICAgICAgIGlmIChpbm5lck1hdGNoICYmIGlubmVyTWF0Y2hbMV0pIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVSZWdFeC5sYXN0SW5kZXggPSBpbm5lclJlZ0V4Lmxhc3RJbmRleDsKCSAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbm5lck5vZGVzID0gdGhpcy5wYXJzZShpbm5lck1hdGNoWzFdLCBub2RlLCBmdWxsVGFnKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbm5lck5vZGVzLmxlbmd0aCA+IDApIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLiRpbm5lck5vZGVzID0gaW5uZXJOb2RlczsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS4kaW5uZXJUZXh0ID0gaW5uZXJNYXRjaFsxXTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBpZiAodGhpcy5xdWVyeVBhcmVudCAmJiBwYXJlbnQpIHsKCSAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRNYXAuc2V0KG5vZGUsIHBhcmVudCk7CgkgICAgICAgICAgICAgICAgfQoKCSAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9ncmVzc2l2ZSkgewoJICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoYDwvJHtmdWxsVGFnfT5gLCBub2RlLCBwYXJlbnQpOwoJICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTsKCSAgICAgICAgICAgIH0KCgkgICAgICAgICAgICByZXR1cm4gbm9kZXM7CgkgICAgICAgIH0KCgkgICAgICAgIGdldFBhcmVudChub2RlKSB7CgkgICAgICAgICAgICBpZiAodGhpcy5xdWVyeVBhcmVudCkgewoJICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudE1hcC5nZXQobm9kZSk7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICByZXR1cm4gbnVsbDsKCSAgICAgICAgfQoKCSAgICAgICAgJGFkZExpc3RlbmVyKGV2dCwgZnVuYykgewoJICAgICAgICAgICAgbGV0IGZ1bmNzID0gdGhpcy5ldnRMaXN0ZW5lcnNbZXZ0XTsKCSAgICAgICAgICAgIGlmIChmdW5jcykgewoJICAgICAgICAgICAgICAgIGZ1bmNzLnB1c2goZnVuYyk7CgkgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgIHRoaXMuZXZ0TGlzdGVuZXJzW2V2dF0gPSBbZnVuY107CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCgkgICAgICAgIC8vIHN1cHBvcnQgamF2YXNjcmlwdCBjb25kaXRpb24gZm9yIHRoZSBsYXN0IHRhZwoJICAgICAgICBhZGRMaXN0ZW5lcihldnQsIGZ1bmMpIHsKCSAgICAgICAgICAgIGlmIChjb25kaXRpb25lZChldnQpKSB7CgkgICAgICAgICAgICAgICAgLy8gZnVuYy5wcm90b3R5cGUgPSBldnQ7CgkgICAgICAgICAgICAgICAgZXZ0ID0gcGFyc2VFdmVudChldnQpOyAgICAKCSAgICAgICAgICAgICAgICBmdW5jLmNvbmRpdGlvbiA9IGdlbkNvbmRpdGlvbkZ1bmMoZXZ0LmV4cCk7CgkgICAgICAgICAgICAgICAgZXZ0ID0gZXZ0LmV2dDsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIHRoaXMuJGFkZExpc3RlbmVyKGV2dCwgZnVuYyk7CgkgICAgICAgIH0KCgkgICAgICAgICRyZW1vdmVMaXN0ZW5lcihldnQsIGZ1bmMpIHsKCSAgICAgICAgICAgIGxldCBmdW5jcyA9IHRoaXMuZXZ0TGlzdGVuZXJzW2V2dF07CgkgICAgICAgICAgICBsZXQgaWR4ID0gbnVsbDsKCSAgICAgICAgICAgIGlmIChmdW5jcyAmJiAoaWR4ID0gZnVuY3MuaW5kZXhPZihmdW5jKSkgPj0gMCkgewoJICAgICAgICAgICAgICAgIGZ1bmNzLnNwbGljZShpZHgsIDEpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgoJICAgICAgICByZW1vdmVMaXN0ZW5lcihldnQsIGZ1bmMpIHsKCSAgICAgICAgICAgIGlmIChjb25kaXRpb25lZChldnQpKSB7CgkgICAgICAgICAgICAgICAgZXZ0ID0gcGFyc2VFdmVudChldnQpOyAgICAKCSAgICAgICAgICAgICAgICBldnQgPSBldnQuZXZ0OwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgdGhpcy4kcmVtb3ZlTGlzdGVuZXIoZXZ0LCBmdW5jKTsKCSAgICAgICAgfQoKCSAgICAgICAgZW1pdChldnQsIC4uLmFyZ3MpIHsKCSAgICAgICAgICAgIGxldCBmdW5jcyA9IHRoaXMuZXZ0TGlzdGVuZXJzW2V2dF07CgkgICAgICAgICAgICBpZiAoZnVuY3MpIHsKCSAgICAgICAgICAgICAgICBmb3IgKGxldCBmdW5jIG9mIGZ1bmNzKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChmdW5jLmNvbmRpdGlvbikgewoJICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bmMuY29uZGl0aW9uLmFwcGx5KG51bGwsIGFyZ3MpID09PSB0cnVlKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYy5hcHBseShudWxsLCBhcmdzKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCgkgICAgICAgIG9uKGV2dCwgZnVuYykgewoJICAgICAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihldnQsIGZ1bmMpOwoJICAgICAgICB9CgoJICAgICAgICBvZmYoZXZ0LCBmdW5jKSB7CgkgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2dCwgZnVuYyk7CgkgICAgICAgIH0KCSAgICB9OwoJfSkoKTsKCgljb25zdCB7Tm9kZSwgV2F5LCBSZWxhdGlvbn0gPSBvc21vYmpzLAoJICAgIHtwdXJnZVByb3BzLCBSZWZFbGVtZW50c30gPSB1dGlscywKCSAgICBYbWxQYXJzZXIgPSB4bWxwYXJzZXI7CgoJdmFyIGxpYiA9IChvc20sIG9wdHMpID0+IHsKCSAgICBsZXQgY29tcGxldGVGZWF0dXJlID0gZmFsc2UsIHJlbmRlclRhZ2dlZCA9IGZhbHNlLCBleGNsdWRlV2F5ID0gdHJ1ZTsKCgkgICAgY29uc3QgcGFyc2VPcHRzID0gb3B0cyA9PiB7CgkgICAgICAgIGlmIChvcHRzKSB7CgkgICAgICAgICAgICBjb21wbGV0ZUZlYXR1cmUgPSBvcHRzLmNvbXBsZXRlRmVhdHVyZSB8fCBvcHRzLmFsbEZlYXR1cmVzPyB0cnVlIDogZmFsc2U7CgkgICAgICAgICAgICByZW5kZXJUYWdnZWQgPSBvcHRzLnJlbmRlclRhZ2dlZD8gdHJ1ZSA6IGZhbHNlOwoJICAgICAgICAgICAgbGV0IHdheU9wdCA9IG9wdHMuc3VwcHJlc3NXYXkgfHwgb3B0cy5leGNsdWRlV2F5OwoJICAgICAgICAgICAgaWYgKHdheU9wdCAhPT0gdW5kZWZpbmVkICYmICF3YXlPcHQpIHsKCSAgICAgICAgICAgICAgICBleGNsdWRlV2F5ID0gZmFsc2U7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9OwoKCSAgICBwYXJzZU9wdHMob3B0cyk7CgoJICAgIGNvbnN0IGRldGVjdEZvcm1hdCA9IG9zbSA9PiB7CgkgICAgICAgIGlmIChvc20uZWxlbWVudHMpIHsKCSAgICAgICAgICAgIHJldHVybiAnanNvbic7CgkgICAgICAgIH0KCSAgICAgICAgaWYgKG9zbS5pbmRleE9mKCc8b3NtJykgPj0gMCkgewoJICAgICAgICAgICAgcmV0dXJuICd4bWwnOwoJICAgICAgICB9CgkgICAgICAgIGlmIChvc20udHJpbSgpLnN0YXJ0c1dpdGgoJ3snKSkgewoJICAgICAgICAgICAgcmV0dXJuICdqc29uLXJhdyc7CgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuICdpbnZhbGlkJzsKCSAgICB9OwoKCSAgICBsZXQgZm9ybWF0ID0gZGV0ZWN0Rm9ybWF0KG9zbSk7CgoJICAgIGxldCByZWZFbGVtZW50cyA9IG5ldyBSZWZFbGVtZW50cygpLCBmZWF0dXJlQXJyYXkgPSBbXTsKCgkgICAgY29uc3QgYW5hbHl6ZUZlYXR1cmVzRnJvbUpzb24gPSBvc20gPT4gewoJICAgICAgICBmb3IgKGxldCBlbGVtIG9mIG9zbS5lbGVtZW50cykgewoJICAgICAgICAgICAgc3dpdGNoKGVsZW0udHlwZSkgewoJICAgICAgICAgICAgICAgIGNhc2UgJ25vZGUnOgoJICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG5ldyBOb2RlKGVsZW0uaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0udGFncykgewoJICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5hZGRUYWdzKGVsZW0udGFncyk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgbm9kZS5hZGRQcm9wcyhwdXJnZVByb3BzKGVsZW0sIFsnaWQnLCAndHlwZScsICd0YWdzJywgJ2xhdCcsICdsb24nXSkpOwoJICAgICAgICAgICAgICAgICAgICBub2RlLnNldExhdExuZyhlbGVtKTsKCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgoJICAgICAgICAgICAgICAgIGNhc2UgJ3dheSc6CgkgICAgICAgICAgICAgICAgICAgIGxldCB3YXkgPSBuZXcgV2F5KGVsZW0uaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0udGFncykgewoJICAgICAgICAgICAgICAgICAgICAgICAgd2F5LmFkZFRhZ3MoZWxlbS50YWdzKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICB3YXkuYWRkUHJvcHMocHVyZ2VQcm9wcyhlbGVtLCBbJ2lkJywgJ3R5cGUnLCAndGFncycsICdub2RlcycsICdnZW9tZXRyeSddKSk7CgkgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtLm5vZGVzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBuIG9mIGVsZW0ubm9kZXMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXkuYWRkTm9kZVJlZihuKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtLmdlb21ldHJ5KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXkuc2V0TGF0TG5nQXJyYXkoZWxlbS5nZW9tZXRyeSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgoJICAgICAgICAgICAgICAgIGNhc2UgJ3JlbGF0aW9uJzoKCSAgICAgICAgICAgICAgICAgICAgbGV0IHJlbGF0aW9uID0gbmV3IFJlbGF0aW9uKGVsZW0uaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbS5ib3VuZHMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLnNldEJvdW5kcyhbcGFyc2VGbG9hdChlbGVtLmJvdW5kcy5taW5sb24pLCBwYXJzZUZsb2F0KGVsZW0uYm91bmRzLm1pbmxhdCksIHBhcnNlRmxvYXQoZWxlbS5ib3VuZHMubWF4bG9uKSwgcGFyc2VGbG9hdChlbGVtLmJvdW5kcy5tYXhsYXQpXSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0udGFncykgewoJICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkVGFncyhlbGVtLnRhZ3MpOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZFByb3BzKHB1cmdlUHJvcHMoZWxlbSwgWydpZCcsICd0eXBlJywgJ3RhZ3MnLCAnYm91bmRzJywgJ21lbWJlcnMnXSkpOwoJICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbS5tZW1iZXJzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtZW1iZXIgb2YgZWxlbS5tZW1iZXJzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb24uYWRkTWVtYmVyKG1lbWJlcik7CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9OwoKCSAgICBjb25zdCBhbmFseXplRmVhdHVyZXNGcm9tWG1sID0gb3NtID0+IHsKCSAgICAgICAgY29uc3QgeG1sUGFyc2VyID0gbmV3IFhtbFBhcnNlcih7cHJvZ3Jlc3NpdmU6IHRydWV9KTsKCgkgICAgICAgIHhtbFBhcnNlci5vbignPC9vc20ubm9kZT4nLCBub2RlID0+IHsKCSAgICAgICAgICAgIGxldCBuZCA9IG5ldyBOb2RlKG5vZGUuaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhub2RlKSkKCSAgICAgICAgICAgICAgICBpZiAoIWsuc3RhcnRzV2l0aCgnJCcpICYmIFsnaWQnLCAnbG9uJywgJ2xhdCddLmluZGV4T2YoaykgPCAwKSB7CgkgICAgICAgICAgICAgICAgICAgIG5kLmFkZFByb3Aoaywgdik7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgbmQuc2V0TGF0TG5nKG5vZGUpOwoJICAgICAgICAgICAgaWYgKG5vZGUuJGlubmVyTm9kZXMpIHsKCSAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmQgb2Ygbm9kZS4kaW5uZXJOb2RlcykgewoJICAgICAgICAgICAgICAgICAgICBpZihpbmQuJHRhZyA9PT0gJ3RhZycpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIG5kLmFkZFRhZyhpbmQuaywgaW5kLnYpOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICB9KTsKCgkgICAgICAgIHhtbFBhcnNlci5vbignPC9vc20ud2F5PicsIG5vZGUgPT4gewoJICAgICAgICAgICAgbGV0IHdheSA9IG5ldyBXYXkobm9kZS5pZCwgcmVmRWxlbWVudHMpOwoJICAgICAgICAgICAgZm9yIChsZXQgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKG5vZGUpKSB7CgkgICAgICAgICAgICAgICAgaWYgKCFrLnN0YXJ0c1dpdGgoJyQnKSAmJiBbJ2lkJ10uaW5kZXhPZihrKSA8IDApIHsKCSAgICAgICAgICAgICAgICAgICAgd2F5LmFkZFByb3Aoaywgdik7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgaWYgKG5vZGUuJGlubmVyTm9kZXMpIHsKCSAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmQgb2Ygbm9kZS4kaW5uZXJOb2RlcykgewoJICAgICAgICAgICAgICAgICAgICBpZiAoaW5kLiR0YWcgPT09ICduZCcpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmQubG9uICYmIGluZC5sYXQpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXkuYWRkTGF0TG5nKGluZCk7CgkgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGluZC5yZWYpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXkuYWRkTm9kZVJlZihpbmQucmVmKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmQuJHRhZyA9PT0gJ3RhZycpCgkgICAgICAgICAgICAgICAgICAgICAgICB3YXkuYWRkVGFnKGluZC5rLCBpbmQudik7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICB9KTsKCgkgICAgICAgIHhtbFBhcnNlci5vbignPG9zbS5yZWxhdGlvbj4nLCBub2RlID0+IHsKCSAgICAgICAgICAgIG5ldyBSZWxhdGlvbihub2RlLmlkLCByZWZFbGVtZW50cyk7CgkgICAgICAgIH0pOwoKCSAgICAgICAgeG1sUGFyc2VyLm9uKCc8L29zbS5yZWxhdGlvbi5tZW1iZXI+JywgKG5vZGUsIHBhcmVudCkgPT4gewoJICAgICAgICAgICAgbGV0IHJlbGF0aW9uID0gcmVmRWxlbWVudHMuZ2V0KGByZWxhdGlvbi8ke3BhcmVudC5pZH1gKTsKCSAgICAgICAgICAgIGxldCBtZW1iZXIgPSB7CgkgICAgICAgICAgICAgICAgdHlwZTogbm9kZS50eXBlLAoJICAgICAgICAgICAgICAgIHJvbGU6IG5vZGUucm9sZT8gbm9kZS5yb2xlIDogJycsCgkgICAgICAgICAgICAgICAgcmVmOiBub2RlLnJlZgoJICAgICAgICAgICAgfTsKCSAgICAgICAgICAgIGlmIChub2RlLmxhdCAmJiBub2RlLmxvbikgewoJICAgICAgICAgICAgICAgIG1lbWJlci5sYXQgPSBub2RlLmxhdCwgbWVtYmVyLmxvbiA9IG5vZGUubG9uLCBtZW1iZXIudGFncyA9IHt9OwoJICAgICAgICAgICAgICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhub2RlKSkgewoJICAgICAgICAgICAgICAgICAgICBpZiAoIWsuc3RhcnRzV2l0aCgnJCcpICYmIFsndHlwZScsICdsYXQnLCAnbG9uJ10uaW5kZXhPZihrKSA8IDApIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcltrXSA9IHY7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBpZiAobm9kZS4kaW5uZXJOb2RlcykgewoJICAgICAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IFtdOwoJICAgICAgICAgICAgICAgIGxldCBub2RlcyA9IFtdOwoJICAgICAgICAgICAgICAgIGZvciAobGV0IGluZCBvZiBub2RlLiRpbm5lck5vZGVzKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChpbmQubGF0ICYmIGluZC5sb24pIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LnB1c2goaW5kKTsKCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goaW5kLnJlZik7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgaWYgKGdlb21ldHJ5Lmxlbmd0aCA+IDApIHsKCSAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmdlb21ldHJ5ID0gZ2VvbWV0cnk7CgkgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2Rlcy5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICAgICAgICAgIG1lbWJlci5ub2RlcyA9IG5vZGVzOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIHJlbGF0aW9uLmFkZE1lbWJlcihtZW1iZXIpOwoJICAgICAgICB9KTsKCgkgICAgICAgIHhtbFBhcnNlci5vbignPC9vc20ucmVsYXRpb24uYm91bmRzPicsIChub2RlLCBwYXJlbnQpID0+IHsKCSAgICAgICAgICAgIHJlZkVsZW1lbnRzLmdldChgcmVsYXRpb24vJHtwYXJlbnQuaWR9YCkuc2V0Qm91bmRzKFtwYXJzZUZsb2F0KG5vZGUubWlubG9uKSwgcGFyc2VGbG9hdChub2RlLm1pbmxhdCksIHBhcnNlRmxvYXQobm9kZS5tYXhsb24pLCBwYXJzZUZsb2F0KG5vZGUubWF4bGF0KV0pOwoJICAgICAgICB9KTsKCgkgICAgICAgIHhtbFBhcnNlci5vbignPC9vc20ucmVsYXRpb24udGFnPicsIChub2RlLCBwYXJlbnQpID0+IHsKCSAgICAgICAgICAgIHJlZkVsZW1lbnRzLmdldChgcmVsYXRpb24vJHtwYXJlbnQuaWR9YCkuYWRkVGFnKG5vZGUuaywgbm9kZS52KTsKCSAgICAgICAgfSk7CgkgICAgICAgIAoJICAgICAgICB4bWxQYXJzZXIucGFyc2Uob3NtKTsKCSAgICB9OwoKCSAgICBpZiAoZm9ybWF0ID09PSAnanNvbi1yYXcnKSB7CgkgICAgICAgIG9zbSA9IEpTT04ucGFyc2Uob3NtKTsKCSAgICAgICAgaWYgKG9zbS5lbGVtZW50cykgewoJICAgICAgICAgICAgZm9ybWF0ID0gJ2pzb24nOwoJICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgZm9ybWF0ID0gJ2ludmFsaWQnOwoJICAgICAgICB9CgkgICAgfQoKCSAgICBpZiAoZm9ybWF0ID09PSAnanNvbicpIHsKCSAgICAgICAgYW5hbHl6ZUZlYXR1cmVzRnJvbUpzb24ob3NtKTsKCSAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gJ3htbCcpIHsKCSAgICAgICAgYW5hbHl6ZUZlYXR1cmVzRnJvbVhtbChvc20pOwoJICAgIH0KCgkgICAgcmVmRWxlbWVudHMuYmluZEFsbCgpOwoKCSAgICBmb3IgKGxldCB2IG9mIHJlZkVsZW1lbnRzLnZhbHVlcygpKSB7CgkgICAgICAgIGlmICh2LnJlZkNvdW50IDw9IDAgfHwgKHYuaGFzVGFnICYmIHJlbmRlclRhZ2dlZCAmJiAhKHYgaW5zdGFuY2VvZiBXYXkgJiYgZXhjbHVkZVdheSkpKSB7CgkgICAgICAgICAgICBsZXQgZmVhdHVyZXMgPSB2LnRvRmVhdHVyZUFycmF5KCk7CgkgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGZpcnN0IGdlb21ldHJ5IG9mIHRoZSBmaXJzdCByZWxhdGlvbiBlbGVtZW50CgkgICAgICAgICAgICBpZiAodiBpbnN0YW5jZW9mIFJlbGF0aW9uICYmICFjb21wbGV0ZUZlYXR1cmUgJiYgZmVhdHVyZXMubGVuZ3RoID4gMCkgewoJICAgICAgICAgICAgICAgIHJldHVybiBmZWF0dXJlc1swXS5nZW9tZXRyeTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGZlYXR1cmVBcnJheSA9IGZlYXR1cmVBcnJheS5jb25jYXQoZmVhdHVyZXMpOwoJICAgICAgICB9CgkgICAgfQoKCSAgICByZXR1cm4ge3R5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBmZWF0dXJlQXJyYXl9OwoJfTsKCgl2YXIgb3NtMmdlb2pzb24gPSAvKkBfX1BVUkVfXyovZ2V0RGVmYXVsdEV4cG9ydEZyb21DanMobGliKTsKCgljbGFzcyBDb252ZXJ0ZXIgewoJICAgIGNvbnN0cnVjdG9yKGZvcm1hdCwgZGF0YSkgewoJICAgICAgICAvKioKCSAgICAgICAgICogQ3JlYXRlcyBhIGJsYW5rIEdlb0pTT04gZmVhdHVyZSBjb2xsZWN0aW9uLgoJICAgICAgICAgKiBAcmV0dXJucyBBIG5ldyBHZW9KU09OIGZlYXR1cmUgY29sbGVjdGlvbiB3aXRoIG5vIGZlYXR1cmVzLgoJICAgICAgICAgKi8KCSAgICAgICAgdGhpcy5ibGFua0dlb0pTT04gPSAoKSA9PiAoewoJICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywKCSAgICAgICAgICAgIGZlYXR1cmVzOiBbXSwKCSAgICAgICAgfSk7CgkgICAgICAgIHRoaXMuX3Jhd0RhdGEgPSBkYXRhOwoJICAgICAgICB0aGlzLl9mb3JtYXQgPSBmb3JtYXQ7CgkgICAgICAgIGNvbnN0IGNvbnZlcnRlcnMgPSB7CgkgICAgICAgICAgICAndG9wb2pzb24nOiB0aGlzLmxvYWRUb3BvSnNvbiwKCSAgICAgICAgICAgICdvc20nOiB0aGlzLmxvYWRPc20sCgkgICAgICAgICAgICAna21sJzogdGhpcy5sb2FkWG1sLAoJICAgICAgICAgICAgJ2dweCc6IHRoaXMubG9hZFhtbCwKCSAgICAgICAgICAgICd0Y3gnOiB0aGlzLmxvYWRYbWwsCgkgICAgICAgICAgICAnY3N2JzogdGhpcy5sb2FkQ3N2LAoJICAgICAgICAgICAgJ3Rzdic6IHRoaXMubG9hZENzdgoJICAgICAgICB9OwoJICAgICAgICB0aGlzLl9jb252ZXJzaW9uRm4gPSBjb252ZXJ0ZXJzW2Zvcm1hdF07CgkgICAgfQoJICAgIGFzeW5jIGNvbnZlcnQoKSB7CgkgICAgICAgIGlmICghdGhpcy5fY29udmVyc2lvbkZuKSB7CgkgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKF8sIHJlaikgPT4gcmVqKGBObyBjb252ZXJ0ZXIgZXhpc3RzIGZvciAke3RoaXMuX2Zvcm1hdH1gKSk7CgkgICAgICAgIH0KCSAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udmVyc2lvbkZuKCk7CgkgICAgICAgIH0KCSAgICB9CgkgICAgLyoqCgkgICAgICogTG9hZCB0aGUgWE1MIGRhdGEgYXMgR2VvSlNPTgoJICAgICAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uCgkgICAgICovCgkgICAgYXN5bmMgbG9hZFhtbCgpIHsKCSAgICAgICAgLy8gVXNlIHRoZSBhcHByb3ByaWF0ZSBwYXJzZXIgYmFzZWQgb24gdGhlIGZvcm1hdAoJICAgICAgICBjb25zdCBnZW9qc29uID0gdG9HZW9Kc29uW3RoaXMuX2Zvcm1hdF0obmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyh0aGlzLl9yYXdEYXRhLCAidGV4dC94bWwiKSk7CgkgICAgICAgIHJldHVybiBnZW9qc29uOwoJICAgIH0KCSAgICAvKioKCSAgICAgKiBMb2FkcyBhbmQgcGFyc2VzIENTViBkYXRhIGludG8gYSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uLgoJICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIEdlb0pTT04gRmVhdHVyZUNvbGxlY3Rpb24uCgkgICAgICovCgkgICAgYXN5bmMgbG9hZENzdigpIHsKCSAgICAgICAgLy8gRGVmaW5lIG9wdGlvbnMgZm9yIHRoZSBjc3YyZ2VvanNvbiBsaWJyYXJ5CgkgICAgICAgIGxldCBvcHRpb25zID0ge307IC8vIFRPRE8gYWxsb3cgQ1NWIG9wdGlvbnMKCSAgICAgICAgaWYgKHRoaXMuX2Zvcm1hdCA9PT0gJ3RzdicpIHsKCSAgICAgICAgICAgIG9wdGlvbnMuZGVsaW1pdGVyID0gJ1x0JzsKCSAgICAgICAgfQoJICAgICAgICAvLyBVc2UgdGhlIGNzdjJnZW9qc29uIGxpYnJhcnkgdG8gY29udmVydCB0aGUgQ1NWIHRvIEdlb0pTT04KCSAgICAgICAgY29uc3QgZ2VvanNvbiA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsKCSAgICAgICAgICAgIGNzdjJnZW9qc29uXzEuY3N2Mmdlb2pzb24odGhpcy5fcmF3RGF0YSwgb3B0aW9ucywgKGVyciwgZGF0YSkgPT4gewoJICAgICAgICAgICAgICAgIGlmIChlcnIpIHsKCSAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGVsc2UgewoJICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0pOwoJICAgICAgICB9KTsKCSAgICAgICAgcmV0dXJuIGdlb2pzb247CgkgICAgfQoJICAgIC8qKgoJICAgICAqIExvYWRzIFRvcG9KU09OIGRhdGEgYW5kIGNvbnZlcnRzIGl0IGludG8gYSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uCgkgICAgICovCgkgICAgYXN5bmMgbG9hZFRvcG9Kc29uKCkgewoJICAgICAgICBsZXQgdG9wb0pzb25EYXRhID0ge307CgkgICAgICAgIHRyeSB7CgkgICAgICAgICAgICB0b3BvSnNvbkRhdGEgPSBKU09OLnBhcnNlKHRoaXMuX3Jhd0RhdGEpOwoJICAgICAgICB9CgkgICAgICAgIGNhdGNoIChlKSB7CgkgICAgICAgICAgICB0aHJvdyAiSW52YWxpZCBUb3BvSnNvbiI7CgkgICAgICAgIH0KCSAgICAgICAgLy8gQ29udmVydCB0aGUgZGF0YQoJICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5ibGFua0dlb0pTT04oKTsKCSAgICAgICAgaWYgKHRvcG9Kc29uRGF0YS50eXBlID09PSAiVG9wb2xvZ3kiICYmIHRvcG9Kc29uRGF0YS5vYmplY3RzICE9PSB1bmRlZmluZWQpIHsKCSAgICAgICAgICAgIHJlc3VsdCA9IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiRmVhdHVyZUNvbGxlY3Rpb24iLAoJICAgICAgICAgICAgICAgIGZlYXR1cmVzOiByZXN1bHQuZmVhdHVyZXMgPSBPYmplY3Qua2V5cyh0b3BvSnNvbkRhdGEub2JqZWN0cykubWFwKGtleSA9PiB0b3BvanNvbkZlYXR1cmUodG9wb0pzb25EYXRhLCBrZXkpKS5yZWR1Y2UoKGEsIHYpID0+IFsuLi5hLCAuLi52LmZlYXR1cmVzXSwgW10pCgkgICAgICAgICAgICB9OwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiByZXN1bHQ7CgkgICAgfQoJICAgIDsKCSAgICAvKioKCSAgICAgKiBMb2FkcyBPU00gZGF0YSBhbmQgY29udmVydHMgaXQgaW50byBhIEdlb0pTT04gRmVhdHVyZUNvbGxlY3Rpb24KCSAgICAgKi8KCSAgICBhc3luYyBsb2FkT3NtKCkgewoJICAgICAgICByZXR1cm4gb3NtMmdlb2pzb24odGhpcy5fcmF3RGF0YSk7CgkgICAgfQoJfQoKCWNvbnN0IGxpYnJhcmllcyA9IHsKCSAgICAnQ29udmVydGVyJzogQ29udmVydGVyCgl9OwoJbGV0IHN1YkNsYXNzOwoJc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZSA9PiB7CgkgICAgY29uc3QgZGF0YSA9IChlLmRhdGEgfHwgZSk7CgkgICAgY29uc3QgcG9zdCA9IChpZCwgZXJyLCByZXMsIHR5cGUpID0+IHsKCSAgICAgICAgcG9zdE1lc3NhZ2UoewoJICAgICAgICAgICAgdHlwZTogdHlwZSA/IHR5cGUgOiAoZXJyID8gJ2Vycm9yJyA6ICdyZXNwb25zZScpLAoJICAgICAgICAgICAgaWQ6IGlkLAoJICAgICAgICAgICAgbWVzc2FnZTogcmVzLAoJICAgICAgICAgICAgZXJyb3I6IGVycgoJICAgICAgICB9KTsKCSAgICB9OwoJICAgIGNvbnN0IGNvbW1hbmRzID0gewoJICAgICAgICAnaW5pdCc6IChtc2cpID0+IHsKCSAgICAgICAgICAgIGNvbnN0IHsgaWQsIGNvbW1hbmQsIG1lc3NhZ2UgfSA9IG1zZzsKCSAgICAgICAgICAgIHN1YkNsYXNzID0gbmV3IGxpYnJhcmllc1tjb21tYW5kXShtZXNzYWdlWzBdLCBtZXNzYWdlWzFdKTsKCSAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2xhc3MnIG1ldGhvZHMKCSAgICAgICAgICAgIGNvbnN0IGZucyA9IFsKCSAgICAgICAgICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsaWJyYXJpZXNbY29tbWFuZF0ucHJvdG90eXBlKSwKCSAgICAgICAgICAgICAgICAuLi5PYmplY3Qua2V5cyhzdWJDbGFzcykKCSAgICAgICAgICAgIF0ubWFwKGtleSA9PiBba2V5LCB0eXBlb2YgbGlicmFyaWVzW2NvbW1hbmRdLnByb3RvdHlwZVtrZXldXSkKCSAgICAgICAgICAgICAgICAucmVkdWNlKChhLCBjKSA9PiAoeyAuLi5hLCAuLi57IFtjWzBdXTogY1sxXSB9IH0pLCB7fSk7CgkgICAgICAgICAgICBwb3N0KGlkLCB1bmRlZmluZWQsIGZucywgJ2luaXRfcmVzcG9uc2UnKTsKCSAgICAgICAgfSwKCSAgICAgICAgJ2dldCc6IGZ1bmN0aW9uIChtc2cpIHsKCSAgICAgICAgICAgIGNvbnN0IHsgaWQsIGNvbW1hbmQgfSA9IG1zZzsKCSAgICAgICAgICAgIGlmIChzdWJDbGFzcyAmJiBzdWJDbGFzc1tjb21tYW5kXSkgewoJICAgICAgICAgICAgICAgIHBvc3QoaWQsIHVuZGVmaW5lZCwgc3ViQ2xhc3NbY29tbWFuZF0pOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAgICAgcG9zdChpZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9LAoJICAgICAgICAnZXhlYyc6IGZ1bmN0aW9uIChtc2cpIHsKCSAgICAgICAgICAgIGNvbnN0IHsgaWQsIGNvbW1hbmQsIG1lc3NhZ2UgfSA9IG1zZzsKCSAgICAgICAgICAgIGlmIChzdWJDbGFzcyAmJiBzdWJDbGFzc1tjb21tYW5kXSAmJiB0eXBlb2Ygc3ViQ2xhc3NbY29tbWFuZF0gPT09ICdmdW5jdGlvbicpIHsKCSAgICAgICAgICAgICAgICBjb25zdCBjbWQgPSBzdWJDbGFzc1tjb21tYW5kXQoJICAgICAgICAgICAgICAgICAgICAuYXBwbHkoc3ViQ2xhc3MsIG1lc3NhZ2UpOwoJICAgICAgICAgICAgICAgIGlmICghIWNtZCAmJiB0eXBlb2YgY21kLnRoZW4gPT09ICdmdW5jdGlvbicpIHsKCSAgICAgICAgICAgICAgICAgICAgLy8gSXQncyBhIHByb21pc2UsIHNvIHdhaXQgZm9yIGl0CgkgICAgICAgICAgICAgICAgICAgIGNtZAoJICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzID0+IHBvc3QoaWQsIHVuZGVmaW5lZCwgcmVzKSkKCSAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHBvc3QoaWQsIGUpKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBhIHByb21pc2UsIGp1c3QgcmV0dXJuIGl0CgkgICAgICAgICAgICAgICAgICAgIHBvc3QoaWQsIHVuZGVmaW5lZCwgY21kKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICAvLyBFcnJvcgoJICAgICAgICAgICAgICAgIHBvc3QoaWQsIG5ldyBFcnJvcihgY29tbWFuZCAiJHtjb21tYW5kfSIgbm90IGZvdW5kYCkpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfTsKCSAgICBpZiAoY29tbWFuZHNbZGF0YS50eXBlXSkgewoJICAgICAgICBjb21tYW5kc1tkYXRhLnR5cGVdKGRhdGEpOwoJICAgIH0KCX0pOwoKfSkoKTsKCg==', null, false);
/* eslint-enable */

const randomString = () => Math.random().toString(36).substring(2);
class Actor {
    /**
     * Creates a new instance of the `Actor` class.
     * @param subClass - The name of the subclass.
     * @param args - The arguments to pass to the subclass constructor.
     */
    constructor(subClass, args) {
        // Generate a random initialization ID
        this.initId = randomString() + '-' + subClass;
        // Create a new Web Worker and a new Map for handlers
        this.worker = new WorkerFactory();
        this.handlers = new Map();
        // Listen for messages from the worker
        this.worker.onmessage = (event) => {
            const data = event.data;
            const handler = this.handlers.get(data.id);
            const that = this;
            if (handler) {
                // Handle responses from the worker
                if (data.type === 'response') {
                    handler.resolve(data.message);
                }
                // Handle errors from the worker
                if (data.type === 'error') {
                    const error = data.error || new Error(`Unknown error with ${subClass}`);
                    handler.reject(error);
                }
                // Handle initialization responses from the worker
                if (data.type === 'init_response') {
                    this._ = Object.keys(data.message)
                        .map(key => {
                        const isFn = typeof data.message[key] === 'function';
                        const subFunction = function () {
                            return isFn ? (that.exec(key))(...arguments) : that.get(key);
                        };
                        return [key, subFunction];
                    })
                        .reduce((a, c) => ({ ...a, ...{ [c[0]]: c[1] } }), {});
                    handler.resolve(this._);
                }
            }
        };
        // Tell the worker to initialize the subclass
        this.worker.postMessage({
            type: 'init',
            id: this.initId,
            command: subClass,
            message: args
        });
    }
    /**
     * Waits for the initialization of the object to complete and returns the resulting object.
     * @returns A promise that resolves with the initialized object.
     */
    onLoad() {
        return new Promise((resolve) => {
            // If initialization is still in progress, add a new handler for the initialization result
            if (this._ === undefined) {
                this.handlers.set(this.initId, { resolve, 'reject': resolve });
            }
            else {
                // Otherwise, immediately resolve the promise with the initialized object
                resolve(this._);
            }
        });
    }
    /**
     * returns a Promise for a given command that will be executed in a worker.
     * @param command - The command to execute.
     * @returns A Promise that resolves with the result of the command execution or rejects with an error.
     */
    exec(command) {
        // Keep track of this class
        const that = this;
        // Return a function that returns a Promise
        return function (...args) {
            return new Promise((resolve, reject) => {
                const id = randomString() + '-' + command;
                // Set up the resolve and reject handlers for the Promise
                that.handlers.set(id, { resolve, reject });
                // Tell the worker to run the command with the provided arguments
                that.worker.postMessage({
                    type: 'exec',
                    id: id,
                    command: command,
                    message: [...args]
                });
            });
        };
    }
    /**
     * Returns a Promise that resolves with the result of a command sent to a Web Worker.
     * @param command - The command to send to the Web Worker.
     * @returns A Promise that resolves with the result of the command.
     */
    get(command) {
        return new Promise((resolve, reject) => {
            // Generate a unique ID for this request
            const id = randomString() + '-' + command;
            // Store the resolve and reject functions for later use
            this.handlers.set(id, { resolve, reject });
            // Send the command to the worker
            this.worker.postMessage({
                type: 'get',
                id,
                command,
                message: [],
            });
        });
    }
}

// Make sure we can support workers in the current browser / runtime
const supportsWorkers = () => {
    let supported = false;
    try {
        supported = typeof (window.Worker) === 'function';
    }
    catch (e) {
        supported = false;
    }
    return supported;
};
// Safari changes https:// to http// for some reason, so this is broken in Safari and iPhone
// So to fix this we add it back
const needsUrlCheck = (new URL('test://http://example.com')).href !== 'test://http://example.com';
const checkUrl = (url) => {
    const safariFixRegex = new RegExp('^(https?)(\/\/)');
    const cleanUrl = url.replace(safariFixRegex, '$1:$2');
    return cleanUrl;
};
/**
 * The processData function accepts a URL, prefix, and an optional controller
 * and tries to read and convert the data
 * @param url - The URL of the resource.
 * @param prefix - The prefix used to process the data
 * @param controller - optional controller that can be used to cancel a request
 * @returns A geojson FeatureCollection (or undefined)
 */
async function processData(url, prefix, controller) {
    const response = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (response.status == 200) {
        const rawData = await response.text();
        let converter;
        let convertPromise;
        if (['kml', 'tcx', 'gpx'].indexOf(prefix) >= 0 || !supportsWorkers()) {
            // XML uses the DOM, which isn't available to web workers
            converter = new Converter(prefix, rawData);
            convertPromise = converter.convert();
        }
        else {
            converter = new Actor('Converter', [prefix, rawData]);
            convertPromise = converter.exec('convert')();
        }
        return await convertPromise;
    }
    else {
        throw (new Error(`Data fetch error: ${response.statusText}`));
    }
}
/**
 * The VectorTextProtocol function handles requests for vector data and returns a Promise with the
 * response callback function.
 * Modeled after this: https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151
 * @param requestParameters - The request parameters containing the URL of the resource.
 * @param callback - The function to be called when the response is available.
 * @returns An object with the cancel function.
 */
const VectorTextProtocol = (requestParameters, callback) => {
    const controller = new AbortController();
    const prefix = requestParameters.url.split('://')[0];
    const url = requestParameters.url.replace(new RegExp(`^${prefix}://`), '');
    // Apply the Safari fix
    const cleanUrl = needsUrlCheck ? checkUrl(url) : url;
    if (cleanUrl) {
        processData(cleanUrl, prefix, controller)
            .then(data => callback(null, data))
            .catch(e => callback(e));
    }
    // Allow the request to be cancelled
    return { cancel: () => { controller.abort(); } };
};
/**
 * Add the vector text protocol to a map library for each supported format.
 * @param mapLibrary - The MapLibrary object to add the protocols to.
 */
const addProtocols = (mapLibrary) => {
    supportedFormats.forEach(type => {
        mapLibrary.addProtocol(type, VectorTextProtocol);
    });
};

export { VectorTextProtocol, addProtocols };
