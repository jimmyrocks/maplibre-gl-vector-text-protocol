(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VectorTextProtocol = {}));
})(this, (function (exports) { 'use strict';

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

	// https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151
	const VectorTextProtocol = (requestParameters, callback) => {
	    const prefix = requestParameters.url.split('://')[0];
	    const url = requestParameters.url.replace(new RegExp(`^${prefix}://`), '');
	    fetch(url)
	        .then(response => {
	        if (response.status == 200) {
	            response.text().then(rawData => {
	                let converter = new Converter(prefix, rawData);
	                converter.convert().then(data => {
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

	exports.VectorTextProtocol = VectorTextProtocol;
	exports.addProtocols = addProtocols;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
