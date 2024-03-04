precision highp float;

uniform vec3 iResolution;
uniform float iTime;
// uniform vec4 iMouse;

//https://iquilezles.org/articles/palettes/
vec3 palette(float t)
{

	vec3 a = vec3(0.5, 0.5, 0.5);
	vec3 b = vec3(0.5, 1.5, 0.5);
	vec3 c = vec3(0.1, 1.0, 0.2);
	vec3 d = vec3(0.263, 0.416, 0.557);

	// return a + b * tan(6.28318 * (c * t + d));

	// vec3 b = vec3(0.5, 0.5, 0.5);
	// vec3 c = vec3(1.0, 1.0, 1.0);
	// vec3 d = vec3(0.00, 0.33, 0.67);

	vec3 val = a + b * cos(6.28318 * (c * t + d));
	// vec3 val = a + b * cos(6.28318 * (t * (c + d)));
	// val = val + fract(gl_FragCoord.xyz * t);
	// val = val + normalize(vec3(uv * 0.5 + 0.5, 1.0));
	return val;
	// return a - b * cos(6.28318 * (c * t + d)) / (c * t);
	// return a + b * cos(1.28318 * (c * t + d)) * sin(0.14159 * t) / (c * t);
}

//https://www.shadertoy.com/view/mtyGWy
void main()
{
	// vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) /
	// 	iResolution.y;
	// vec2 uv0 = uv;
	// vec3 finalColor = vec3(iTime * 0.1, 0.0, 0.0);

	// for(float i = 0.0; i < 4.0; i++)
	// {
	// 	uv = fract(uv * 1.5) - 0.5;
	// 	float d = length(uv) * exp(-length(uv0));
	// 	vec3 col = palette(length(uv0) + i * .4 + iTime * .4);
	// 	d = sin(d * 18. + iTime) / 18.;
	// 	d = abs(d);
	// 	d = pow(0.01 / d, 1.6);
	// 	finalColor += col * d;
	// }
	// gl_FragColor = vec4(finalColor, 1.0);

	vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
	vec2 uv0 = uv;
	vec3 finalColor = vec3(0);

	for(float i = 0.0; i < 4.0; i++)
	{
		// uv = fract(uv * 1.5) - 0.5;
		// uv.x = fract(uv.x * 1.5) - 0.5;
		uv.y = (fract(gl_FragCoord.y / 1000.0) - iResolution.y / 2.0) / (gl_FragCoord.x - (iResolution.x / 2.0)) + 0.5;
		uv.x = (fract(gl_FragCoord.x / 1000.0) - iResolution.x / 2.0) / (gl_FragCoord.y - (iResolution.y / 2.0)) + 0.5;
		// uv.y = (sign(gl_FragCoord.y) * abs(sin(iTime / 2.0)) * 5.0) * uv.y;
		// uv.x = (sign(gl_FragCoord.x) * abs(sin(iTime / 2.0)) * 5.0) * uv.x;
		uv.y = (sign(gl_FragCoord.y) * abs(sin(iTime / 20.0)) / 2.0) * uv.y;
		uv.x = (sign(gl_FragCoord.x) * abs(sin(iTime / 20.0)) / 2.0) * uv.x;

		// move "camera"
		// uv.y = uv.y - (sin(iTime * 5.0) * sign(gl_FragCoord.y));
		// uv.x = uv.x - (cos(iTime * 5.0) * sign(gl_FragCoord.x));

		// speed of "camera"
		// uv.y = uv.y * (sin(iTime * 5.0) * sign(gl_FragCoord.y));
		// uv.x = uv.x * (cos(iTime * 5.0) * sign(gl_FragCoord.x));

		float d = length(uv) * exp(-length(uv0));

		// vec3 col = palette(length(uv0) + i * .4 + iTime * .4);
		vec3 col = palette(length(uv) / cos(iTime * 0.5));

		d = sin(d * 8. + iTime) / 8.;
		d = abs(d);

		d = pow(0.01 / d, 1.2);
		// d = pow(0.01 / d, 1.5);
		// d = clamp(d, 0.0, 0.2);
		// d = clamp(d, 0.0, 0.15);

		finalColor += col * d;
	}

	gl_FragColor = vec4(finalColor / 1.0, (-abs(gl_FragCoord.y / (iResolution.y) - .5) - .5));
}