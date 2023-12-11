// This module shall be imported in the main method of a fragment shader. It provides a function to render a signed distance field.

  if (DEBUG == 1) {
    float scale = abs(u_InverseTransform[0][0]);
    vec3 col = (dist > 0.0) ? vec3(0.9, 0.6, 0.3) : vec3(0.65, 0.85, 1.0);
    col *= 1.0 - exp(-100.0 / scale * abs(dist));
    col *= 0.8 + 0.5 * cos(1000.0 / scale * dist);
    if (dist < 0.0 && dist > -u_PixelSize * scale) {
      col = vec3(1.0, 1.0, 1.0);
    }
    gl_FragColor = vec4(col, 1.0);
    return;
  }
