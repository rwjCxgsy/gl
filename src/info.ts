function getWebGLInfoByVersion(webglVersion) {
    const report = {
        webglVersion: webglVersion,
    };

    if ((webglVersion === 2 && !window.WebGL2RenderingContext) || (webglVersion === 1 && !window.WebGLRenderingContext)) {
        // The browser does not support WebGL
        report.contextName = "webgl not supported";
        return report;
    }

    const canvas = document.createElement("canvas");
    let gl, contextName;
    const possibleNames = webglVersion === 2 ? ["webgl2", "experimental-webgl2"] : ["webgl", "experimental-webgl"];
    for (let i = 0; i < possibleNames.length; i++) {
        const name = possibleNames[i];
        gl = canvas.getContext(name, { stencil: true });
        if (gl) {
            contextName = name;
            break;
        }
    }
    canvas.remove();
    if (!gl) {
        report.contextName = "webgl supported but failed to initialize";
        return report;
    }

    return Object.assign(report, {
        contextName: contextName,
        glVersion: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        unMaskedVendor: getUnmaskedInfo(gl).vendor,
        unMaskedRenderer: getUnmaskedInfo(gl).renderer,
        angle: getAngle(gl),
        antialias: gl.getContextAttributes().antialias ? "Available" : "Not available",
        majorPerformanceCaveat: getMajorPerformanceCaveat(contextName),
        bits: {
            redBits: gl.getParameter(gl.RED_BITS),
            greenBits: gl.getParameter(gl.GREEN_BITS),
            blueBits: gl.getParameter(gl.BLUE_BITS),
            alphaBits: gl.getParameter(gl.ALPHA_BITS),
            depthBits: gl.getParameter(gl.DEPTH_BITS),
            stencilBits: gl.getParameter(gl.STENCIL_BITS),
        },
        maximum: {
            maxColorBuffers: getMaxColorBuffers(gl),
            maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
            maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
            maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            maxViewportDimensions: describeRange(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),
            maxAnisotropy: getMaxAnisotropy(gl),
        },
        aliasedLineWidthRange: describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)),
        aliasedPointSizeRange: describeRange(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)),
        shaders: {
            vertexShaderBestPrecision: getBestFloatPrecision(gl.VERTEX_SHADER, gl),
            fragmentShaderBestPrecision: getBestFloatPrecision(gl.FRAGMENT_SHADER, gl),
            fragmentShaderFloatIntPrecision: getFloatIntPrecision(gl),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        },
        extensions: gl.getSupportedExtensions(),
    });
}

function describeRange(value) {
    return [value[0], value[1]];
}

function getUnmaskedInfo(gl) {
    const unMaskedInfo = {
        renderer: "",
        vendor: "",
    };

    const dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbgRenderInfo != null) {
        unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
        unMaskedInfo.vendor = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
    }

    return unMaskedInfo;
}

function getMaxColorBuffers(gl) {
    let maxColorBuffers = 1;
    const ext = gl.getExtension("WEBGL_draw_buffers");
    if (ext != null) maxColorBuffers = gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);

    return maxColorBuffers;
}

function getMajorPerformanceCaveat(contextName) {
    // Does context creation fail to do a major performance caveat?
    const canvas = document.body.appendChild(document.createElement("canvas"));
    const gl = canvas.getContext(contextName, { failIfMajorPerformanceCaveat: true });
    canvas.remove();

    if (!gl) {
        // Our original context creation passed.  This did not.
        return "Yes";
    }

    if (typeof gl.getContextAttributes().failIfMajorPerformanceCaveat === "undefined") {
        // If getContextAttributes() doesn"t include the failIfMajorPerformanceCaveat
        // property, assume the browser doesn"t implement it yet.
        return "Not implemented";
    }
    return "No";
}

function isPowerOfTwo(n) {
    return n !== 0 && (n & (n - 1)) === 0;
}

function getAngle(gl) {
    const lineWidthRange = describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE));

    // Heuristic: ANGLE is only on Windows, not in IE, and does not implement line width greater than one.
    const angle = (navigator.platform === "Win32" || navigator.platform === "Win64") && gl.getParameter(gl.RENDERER) !== "Internet Explorer" && lineWidthRange === describeRange([1, 1]);

    if (angle) {
        // Heuristic: D3D11 backend does not appear to reserve uniforms like the D3D9 backend, e.g.,
        // D3D11 may have 1024 uniforms per stage, but D3D9 has 254 and 221.
        //
        // We could also test for WEBGL_draw_buffers, but many systems do not have it yet
        // due to driver bugs, etc.
        if (isPowerOfTwo(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)) && isPowerOfTwo(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS))) {
            return "Yes, D3D11";
        } else {
            return "Yes, D3D9";
        }
    }

    return "No";
}

function getMaxAnisotropy(gl) {
    const e = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

    if (e) {
        let max = gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        // See Canary bug: https://code.google.com/p/chromium/issues/detail?id=117450
        if (max === 0) {
            max = 2;
        }
        return max;
    }
    return "n/a";
}

function formatPower(exponent, verbose) {
    if (verbose) {
        return "" + Math.pow(2, exponent);
    } else {
        return "2^" + exponent + "";
    }
}

function getPrecisionDescription(precision, verbose) {
    const verbosePart = verbose ? " bit mantissa" : "";
    return "[-" + formatPower(precision.rangeMin, verbose) + ", " + formatPower(precision.rangeMax, verbose) + "] (" + precision.precision + verbosePart + ")";
}

function getBestFloatPrecision(shaderType, gl) {
    const high = gl.getShaderPrecisionFormat(shaderType, gl.HIGH_FLOAT);
    const medium = gl.getShaderPrecisionFormat(shaderType, gl.MEDIUM_FLOAT);
    const low = gl.getShaderPrecisionFormat(shaderType, gl.LOW_FLOAT);

    let best = high;
    if (high.precision === 0) {
        best = medium;
    }

    return {
        high: getPrecisionDescription(high, true),
        medium: getPrecisionDescription(medium, true),
        low: getPrecisionDescription(low, true),
        best: getPrecisionDescription(best, false),
    };
}

function getFloatIntPrecision(gl) {
    let high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    let s = high.precision !== 0 ? "highp/" : "mediump/";

    high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT);
    s += high.rangeMax !== 0 ? "highp" : "lowp";

    return s;
}
export { getWebGLInfoByVersion };
