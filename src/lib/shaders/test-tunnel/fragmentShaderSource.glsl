precision highp float;

uniform vec3 iResolution;
uniform float iTime;
// uniform vec4 iMouse;

//https://iquilezles.org/articles/palettes/
vec3 palette(float t)
{

	vec3 a = vec3(0.5, 0.5, 0.5);
	vec3 b = vec3(0.5, 0.5, 0.5);
	vec3 c = vec3(1.0, 1.0, 1.0);
	vec3 d = vec3(0.263, 0.416, 0.557);

	// return a + b * tan(6.28318 * (c * t + d));

	// vec3 b = vec3(0.5, 0.5, 0.5);
	// vec3 c = vec3(1.0, 1.0, 1.0);
	// vec3 d = vec3(0.00, 0.33, 0.67);

	vec3 val = a + b * cos(6.28318 * (c * t + d));
	// vec3 val = a + b * (sin(6.28318 * (c * (t / 1.0) + d)) + 0.5) / (c * (t * 1.2));
	// val = val * (abs(gl_FragCoord.x - abs(iResolution.x / 2.0)) / (iResolution.x) - 0.05);
	// val = val * (abs(gl_FragCoord.y - abs(iResolution.y / 2.0)) / (iResolution.y) - 0.05);
	// vec3 val = a + b * cos(6.28318 * (t * (c + d)));
	// val = val + fract(gl_FragCoord.xyz * t);
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
		uv = fract(uv * 1.5) - 0.5;

		// uv.y = atan((fract(atan(uv.y * 100.5)) - 0.5) * 15.);
		// uv.x = atan((fract(atan(uv.x * 100.5)) - 0.5) * 15.);

		// uv.y = sin((fract(cos(uv.y * 1.5)) - 0.5) * 4.);
		// uv.x = sin((fract(cos(uv.x * 1.5)) - 0.5) * 4.);

		// uv.y = (fract(gl_FragCoord.y / 1000.0) - iResolution.y / 2.0) / (gl_FragCoord.x - (iResolution.x / 2.0)) + 0.5;
		// uv.x = (fract(gl_FragCoord.x / 1000.0) - iResolution.x / 2.0) / (gl_FragCoord.y - (iResolution.y / 2.0)) + 0.5;
		// uv.y = (sign(gl_FragCoord.y) * abs(sin(iTime / 2.0))) * uv.y * 1.25;
		// uv.x = (sign(gl_FragCoord.x) * abs(sin(iTime / 2.0))) * uv.x * 1.25;
		// uv.y = (sign(gl_FragCoord.y) * abs(sin(iTime / 20.0)) / 2.0) * uv.y * atan(iTime / 5.) * 2.;
		// uv.x = (sign(gl_FragCoord.x) * abs(sin(iTime / 20.0)) / 2.0) * uv.x * atan(iTime / 5.) * 2.;

		// move "camera"
		// uv.y = uv.y - (sin(iTime * 5.0) * sign(gl_FragCoord.y));
		// uv.x = uv.x - (cos(iTime * 5.0) * sign(gl_FragCoord.x));

		// speed of "camera"
		// uv.y = uv.y * (cos(iTime * .1) * sign(gl_FragCoord.y));
		// uv.x = uv.x * (cos(iTime * .1) * sign(gl_FragCoord.x));

		// uv.y = uv.y * (sin(iTime * .5) + 1.);
		// uv.x = uv.x * (sin(iTime * .5) + 1.);

		float d = length(uv) * exp(-length(uv0));

		vec3 col = palette(length(uv0) + i * .4 + iTime * .4);
		// vec3 col = palette(length(uv) / cos(iTime * 0.5));
		// vec3 col = palette(length(uv) / cos(iTime / 2.));

		// d = sin(d * 8. + iTime / 10.) / 8.;

		d = sin(d * 8. + iTime) / 8.;
		d = abs(d);

		d = pow(0.01 / d, 1.2);
		// d = pow(0.01 / d, 1.75);
		// d = clamp(d, 0.0, 0.2);
		// d = clamp(d, 0.0, 0.15);

		finalColor += col * d;
	}

	gl_FragColor = vec4(finalColor, 3.0);
	// gl_FragColor = vec4(finalColor * -1.3, 3.0);
	// float xVal = abs((gl_FragCoord.y - abs(iResolution.y / 2.0)) / (iResolution.y));
	// float yVal = ((gl_FragCoord.x - abs(iResolution.x / 2.0)) / (iResolution.x));
	// float val = (xVal / -xVal);
	// gl_FragColor = vec4(gl_FragColor.xyz * 1., 1.0);
}
